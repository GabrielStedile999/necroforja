/**
 * Gang rating history & campaign timeline (issue #70) — PURE mappers.
 *
 * Everything here is deterministic data → data: grouping snapshots into
 * chart series, computing the SVG geometry for the server-rendered chart
 * (no client charting library — hand-rolled paths keep the public page
 * static, zero client JS, CLS 0 via fixed viewBox), and merging
 * challenges/battle events/triumphs into a cycle-by-cycle timeline.
 * Tested in tests/campaign-history.test.ts.
 */

/* ------------------------------ Chart ------------------------------ */

export type SnapshotRow = {
  gangId: string;
  gangName: string;
  cycle: number;
  rating: number;
};

export type RatingSeries = {
  gangId: string;
  gangName: string;
  points: { cycle: number; rating: number }[];
};

/**
 * Groups snapshot rows into one series per gang, points sorted by cycle.
 * Series are sorted by latest rating (desc) so the legend/label order
 * matches what the eye sees at the right edge of the chart.
 */
export function buildRatingSeries(rows: SnapshotRow[]): RatingSeries[] {
  const byGang = new Map<string, RatingSeries>();
  for (const r of rows) {
    const s =
      byGang.get(r.gangId) ??
      ({ gangId: r.gangId, gangName: r.gangName, points: [] } as RatingSeries);
    s.points.push({ cycle: r.cycle, rating: r.rating });
    byGang.set(r.gangId, s);
  }
  const series = [...byGang.values()];
  for (const s of series) s.points.sort((a, b) => a.cycle - b.cycle);
  return series.sort(
    (a, b) =>
      (b.points[b.points.length - 1]?.rating ?? 0) -
      (a.points[a.points.length - 1]?.rating ?? 0),
  );
}

export type ChartGeometry = {
  width: number;
  height: number;
  /** Plot area (axes live outside it). */
  plot: { x: number; y: number; w: number; h: number };
  /** One polyline per series, same order as the input. */
  lines: {
    gangId: string;
    gangName: string;
    /** SVG polyline `points` attribute ("x1,y1 x2,y2 …"). */
    points: string;
    dots: { x: number; y: number; cycle: number; rating: number }[];
    /** Label anchored at the last point (name at line end — not colour-only). */
    label: { x: number; y: number };
  }[];
  xTicks: { x: number; label: string }[];
  yTicks: { y: number; label: string }[];
};

/** Rounds `max` up to a "nice" axis ceiling (1/2/2.5/5 × 10^n). */
export function niceCeil(max: number): number {
  if (max <= 0) return 100;
  const pow = 10 ** Math.floor(Math.log10(max));
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (max <= m * pow) return m * pow;
  }
  return 10 * pow;
}

/**
 * Computes the fixed-viewBox geometry for the rating chart. Returns null
 * when there is nothing to draw. Gracefully handles 1 cycle of data (the
 * issue's cold-start risk): a single x position centres in the plot and
 * lines degenerate to labelled dots.
 */
export function computeChartGeometry(
  series: RatingSeries[],
  width = 640,
  height = 300,
): ChartGeometry | null {
  const withPoints = series.filter((s) => s.points.length > 0);
  if (withPoints.length === 0) return null;

  // Right padding hosts the gang labels at line ends.
  const plot = { x: 44, y: 12, w: width - 44 - 116, h: height - 12 - 28 };

  const cycles = withPoints.flatMap((s) => s.points.map((p) => p.cycle));
  const minCycle = Math.min(...cycles);
  const maxCycle = Math.max(...cycles);
  const maxRating = Math.max(
    ...withPoints.flatMap((s) => s.points.map((p) => p.rating)),
  );
  const yMax = niceCeil(maxRating);

  const xFor = (cycle: number) =>
    maxCycle === minCycle
      ? plot.x + plot.w / 2
      : plot.x + ((cycle - minCycle) / (maxCycle - minCycle)) * plot.w;
  const yFor = (rating: number) =>
    plot.y + plot.h - (Math.max(0, rating) / yMax) * plot.h;

  const round = (n: number) => Math.round(n * 10) / 10;

  const lines = withPoints.map((s) => {
    const dots = s.points.map((p) => ({
      x: round(xFor(p.cycle)),
      y: round(yFor(p.rating)),
      cycle: p.cycle,
      rating: p.rating,
    }));
    const last = dots[dots.length - 1]!;
    return {
      gangId: s.gangId,
      gangName: s.gangName,
      points: dots.map((d) => `${d.x},${d.y}`).join(" "),
      dots,
      label: { x: round(last.x + 8), y: round(last.y + 3) },
    };
  });

  const xTicks: ChartGeometry["xTicks"] = [];
  for (let c = minCycle; c <= maxCycle; c++) {
    xTicks.push({ x: round(xFor(c)), label: `C${c}` });
  }
  const yTicks: ChartGeometry["yTicks"] = [];
  for (let i = 0; i <= 4; i++) {
    const value = (yMax / 4) * i;
    yTicks.push({ y: round(yFor(value)), label: String(Math.round(value)) });
  }

  return { width, height, plot, lines, xTicks, yTicks };
}

/* ----------------------------- Timeline ----------------------------- */

export type TimelineChallengeInput = {
  id: string;
  cycle: number;
  challengerName: string;
  challengedName: string | null;
  sympathiserName: string | null;
  outcome: string | null;
  playedAt: Date | null;
};

export type TimelineEventInput = {
  id: string;
  kind: "fighter_dead" | "fighter_captured";
  cycle: number;
  gangName: string;
  fighterName: string | null;
  createdAt: Date;
};

export type TimelineTriumphInput = {
  id: string;
  title: string;
  gangName: string | null;
  awardedAt: Date;
};

export type TimelineItem =
  | {
      type: "challenge";
      id: string;
      challengerName: string;
      challengedName: string | null;
      sympathiserName: string | null;
      outcome: string | null;
    }
  | {
      type: "death" | "capture";
      id: string;
      gangName: string;
      fighterName: string;
    };

export type Timeline = {
  /** Cycle groups, ascending; items inside are chronological. */
  cycles: { cycle: number; items: TimelineItem[] }[];
  /** Triumphs have no cycle — they close the timeline (campaign honours). */
  triumphs: { id: string; title: string; gangName: string | null }[];
};

/**
 * Merges resolved challenges and key battle events into cycle groups
 * (ascending), items ordered chronologically within each cycle; triumphs
 * carry no cycle and close the timeline as campaign honours.
 */
export function buildTimeline(
  challenges: TimelineChallengeInput[],
  events: TimelineEventInput[],
  triumphs: TimelineTriumphInput[],
): Timeline {
  type Stamped = { cycle: number; at: number; item: TimelineItem };
  const stamped: Stamped[] = [];

  for (const c of challenges) {
    stamped.push({
      cycle: c.cycle,
      at: c.playedAt?.getTime() ?? 0,
      item: {
        type: "challenge",
        id: c.id,
        challengerName: c.challengerName,
        challengedName: c.challengedName,
        sympathiserName: c.sympathiserName,
        outcome: c.outcome,
      },
    });
  }
  for (const e of events) {
    stamped.push({
      cycle: e.cycle,
      at: e.createdAt.getTime(),
      item: {
        type: e.kind === "fighter_dead" ? "death" : "capture",
        id: e.id,
        gangName: e.gangName,
        fighterName: e.fighterName ?? "A fighter",
      },
    });
  }

  const byCycle = new Map<number, Stamped[]>();
  for (const s of stamped) {
    const list = byCycle.get(s.cycle) ?? [];
    list.push(s);
    byCycle.set(s.cycle, list);
  }

  const cycles = [...byCycle.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([cycle, items]) => ({
      cycle,
      items: items.sort((a, b) => a.at - b.at).map((s) => s.item),
    }));

  return {
    cycles,
    triumphs: [...triumphs]
      .sort((a, b) => a.awardedAt.getTime() - b.awardedAt.getTime())
      .map((t) => ({ id: t.id, title: t.title, gangName: t.gangName })),
  };
}
