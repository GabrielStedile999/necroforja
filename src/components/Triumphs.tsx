import { Badge } from "@/components/ui/badge";
import type { Triumph } from "@/types";
import { Trophy } from "lucide-react";

export function Triumphs({
  triumphs,
  campaignClosed,
}: {
  triumphs: Triumph[];
  campaignClosed: boolean;
}) {
  if (!campaignClosed && triumphs.length === 0) return null;

  return (
    <section className="rounded-sm border border-hazard/40 bg-panel p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Trophy className="h-5 w-5 text-hazard" aria-hidden />
        <h2 className="stencil text-xl font-bold text-ink">Triumphs</h2>
        {campaignClosed && (
          <Badge variant="hazard" className="ml-auto">
            Campaign Closed
          </Badge>
        )}
      </div>

      {triumphs.length === 0 ? (
        <p className="text-sm text-muted">No Triumphs awarded yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-rivet/50">
          {triumphs.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div>
                <span className="font-semibold text-hazard">{t.title}</span>
                {t.gangName && (
                  <span className="ml-2 text-sm text-muted">— {t.gangName}</span>
                )}
              </div>
              <span className="shrink-0 font-mono text-xs text-muted">
                {new Date(t.awardedAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
