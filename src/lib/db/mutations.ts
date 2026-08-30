import { and, eq, gte, inArray, isNull, ne, sql } from "drizzle-orm";
import { db, schema, type DbOrTx } from "./index";
import { getGangById } from "./queries";
import { fighterTotalCost, gangRating, gangWealth } from "@/lib/scoring";
import {
  captiveReturnPayment,
  downtimePromotion,
  FRESH_RECRUITMENT_CREDITS,
  nextCycleState,
} from "@/lib/campaign-rules";
import type { BattleEventInput } from "@/lib/validation";
import type { FighterCategory } from "@/types";

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

/**
 * Snapshots every gang of a campaign at `cycle` (issue #70) — one row per
 * gang with the CACHED scores (kept fresh on every write, so this is a
 * cheap read, no tree walking) plus the current Sympathiser count. Upsert
 * on (gang, cycle): re-running refreshes the same row instead of
 * duplicating, which makes the advanceCycle hook and the gang-creation
 * hook idempotent. Pass the caller's `dbc` to join its transaction.
 */
export async function snapshotCampaignGangs(
  campaignId: string,
  cycle: number,
  dbc: DbOrTx = db,
): Promise<void> {
  const campaignGangs = await dbc.query.gangs.findMany({
    where: eq(schema.gangs.campaignId, campaignId),
    columns: {
      id: true,
      ratingCached: true,
      wealthCached: true,
      reputation: true,
    },
  });
  if (campaignGangs.length === 0) return;

  const controls = await dbc.query.sympathiserControl.findMany({
    where: eq(schema.sympathiserControl.isCurrent, true),
    columns: { gangId: true },
  });
  const sympCount = new Map<string, number>();
  for (const c of controls) {
    if (c.gangId) sympCount.set(c.gangId, (sympCount.get(c.gangId) ?? 0) + 1);
  }

  await dbc
    .insert(schema.gangSnapshots)
    .values(
      campaignGangs.map((g) => ({
        gangId: g.id,
        campaignId,
        cycle,
        rating: g.ratingCached,
        wealth: g.wealthCached,
        reputation: g.reputation,
        sympathiserCount: sympCount.get(g.id) ?? 0,
      })),
    )
    .onConflictDoUpdate({
      target: [schema.gangSnapshots.gangId, schema.gangSnapshots.cycle],
      set: {
        rating: sql`excluded.rating`,
        wealth: sql`excluded.wealth`,
        reputation: sql`excluded.reputation`,
        sympathiserCount: sql`excluded.sympathiser_count`,
        createdAt: sql`now()`,
      },
    });
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

/** What one Downtime pass did (issue #83) — also persisted as downtime_event rows. */
export type DowntimeSummary = {
  cycle: number;
  recovered: { fighterId: string; fighterName: string; gangId: string }[];
  returned: {
    fighterId: string;
    fighterName: string;
    gangId: string;
    captorGangId: string | null;
    /** Credits actually credited to the captor (0 = no captor on record). */
    paid: number;
  }[];
  promoted: {
    fighterId: string;
    fighterName: string;
    gangId: string;
    from: FighterCategory;
    to: FighterCategory;
  }[];
};

/**
 * The Effects of Downtime (Cinderak Burning, p.61 — issue #83 completes
 * the sequence), applied to every gang of the campaign:
 *
 * - A. Fighters recover: "in_recovery" → "active".
 * - B. Captives are returned: "captured" → "active", capturedByGangId
 *   cleared — and the CAPTOR is compensated with half the captive's credits
 *   value rounded up to 5s (`captiveReturnPayment`), valued BEFORE release
 *   with `fighterTotalCost` (equipment + advancements included). A captive
 *   with no captor on record (legacy rows) is released unpaid.
 * - C. Experienced Juves/Prospects are promoted: 5+ Advancements → the
 *   category changes (Juve → Ganger, Prospect → Champion); cost, profile
 *   and the free-text type stay untouched. Dead fighters are skipped.
 * - D. Fresh Recruitment is a separate Arbitrator-triggered grant
 *   (`grantFreshRecruitment`) — E. Declare Allegiance lives in issue #82.
 *
 * Every effect is logged in `downtime_event` (the audit trail — promotion
 * overwrites the category) and every touched gang is recalculated, all in
 * one transaction (issue #62): a Downtime can never half-apply. Re-running
 * on the same state is harmless: recovered/returned fighters are already
 * active and promoted fighters no longer match, so nothing is paid or
 * promoted twice.
 */
export async function applyDowntimeEffects(
  campaignId: string,
  dbc?: DbOrTx,
): Promise<DowntimeSummary> {
  return withTx(dbc, async (tx): Promise<DowntimeSummary> => {
    const summary: DowntimeSummary = {
      cycle: 0,
      recovered: [],
      returned: [],
      promoted: [],
    };

    const campaign = await tx.query.campaigns.findFirst({
      where: eq(schema.campaigns.id, campaignId),
      columns: { currentCycle: true },
    });
    if (!campaign) return summary;
    summary.cycle = campaign.currentCycle;

    const campaignGangs = await tx.query.gangs.findMany({
      where: eq(schema.gangs.campaignId, campaignId),
      columns: { id: true },
    });
    if (campaignGangs.length === 0) return summary;

    const gangIds = campaignGangs.map((g) => g.id);

    // A. Fighters recover — in_recovery → active
    const recovered = await tx
      .update(schema.fighters)
      .set({ status: "active" })
      .where(
        and(
          inArray(schema.fighters.gangId, gangIds),
          eq(schema.fighters.status, "in_recovery"),
        ),
      )
      .returning({
        id: schema.fighters.id,
        name: schema.fighters.name,
        gangId: schema.fighters.gangId,
      });
    summary.recovered = recovered.map((f) => ({
      fighterId: f.id,
      fighterName: f.name,
      gangId: f.gangId,
    }));

    // B. Captives are returned — value each captive BEFORE releasing, pay
    // the captor, then clear the status. The payment is a plain credit
    // (no conditional guard needed: it only ever adds).
    const captives = await tx.query.fighters.findMany({
      where: and(
        inArray(schema.fighters.gangId, gangIds),
        eq(schema.fighters.status, "captured"),
      ),
      columns: {
        id: true,
        name: true,
        gangId: true,
        baseCost: true,
        capturedByGangId: true,
      },
      with: {
        equipment: { with: { equipment: { columns: { cost: true } } } },
        advancements: { columns: { creditIncrease: true } },
      },
    });
    const captorIds = new Set<string>();
    for (const c of captives) {
      const value = fighterTotalCost({
        baseCost: c.baseCost,
        equipment: c.equipment.map((fe) => ({ cost: fe.equipment.cost })),
        advancements: c.advancements,
      });
      let paid = 0;
      const owed = captiveReturnPayment(value);
      if (c.capturedByGangId && owed > 0) {
        const rows = await tx
          .update(schema.gangs)
          .set({
            stashCredits: sql`${schema.gangs.stashCredits} + ${owed}`,
          })
          .where(eq(schema.gangs.id, c.capturedByGangId))
          .returning({ id: schema.gangs.id });
        // A captor gang that no longer exists simply is not paid.
        if (rows.length > 0) {
          paid = owed;
          captorIds.add(c.capturedByGangId);
        }
      }
      summary.returned.push({
        fighterId: c.id,
        fighterName: c.name,
        gangId: c.gangId,
        captorGangId: c.capturedByGangId,
        paid,
      });
    }
    if (captives.length > 0) {
      await tx
        .update(schema.fighters)
        .set({ status: "active", capturedByGangId: null })
        .where(
          inArray(
            schema.fighters.id,
            captives.map((c) => c.id),
          ),
        );
    }

    // C. Experienced Juves and Prospects are promoted — 5+ Advancements.
    const candidates = await tx.query.fighters.findMany({
      where: and(
        inArray(schema.fighters.gangId, gangIds),
        inArray(schema.fighters.category, ["juve", "prospect"]),
        ne(schema.fighters.status, "dead"),
      ),
      columns: { id: true, name: true, gangId: true, category: true },
      with: { advancements: { columns: { id: true } } },
    });
    for (const f of candidates) {
      const to = downtimePromotion(f.category, f.advancements.length);
      if (!to) continue;
      await tx
        .update(schema.fighters)
        .set({ category: to })
        .where(eq(schema.fighters.id, f.id));
      summary.promoted.push({
        fighterId: f.id,
        fighterName: f.name,
        gangId: f.gangId,
        from: f.category,
        to,
      });
    }

    // Append-only log — one row per effect, in the same transaction.
    const cycle = summary.cycle;
    const log: (typeof schema.downtimeEvents.$inferInsert)[] = [
      ...summary.recovered.map((r) => ({
        campaignId,
        cycle,
        gangId: r.gangId,
        fighterId: r.fighterId,
        kind: "fighter_recovered" as const,
      })),
      ...summary.returned.map((r) => ({
        campaignId,
        cycle,
        gangId: r.gangId,
        fighterId: r.fighterId,
        kind: "captive_returned" as const,
        amount: r.paid,
      })),
      ...summary.returned
        .filter((r) => r.captorGangId && r.paid > 0)
        .map((r) => ({
          campaignId,
          cycle,
          gangId: r.captorGangId!,
          fighterId: r.fighterId,
          kind: "captor_paid" as const,
          amount: r.paid,
          notes: r.fighterName,
        })),
      ...summary.promoted.map((p) => ({
        campaignId,
        cycle,
        gangId: p.gangId,
        fighterId: p.fighterId,
        kind: "fighter_promoted" as const,
        notes: `${p.from} → ${p.to}`,
      })),
    ];
    if (log.length > 0) {
      await tx.insert(schema.downtimeEvents).values(log);
    }

    // Recalculate every campaign gang (status changes move the Rating) plus
    // any paid captor (Stash credits move the Wealth).
    const toRecalc = new Set<string>([...gangIds, ...captorIds]);
    for (const id of toRecalc) {
      await recalcGangScores(id, tx);
    }
    return summary;
  });
}

/** Result of the Fresh Recruitment grant (issue #83). */
export type FreshRecruitmentResult =
  | { ok: true; gangs: number; credits: number }
  | { ok: false; error: string };

/**
 * Downtime step D — Fresh Recruitment (Cinderak Burning, p.61): every
 * active gang gains FRESH_RECRUITMENT_CREDITS to recruit and re-equip.
 * Arbitrator-triggered, ONE-SHOT per campaign: the claim is a conditional
 * UPDATE on `campaign.fresh_recruitment_at is null` (the debitStashCredits
 * pattern) — two concurrent clicks can never pay twice. Credits, log rows
 * and recalcs commit together with the claim.
 *
 * Documented deviation: the book says these credits "must be spent now"
 * and never join the Stash. A faithful escrow flow (a spend-only pool with
 * its own purchase path) is heavy for the value it adds, so the grant lands
 * in the Stash and the Arbitrator polices leftovers at the table.
 */
export async function grantFreshRecruitment(
  campaignId: string,
  dbc?: DbOrTx,
): Promise<FreshRecruitmentResult> {
  return withTx(dbc, async (tx): Promise<FreshRecruitmentResult> => {
    // Read-only checks first: nothing is written until the grant can land.
    const activeGangs = await tx.query.gangs.findMany({
      where: and(
        eq(schema.gangs.campaignId, campaignId),
        eq(schema.gangs.isActive, true),
      ),
      columns: { id: true },
    });
    if (activeGangs.length === 0) {
      return { ok: false, error: "No active gangs to pay." };
    }

    const claimed = await tx
      .update(schema.campaigns)
      .set({ freshRecruitmentAt: sql`now()` })
      .where(
        and(
          eq(schema.campaigns.id, campaignId),
          isNull(schema.campaigns.freshRecruitmentAt),
        ),
      )
      .returning({ currentCycle: schema.campaigns.currentCycle });
    if (claimed.length === 0) {
      return {
        ok: false,
        error: "Fresh Recruitment was already granted in this campaign.",
      };
    }
    const cycle = claimed[0]!.currentCycle;

    const gangIds = activeGangs.map((g) => g.id);
    await tx
      .update(schema.gangs)
      .set({
        stashCredits: sql`${schema.gangs.stashCredits} + ${FRESH_RECRUITMENT_CREDITS}`,
      })
      .where(inArray(schema.gangs.id, gangIds));

    await tx.insert(schema.downtimeEvents).values(
      gangIds.map((gangId) => ({
        campaignId,
        cycle,
        gangId,
        kind: "fresh_recruitment" as const,
        amount: FRESH_RECRUITMENT_CREDITS,
      })),
    );

    for (const id of gangIds) {
      await recalcGangScores(id, tx);
    }
    return {
      ok: true,
      gangs: gangIds.length,
      credits: FRESH_RECRUITMENT_CREDITS,
    };
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
