/**
 * Auto-suggested campaign Triumphs (issue #88) — Cinderak Burning p.64.
 *
 * Pure lib: the six official Triumphs ranked from recorded data. Survivor
 * counts only Great Darkness deaths (phase re-derived from totalCycles via
 * phaseForCycle, so a mid-campaign length edit stays consistent); ties are
 * surfaced, never resolved (the Arbitrator's call); Champions rank only
 * wins carrying the #82 winner-allegiance snapshot and degrade to an empty
 * ranking without it; sitting-out gangs never rank.
 */
import { describe, expect, it } from "vitest";
import {
  suggestTriumphs,
  type TriumphInputs,
} from "@/lib/triumph-suggestions";

const GANGS = [
  { id: "a", name: "Alpha", isActive: true, wealth: 2000, reputation: 5 },
  { id: "b", name: "Bravo", isActive: true, wealth: 1500, reputation: 9 },
  { id: "c", name: "Charlie", isActive: true, wealth: 1500, reputation: 3 },
  { id: "x", name: "Xeno", isActive: false, wealth: 9999, reputation: 99 },
];

const BASE: TriumphInputs = {
  gangs: GANGS,
  totalCycles: 7, // Great Darkness = cycles 1-3, Downtime 4, Spark 5-7
  deaths: [],
  controllerMap: {},
  wins: [],
};

const byTitle = (inputs: TriumphInputs) =>
  new Map(suggestTriumphs(inputs).map((s) => [s.title, s]));

describe("suggestTriumphs", () => {
  it("returns the six official Triumphs", () => {
    const titles = suggestTriumphs(BASE).map((s) => s.title);
    expect(titles).toEqual([
      "Champion of House Helmawr",
      "Champion of the Rebellion",
      "Survivor",
      "Hoarder of Coin",
      "Leader of Men",
      "Legendary Status",
    ]);
  });

  it("Survivor counts ONLY Great Darkness deaths (fewest first)", () => {
    const s = byTitle({
      ...BASE,
      deaths: [
        { gangId: "a", cycle: 1 }, // GD — counts
        { gangId: "a", cycle: 3 }, // GD — counts
        { gangId: "b", cycle: 2 }, // GD — counts
        { gangId: "b", cycle: 5 }, // Spark — ignored
        { gangId: "b", cycle: 4 }, // Downtime — ignored
      ],
    }).get("Survivor")!;

    expect(s.ranking.map((r) => [r.gangName, r.value])).toEqual([
      ["Charlie", 0],
      ["Bravo", 1],
      ["Alpha", 2],
    ]);
    expect(s.tie).toBe(false);
  });

  it("Survivor's phase boundary follows the CURRENT totalCycles", () => {
    // With 5 cycles, Downtime is cycle 3 — a cycle-3 death leaves the GD.
    const s = byTitle({
      ...BASE,
      totalCycles: 5,
      deaths: [{ gangId: "a", cycle: 3 }],
    }).get("Survivor")!;
    expect(s.ranking.every((r) => r.value === 0)).toBe(true);
  });

  it("Hoarder of Coin ranks Wealth and SURFACES the tie", () => {
    const s = byTitle(BASE).get("Hoarder of Coin")!;
    expect(s.ranking[0]).toMatchObject({ gangName: "Alpha", value: 2000 });
    expect(s.tie).toBe(false);

    const tied = byTitle({
      ...BASE,
      gangs: BASE.gangs.map((g) =>
        g.id === "a" ? { ...g, wealth: 1500 } : g,
      ),
    }).get("Hoarder of Coin")!;
    expect(tied.tie).toBe(true);
    expect(tied.ranking[0]!.value).toBe(tied.ranking[1]!.value);
  });

  it("Legendary Status ranks Reputation; Leader of Men counts current control", () => {
    const m = byTitle({
      ...BASE,
      controllerMap: { "water-guild": "c", "iron-guild": "c", venator: "a" },
    });
    expect(m.get("Legendary Status")!.ranking[0]).toMatchObject({
      gangName: "Bravo",
      value: 9,
    });
    expect(m.get("Leader of Men")!.ranking.map((r) => [r.gangName, r.value])).toEqual([
      ["Charlie", 2],
      ["Alpha", 1],
      ["Bravo", 0],
    ]);
  });

  it("Champions count wins per snapshotted side and degrade without #82 data", () => {
    const m = byTitle({
      ...BASE,
      wins: [
        { gangId: "a", allegiance: "imperial_house" },
        { gangId: "a", allegiance: "imperial_house" },
        { gangId: "b", allegiance: "imperial_house" },
        { gangId: "b", allegiance: "rebellion" },
        { gangId: "c", allegiance: null }, // pre-#82 row — no side, no rank
        { gangId: "x", allegiance: "rebellion" }, // sitting out — excluded
      ],
    });
    expect(
      m.get("Champion of House Helmawr")!.ranking.map((r) => [r.gangName, r.value]),
    ).toEqual([
      ["Alpha", 2],
      ["Bravo", 1],
    ]);
    expect(m.get("Champion of the Rebellion")!.ranking).toEqual([
      { gangId: "b", gangName: "Bravo", value: 1 },
    ]);

    // No sided wins at all → empty rankings (the panel shows the hint).
    const empty = byTitle(BASE);
    expect(empty.get("Champion of House Helmawr")!.ranking).toEqual([]);
    expect(empty.get("Champion of the Rebellion")!.ranking).toEqual([]);
  });

  it("sitting-out gangs never rank anywhere", () => {
    for (const s of suggestTriumphs(BASE)) {
      expect(s.ranking.some((r) => r.gangId === "x")).toBe(false);
    }
  });
});
