import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SympathiserView } from "@/types";

/** Gang colour (deterministic from the id), for the map. */
const PALETTE = [
  "border-blood/60 bg-blood/15 text-ink",
  "border-cyan/60 bg-cyan/10 text-ink",
  "border-rust/60 bg-rust/20 text-ink",
  "border-toxic/60 bg-toxic/10 text-ink",
  "border-hazard/60 bg-hazard/10 text-ink",
];

function colorFor(gangId: string, order: Map<string, number>): string {
  const idx = order.get(gangId) ?? 0;
  return PALETTE[idx % PALETTE.length]!;
}

/** Map of the 26 Sympathisers: who controls each one. Free ones are dimmed. */
export function SympathiserMap({
  sympathisers,
}: {
  sympathisers: SympathiserView[];
}) {
  // sort gangs by order of appearance to assign stable colours
  const order = new Map<string, number>();
  for (const s of sympathisers) {
    if (s.controllerGangId && !order.has(s.controllerGangId)) {
      order.set(s.controllerGangId, order.size);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sympathiser Map</CardTitle>
        <span className="ml-auto text-xs uppercase tracking-wider text-muted">
          {sympathisers.length} territories
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {sympathisers.map((s) => {
            const color = s.controllerGangId
              ? colorFor(s.controllerGangId, order)
              : "border-rivet bg-elevated/40 text-muted";
            return (
              <div
                key={s.id}
                className={`flex flex-col gap-1 rounded-sm border px-3 py-2 ${color}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-tight">
                    {s.name.replace(" Sympathisers", "")}
                  </span>
                  {s.controllerGangId ? (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-current" />
                  ) : null}
                </div>
                <span className="text-xs opacity-80">
                  {s.controllerName ?? "Free"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
