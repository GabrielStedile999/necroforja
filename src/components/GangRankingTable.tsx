import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GangRankRow } from "@/types";

/**
 * Public gang ranking. Sorted by: number of controlled Sympathisers
 * (decides the campaign), tie-broken by Gang Rating. Receives already-sorted rows.
 */
export function GangRankingTable({ gangs }: { gangs: GangRankRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Ranking</CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-b border-rivet text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-2 font-medium">#</th>
              <th className="px-5 py-2 font-medium">Gang</th>
              <th className="px-5 py-2 font-medium">House</th>
              <th className="px-5 py-2 text-center font-medium">Sympath.</th>
              <th className="px-5 py-2 text-right font-medium">Rating</th>
              <th className="px-5 py-2 text-right font-medium">Wealth</th>
            </tr>
          </thead>
          <tbody>
            {gangs.map((g, i) => (
              <tr key={g.id} className="border-b border-rivet/50 last:border-0">
                <td className="px-5 py-3 font-mono text-muted">{i + 1}</td>
                <td className="px-5 py-3">
                  <div className="font-display text-base font-semibold uppercase text-ink">
                    {g.name}
                  </div>
                  <div className="text-xs text-muted">{g.ownerName}</div>
                </td>
                <td className="px-5 py-3 text-muted">{g.house}</td>
                <td className="px-5 py-3 text-center">
                  <Badge variant={g.sympathiserCount > 0 ? "toxic" : "muted"}>
                    {g.sympathiserCount}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-right font-mono text-ink">
                  {g.rating}
                </td>
                <td className="px-5 py-3 text-right font-mono text-muted">
                  {g.wealth}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <ul className="divide-y divide-rivet/50 sm:hidden">
          {gangs.map((g, i) => (
            <li key={g.id} className="flex items-center gap-3 px-5 py-3">
              <span className="font-mono text-lg text-muted">{i + 1}</span>
              <div className="flex-1">
                <div className="font-display text-base font-semibold uppercase text-ink">
                  {g.name}
                </div>
                <div className="text-xs text-muted">
                  {g.ownerName} · {g.house}
                </div>
              </div>
              <div className="text-right">
                <Badge variant={g.sympathiserCount > 0 ? "toxic" : "muted"}>
                  {g.sympathiserCount} symp.
                </Badge>
                <div className="mt-1 font-mono text-xs text-muted">
                  R {g.rating}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
