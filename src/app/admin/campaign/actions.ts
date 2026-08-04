"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { getActiveCampaign, getLatestCampaign } from "@/lib/db/queries";
import {
  createChallengeSchema,
  resolveChallengeSchema,
  assignSympathiserSchema,
  awardTriumphSchema,
  createCampaignSchema,
  updateCampaignSchema,
  setCampaignCycleSchema,
  battleEventSchema,
} from "@/lib/validation";
import {
  setSympathiserController,
  clearSympathiserController,
  advanceCampaignCycle,
  applyDowntimeEffects,
  applyBattleEvent,
} from "@/lib/db/mutations";
import { SYMPATHISERS } from "@/lib/data/sympathisers";
import {
  controlWinner,
  rollScenario,
  nextCycleState,
  phaseForCycle,
} from "@/lib/campaign-rules";

export type CampaignState = { error?: string; success?: string };

/* ------------------------------------------------------------------ */
/*  Campaign lifecycle (issue #66)                                      */
/* ------------------------------------------------------------------ */

/**
 * Starts a new campaign from the UI (issue #66) — until now a campaign
 * could only be born via `db:seed`. One active campaign at a time is a
 * product decision: the public landing, challenges and rankings all assume
 * a single active campaign.
 */
export async function createCampaign(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  await requireAdmin();

  const active = await getActiveCampaign();
  if (active) {
    return {
      error: `"${active.name}" is still active — finish it before starting a new campaign.`,
    };
  }

  const parsed = createCampaignSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  await db.insert(schema.campaigns).values({
    name: d.name,
    phase: phaseForCycle(1, d.totalCycles),
    currentCycle: 1,
    totalCycles: d.totalCycles,
    startDate: d.startDate ?? null,
    endDate: d.endDate ?? null,
    status: "active",
  });

  revalidatePath("/admin/campaign");
  revalidatePath("/");
  revalidatePath("/campaign");
  return { success: `Campaign "${d.name}" started (cycle 1 of ${d.totalCycles}).` };
}

/**
 * Jumps the campaign to a specific cycle — forwards or BACKWARDS (regret
 * button for a mis-clicked "Advance cycle"). The phase is re-derived for
 * the target cycle. Downtime side effects (recovery/captured resets) are
 * NOT un-applied when rewinding — they are lossy; jumping forward into the
 * Downtime cycle applies them again (harmless: they only clear statuses).
 */
export async function setCampaignCycle(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  await requireAdmin();

  const parsed = setCampaignCycleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { campaignId, cycle } = parsed.data;

  const campaign = await db.query.campaigns.findFirst({
    where: eq(schema.campaigns.id, campaignId),
  });
  if (!campaign) return { error: "Campaign not found." };
  if (campaign.status !== "active") {
    return { error: "The campaign is closed." };
  }
  if (cycle > campaign.totalCycles) {
    return {
      error: `Cycle cannot exceed the campaign length (${campaign.totalCycles}).`,
    };
  }

  const newPhase = phaseForCycle(cycle, campaign.totalCycles);

  // Atomic (issue #62 pattern): cycle jump + Downtime effects together when
  // landing ON the Downtime cycle from outside it.
  await db.transaction(async (tx) => {
    await tx
      .update(schema.campaigns)
      .set({ currentCycle: cycle, phase: newPhase })
      .where(eq(schema.campaigns.id, campaignId));

    if (newPhase === "downtime" && campaign.phase !== "downtime") {
      await applyDowntimeEffects(campaignId, tx);
    }
  });

  revalidatePath("/admin/campaign");
  revalidatePath("/");
  revalidatePath("/campaign");
  return { success: `Campaign moved to cycle ${cycle} (${newPhase.replace(/_/g, " ")}).` };
}

/**
 * Edits the active campaign's name, dates and length. Shrinking below the
 * current cycle is rejected — the campaign cannot "un-live" cycles already
 * played.
 */
export async function updateCampaign(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  await requireAdmin();

  const parsed = updateCampaignSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  const campaign = await db.query.campaigns.findFirst({
    where: eq(schema.campaigns.id, d.campaignId),
  });
  if (!campaign) return { error: "Campaign not found." };

  if (d.totalCycles < campaign.currentCycle) {
    return {
      error: `Total cycles cannot be below the current cycle (${campaign.currentCycle}).`,
    };
  }

  // The length change can move the Downtime cycle — re-derive the phase for
  // the CURRENT cycle so the public state stays coherent.
  await db
    .update(schema.campaigns)
    .set({
      name: d.name,
      totalCycles: d.totalCycles,
      startDate: d.startDate ?? null,
      endDate: d.endDate ?? null,
      phase: phaseForCycle(campaign.currentCycle, d.totalCycles),
    })
    .where(eq(schema.campaigns.id, d.campaignId));

  revalidatePath("/admin/campaign");
  revalidatePath("/");
  revalidatePath("/campaign");
  return { success: `Campaign "${d.name}" updated.` };
}

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

  // Atomic (issue #62): the Sympathiser transfer and the challenge update
  // commit together — a challenge can no longer be marked resolved while the
  // control transfer was lost (or vice versa).
  await db.transaction(async (tx) => {
    if (winner && challenge.sympathiserId) {
      await setSympathiserController(
        challenge.sympathiserId,
        winner,
        campaign.currentCycle,
        tx,
      );
    }

    await tx
      .update(schema.challenges)
      .set({ outcome, resolved: true, playedAt: new Date() })
      .where(eq(schema.challenges.id, challengeId));
  });

  revalidatePath("/admin/campaign");
  revalidatePath("/");
  return { success: "Challenge resolved." };
}

/**
 * Logs ONE battle aftermath event on a resolved challenge (issue #69).
 * Validation is a zod discriminated union (each kind states its exact
 * fields); cross-row rules (challenge resolved, gang is a participant,
 * fighter belongs to the gang) and the effect itself live in
 * `applyBattleEvent`, which runs effect + log row + score recalc in one
 * transaction. Corrections are compensating events — never edit/delete.
 */
export async function recordBattleEvent(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  await requireAdmin();

  const parsed = battleEventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const result = await applyBattleEvent(parsed.data);
  if (!result.ok) return { error: result.error };

  // Stash/XP/status/reputation feed the admin panel, the player sheet and
  // the public ranking (cached Rating/Wealth).
  revalidatePath("/admin/campaign");
  revalidatePath("/player");
  revalidatePath("/");
  return { success: "Battle event logged." };
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

/**
 * Awards a Triumph to a gang (or to the campaign as a whole when gangId is empty).
 * Works on both active and finished campaigns.
 */
export async function awardTriumph(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  await requireAdmin();

  const campaign = await getLatestCampaign();
  if (!campaign) return { error: "No campaign found." };

  const parsed = awardTriumphSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { title, gangId } = parsed.data;

  // If a gangId is provided, confirm it belongs to this campaign
  if (gangId) {
    const gang = await db.query.gangs.findFirst({
      where: and(
        eq(schema.gangs.id, gangId),
        eq(schema.gangs.campaignId, campaign.id),
      ),
      columns: { id: true },
    });
    if (!gang) return { error: "Gang not found in this campaign." };
  }

  await db.insert(schema.triumphs).values({
    campaignId: campaign.id,
    gangId: gangId ?? null,
    title,
  });

  revalidatePath("/admin/campaign");
  revalidatePath("/");
  return { success: `Triumph "${title}" awarded.` };
}

/** Marks the active campaign as finished. */
export async function finishCampaign() {
  await requireAdmin();
  const campaign = await getActiveCampaign();
  if (!campaign) return;

  await db
    .update(schema.campaigns)
    .set({ status: "finished" })
    .where(eq(schema.campaigns.id, campaign.id));

  revalidatePath("/admin/campaign");
  revalidatePath("/");
}

/** Advances the campaign by one cycle (and adjusts the phase). When entering
 *  cycle 4 (Downtime), automatically applies the effects: clears in_recovery,
 *  returns captured fighters. */
export async function advanceCycle() {
  await requireAdmin();
  const campaign = await getActiveCampaign();
  if (!campaign) return;

  const { phase: newPhase } = nextCycleState(
    campaign.currentCycle,
    campaign.totalCycles,
  );

  // Atomic (issue #62): the cycle advance and the Downtime side effects
  // commit together — entering the Downtime cycle can no longer half-apply.
  await db.transaction(async (tx) => {
    await advanceCampaignCycle(campaign.id, tx);

    // Entering Downtime: reset fighters in_recovery and captured (issue #66
    // generalised the campaign length, so the trigger is the PHASE, not a
    // hardcoded cycle number).
    if (newPhase === "downtime" && campaign.phase !== "downtime") {
      await applyDowntimeEffects(campaign.id, tx);
    }
  });

  revalidatePath("/admin/campaign");
  revalidatePath("/");
  revalidatePath("/player");
}
