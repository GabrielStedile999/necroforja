import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "./index";
import { getGangById } from "./queries";
import { gangRating, gangWealth } from "@/lib/scoring";
import { nextCycleState } from "@/lib/campaign-rules";

/**
 * Recalculates and persists a gang's Rating and Wealth after any change.
 * Keeps the cached values consistent for fast reads in the ranking.
 */
export async function recalcGangScores(gangId: string) {
  const gang = await getGangById(gangId);
  if (!gang) return;
  await db
    .update(schema.gangs)
    .set({ ratingCached: gangRating(gang), wealthCached: gangWealth(gang) })
    .where(eq(schema.gangs.id, gangId));
}

/**
 * Transfers control of a Sympathiser to a gang: closes the current control
 * (isCurrent=false) and registers the new one (maintains history).
 */
export async function setSympathiserController(
  sympathiserId: string,
  gangId: string,
  cycle: number,
) {
  await db
    .update(schema.sympathiserControl)
    .set({ isCurrent: false })
    .where(
      and(
        eq(schema.sympathiserControl.sympathiserId, sympathiserId),
        eq(schema.sympathiserControl.isCurrent, true),
      ),
    );

  await db.insert(schema.sympathiserControl).values({
    sympathiserId,
    gangId,
    sinceCycle: cycle,
    isCurrent: true,
  });
}

/**
 * Downtime steps (cycle 4):
 * - Fighters "in_recovery" return to "active".
 * - Fighters "captured" are returned: they go back to "active" and capturedByGangId is cleared.
 * Recalculates scores for all affected gangs.
 */
export async function applyDowntimeEffects(campaignId: string): Promise<void> {
  const campaignGangs = await db.query.gangs.findMany({
    where: eq(schema.gangs.campaignId, campaignId),
    columns: { id: true },
  });
  if (campaignGangs.length === 0) return;

  const gangIds = campaignGangs.map((g) => g.id);

  // 1. Clear in_recovery → active
  await db
    .update(schema.fighters)
    .set({ status: "active" })
    .where(
      and(
        inArray(schema.fighters.gangId, gangIds),
        eq(schema.fighters.status, "in_recovery"),
      ),
    );

  // 2. Return captured → active (clears the capturing gang)
  await db
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
    await recalcGangScores(id);
  }
}

/**
 * Removes the current control of a Sympathiser without assigning a new one (releases it).
 * Closes the is_current record without creating a replacement.
 */
export async function clearSympathiserController(
  sympathiserId: string,
): Promise<void> {
  await db
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
export async function advanceCampaignCycle(campaignId: string) {
  const campaign = await db.query.campaigns.findFirst({
    where: eq(schema.campaigns.id, campaignId),
  });
  if (!campaign) return;

  const { cycle, phase } = nextCycleState(campaign.currentCycle);
  await db
    .update(schema.campaigns)
    .set({ currentCycle: cycle, phase })
    .where(eq(schema.campaigns.id, campaignId));
}
