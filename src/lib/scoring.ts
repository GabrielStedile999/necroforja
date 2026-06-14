/**
 * Cálculos de pontuação da gangue — fórmulas oficiais (Core Rulebook 2023, p.80–92).
 * Funções puras e testáveis (ver tests/scoring.test.ts).
 */
import type { Fighter, Gang } from "@/types";

/** Orçamento de fundação numa Succession Campaign (Cinderak Burning). */
export const SUCCESSION_FOUNDING_BUDGET = 2000;

/** Custo total de um fighter = custo base + soma de todo o equipamento equipado. */
export function fighterTotalCost(fighter: Fighter): number {
  const equipmentCost = fighter.equipment.reduce(
    (sum, item) => sum + item.cost,
    0,
  );
  return fighter.baseCost + equipmentCost;
}

/**
 * Gang Rating = custo total de todos os fighters (e veículos), incluindo todo
 * o equipamento e upgrades que carregam. Fighters mortos não contam.
 */
export function gangRating(gang: Gang): number {
  return gang.fighters
    .filter((f) => f.status !== "dead")
    .reduce((sum, f) => sum + fighterTotalCost(f), 0);
}

/**
 * Wealth = Gang Rating + valor dos créditos e equipamentos no Stash.
 */
export function gangWealth(gang: Gang): number {
  const stashEquipment = gang.stash.reduce(
    (sum, item) => sum + item.equipment.cost * item.qty,
    0,
  );
  return gangRating(gang) + gang.stashCredits + stashEquipment;
}

/** Créditos já gastos na fundação (útil na tela de criação de gangue). */
export function creditsSpent(gang: Gang): number {
  return gang.fighters.reduce((sum, f) => sum + fighterTotalCost(f), 0);
}

/** Créditos restantes do orçamento de fundação. */
export function creditsRemaining(
  gang: Gang,
  budget: number = SUCCESSION_FOUNDING_BUDGET,
): number {
  return budget - creditsSpent(gang);
}
