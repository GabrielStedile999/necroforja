import type { CampaignPhase } from "@/types";

/**
 * Cinderak Burning narrative scenario catalogue (issue #87) — p.77–101.
 *
 * IP note (public repo): this file carries scenario NAMES and NUMERIC
 * reward parameters only (dice labels, fixed modifiers). Setup, special
 * rules and reward conditions beyond these standard lines are played and
 * policed at the table; the dice are always rolled there — the app
 * validates and records the results (issue #69 aftermath philosophy).
 *
 * Reward spec semantics (all gang-level; per-fighter XP beyond the
 * universal participation point is table-side, via the aftermath panel):
 * - creditsWinner/creditsLoser: dice label, or null when the scenario has
 *   no standard credit line for that side.
 * - creditsDraw: dice label EACH gang adds when the battle is a draw.
 * - repWinner: dice label the victor rolls for Reputation.
 * - repBottled: fixed Reputation change for a gang that bottled out.
 * - xpEach: participation XP per fighter (recorded via the aftermath log).
 * - winnerCreditsOnlyAttacker / repWinnerOnlyDefender: the two
 *   conditional lines in the catalogue (Assassin in the Spire). In a
 *   campaign the CHALLENGER is the attacker, so the app can gate them.
 */
export interface ScenarioRewards {
  creditsWinner: string | null;
  creditsLoser: string | null;
  creditsDraw: string | null;
  repWinner: string | null;
  repBottled: number;
  xpEach: number;
  winnerCreditsOnlyAttacker?: true;
  repWinnerOnlyDefender?: true;
}

export interface ScenarioEntry {
  id: string;
  name: string;
  /** Phase the 2D6 table offers it in; "any" = chooser's pick only. */
  phase: CampaignPhase | "any";
  rewards: ScenarioRewards;
}

export const SCENARIOS: ScenarioEntry[] = [
  {
    id: "fall-of-badzones-outpost",
    name: "Fall of Badzones Outpost",
    phase: "great_darkness",
    rewards: { creditsWinner: "D6x10", creditsLoser: "D3x5", creditsDraw: null, repWinner: "D3", repBottled: -1, xpEach: 1 },
  },
  {
    id: "gunk-war",
    name: "Gunk War",
    phase: "great_darkness",
    rewards: { creditsWinner: "2D6x10", creditsLoser: "D3x10", creditsDraw: null, repWinner: "D3", repBottled: -1, xpEach: 1 },
  },
  {
    id: "they-come-from-below",
    name: "They Come From Below!",
    phase: "any",
    rewards: { creditsWinner: "2D6x10", creditsLoser: "D6x5", creditsDraw: "D6x10", repWinner: "D3", repBottled: -1, xpEach: 1 },
  },
  {
    id: "out-of-the-storm",
    name: "Out of the Storm",
    phase: "great_darkness",
    rewards: { creditsWinner: "D6x10", creditsLoser: "D3x5", creditsDraw: "D6x5", repWinner: "D3", repBottled: -1, xpEach: 1 },
  },
  {
    id: "assassin-in-the-spire",
    name: "Assassin in the Spire",
    phase: "any",
    rewards: {
      creditsWinner: "3D6x10",
      creditsLoser: "D6x10",
      creditsDraw: null,
      repWinner: "D3+1",
      repBottled: 0,
      xpEach: 1,
      winnerCreditsOnlyAttacker: true,
      repWinnerOnlyDefender: true,
    },
  },
  {
    id: "escape-from-hive-zalktraa",
    name: "Escape from Hive Zalktraa",
    phase: "any",
    // Rescue mission: rewards are per-captive-freed — recorded through the
    // aftermath panel; only the bottled-out line is standard.
    rewards: { creditsWinner: null, creditsLoser: null, creditsDraw: null, repWinner: null, repBottled: -1, xpEach: 1 },
  },
  {
    id: "parley-showdown",
    name: "Parley Showdown",
    phase: "spark_of_rebellion",
    rewards: { creditsWinner: "2D6x10", creditsLoser: "D3x10", creditsDraw: "D6x10", repWinner: "D3", repBottled: -1, xpEach: 1 },
  },
  {
    id: "house-of-pain",
    name: "House of Pain",
    phase: "any",
    rewards: { creditsWinner: "2D6x10", creditsLoser: "D6x5", creditsDraw: "D6x10", repWinner: "D3", repBottled: -1, xpEach: 1 },
  },
  {
    id: "battle-of-the-riftways",
    name: "Battle of the Riftways",
    phase: "spark_of_rebellion",
    rewards: { creditsWinner: "3D6x10", creditsLoser: "D6x10", creditsDraw: null, repWinner: "D3", repBottled: -1, xpEach: 1 },
  },
  {
    id: "street-fight",
    name: "Street Fight",
    phase: "spark_of_rebellion",
    rewards: { creditsWinner: "3D6x10", creditsLoser: "D6x10", creditsDraw: "2D6x10", repWinner: "D3", repBottled: -1, xpEach: 1 },
  },
  {
    id: "bar-defence",
    name: "Bar Defence",
    phase: "any",
    rewards: { creditsWinner: "2D6x10", creditsLoser: "D6x5", creditsDraw: null, repWinner: "D3", repBottled: -1, xpEach: 1 },
  },
  {
    id: "market-mayhem",
    name: "Market Mayhem",
    phase: "any",
    rewards: { creditsWinner: "2D6x10", creditsLoser: "D6x5", creditsDraw: "D6x10", repWinner: "D3", repBottled: -1, xpEach: 1 },
  },
];

export function getScenario(id: string): ScenarioEntry | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

/** Case-insensitive name lookup (free-text challenge entries). */
export function getScenarioByName(name: string): ScenarioEntry | undefined {
  const needle = name.trim().toLowerCase();
  return SCENARIOS.find((s) => s.name.toLowerCase() === needle);
}

/**
 * Bounds of a rolled dice label ("D3", "2D6x10", "D3x5", "D3+1"…): the
 * server validates the table's rolled result against them. Returns null
 * for an unparseable label.
 */
export function diceBounds(
  label: string,
): { min: number; max: number; step: number } | null {
  const m = /^(\d*)D(\d+)(?:x(\d+))?(?:\+(\d+))?$/i.exec(label.trim());
  if (!m) return null;
  const count = m[1] ? parseInt(m[1], 10) : 1;
  const faces = parseInt(m[2]!, 10);
  const mult = m[3] ? parseInt(m[3], 10) : 1;
  const add = m[4] ? parseInt(m[4], 10) : 0;
  if (count < 1 || faces < 2 || mult < 1) return null;
  return {
    min: count * mult + add,
    max: count * faces * mult + add,
    // a +N shift keeps the die's natural step; an xN multiplies it
    step: mult,
  };
}
