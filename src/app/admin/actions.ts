"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { createPlayerSchema, updatePlayerSchema } from "@/lib/validation";
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

/**
 * Edits a player account — display name, login e-mail and, optionally, a
 * new password (issue #57). Restrito a contas `role: "player"`: a conta
 * admin não é editável por aqui (proteção contra lockout/hijack do próprio
 * painel). Senha vazia mantém a atual; trocar e-mail/senha NÃO derruba uma
 * sessão JWT já emitida do player (expira sozinha em até 7 dias — issue #40).
 */
export async function updatePlayer(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();

  const parsed = updatePlayerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { userId, displayName, email, password } = parsed.data;

  const target = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });
  if (!target) return { error: "Player not found." };
  if (target.role !== "player") {
    return { error: "Only player accounts can be edited here." };
  }

  if (email !== target.email) {
    const emailTaken = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
    if (emailTaken) return { error: "An account with this e-mail already exists." };
  }

  await db
    .update(schema.users)
    .set({
      displayName,
      email,
      // Só troca o hash quando o admin realmente digitou uma senha nova.
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
    })
    .where(eq(schema.users.id, userId));

  revalidatePath("/admin");
  return { success: `Account for ${displayName} updated.` };
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
