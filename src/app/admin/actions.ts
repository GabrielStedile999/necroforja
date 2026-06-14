"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { createPlayerSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth/password";
import { getActiveCampaign } from "@/lib/db/queries";

export type AdminState = { error?: string; success?: string };

/** Creates a player account + their gang (no self-signup). */
export async function createPlayer(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();

  const parsed = createPlayerSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { displayName, email, password, gangName, house } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });
  if (existing) return { error: "An account with this e-mail already exists." };

  const campaign = await getActiveCampaign();
  if (!campaign) return { error: "No active campaign found." };

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(schema.users)
    .values({ email, displayName, role: "player", passwordHash })
    .returning();
  if (!user) return { error: "Failed to create user." };

  await db.insert(schema.gangs).values({
    campaignId: campaign.id,
    ownerUserId: user.id,
    name: gangName,
    house,
  });

  revalidatePath("/admin");
  return { success: `Account for ${displayName} created successfully.` };
}

/** Activates/deactivates a player's access. */
export async function togglePlayerActive(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId"));
  const isActive = formData.get("isActive") === "true";
  await db
    .update(schema.users)
    .set({ isActive: !isActive })
    .where(eq(schema.users.id, userId));
  revalidatePath("/admin");
}
