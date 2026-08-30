import type { Sympathiser } from "@/types";

/**
 * Catalogue of the 26 Sympathisers in the Cinderak Burning campaign.
 * They are contestable territories; the Arbitrator chooses which ones are
 * active in the campaign (see the `enabled` column in `sympathiser`).
 */
export const SYMPATHISERS: Sympathiser[] = [
  { id: "promethium-guild", name: "Promethium Guild Sympathisers" },
  { id: "water-guild", name: "Water Guild Sympathisers" },
  { id: "slave-guild", name: "Slave Guild Sympathisers" },
  { id: "corpse-guild", name: "Corpse Guild Sympathisers" },
  { id: "guild-of-coin", name: "Guild of Coin Sympathisers" },
  { id: "iron-guild", name: "Iron Guild Sympathisers" },
  { id: "imperial-imposter", name: "Imperial Imposter Sympathisers" },
  { id: "cold-trader", name: "Cold Trader Sympathisers" },
  { id: "narco-lord", name: "Narco Lord Sympathisers" },
  { id: "rogue-factoria", name: "Rogue Factoria Sympathisers" },
  { id: "fallen-house", name: "Fallen House Sympathisers" },
  { id: "psi-syndica", name: "Psi-syndica Sympathisers" },
  { id: "house-catallus", name: "House Catallus Sympathisers" },
  { id: "house-ulanti", name: "House Ulanti Sympathisers" },
  { id: "house-greim", name: "House Greim Sympathisers" },
  { id: "house-koiron", name: "House Ko'iron Sympathisers" },
  { id: "house-ran-lo", name: "House Ran Lo Sympathisers" },
  { id: "house-ty", name: "House Ty Sympathisers" },
  { id: "electro-guild", name: "Electro Guild Sympathisers" },
  { id: "air-guild", name: "Air Guild Sympathisers" },
  { id: "venator", name: "Venator Sympathisers" },
  { id: "dregs-of-the-hive", name: "Dregs of the Hive Sympathisers" },
  { id: "wasteland-scrapper", name: "Wasteland Scrapper Sympathisers" },
  { id: "second-best-smuggler", name: "Second Best Smuggler Sympathisers" },
  { id: "heretek", name: "Heretek Sympathisers" },
  { id: "explorator", name: "Explorator Sympathisers" },
];

export function getSympathiser(id: string): Sympathiser | undefined {
  return SYMPATHISERS.find((s) => s.id === id);
}

/* ---------------------- Sympathiser Boons (issue #85) ---------------------- */

/**
 * Functional boon PARAMETERS only (Cinderak Burning, p.65–76) — dice
 * labels and flags, never rule text. The REWRITTEN boon summaries live in
 * the private `sympathiser_boon` table (keyword_rule IP pattern), imported
 * by the Arbitrator from a gitignored private JSON. Dice are always rolled
 * at the table; the app validates and records the result.
 *
 * - `baseIncome`: dice label of the always-on credit boon (collected
 *   together with the Spark income in-app); null = none.
 * - `sparkIncome`: dice label of the additional Spark of Rebellion credit
 *   boon; null = none (some Sympathisers pay in XP, items or abilities —
 *   table-side, display only).
 * - `rosterEffect`: the roster effect the app automates; everything else
 *   is display only.
 */
export type SympathiserRosterEffect = "clear_recovery";

export interface SympathiserBoonConfig {
  baseIncome: string | null;
  sparkIncome: string | null;
  rosterEffect: SympathiserRosterEffect | null;
}

export const SYMPATHISER_BOONS: Record<string, SympathiserBoonConfig> = {
  "promethium-guild": { baseIncome: null, sparkIncome: "D6x10", rosterEffect: null },
  "water-guild": { baseIncome: null, sparkIncome: "2D6x10", rosterEffect: "clear_recovery" },
  "slave-guild": { baseIncome: null, sparkIncome: "2D6x10", rosterEffect: null },
  "corpse-guild": { baseIncome: null, sparkIncome: "D6x10", rosterEffect: null },
  "guild-of-coin": { baseIncome: "D6x10", sparkIncome: "2D6x10", rosterEffect: null },
  "iron-guild": { baseIncome: null, sparkIncome: "D6x10", rosterEffect: null },
  "imperial-imposter": { baseIncome: "D6x10", sparkIncome: null, rosterEffect: null },
  "cold-trader": { baseIncome: null, sparkIncome: "2D6x10", rosterEffect: null },
  "narco-lord": { baseIncome: null, sparkIncome: "2D6x10", rosterEffect: null },
  "rogue-factoria": { baseIncome: null, sparkIncome: "D6x10", rosterEffect: null },
  "fallen-house": { baseIncome: null, sparkIncome: "D6x10", rosterEffect: null },
  "psi-syndica": { baseIncome: null, sparkIncome: "D6x10", rosterEffect: null },
  "house-catallus": { baseIncome: null, sparkIncome: "D6x10", rosterEffect: null },
  "house-ulanti": { baseIncome: "2D6x10", sparkIncome: "2D6x10", rosterEffect: null },
  "house-greim": { baseIncome: null, sparkIncome: "2D6x10", rosterEffect: null },
  "house-koiron": { baseIncome: null, sparkIncome: "D6x10", rosterEffect: null },
  "house-ran-lo": { baseIncome: null, sparkIncome: "D6x10", rosterEffect: null },
  "house-ty": { baseIncome: null, sparkIncome: "2D6x10", rosterEffect: null },
  "electro-guild": { baseIncome: null, sparkIncome: "D6x10", rosterEffect: null },
  "air-guild": { baseIncome: null, sparkIncome: "D6x10", rosterEffect: null },
  "venator": { baseIncome: null, sparkIncome: null, rosterEffect: null },
  "dregs-of-the-hive": { baseIncome: null, sparkIncome: null, rosterEffect: null },
  "wasteland-scrapper": { baseIncome: null, sparkIncome: "2D6x10", rosterEffect: null },
  "second-best-smuggler": { baseIncome: "2D6x10", sparkIncome: "D6x10", rosterEffect: null },
  "heretek": { baseIncome: null, sparkIncome: "2D6x10", rosterEffect: null },
  "explorator": { baseIncome: null, sparkIncome: "3D6x10", rosterEffect: null },
};

export function getSympathiserBoons(id: string): SympathiserBoonConfig | null {
  return SYMPATHISER_BOONS[id] ?? null;
}

/**
 * Dice labels a controlling gang rolls when collecting this Sympathiser's
 * income in the given phase. The in-app collection happens once per cycle
 * in the Spark of Rebellion phase (issue #85) and covers base + Spark
 * boons together — an empty array means no credit income to collect.
 */
export function sympathiserIncomeDice(
  id: string,
  phase: string,
): string[] {
  const cfg = SYMPATHISER_BOONS[id];
  if (!cfg) return [];
  const dice: string[] = [];
  if (cfg.baseIncome) dice.push(cfg.baseIncome);
  if (phase === "spark_of_rebellion" && cfg.sparkIncome) {
    dice.push(cfg.sparkIncome);
  }
  return dice;
}

/** Imperial House "Deep Pockets": extra dice when generating Sympathiser income. */
export const DEEP_POCKETS_DICE = "D6x10";

/**
 * Home Support (every gang's own Sympathisers — never contestable): in the
 * Spark of Rebellion phase, a table roll of 2D6 ≥ 10 adds a free Ganger
 * to the roster (equipment still paid as normal). One per gang per cycle.
 */
export const HOME_SUPPORT_RECRUIT = { dice: "2D6", threshold: 10 } as const;

/**
 * Server bounds for a collected income amount: rolled at the table, always
 * a multiple of 10; the ceiling covers the largest combination (3D6x10
 * plus modifiers such as Deep Pockets or the Fallen House double).
 */
export const SYMPATHISER_INCOME_MIN = 10;
export const SYMPATHISER_INCOME_MAX = 300;
