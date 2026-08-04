import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db, schema, type DbOrTx } from "./index";
import { getGangById } from "./queries";
import { gangRating, gangWealth } from "@/lib/scoring";
import { nextCycleState } from "@/lib/campaign-rules";
import type { BattleEventInput } from "@/lib/validation";

/**
 * Runs `fn` inside `dbc` when a transaction handle is provided, or opens a
 * fresh `db.transaction` otherwise (issue #62). Keeps multi-step helpers
 * atomic both when composed into a larger transaction and when called alone.
 */
async function withTx<T>(
  dbc: DbOrTx | undefined,
  fn: (tx: DbOrTx) => Promise<T>,
): Promise<T> {
  return dbc ? fn(dbc) : db.transaction((tx) => fn(tx));
}

/**
 * Recalculates and persists a gang's Rating and Wealth after any change.
 * Keeps the cached values consistent for fast reads in the ranking.
 * Accepts a `dbc` so the recalculation joins the caller's transaction
 * (issue #62) — a crash between the mutation and the recalc can no longer
 * persist stale cached scores.
 */
export async function recalcGangScores(gangId: string, dbc: DbOrTx = db) {
  const gang = await getGangById(gangId, dbc);
  if (!gang) return;
  await dbc
    .update(schema.gangs)
    .set({ ratingCached: gangRating(gang), wealthCached: gangWealth(gang) })
    .where(eq(schema.gangs.id, gangId));
}

/**
 * Conditionally debits a gang's Stash credits (issue #68) — the correctness
 * core of the Trading Post. The WHERE clause makes the debit atomic at the
 * database level: `stash_credits >= amount` means two concurrent purchases
 * can never spend the same credits — the second UPDATE matches 0 rows and
 * the purchase fails cleanly, no locks needed. Returns `true` when the
 * debit happened. Always call inside the purchase's transaction so a later
 * failure rolls the debit back.
 */
export async function debitStashCredits(
  gangId: string,
  amount: number,
  dbc: DbOrTx = db,
): Promise<boolean> {
  if (amount < 0) return false;
  if (amount === 0) return true;
  const rows = await dbc
    .update(schema.gangs)
    .set({
      stashCredits: sql`${schema.gangs.stashCredits} - ${amount}`,
    })
    .where(
      and(eq(schema.gangs.id, gangId), gte(schema.gangs.stashCredits, amount)),
    )
    .returning({ id: schema.gangs.id });
  return rows.length > 0;
}

/** Result of applying one battle aftermath event (issue #69). */
export type BattleEventResult = { ok: true } | { ok: false; error: string };

/**
 * Applies ONE battle aftermath event (issue #69): validates the referenced
 * challenge/gang/fighter, applies the kind's effect, inserts the append-only
 * `battle_event` row and recalculates the gang's cached scores — all in a
 * single transaction, so an event can never be recorded without its effect
 * (or vice versa).
 *
 * Guard rails:
 * - The challenge must exist and be RESOLVED (aftermath describes a battle
 *   that happened) — and the gang must be one of its participants, which
 *   also pins gang and challenge to the same campaign.
 * - A referenced fighter must belong to the event's gang.
 * - Negative credits/XP (compensating events) use conditional UPDATEs
 *   (`>= delta`), the debitStashCredits pattern — a correction can never
 *   overdraw the Stash or push a fighter's XP below zero, even under
 *   concurrent submissions.
 * - reputation_change clamps at the floor of 1 (Reputation never drops
 *   below 1 in campaign play).
 * - fighter_captured records the OTHER participant as the capturing gang
 *   (null when the challenge had no defender).
 *
 * The caller validates the event shape with `battleEventSchema` first; this
 * function assumes a well-formed input and enforces the cross-row rules.
 */
export async function applyBattleEvent(
  event: BattleEventInput,
  dbc?: DbOrTx,
): Promise<BattleEventResult> {
  return withTx(dbc, async (tx): Promise<BattleEventResult> => {
    const challenge = await tx.query.challenges.findFirst({
      where: eq(schema.challenges.id, event.challengeId),
      columns: {
        id: true,
        resolved: true,
        challengerGangId: true,
        challengedGangId: true,
      },
    });
    if (!challenge) return { ok: false, error: "Challenge not found." };
    if (!challenge.resolved) {
      return {
        ok: false,
        error: "Aftermath can only be logged on a resolved challenge.",
      };
    }
    const participants = [
      challenge.challengerGangId,
      challenge.challengedGangId,
    ].filter((id): id is string => !!id);
    if (!participants.includes(event.gangId)) {
      return { ok: false, error: "Gang did not take part in this challenge." };
    }

    if ("fighterId" in event && event.fighterId) {
      const fighter = await tx.query.fighters.findFirst({
        where: and(
          eq(schema.fighters.id, event.fighterId),
          eq(schema.fighters.gangId, event.gangId),
        ),
        columns: { id: true },
      });
      if (!fighter) {
        return { ok: false, error: "Fighter does not belong to this gang." };
      }
    }

    // Apply the kind's effect. Guarded writes come FIRST: when they fail
    // nothing has been written yet, so returning the error needs no rollback.
    switch (event.kind) {
      case "credits_gained": {
        if (event.amount < 0) {
          const paid = await debitStashCredits(event.gangId, -event.amount, tx);
          if (!paid) {
            return {
              ok: false,
              error: "Compensation exceeds the gang's Stash credits.",
            };
          }
        } else {
          await tx
            .update(schema.gangs)
            .set({
              stashCredits: sql`${schema.gangs.stashCredits} + ${event.amount}`,
            })
            .where(eq(schema.gangs.id, event.gangId));
        }
        break;
      }
      case "xp_gained": {
        // Conditional UPDATE: a negative delta only lands when the fighter
        // has enough XP (`xp >= -delta`), mirroring debitStashCredits.
        const rows = await tx
          .update(schema.fighters)
          .set({ xp: sql`${schema.fighters.xp} + ${event.amount}` })
          .where(
            and(
              eq(schema.fighters.id, event.fighterId),
              event.amount < 0
                ? gte(schema.fighters.xp, -event.amount)
                : undefined,
            ),
          )
          .returning({ id: schema.fighters.id });
        if (rows.length === 0) {
          return {
            ok: false,
            error: "Compensation exceeds the fighter's XP.",
          };
        }
        break;
      }
      case "fighter_injured": {
        // Post-battle injuries put the fighter in recovery (Downtime clears
        // it). Lasting-injury automation is issue #71 territory.
        await tx
          .update(schema.fighters)
          .set({ status: "in_recovery", capturedByGangId: null })
          .where(eq(schema.fighters.id, event.fighterId));
        break;
      }
      case "fighter_dead": {
        await tx
          .update(schema.fighters)
          .set({ status: "dead", capturedByGangId: null })
          .where(eq(schema.fighters.id, event.fighterId));
        break;
      }
      case "fighter_captured": {
        const captor =
          participants.find((id) => id !== event.gangId) ?? null;
        await tx
          .update(schema.fighters)
          .set({ status: "captured", capturedByGangId: captor })
          .where(eq(schema.fighters.id, event.fighterId));
        break;
      }
      case "reputation_change": {
        // Floor of 1: Reputation never drops below 1 in campaign play.
        await tx
          .update(schema.gangs)
          .set({
            reputation: sql`greatest(1, ${schema.gangs.reputation} + ${event.amount})`,
          })
          .where(eq(schema.gangs.id, event.gangId));
        break;
      }
    }

    // Append-only log row — recorded with its effect, in the same transaction.
    await tx.insert(schema.battleEvents).values({
      challengeId: event.challengeId,
      gangId: event.gangId,
      kind: event.kind,
      fighterId: "fighterId" in event ? (event.fighterId ?? null) : null,
      amount: "amount" in event ? (event.amount ?? null) : null,
      notes: event.notes,
    });

    await recalcGangScores(event.gangId, tx);
    return { ok: true };
  });
}

/**
 * Transfers control of a Sympathiser to a gang: closes the current control
 * (isCurrent=false) and registers the new one (maintains history).
 * Atomic (issue #62): runs in the caller's transaction when `dbc` is given,
 * or opens its own — the close+insert pair can never be split.
 */
export async function setSympathiserController(
  sympathiserId: string,
  gangId: string,
  cycle: number,
  dbc?: DbOrTx,
) {
  await withTx(dbc, async (tx) => {
    await tx
      .update(schema.sympathiserControl)
      .set({ isCurrent: false })
      .where(
        and(
          eq(schema.sympathiserControl.sympathiserId, sympathiserId),
          eq(schema.sympathiserControl.isCurrent, true),
        ),
      );

    await tx.insert(schema.sympathiserControl).values({
      sympathiserId,
      gangId,
      sinceCycle: cycle,
      isCurrent: true,
    });
  });
}

/**
 * Downtime steps (cycle 4):
 * - Fighters "in_recovery" return to "active".
 * - Fighters "captured" are returned: they go back to "active" and capturedByGangId is cleared.
 * Recalculates scores for all affected gangs.
 * Atomic (issue #62): both status resets and every recalc commit together.
 */
export async function applyDowntimeEffects(
  campaignId: string,
  dbc?: DbOrTx,
): Promise<void> {
  await withTx(dbc, async (tx) => {
    const campaignGangs = await tx.query.gangs.findMany({
      where: eq(schema.gangs.campaignId, campaignId),
      columns: { id: true },
    });
    if (campaignGangs.length === 0) return;

    const gangIds = campaignGangs.map((g) => g.id);

    // 1. Clear in_recovery → active
    await tx
      .update(schema.fighters)
      .set({ status: "active" })
      .where(
        and(
          inArray(schema.fighters.gangId, gangIds),
          eq(schema.fighters.status, "in_recovery"),
        ),
      );

    // 2. Return captured → active (clears the capturing gang)
    await tx
      .update(schema.fighters)
      .set({ status: "active", capturedByGangId: null })
      .where(
        and(
          inArray(schema.fighters.gangId, gangIds),
          eq(schema.fighters.status, "captured"),
        ),
      );

    // 3. Recalculate scores (dead/active status affects Rating)
    for (const { id } of campaignGangs) {
      await recalcGangScores(id, tx);
    }
  });
}

/**
 * Removes the current control of a Sympathiser without assigning a new one (releases it).
 * Closes the is_current record without creating a replacement.
 */
export async function clearSympathiserController(
  sympathiserId: string,
  dbc: DbOrTx = db,
): Promise<void> {
  await dbc
    .update(schema.sympathiserControl)
    .set({ isCurrent: false })
    .where(
      and(
        eq(schema.sympathiserControl.sympathiserId, sympathiserId),
        eq(schema.sympathiserControl.isCurrent, true),
      ),
    );
}

/** Advances the campaign one cycle, automatically adjusting the phase. */
export async function advanceCampaignCycle(
  campaignId: string,
  dbc: DbOrTx = db,
) {
  const campaign = await dbc.query.campaigns.findFirst({
    where: eq(schema.campaigns.id, campaignId),
  });
  if (!campaign) return;

  const { cycle, phase } = nextCycleState(
    campaign.currentCycle,
    campaign.totalCycles,
  );
  await dbc
    .update(schema.campaigns)
    .set({ currentCycle: cycle, phase })
    .where(eq(schema.campaigns.id, campaignId));
}
