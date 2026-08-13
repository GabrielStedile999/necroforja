/**
 * Advancement & lasting-injury CONFIG (issue #71) — functional data only.
 *
 * IP note (public repo): this file carries NUMBERS from the Core Rulebook
 * 2023 (XP costs and credit increases, p.149; characteristic bounds, p.73)
 * and short injury NAMES (p.127) with their numeric stat effects. No book
 * rule text lives here — the Arbitrator rolls the dice at the table and
 * records the result; the app never automates the 2D6/D66 tables.
 *
 * Stored-value semantics: WS/BS/I/Ld/Cl/Wil/Int are TARGET numbers (lower
 * is better); M/S/T/W/A are plain numbers (higher is better). An
 * "improvement of 1" therefore means stored −1 for roll stats and stored
 * +1 for flat stats — `storageDelta` does that translation once.
 */

export type StatKey =
  | "m" | "ws" | "bs" | "s" | "t" | "w"
  | "i" | "a" | "ld" | "cl" | "wil" | "int";

export const STAT_KEYS: StatKey[] = [
  "m", "ws", "bs", "s", "t", "w", "i", "a", "ld", "cl", "wil", "int",
];

/** Target-number stats (stored value: lower is better). */
export const ROLL_STATS: readonly StatKey[] = [
  "ws", "bs", "i", "ld", "cl", "wil", "int",
] as const;

export const STAT_LABEL: Record<StatKey, string> = {
  m: "M", ws: "WS", bs: "BS", s: "S", t: "T", w: "W",
  i: "I", a: "A", ld: "Ld", cl: "Cl", wil: "Wil", int: "Int",
};

/** Translates "improve/worsen by n" into the STORED delta for a stat. */
export function storageDelta(stat: StatKey, improvement: number): number {
  return ROLL_STATS.includes(stat) ? -improvement : improvement;
}

/**
 * Allowed STORED range per stat (Core Rulebook 2023, p.73), intersected
 * with the app's storage bounds (roll stats live in 1–6 since issue #63):
 * a roll stat's best is 2+ and its app-storable worst is 6+; psychology
 * stats improve no further than 3+. M caps at 8", W at 6, A at 10.
 */
export const STAT_BOUNDS: Record<StatKey, { min: number; max: number }> = {
  m: { min: 1, max: 8 },
  ws: { min: 2, max: 6 },
  bs: { min: 2, max: 6 },
  s: { min: 1, max: 6 },
  t: { min: 1, max: 6 },
  w: { min: 1, max: 6 },
  i: { min: 2, max: 6 },
  a: { min: 1, max: 10 },
  ld: { min: 3, max: 6 },
  cl: { min: 3, max: 6 },
  wil: { min: 3, max: 6 },
  int: { min: 3, max: 6 },
};

/** Clamps a stored stat value into its allowed range. */
export function clampStat(stat: StatKey, value: number): number {
  const { min, max } = STAT_BOUNDS[stat];
  return Math.max(min, Math.min(max, value));
}

/**
 * Characteristic Advancements (Core Rulebook 2023, p.149): base XP cost and
 * credit increase per +1 improvement. Repeats of the SAME characteristic
 * cost +2 XP each after the first — except for Juves and Prospects, who
 * pay the base cost every time (see FAST_LEARNER_CATEGORIES).
 */
export const STAT_ADVANCEMENTS: Record<
  StatKey,
  { xpCost: number; creditIncrease: number }
> = {
  wil: { xpCost: 3, creditIncrease: 5 },
  int: { xpCost: 3, creditIncrease: 5 },
  ld: { xpCost: 4, creditIncrease: 10 },
  cl: { xpCost: 4, creditIncrease: 10 },
  i: { xpCost: 5, creditIncrease: 10 },
  m: { xpCost: 5, creditIncrease: 10 },
  ws: { xpCost: 6, creditIncrease: 20 },
  bs: { xpCost: 6, creditIncrease: 20 },
  s: { xpCost: 8, creditIncrease: 30 },
  t: { xpCost: 8, creditIncrease: 30 },
  w: { xpCost: 12, creditIncrease: 45 },
  a: { xpCost: 12, creditIncrease: 45 },
};

/** Repeat-purchase XP surcharge per prior advancement of the same stat. */
export const REPEAT_STAT_SURCHARGE = 2;

/** Categories that never pay the repeat surcharge (p.149). */
export const FAST_LEARNER_CATEGORIES = ["juve", "prospect"] as const;

/**
 * Skill Advancements (Core Rulebook 2023, p.149). The die roll for random
 * skills happens at the table; the app records the outcome and charges the
 * configured XP/credits for the chosen acquisition tier.
 */
export const SKILL_ADVANCEMENTS = {
  primary_random: { label: "Primary set — random", xpCost: 6, creditIncrease: 20 },
  primary_chosen: { label: "Primary set — chosen", xpCost: 9, creditIncrease: 20 },
  secondary_random: { label: "Secondary set — random", xpCost: 9, creditIncrease: 35 },
  secondary_chosen: { label: "Secondary set — chosen", xpCost: 12, creditIncrease: 35 },
  any_random: { label: "Any set — random", xpCost: 15, creditIncrease: 50 },
} as const;

export type SkillTier = keyof typeof SKILL_ADVANCEMENTS;
export const SKILL_TIER_KEYS = Object.keys(
  SKILL_ADVANCEMENTS,
) as [SkillTier, ...SkillTier[]];

/**
 * Lasting-injury presets (Core Rulebook 2023, p.127) that leave a mark on
 * the Fighter card: name + numeric effect only ("improvement" is in book
 * semantics; negative = penalty). Dual-stat injuries carry two effects and
 * record one row per effect. Results that only set a status (Out Cold,
 * Convalescence, Recovery, Captured, dead) go through the existing status
 * flow instead. The D66 roll itself happens at the table.
 */
export const INJURY_PRESETS: {
  id: string;
  name: string;
  effects: { stat: StatKey; improvement: number }[];
}[] = [
  { id: "impressive-scars", name: "Impressive Scars", effects: [{ stat: "cl", improvement: 1 }] },
  { id: "old-battle-wound", name: "Old Battle Wound", effects: [] },
  { id: "partially-deafened", name: "Partially Deafened", effects: [] },
  { id: "humiliated", name: "Humiliated", effects: [{ stat: "ld", improvement: -1 }, { stat: "cl", improvement: -1 }] },
  { id: "eye-injury", name: "Eye Injury", effects: [{ stat: "bs", improvement: -1 }] },
  { id: "hand-injury", name: "Hand Injury", effects: [{ stat: "ws", improvement: -1 }] },
  { id: "hobbled", name: "Hobbled", effects: [{ stat: "m", improvement: -1 }] },
  { id: "spinal-injury", name: "Spinal Injury", effects: [{ stat: "s", improvement: -1 }] },
  { id: "enfeebled", name: "Enfeebled", effects: [{ stat: "t", improvement: -1 }] },
  { id: "head-injury", name: "Head Injury", effects: [{ stat: "wil", improvement: -1 }, { stat: "int", improvement: -1 }] },
];

export function getInjuryPreset(id: string) {
  return INJURY_PRESETS.find((p) => p.id === id) ?? null;
}
