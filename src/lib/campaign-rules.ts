/**
 * Pure rules of the Succession Campaign (Cinderak Burning). No I/O — testable.
 * Structure: 7 cycles → Great Darkness (1-3), Downtime (4), Spark of Rebellion (5-7).
 */
import type { CampaignPhase } from "@/types";

export const TOTAL_CYCLES = 7;

/**
 * "Equipping a Fighter" (Core Rulebook 2023, p.83): a fighter on foot can
 * be equipped with a maximum of three weapons. (Asterisked weapons counting
 * double and the Mounted two-weapon cap are not modelled — equipment is
 * free text today; revisit with the equipment catalogue, issue #67.)
 */
export const MAX_WEAPONS_PER_FIGHTER = 3;

export type ChallengeOutcome =
  | "challenger_win"
  | "challenged_win"
  | "declined"
  | "draw";

/**
 * The single Downtime cycle sits in the middle of the campaign, preserving
 * the official 3/1/3 shape for 7 cycles (issue #66 generalises the length:
 * e.g. 5 cycles → 2 GD / 1 DT / 2 Spark; 3 → 1/1/1). Minimum meaningful
 * campaign is 3 cycles (enforced by createCampaignSchema).
 */
export function downtimeCycle(totalCycles: number = TOTAL_CYCLES): number {
  return Math.ceil(totalCycles / 2);
}

/** Phase corresponding to a cycle (defaults to the 7-cycle Cinderak shape). */
export function phaseForCycle(
  cycle: number,
  totalCycles: number = TOTAL_CYCLES,
): CampaignPhase {
  const dt = downtimeCycle(totalCycles);
  if (cycle < dt) return "great_darkness";
  if (cycle === dt) return "downtime";
  return "spark_of_rebellion";
}

/** Next cycle/phase state (capped at the end of the campaign). */
export function nextCycleState(
  cycle: number,
  totalCycles: number = TOTAL_CYCLES,
): {
  cycle: number;
  phase: CampaignPhase;
  finished: boolean;
} {
  const next = Math.min(cycle + 1, totalCycles);
  return {
    cycle: next,
    phase: phaseForCycle(next, totalCycles),
    finished: cycle >= totalCycles,
  };
}

/**
 * Challenge order: ascending by Gang Rating (the gang with the lowest Rating
 * challenges first). Ties maintain stable order.
 */
export function challengeOrder<T extends { rating: number }>(gangs: T[]): T[] {
  return [...gangs].sort((a, b) => a.rating - b.rating);
}

/** Rolls 2D6. */
export function roll2d6(rng: () => number = Math.random): number {
  const d = () => Math.floor(rng() * 6) + 1;
  return d() + d();
}

/**
 * Scenario selection table (2D6). Where there are two options, the first applies
 * in the Great Darkness phase and the second in the Spark of Rebellion.
 */
export function scenarioForRoll(
  roll: number,
  phase: CampaignPhase,
): string {
  const isSpark = phase === "spark_of_rebellion";
  if (roll <= 3) return "Choose who has MORE Sympathisers";
  if (roll <= 5) return isSpark ? "Parley Showdown" : "Fall of Badzones Outpost";
  if (roll <= 7) return isSpark ? "Battle of the Riftways" : "Gunk War";
  if (roll <= 9) return isSpark ? "Street Fight" : "Out of the Storm";
  return "Choose who has FEWER Sympathisers";
}

/** Convenience: rolls and returns the scenario. */
export function rollScenario(
  phase: CampaignPhase,
  rng: () => number = Math.random,
): { roll: number; scenario: string } {
  const roll = roll2d6(rng);
  return { roll, scenario: scenarioForRoll(roll, phase) };
}

/**
 * Gang that takes control of the contested Sympathiser after resolution.
 * Challenger win or decline → challenger; challenged win → challenged;
 * draw → nobody changes (null).
 */
export function controlWinner(
  outcome: ChallengeOutcome,
  challengerGangId: string,
  challengedGangId: string | null,
): string | null {
  switch (outcome) {
    case "challenger_win":
    case "declined":
      return challengerGangId;
    case "challenged_win":
      return challengedGangId;
    case "draw":
      return null;
  }
}
