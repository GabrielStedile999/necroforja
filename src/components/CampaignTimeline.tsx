import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Timeline, TimelineItem } from "@/lib/campaign-history";

const OUTCOME_LABEL: Record<string, string> = {
  challenger_win: "challenger won",
  challenged_win: "defender won",
  declined: "declined",
  draw: "draw",
};

/** Marker colour per item type — the text always names the fact too. */
function markerClass(item: TimelineItem): string {
  switch (item.type) {
    case "challenge":
      return "bg-hazard";
    case "death":
      return "bg-blood";
    case "capture":
      return "bg-cyan";
  }
}

function ItemText({ item }: { item: TimelineItem }) {
  if (item.type === "challenge") {
    return (
      <>
        <span className="text-ink">{item.challengerName}</span>
        <span className="text-muted"> vs </span>
        <span className="text-ink">{item.challengedName ?? "free claim"}</span>
        {item.sympathiserName && (
          <span className="text-muted">
            {" "}
            for {item.sympathiserName.replace(" Sympathisers", "")}
          </span>
        )}
        {item.outcome && (
          <span className="text-muted">
            {" "}
            — {OUTCOME_LABEL[item.outcome] ?? item.outcome}
          </span>
        )}
      </>
    );
  }
  if (item.type === "death") {
    return (
      <>
        <span className="text-ink">{item.fighterName}</span>
        <span className="text-muted"> ({item.gangName}) </span>
        <span className="text-blood">died in battle</span>
      </>
    );
  }
  return (
    <>
      <span className="text-ink">{item.fighterName}</span>
      <span className="text-muted"> ({item.gangName}) </span>
      <span className="text-cyan">was captured</span>
    </>
  );
}

/**
 * Cycle-by-cycle campaign timeline (issue #70) — server component, zero
 * client JS. Merges resolved challenges and key aftermath events (deaths,
 * captures — issue #69) per cycle; Triumphs close the list as campaign
 * honours. Colour marks the item type but never alone: the text always
 * says what happened.
 */
export function CampaignTimeline({ timeline }: { timeline: Timeline }) {
  if (timeline.cycles.length === 0 && timeline.triumphs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign timeline</CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <ol className="m-0 list-none divide-y divide-rivet/50 p-0">
          {timeline.cycles.map((group) => (
            <li key={group.cycle} className="flex gap-4 px-5 py-3">
              <span
                className="shrink-0 pt-0.5 font-mono text-xs text-muted"
                aria-label={`Cycle ${group.cycle}`}
              >
                C{group.cycle}
              </span>
              <ul className="m-0 flex min-w-0 flex-1 list-none flex-col gap-2 p-0">
                {group.items.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${markerClass(item)}`}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <ItemText item={item} />
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {timeline.triumphs.length > 0 && (
            <li className="flex gap-4 px-5 py-3">
              <span className="shrink-0 pt-0.5 font-mono text-xs text-muted">
                END
              </span>
              <ul className="m-0 flex min-w-0 flex-1 list-none flex-col gap-2 p-0">
                {timeline.triumphs.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center gap-2 text-sm"
                  >
                    <Badge variant="hazard">Triumph</Badge>
                    <span className="font-semibold text-hazard">{t.title}</span>
                    <span className="text-muted">
                      {t.gangName ?? "Campaign-wide"}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ol>
      </CardContent>
    </Card>
  );
}
