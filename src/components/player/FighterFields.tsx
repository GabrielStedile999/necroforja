"use client";

import { Input, Label, Select } from "@/components/ui/input";
import type { FighterProfile } from "@/types";

export const FIGHTER_CATEGORIES = [
  "leader",
  "champion",
  "prospect",
  "ganger",
  "juve",
  "crew",
  "hanger_on",
  "brute",
] as const;

type StatKey = keyof FighterProfile;

/**
 * Characteristics in the OFFICIAL fighter-card reading order — three rows
 * of four, exactly as printed on the card:
 *
 *   M   T   W   I
 *   BS  WS  S   A
 *   Ld  Cl  Wil INT
 */
const STAT_KEYS: StatKey[] = [
  "m", "t", "w", "i",
  "bs", "ws", "s", "a",
  "ld", "cl", "wil", "int",
];

const STAT_LABELS: Record<StatKey, string> = {
  m: "M", t: "T", w: "W", i: "I",
  bs: "BS", ws: "WS", s: "S", a: "A",
  ld: "Ld", cl: "Cl", wil: "Wil", int: "INT",
};

/**
 * Nature of each stat, shown as a suffix inside the input so the user knows
 * the correct in-game modifier: M is a distance in inches (4"); WS/BS/I and
 * the mental stats are D6 target rolls (3+); S/T/W/A are plain values.
 */
const STAT_SUFFIX: Partial<Record<StatKey, string>> = {
  m: "″", // ″ (inches)
  bs: "+",
  ws: "+",
  i: "+",
  ld: "+",
  cl: "+",
  wil: "+",
  int: "+",
};

/** D6 target-roll stats: value is strictly 1–6 (single digit input). */
const ROLL_STATS = new Set<StatKey>([
  "bs", "ws", "i", "ld", "cl", "wil", "int",
]);

/**
 * Full stat name + nature, shown as a native tooltip (`title`) after ~1s of
 * hover over the label or the input — a reminder for anyone who forgot
 * what the abbreviation means.
 */
const STAT_NATURE: Record<StatKey, string> = {
  m: 'Movement — distance in inches (e.g. 4")',
  t: "Toughness",
  w: "Wounds",
  i: "Initiative — target roll, 1–6 (e.g. 3+)",
  bs: "Ballistic Skill — target roll, 1–6 (e.g. 3+)",
  ws: "Weapon Skill — target roll, 1–6 (e.g. 3+)",
  s: "Strength",
  a: "Attacks",
  ld: "Leadership — target roll, 1–6 (e.g. 5+)",
  cl: "Cool — target roll, 1–6 (e.g. 5+)",
  wil: "Willpower — target roll, 1–6 (e.g. 5+)",
  int: "Intelligence — target roll, 1–6 (e.g. 5+)",
};

/**
 * Hard input filter (typing AND paste): HTML `pattern`/`maxLength` only
 * validate on submit — they do not stop characters from being entered. The
 * handler strips anything outside the allowed set in place, keeping the
 * input uncontrolled (form.reset() still works).
 */
function sanitizeStat(
  e: React.ChangeEvent<HTMLInputElement>,
  isRoll: boolean,
) {
  const cleaned = e.target.value
    .replace(isRoll ? /[^1-6]/g : /[^0-9]/g, "")
    .slice(0, isRoll ? 1 : 2);
  if (cleaned !== e.target.value) e.target.value = cleaned;
}

export interface FighterDefaults {
  name?: string;
  type?: string;
  category?: string;
  baseCost?: number;
  profile?: FighterProfile;
}

/**
 * Shared fighter form fields (issue #63) — used by AddFighterForm (blank)
 * and EditFighterForm (pre-filled). `idPrefix` keeps input ids unique when
 * several forms render on the same page (one edit form per fighter).
 * Characteristics are optional: an empty field means "not set" on create
 * and "unchanged" on edit (see updateFighterSchema).
 */
export function FighterFields({
  idPrefix = "",
  defaults,
}: {
  idPrefix?: string;
  defaults?: FighterDefaults;
}) {
  const id = (field: string) => `${idPrefix}${field}`;
  /** Stored → displayed: `null`/absent = never set → empty. */
  const stat = (key: StatKey): string => {
    const v = defaults?.profile?.[key];
    return v === null || v === undefined ? "" : String(v);
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Label htmlFor={id("name")}>Name</Label>
          <Input
            id={id("name")}
            name="name"
            defaultValue={defaults?.name}
            required
          />
        </div>
        <div>
          <Label htmlFor={id("type")}>Type</Label>
          <Input
            id={id("type")}
            name="type"
            placeholder="e.g.: Gunner"
            defaultValue={defaults?.type}
            required
          />
        </div>
        <div>
          <Label htmlFor={id("category")}>Category</Label>
          <Select
            id={id("category")}
            name="category"
            defaultValue={defaults?.category ?? "ganger"}
          >
            {FIGHTER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={id("baseCost")}>Base cost (c)</Label>
          <Input
            id={id("baseCost")}
            name="baseCost"
            type="number"
            min={0}
            max={2000}
            defaultValue={defaults?.baseCost ?? 0}
            // number inputs still let "-", "+" and "e" through — block them
            onKeyDown={(e) => {
              if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                e.preventDefault();
              }
            }}
            required
          />
        </div>
      </div>

      <fieldset className="border border-rivet/50 p-3">
        <legend className="px-1 font-mono text-xs uppercase tracking-wider text-muted">
          Profile (optional)
        </legend>
        {/*
         * Fighter-card layout: 4 columns on sm+ (3 rows, exactly like the
         * printed card: M T W I / BS WS S A / Ld Cl Wil INT); 2 columns on
         * small screens (pairs keep the card reading order). Values are at
         * most 2 digits + a modifier, so narrow cells are fine.
         */}
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
          {STAT_KEYS.map((key) => {
            const suffix = STAT_SUFFIX[key];
            const nature = STAT_NATURE[key];
            const isRoll = ROLL_STATS.has(key);
            return (
              <div key={key}>
                <Label
                  htmlFor={id(`stat-${key}`)}
                  className="text-center font-mono text-xs"
                  title={nature}
                >
                  {STAT_LABELS[key]}
                </Label>
                <div className="relative">
                  <Input
                    id={id(`stat-${key}`)}
                    name={key}
                    type="text"
                    inputMode="numeric"
                    pattern={isRoll ? "[1-6]" : "[0-9]{0,2}"}
                    maxLength={isRoll ? 1 : 2}
                    onChange={(e) => sanitizeStat(e, isRoll)}
                    defaultValue={stat(key)}
                    title={nature}
                    aria-label={
                      nature ? `${STAT_LABELS[key]} — ${nature}` : undefined
                    }
                    className={`text-center font-mono ${suffix ? "pr-6" : ""}`}
                  />
                  {suffix && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-sm text-muted"
                    >
                      {suffix}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>
    </>
  );
}
