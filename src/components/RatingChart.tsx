import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  computeChartGeometry,
  type RatingSeries,
} from "@/lib/campaign-history";

/**
 * Series palette — site accent tokens (globals.css @theme), all ≥ 4.5:1 on
 * the #0f0d14 panel. Colour is never the only channel: every line carries
 * the gang's name at its end and dots mark the data points.
 */
const SERIES_COLORS = [
  "#ff2d6f", // hazard
  "#00e5ff", // cyan
  "#59e36b", // toxic
  "#ff8a3d", // rust
  "#b07bff", // violet
  "#f5f5fa", // ink
  "#e84040", // blood
  "#7d7a95", // muted
];

/**
 * Rating evolution per gang (issue #70) — SERVER-rendered SVG, zero client
 * JS, fixed viewBox (CLS 0). One polyline per gang from the per-cycle
 * snapshots; renders gracefully from a single data point (labelled dots).
 * The <details> table is the accessible alternative with the same data.
 */
export function RatingChart({ series }: { series: RatingSeries[] }) {
  const geo = computeChartGeometry(series);
  if (!geo) return null;

  const cycles = [
    ...new Set(series.flatMap((s) => s.points.map((p) => p.cycle))),
  ].sort((a, b) => a - b);
  const ratingAt = (s: RatingSeries, cycle: number) =>
    s.points.find((p) => p.cycle === cycle)?.rating;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating history</CardTitle>
        <span className="ml-auto text-xs text-muted">
          snapshot at each cycle&apos;s end
        </span>
      </CardHeader>
      <CardContent>
        <figure className="m-0">
          <svg
            viewBox={`0 0 ${geo.width} ${geo.height}`}
            role="img"
            aria-label={`Gang Rating per campaign cycle for ${geo.lines
              .map((l) => l.gangName)
              .join(", ")}. The same data is available in the table below.`}
            className="h-auto w-full"
          >
            {/* grid + y axis */}
            {geo.yTicks.map((t) => (
              <g key={`y${t.y}`}>
                <line
                  x1={geo.plot.x}
                  x2={geo.plot.x + geo.plot.w}
                  y1={t.y}
                  y2={t.y}
                  stroke="#2a2535"
                  strokeWidth="1"
                />
                <text
                  x={geo.plot.x - 6}
                  y={t.y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#7d7a95"
                  fontFamily="var(--font-mono)"
                >
                  {t.label}
                </text>
              </g>
            ))}
            {/* x axis (cycles) */}
            {geo.xTicks.map((t) => (
              <text
                key={`x${t.x}`}
                x={t.x}
                y={geo.height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#7d7a95"
                fontFamily="var(--font-mono)"
              >
                {t.label}
              </text>
            ))}
            {/* one line per gang, gang name at the line end */}
            {geo.lines.map((line, i) => {
              const color = SERIES_COLORS[i % SERIES_COLORS.length];
              return (
                <g key={line.gangId}>
                  {line.dots.length > 1 && (
                    <polyline
                      points={line.points}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                    />
                  )}
                  {line.dots.map((d) => (
                    <circle
                      key={`${line.gangId}-${d.cycle}`}
                      cx={d.x}
                      cy={d.y}
                      r="3"
                      fill={color}
                    />
                  ))}
                  <text
                    x={line.label.x}
                    y={line.label.y}
                    fontSize="10"
                    fill={color}
                    fontFamily="var(--font-mono)"
                  >
                    {line.gangName}
                  </text>
                </g>
              );
            })}
          </svg>

          <figcaption className="mt-2">
            <details>
              <summary className="cursor-pointer py-1 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-hazard">
                View as table
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <caption className="sr-only">
                    Gang Rating at the end of each campaign cycle
                  </caption>
                  <thead>
                    <tr className="border-b border-rivet text-left">
                      <th scope="col" className="py-2 pr-4 font-medium text-muted">
                        Gang
                      </th>
                      {cycles.map((c) => (
                        <th
                          key={c}
                          scope="col"
                          className="py-2 pr-4 text-right font-mono font-medium text-muted"
                        >
                          C{c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {series.map((s) => (
                      <tr key={s.gangId} className="border-b border-rivet/50">
                        <th
                          scope="row"
                          className="py-2 pr-4 text-left font-medium text-ink"
                        >
                          {s.gangName}
                        </th>
                        {cycles.map((c) => (
                          <td
                            key={c}
                            className="py-2 pr-4 text-right font-mono text-ink"
                          >
                            {ratingAt(s, c) ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </figcaption>
        </figure>
      </CardContent>
    </Card>
  );
}
