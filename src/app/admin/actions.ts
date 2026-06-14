"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { createPlayerSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth/password";
import { getActiveCampaign } from "@/lib/db/queries";

export type AdminState = { error?: string; success?: string };

/** Cria a conta de um jogador + a gangue dele (sem self-signup). */
export async function createPlayer(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();

  const parsed = createPlayerSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { displayName, email, password, gangName, house } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });
  if (existing) return { error: "Já existe uma conta com esse e-mail." };

  const campaign = await getActiveCampaign();
  if (!campaign) return { error: "Nenhuma campanha ativa encontrada." };

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(schema.users)
    .values({ email, displayName, role: "player", passwordHash })
    .returning();
  if (!user) return { error: "Falha ao criar usuário." };

  await db.insert(schema.gangs).values({
    campaignId: campaign.id,
    ownerUserId: user.id,
    name: gangName,
    house,
  });

  revalidatePath("/admin");
  return { success: `Conta de ${displayName} criada com sucesso.` };
}

/** Ativa/desativa o acesso de um jogador. */
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
