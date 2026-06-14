/**
 * Gang scoring calculations — official formulas (Core Rulebook 2023, p.80–92).
 * Pure and testable functions (see tests/scoring.test.ts).
 */
import type { Fighter, Gang } from "@/types";

/** Founding budget in a Succession Campaign (Cinderak Burning). */
export const SUCCESSION_FOUNDING_BUDGET = 2000;

/** Total cost of a fighter = base cost + sum of all equipped items. */
export function fighterTotalCost(fighter: Fighter): number {
  const equipmentCost = fighter.equipment.reduce(
    (sum, item) => sum + item.cost,
    0,
  );
  return fighter.baseCost + equipmentCost;
}

/**
 * Gang Rating = total cost of all fighters (and vehicles), including all
 * equipment and upgrades they carry. Dead fighters do not count.
 */
export function gangRating(gang: Gang): number {
  return gang.fighters
    .filter((f) => f.status !== "dead")
    .reduce((sum, f) => sum + fighterTotalCost(f), 0);
}

/**
 * Wealth = Gang Rating + value of credits and equipment in the Stash.
 */
export function gangWealth(gang: Gang): number {
  const stashEquipment = gang.stash.reduce(
    (sum, item) => sum + item.equipment.cost * item.qty,
    0,
  );
  return gangRating(gang) + gang.stashCredits + stashEquipment;
}

/** Credits already spent on founding (useful on the gang creation screen). */
export function creditsSpent(gang: Gang): number {
  return gang.fighters.reduce((sum, f) => sum + fighterTotalCost(f), 0);
}

/** Remaining credits from the founding budget. */
export function creditsRemaining(
  gang: Gang,
  budget: number = SUCCESSION_FOUNDING_BUDGET,
): number {
  return budget - creditsSpent(gang);
}
