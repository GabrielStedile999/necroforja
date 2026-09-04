/**
 * Universal Skill Sets catalogue (issue #89) — Core Rulebook 2023,
 * p.256–261.
 *
 * IP note (public repo): this file carries skill NAMES, their set and
 * their D6 index (1–6, used for random rolls at the table) — functional
 * data only. Skill RULE TEXT is book prose: rewritten summaries live in
 * the private keyword_rule table (the #67 IP pattern — one entry per
 * skill name, imported via the /admin/catalog keyword flow) and surface
 * as clickable chips on the fighter card.
 *
 * `setKey` strings stay open: house Skill Sets (House books, not yet in
 * the reference folder) can join later without schema or shape changes.
 */
export interface SkillSetEntry {
  key: string;
  name: string;
  /** D6 order as printed — index 1–6. */
  skills: { index: number; name: string }[];
}

export const SKILL_SETS: SkillSetEntry[] = [
  {
    key: "agility",
    name: "Agility",
    skills: [
      { index: 1, name: "Catfall" },
      { index: 2, name: "Clamber" },
      { index: 3, name: "Dodge" },
      { index: 4, name: "Mighty Leap" },
      { index: 5, name: "Spring Up" },
      { index: 6, name: "Sprint" },
    ],
  },
  {
    key: "brawn",
    name: "Brawn",
    skills: [
      { index: 1, name: "Bull Charge" },
      { index: 2, name: "Bulging Biceps" },
      { index: 3, name: "Crushing Blow" },
      { index: 4, name: "Headbutt" },
      { index: 5, name: "Hurl" },
      { index: 6, name: "Iron Jaw" },
    ],
  },
  {
    key: "combat",
    name: "Combat",
    skills: [
      { index: 1, name: "Combat Master" },
      { index: 2, name: "Counter-attack" },
      { index: 3, name: "Disarm" },
      { index: 4, name: "Parry" },
      { index: 5, name: "Rain of Blows" },
      { index: 6, name: "Step Aside" },
    ],
  },
  {
    key: "cunning",
    name: "Cunning",
    skills: [
      { index: 1, name: "Backstab" },
      { index: 2, name: "Escape Artist" },
      { index: 3, name: "Evade" },
      { index: 4, name: "Infiltrate" },
      { index: 5, name: "Lie Low" },
      { index: 6, name: "Overwatch" },
    ],
  },
  {
    key: "driving",
    name: "Driving",
    skills: [
      { index: 1, name: "Jink" },
      { index: 2, name: "Expert Driver" },
      { index: 3, name: "Heavy Foot" },
      { index: 4, name: "Slalom" },
      { index: 5, name: "T-Bone" },
      { index: 6, name: "Running Repairs" },
    ],
  },
  {
    key: "ferocity",
    name: "Ferocity",
    skills: [
      { index: 1, name: "Berserker" },
      { index: 2, name: "Fearsome" },
      { index: 3, name: "Impetuous" },
      { index: 4, name: "Nerves of Steel" },
      { index: 5, name: "True Grit" },
      { index: 6, name: "Unstoppable" },
    ],
  },
  {
    key: "leadership",
    name: "Leadership",
    skills: [
      { index: 1, name: "Commanding Presence" },
      { index: 2, name: "Inspirational" },
      { index: 3, name: "Iron Will" },
      { index: 4, name: "Mentor" },
      { index: 5, name: "Overseer" },
      { index: 6, name: "Regroup" },
    ],
  },
  {
    key: "savant",
    name: "Savant",
    skills: [
      { index: 1, name: "Ballistics Expert" },
      { index: 2, name: "Connected" },
      { index: 3, name: "Fixer" },
      { index: 4, name: "Medicae" },
      { index: 5, name: "Munitioneer" },
      { index: 6, name: "Savvy Trader" },
    ],
  },
  {
    key: "shooting",
    name: "Shooting",
    skills: [
      { index: 1, name: "Fast Shot" },
      { index: 2, name: "Gunfighter" },
      { index: 3, name: "Hip Shooting" },
      { index: 4, name: "Marksman" },
      { index: 5, name: "Precision Shot" },
      { index: 6, name: "Trick Shot" },
    ],
  },
];

export function getSkillSet(key: string): SkillSetEntry | undefined {
  return SKILL_SETS.find((s) => s.key === key);
}

/** Every canonical universal skill name (picker + integrity tests). */
export function allSkillNames(): string[] {
  return SKILL_SETS.flatMap((s) => s.skills.map((sk) => sk.name));
}
