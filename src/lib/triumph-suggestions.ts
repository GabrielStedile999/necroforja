/**
 * Auto-suggested campaign Triumphs (issue #88) — the six official
 * Succession Campaign Triumphs (Cinderak Burning, p.64), computed from
 * data the app already records. Pure and testable: no I/O, the query
 * layer feeds it. Names only from the book; conditions are expressed as
 * metric labels in our own words.
 *
 * Suggestions never auto-award: ties are the Arbitrator's call, so every
 * ranking is returned in full (best first) with the metric value visible.
 * Survivor counts only deaths RECORDED through the aftermath log (#69),
 * attributed to the Great Darkness phase by the challenge's cycle via
 * `phaseForCycle` — re-derived from the CURRENT totalCycles, so a
 * mid-campaign length edit stays consistent.
 */
import { phaseForCycle } from "@/lib/campaign-rules";

export interface TriumphGang {
  id: string;
  name: string;
  isActive: boolean;
  wealth: number;
  reputation: number;
}

export interface TriumphInputs {
  gangs: TriumphGang[];
  totalCycles: number;
  /** fighter_dead aftermath events with the challenge's cycle. */
  deaths: { gangId: string; cycle: number }[];
  /** sympathiserId -> controlling gangId (current control). */
  controllerMap: Record<string, string>;
  /** Battle wins (challenger_win/challenged_win) with the #82 snapshot. */
  wins: { gangId: string; allegiance: string | null }[];
}

export interface TriumphRow {
  gangId: string;
  gangName: string;
  value: number;
}

export interface TriumphSuggestion {
  /** Official Triumph name (p.64). */
  title: string;
  /** Short metric description ("fewest recorded deaths…"). */
  metric: string;
  /** Best first; empty = no data to rank (the panel shows a hint). */
  ranking: TriumphRow[];
  /** True when more than one gang shares the best value. */
  tie: boolean;
}

/** Ranks active gangs by a value; `asc` = lower is better (Survivor). */
function rank(
  gangs: TriumphGang[],
  value: (g: TriumphGang) => number,
  asc = false,
): TriumphRow[] {
  return gangs
    .filter((g) => g.isActive)
    .map((g) => ({ gangId: g.id, gangName: g.name, value: value(g) }))
    .sort((a, b) => (asc ? a.value - b.value : b.value - a.value));
}

function withTie(rows: TriumphRow[]): { ranking: TriumphRow[]; tie: boolean } {
  return {
    ranking: rows,
    tie: rows.length > 1 && rows[0]!.value === rows[1]!.value,
  };
}

/** Wins per active gang for one declared side, best first (empty = no data). */
function championRanking(
  inputs: TriumphInputs,
  side: "imperial_house" | "rebellion",
): TriumphRow[] {
  const active = new Map(
    inputs.gangs.filter((g) => g.isActive).map((g) => [g.id, g.name]),
  );
  const counts = new Map<string, number>();
  for (const w of inputs.wins) {
    if (w.allegiance !== side || !active.has(w.gangId)) continue;
    counts.set(w.gangId, (counts.get(w.gangId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([gangId, value]) => ({
      gangId,
      gangName: active.get(gangId)!,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

/** The six official Triumphs, ranked from the recorded data. */
export function suggestTriumphs(inputs: TriumphInputs): TriumphSuggestion[] {
  // Survivor — fewest recorded deaths during the Great Darkness cycles.
  const gdDeaths = new Map<string, number>();
  for (const d of inputs.deaths) {
    if (phaseForCycle(d.cycle, inputs.totalCycles) !== "great_darkness") {
      continue;
    }
    gdDeaths.set(d.gangId, (gdDeaths.get(d.gangId) ?? 0) + 1);
  }

  // Leader of Men — Sympathisers controlled right now (end of campaign).
  const controlCount = new Map<string, number>();
  for (const gangId of Object.values(inputs.controllerMap)) {
    controlCount.set(gangId, (controlCount.get(gangId) ?? 0) + 1);
  }

  const helmawr = championRanking(inputs, "imperial_house");
  const rebellion = championRanking(inputs, "rebellion");

  return [
    {
      title: "Champion of House Helmawr",
      metric: "battle wins recorded for the Imperial House",
      ...withTie(helmawr),
    },
    {
      title: "Champion of the Rebellion",
      metric: "battle wins recorded for Lady Credo's Rebellion",
      ...withTie(rebellion),
    },
    {
      title: "Survivor",
      metric: "fewest recorded fighter deaths in the Great Darkness",
      ...withTie(rank(inputs.gangs, (g) => gdDeaths.get(g.id) ?? 0, true)),
    },
    {
      title: "Hoarder of Coin",
      metric: "highest Wealth at the end",
      ...withTie(rank(inputs.gangs, (g) => g.wealth)),
    },
    {
      title: "Leader of Men",
      metric: "most Sympathisers controlled at the end",
      ...withTie(rank(inputs.gangs, (g) => controlCount.get(g.id) ?? 0)),
    },
    {
      title: "Legendary Status",
      metric: "highest Reputation at the end",
      ...withTie(rank(inputs.gangs, (g) => g.reputation)),
    },
  ];
}
