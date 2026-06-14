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

/** Registra um desafio por um Sympathiser no ciclo atual. */
export async function createChallenge(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  await requireAdmin();
  const campaign = await getActiveCampaign();
  if (!campaign) return { error: "Nenhuma campanha ativa." };

  const parsed = createChallengeSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;

  if (d.challengedGangId && d.challengedGangId === d.challengerGangId) {
    return { error: "Uma gangue não pode desafiar a si mesma." };
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
  return { success: `Desafio registrado (cenário: ${scenario}).` };
}

/** Resolve um desafio: transfere o Sympathiser ao vencedor. */
export async function resolveChallenge(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  await requireAdmin();
  const campaign = await getActiveCampaign();
  if (!campaign) return { error: "Nenhuma campanha ativa." };

  const parsed = resolveChallengeSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { challengeId, outcome } = parsed.data;

  const challenge = await db.query.challenges.findFirst({
    where: eq(schema.challenges.id, challengeId),
  });
  if (!challenge) return { error: "Desafio não encontrado." };
  if (challenge.resolved) return { error: "Desafio já resolvido." };

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
  return { success: "Desafio resolvido." };
}

/** Ativa/desativa um Sympathiser na campanha (some do mapa público e dos desafios). */
export async function toggleSympathiser(formData: FormData) {
  await requireAdmin();
  const sympathiserId = String(formData.get("sympathiserId"));
  const enabled = formData.get("enabled") === "true"; // estado atual
  if (!sympathiserId) return;
  await db
    .update(schema.sympathisers)
    .set({ enabled: !enabled })
    .where(eq(schema.sympathisers.id, sympathiserId));
  revalidatePath("/admin/campaign");
  revalidatePath("/");
}

/**
 * Atribui manualmente um Sympathiser a uma gangue, ou libera-o (gangId = "").
 * Encerra o controle atual e cria um novo registro se gangId for fornecido.
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
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { sympathiserId, gangId } = parsed.data;

  // Validar que o sympathiserId existe no catálogo fixo
  if (!SYMPATHISERS.find((s) => s.id === sympathiserId)) {
    return { error: "Sympathiser inválido." };
  }

  if (gangId === "") {
    // Liberar: encerrar controle atual sem criar novo
    await clearSympathiserController(sympathiserId);
    revalidatePath("/admin/campaign");
    revalidatePath("/");
    return { success: "Sympathiser liberado." };
  }

  // Validar que a gangue pertence à campanha ativa
  const campaign = await getActiveCampaign();
  if (!campaign) return { error: "Nenhuma campanha ativa." };

  const gang = await db.query.gangs.findFirst({
    where: and(
      eq(schema.gangs.id, gangId),
      eq(schema.gangs.campaignId, campaign.id),
    ),
    columns: { id: true },
  });
  if (!gang) return { error: "Gangue inválida." };

  await setSympathiserController(sympathiserId, gangId, campaign.currentCycle);
  revalidatePath("/admin/campaign");
  revalidatePath("/");
  return { success: "Atribuição registrada." };
}

/** Avança a campanha um ciclo (e ajusta a fase). Ao entrar no ciclo 4 (Downtime),
 *  aplica automaticamente os efeitos: limpa in_recovery, devolve capturados. */
export async function advanceCycle() {
  await requireAdmin();
  const campaign = await getActiveCampaign();
  if (!campaign) return;

  const { cycle: newCycle } = nextCycleState(campaign.currentCycle);
  await advanceCampaignCycle(campaign.id);

  // Ciclo 4 = Downtime: resetar fighters in_recovery e captured
  if (newCycle === 4) {
    await applyDowntimeEffects(campaign.id);
  }

  revalidatePath("/admin/campaign");
  revalidatePath("/");
  revalidatePath("/player");
}
