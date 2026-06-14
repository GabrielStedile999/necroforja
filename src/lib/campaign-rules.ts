/**
 * Regras puras da Succession Campaign (Cinderak Burning). Sem I/O — testáveis.
 * Estrutura: 7 ciclos → Great Darkness (1-3), Downtime (4), Spark of Rebellion (5-7).
 */
import type { CampaignPhase } from "@/types";

export const TOTAL_CYCLES = 7;

export type ChallengeOutcome =
  | "challenger_win"
  | "challenged_win"
  | "declined"
  | "draw";

/** Fase correspondente a um ciclo. */
export function phaseForCycle(cycle: number): CampaignPhase {
  if (cycle <= 3) return "great_darkness";
  if (cycle === 4) return "downtime";
  return "spark_of_rebellion";
}

/** Próximo estado de ciclo/fase (limitado ao fim da campanha). */
export function nextCycleState(cycle: number): {
  cycle: number;
  phase: CampaignPhase;
  finished: boolean;
} {
  const next = Math.min(cycle + 1, TOTAL_CYCLES);
  return {
    cycle: next,
    phase: phaseForCycle(next),
    finished: cycle >= TOTAL_CYCLES,
  };
}

/**
 * Ordem dos desafios: ascendente por Gang Rating (a de menor Rating desafia
 * primeiro). Empates mantêm ordem estável.
 */
export function challengeOrder<T extends { rating: number }>(gangs: T[]): T[] {
  return [...gangs].sort((a, b) => a.rating - b.rating);
}

/** Rola 2D6. */
export function roll2d6(rng: () => number = Math.random): number {
  const d = () => Math.floor(rng() * 6) + 1;
  return d() + d();
}

/**
 * Tabela de seleção de cenário (2D6). Onde há duas opções, a primeira vale na
 * fase Great Darkness e a segunda na Spark of Rebellion.
 */
export function scenarioForRoll(
  roll: number,
  phase: CampaignPhase,
): string {
  const isSpark = phase === "spark_of_rebellion";
  if (roll <= 3) return "Escolhe quem tem MAIS Sympathisers";
  if (roll <= 5) return isSpark ? "Parley Showdown" : "Fall of Badzones Outpost";
  if (roll <= 7) return isSpark ? "Battle of the Riftways" : "Gunk War";
  if (roll <= 9) return isSpark ? "Street Fight" : "Out of the Storm";
  return "Escolhe quem tem MENOS Sympathisers";
}

/** Conveniência: rola e devolve o cenário. */
export function rollScenario(
  phase: CampaignPhase,
  rng: () => number = Math.random,
): { roll: number; scenario: string } {
  const roll = roll2d6(rng);
  return { roll, scenario: scenarioForRoll(roll, phase) };
}

/**
 * Gangue que passa a controlar o Sympathiser em disputa após a resolução.
 * Vitória do desafiante ou recusa → desafiante; vitória do desafiado → desafiado;
 * empate → ninguém muda (null).
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
