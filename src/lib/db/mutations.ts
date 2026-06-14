import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "./index";
import { getGangById } from "./queries";
import { gangRating, gangWealth } from "@/lib/scoring";
import { nextCycleState } from "@/lib/campaign-rules";

/**
 * Recalcula e persiste Rating e Wealth de uma gangue após qualquer alteração.
 * Mantém os valores cacheados consistentes para leitura rápida no ranking.
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
 * Transfere o controle de um Sympathiser para uma gangue: encerra o controle
 * atual (isCurrent=false) e registra o novo (mantém histórico).
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
 * Passos de Downtime (ciclo 4):
 * - Fighters "in_recovery" voltam a "active".
 * - Fighters "captured" são devolvidos: voltam a "active" e capturedByGangId é limpo.
 * Recalcula scores de todas as gangues afetadas.
 */
export async function applyDowntimeEffects(campaignId: string): Promise<void> {
  const campaignGangs = await db.query.gangs.findMany({
    where: eq(schema.gangs.campaignId, campaignId),
    columns: { id: true },
  });
  if (campaignGangs.length === 0) return;

  const gangIds = campaignGangs.map((g) => g.id);

  // 1. Limpar in_recovery → active
  await db
    .update(schema.fighters)
    .set({ status: "active" })
    .where(
      and(
        inArray(schema.fighters.gangId, gangIds),
        eq(schema.fighters.status, "in_recovery"),
      ),
    );

  // 2. Devolver capturados → active (limpa a gangue captora)
  await db
    .update(schema.fighters)
    .set({ status: "active", capturedByGangId: null })
    .where(
      and(
        inArray(schema.fighters.gangId, gangIds),
        eq(schema.fighters.status, "captured"),
      ),
    );

  // 3. Recalcular scores (status dead/active afeta o Rating)
  for (const { id } of campaignGangs) {
    await recalcGangScores(id);
  }
}

/**
 * Remove o controle atual de um Sympathiser sem atribuir um novo (libera-o).
 * Encerra o registro is_current sem criar um substituto.
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

/** Avança a campanha um ciclo, ajustando a fase automaticamente. */
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
