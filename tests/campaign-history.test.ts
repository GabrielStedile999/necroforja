/**
 * Gang rating history & campaign timeline (issue #70) — pure mappers.
 * The chart geometry and the timeline merge are deterministic data → data,
 * so they are tested directly, no database or DOM involved.
 */
import { describe, expect, it } from "vitest";
import {
  buildRatingSeries,
  computeChartGeometry,
  niceCeil,
  buildTimeline,
  type SnapshotRow,
  type TimelineChallengeInput,
  type TimelineEventInput,
  type TimelineTriumphInput,
} from "@/lib/campaign-history";

const row = (
  gangId: string,
  cycle: number,
  rating: number,
  gangName = gangId,
): SnapshotRow => ({ gangId, gangName, cycle, rating });

describe("buildRatingSeries", () => {
  it("groups rows per gang with points sorted by cycle", () => {
    const series = buildRatingSeries([
      row("a", 3, 1500),
      row("a", 1, 1000),
      row("b", 1, 900),
      row("a", 2, 1200),
    ]);
    const a = series.find((s) => s.gangId === "a")!;
    expect(a.points.map((p) => p.cycle)).toEqual([1, 2, 3]);
    expect(a.points.map((p) => p.rating)).toEqual([1000, 1200, 1500]);
  });

  it("orders series by latest rating so labels match the chart's right edge", () => {
    const series = buildRatingSeries([
      row("low", 1, 500),
      row("high", 1, 2000),
      row("mid", 1, 1000),
    ]);
    expect(series.map((s) => s.gangId)).toEqual(["high", "mid", "low"]);
  });

  it("returns an empty list for no rows", () => {
    expect(buildRatingSeries([])).toEqual([]);
  });
});

describe("niceCeil", () => {
  it("rounds up to a nice axis ceiling", () => {
    expect(niceCeil(1730)).toBe(2000);
    expect(niceCeil(2000)).toBe(2000);
    expect(niceCeil(2100)).toBe(2500);
    expect(niceCeil(90)).toBe(100);
    expect(niceCeil(0)).toBe(100); // empty-ish data still gets an axis
  });
});

describe("computeChartGeometry", () => {
  it("returns null when there is nothing to draw", () => {
    expect(computeChartGeometry([])).toBeNull();
    expect(
      computeChartGeometry([{ gangId: "a", gangName: "A", points: [] }]),
    ).toBeNull();
  });

  it("maps cycles left-to-right and ratings bottom-up inside the plot", () => {
    const geo = computeChartGeometry(
      buildRatingSeries([row("a", 1, 0), row("a", 5, 1000)]),
    )!;
    const [first, last] = geo.lines[0]!.dots;
    expect(first!.x).toBeLessThan(last!.x); // cycle 1 left of cycle 5
    expect(first!.y).toBeGreaterThan(last!.y); // rating 0 below rating 1000
    // everything stays inside the fixed viewBox (CLS 0 depends on it)
    for (const d of geo.lines[0]!.dots) {
      expect(d.x).toBeGreaterThanOrEqual(0);
      expect(d.x).toBeLessThanOrEqual(geo.width);
      expect(d.y).toBeGreaterThanOrEqual(0);
      expect(d.y).toBeLessThanOrEqual(geo.height);
    }
  });

  it("handles a SINGLE data point without NaN (cold-start risk)", () => {
    const geo = computeChartGeometry(
      buildRatingSeries([row("a", 1, 1200)]),
    )!;
    const dot = geo.lines[0]!.dots[0]!;
    expect(Number.isFinite(dot.x)).toBe(true);
    expect(Number.isFinite(dot.y)).toBe(true);
    expect(geo.lines[0]!.points).not.toContain("NaN");
    expect(geo.xTicks).toHaveLength(1);
  });

  it("emits one x tick per cycle in range", () => {
    const geo = computeChartGeometry(
      buildRatingSeries([row("a", 2, 100), row("a", 4, 300)]),
    )!;
    expect(geo.xTicks.map((t) => t.label)).toEqual(["C2", "C3", "C4"]);
  });
});

/* ----------------------------- Timeline ----------------------------- */

const challenge = (
  id: string,
  cycle: number,
  playedAt: Date | null,
): TimelineChallengeInput => ({
  id,
  cycle,
  challengerName: "Iron Reapers",
  challengedName: "Sump Rats",
  sympathiserName: "Water Guild Sympathisers",
  outcome: "challenger_win",
  playedAt,
});

const event = (
  id: string,
  cycle: number,
  kind: "fighter_dead" | "fighter_captured",
  createdAt: Date,
): TimelineEventInput => ({
  id,
  kind,
  cycle,
  gangName: "Sump Rats",
  fighterName: "Grix",
  createdAt,
});

const triumph = (id: string, awardedAt: Date): TimelineTriumphInput => ({
  id,
  title: "Slaughterer",
  gangName: "Iron Reapers",
  awardedAt,
});

describe("buildTimeline", () => {
  it("groups items per cycle, ascending", () => {
    const t = buildTimeline(
      [challenge("c2", 2, new Date(2)), challenge("c1", 1, new Date(1))],
      [event("e3", 3, "fighter_dead", new Date(3))],
      [],
    );
    expect(t.cycles.map((c) => c.cycle)).toEqual([1, 2, 3]);
  });

  it("orders items chronologically INSIDE a cycle (challenge vs event)", () => {
    const t = buildTimeline(
      [challenge("c", 1, new Date(1000))],
      [
        event("late", 1, "fighter_captured", new Date(2000)),
        event("early", 1, "fighter_dead", new Date(500)),
      ],
      [],
    );
    expect(t.cycles[0]!.items.map((i) => i.id)).toEqual(["early", "c", "late"]);
    expect(t.cycles[0]!.items.map((i) => i.type)).toEqual([
      "death",
      "challenge",
      "capture",
    ]);
  });

  it("keeps triumphs out of cycles — they close the timeline, oldest first", () => {
    const t = buildTimeline(
      [challenge("c", 1, new Date(1))],
      [],
      [triumph("t2", new Date(2000)), triumph("t1", new Date(1000))],
    );
    expect(t.cycles).toHaveLength(1);
    expect(t.triumphs.map((x) => x.id)).toEqual(["t1", "t2"]);
  });

  it("a challenge without playedAt still lands in its cycle (sorted first)", () => {
    const t = buildTimeline(
      [challenge("nodate", 1, null)],
      [event("e", 1, "fighter_dead", new Date(10))],
      [],
    );
    expect(t.cycles[0]!.items.map((i) => i.id)).toEqual(["nodate", "e"]);
  });

  it("names a removed fighter gracefully", () => {
    const t = buildTimeline(
      [],
      [{ ...event("e", 1, "fighter_dead", new Date(1)), fighterName: null }],
      [],
    );
    const item = t.cycles[0]!.items[0]!;
    expect(item.type).toBe("death");
    if (item.type === "death") expect(item.fighterName).toBe("A fighter");
  });

  it("is empty in, empty out", () => {
    const t = buildTimeline([], [], []);
    expect(t.cycles).toEqual([]);
    expect(t.triumphs).toEqual([]);
  });
});
