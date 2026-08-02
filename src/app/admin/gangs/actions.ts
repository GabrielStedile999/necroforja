"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { getActiveCampaign } from "@/lib/db/queries";
import { recalcGangScores } from "@/lib/db/mutations";
import {
  updateGangSchema,
  transferGangSchema,
  createGangForUserSchema,
  deleteGangSchema,
  toggleGangActiveSchema,
} from "@/lib/validation";

export type GangAdminState = { error?: string; success?: string };

/** Paths that render gang identity/ranking data. */
function revalidateGangViews(gangId?: string) {
  revalidatePath("/");
  revalidatePath("/gangs");
  revalidatePath("/player");
  revalidatePath("/admin");
  if (gangId) revalidatePath(`/admin/gangs/${gangId}`);
}

/**
 * Edits a gang's identity: name, house and Reputation (issue #64).
 * Reputation is a separate attribute from Rating (starts at 1, limits
 * Hangers-on/Brutes) — the Arbitrator adjusts it manually until battle
 * events automate it (issue #69).
 */
export async function updateGang(
  _prev: GangAdminState,
  formData: FormData,
): Promise<GangAdminState> {
  await requireAdmin();

  const parsed = updateGangSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { gangId, name, house, reputation } = parsed.data;

  const gang = await db.query.gangs.findFirst({
    where: eq(schema.gangs.id, gangId),
    columns: { id: true },
  });
  if (!gang) return { error: "Gang not found." };

  await db
    .update(schema.gangs)
    .set({ name, house, reputation })
    .where(eq(schema.gangs.id, gangId));

  revalidateGangViews(gangId);
  return { success: `${name} updated.` };
}

/**
 * Transfers a gang to another account, or releases it (no owner) when the
 * target is empty. One gang per player: transferring to an account that
 * already owns a gang is rejected (the 1:1 assumption is used across the
 * app — getGangByOwnerId).
 */
export async function transferGang(
  _prev: GangAdminState,
  formData: FormData,
): Promise<GangAdminState> {
  await requireAdmin();

  const parsed = transferGangSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { gangId, newOwnerUserId } = parsed.data;

  const gang = await db.query.gangs.findFirst({
    where: eq(schema.gangs.id, gangId),
    columns: { id: true, name: true },
  });
  if (!gang) return { error: "Gang not found." };

  if (!newOwnerUserId) {
    await db
      .update(schema.gangs)
      .set({ ownerUserId: null })
      .where(eq(schema.gangs.id, gangId));
    revalidateGangViews(gangId);
    return { success: `${gang.name} released (no owner).` };
  }

  const target = await db.query.users.findFirst({
    where: eq(schema.users.id, newOwnerUserId),
    with: { gangs: { columns: { id: true } } },
  });
  if (!target || target.role !== "player") {
    return { error: "Target account not found (must be a player)." };
  }
  if (target.gangs.length > 0 && target.gangs[0]?.id !== gangId) {
    return { error: `${target.displayName} already owns a gang.` };
  }

  await db
    .update(schema.gangs)
    .set({ ownerUserId: newOwnerUserId })
    .where(eq(schema.gangs.id, gangId));

  revalidateGangViews(gangId);
  return { success: `${gang.name} transferred to ${target.displayName}.` };
}

/**
 * Creates a gang for an existing account that has none (issue #64) — until
 * now a gang could only be born inside createPlayer, so an account without
 * one was a dead end.
 */
export async function createGangForUser(
  _prev: GangAdminState,
  formData: FormData,
): Promise<GangAdminState> {
  await requireAdmin();

  const parsed = createGangForUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { userId, name, house } = parsed.data;

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    with: { gangs: { columns: { id: true } } },
  });
  if (!user || user.role !== "player") {
    return { error: "Account not found (must be a player)." };
  }
  if (user.gangs.length > 0) {
    return { error: `${user.displayName} already owns a gang.` };
  }

  const campaign = await getActiveCampaign();
  if (!campaign) return { error: "No active campaign found." };

  // Atomic (issue #62 pattern): insert + cached-score seed commit together.
  await db.transaction(async (tx) => {
    const [gang] = await tx
      .insert(schema.gangs)
      .values({ campaignId: campaign.id, ownerUserId: userId, name, house })
      .returning();
    if (gang) await recalcGangScores(gang.id, tx);
  });

  revalidateGangViews();
  return { success: `${name} created for ${user.displayName}.` };
}

/**
 * Deletes a gang and everything under it (fighters, equipment links, stash,
 * challenges and control history cascade at the database level). The admin
 * must type the gang's exact name — this is irreversible and the database
 * is production.
 */
export async function deleteGang(
  _prev: GangAdminState,
  formData: FormData,
): Promise<GangAdminState> {
  await requireAdmin();

  const parsed = deleteGangSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { gangId, confirmName } = parsed.data;

  const gang = await db.query.gangs.findFirst({
    where: eq(schema.gangs.id, gangId),
    columns: { id: true, name: true },
  });
  if (!gang) return { error: "Gang not found." };
  if (confirmName.trim() !== gang.name) {
    return { error: "Name does not match — type the gang name exactly to confirm." };
  }

  await db.delete(schema.gangs).where(eq(schema.gangs.id, gangId));

  revalidateGangViews();
  return {
    success: `${gang.name} deleted. Any Sympathisers it controlled are now uncontrolled.`,
  };
}

/**
 * Activates/deactivates a gang's participation in the campaign (issue #66
 * follow-up): registered players can sit a campaign out. Inactive gangs
 * leave the public ranking and the challenge/Sympathiser options, but keep
 * all their data and can return at any time.
 */
export async function toggleGangActive(formData: FormData) {
  await requireAdmin();

  const parsed = toggleGangActiveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { gangId, isActive } = parsed.data;

  await db
    .update(schema.gangs)
    .set({ isActive: isActive !== "true" })
    .where(eq(schema.gangs.id, gangId));

  revalidateGangViews(gangId);
  revalidatePath("/admin/campaign");
  revalidatePath("/campaign");
}
