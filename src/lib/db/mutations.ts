import { and, eq, inArray } from "drizzle-orm";
import { db, schema, type DbOrTx } from "./index";
import { getGangById } from "./queries";
import { gangRating, gangWealth } from "@/lib/scoring";
import { nextCycleState } from "@/lib/campaign-rules";

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
