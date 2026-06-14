"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { getActiveCampaign } from "@/lib/db/queries";
import {
  createChallengeSchema,
  resolveChallengeSchema,
  assignSympathiserSchema,
} from "@/lib/validation";
import {
  setSympathiserController,
  clearSympathiserController,
  advanceCampaignCycle,
  applyDowntimeEffects,
} from "@/lib/db/mutations";
import { SYMPATHISERS } from "@/lib/data/sympathisers";
import { controlWinner, rollScenario, nextCycleState } from "@/lib/campaign-rules";

export type CampaignState = { error?: string; success?: string };

/** Registers a challenge for a Sympathiser in the current cycle. */
export async function createChallenge(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  await requireAdmin();
  const campaign = await getActiveCampaign();
  if (!campaign) return { error: "No active campaign." };

  const parsed = createChallengeSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  if (d.challengedGangId && d.challengedGangId === d.challengerGangId) {
    return { error: "A gang cannot challenge itself." };
  }

  const scenario =
    d.scenario && d.scenario.length > 0
      ? d.scenario
      : rollScenario(campaign.phase).scenario;

  await db.insert(schema.challenges).values({
    campaignId: campaign.id,
    cycle: campaign.currentCycle,
    challengerGangId: d.challengerGangId,
    challengedGangId: d.challengedGangId ?? null,
    sympathiserId: d.sympathiserId,
    scenario,
    resolved: false,
  });

  revalidatePath("/admin/campaign");
  revalidatePath("/");
  return { success: `Challenge registered (scenario: ${scenario}).` };
}

/** Resolves a challenge: transfers the Sympathiser to the winner. */
export async function resolveChallenge(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  await requireAdmin();
  const campaign = await getActiveCampaign();
  if (!campaign) return { error: "No active campaign." };

  const parsed = resolveChallengeSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { challengeId, outcome } = parsed.data;

  const challenge = await db.query.challenges.findFirst({
    where: eq(schema.challenges.id, challengeId),
  });
  if (!challenge) return { error: "Challenge not found." };
  if (challenge.resolved) return { error: "Challenge already resolved." };

  const winner = controlWinner(
    outcome,
    challenge.challengerGangId,
    challenge.challengedGangId ?? null,
  );
  if (winner && challenge.sympathiserId) {
    await setSympathiserController(
      challenge.sympathiserId,
      winner,
      campaign.currentCycle,
    );
  }

  await db
    .update(schema.challenges)
    .set({ outcome, resolved: true, playedAt: new Date() })
    .where(eq(schema.challenges.id, challengeId));

  revalidatePath("/admin/campaign");
  revalidatePath("/");
  return { success: "Challenge resolved." };
}

/** Enables/disables a Sympathiser in the campaign (disappears from the public map and challenges). */
export async function toggleSympathiser(formData: FormData) {
  await requireAdmin();
  const sympathiserId = String(formData.get("sympathiserId"));
  const enabled = formData.get("enabled") === "true"; // current state
  if (!sympathiserId) return;
  await db
    .update(schema.sympathisers)
    .set({ enabled: !enabled })
    .where(eq(schema.sympathisers.id, sympathiserId));
  revalidatePath("/admin/campaign");
  revalidatePath("/");
}

/**
 * Manually assigns a Sympathiser to a gang, or releases it (gangId = "").
 * Ends the current control and creates a new record if gangId is provided.
 */
export async function assignSympathiser(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  await requireAdmin();

  const parsed = assignSympathiserSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { sympathiserId, gangId } = parsed.data;

  // Validate that the sympathiserId exists in the fixed catalogue
  if (!SYMPATHISERS.find((s) => s.id === sympathiserId)) {
    return { error: "Invalid Sympathiser." };
  }

  if (gangId === "") {
    // Release: end current control without creating a new one
    await clearSympathiserController(sympathiserId);
    revalidatePath("/admin/campaign");
    revalidatePath("/");
    return { success: "Sympathiser released." };
  }

  // Validate that the gang belongs to the active campaign
  const campaign = await getActiveCampaign();
  if (!campaign) return { error: "No active campaign." };

  const gang = await db.query.gangs.findFirst({
    where: and(
      eq(schema.gangs.id, gangId),
      eq(schema.gangs.campaignId, campaign.id),
    ),
    columns: { id: true },
  });
  if (!gang) return { error: "Invalid gang." };

  await setSympathiserController(sympathiserId, gangId, campaign.currentCycle);
  revalidatePath("/admin/campaign");
  revalidatePath("/");
  return { success: "Assignment recorded." };
}

/** Advances the campaign by one cycle (and adjusts the phase). When entering
 *  cycle 4 (Downtime), automatically applies the effects: clears in_recovery,
 *  returns captured fighters. */
export async function advanceCycle() {
  await requireAdmin();
  const campaign = await getActiveCampaign();
  if (!campaign) return;

  const { cycle: newCycle } = nextCycleState(campaign.currentCycle);
  await advanceCampaignCycle(campaign.id);

  // Cycle 4 = Downtime: reset fighters in_recovery and captured
  if (newCycle === 4) {
    await applyDowntimeEffects(campaign.id);
  }

  revalidatePath("/admin/campaign");
  revalidatePath("/");
  revalidatePath("/player");
}
