import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FreshRecruitmentForm } from "@/components/admin/FreshRecruitmentForm";
import {
  DOWNTIME_PROMOTION_ADVANCEMENTS,
  FRESH_RECRUITMENT_CREDITS,
} from "@/lib/campaign-rules";
import type { listDowntimeEvents } from "@/lib/db/queries";

type DowntimeEvent = Awaited<ReturnType<typeof listDowntimeEvents>>[number];

const CATEGORY_LABEL: Record<string, string> = {
  juve: "Juve",
  prospect: "Prospect",
  ganger: "Ganger",
  champion: "Champion",
};

/**
 * Downtime summary (issue #83) — what the Effects of Downtime did when the
 * campaign entered the Downtime cycle (steps A–C, read from the append-only
 * downtime_event log), the one-shot Fresh Recruitment grant (step D) and
 * the pointer to allegiances (step E, issue #82). Server component: the
 * only client island is the grant form.
 */
export function DowntimePanel({
  campaign,
  events,
  gangName,
  activeGangCount,
  isFinished,
}: {
  campaign: { id: string; freshRecruitmentAt: Date | null };
  events: DowntimeEvent[];
  gangName: Map<string, string>;
  activeGangCount: number;
  isFinished: boolean;
}) {
  const byKind = (kind: DowntimeEvent["kind"]) =>
    events.filter((e) => e.kind === kind);
  const recovered = byKind("fighter_recovered");
  const returned = byKind("captive_returned");
  const paid = byKind("captor_paid");
  const promoted = byKind("fighter_promoted");
  const recruitment = byKind("fresh_recruitment");

  const name = (id: string) => gangName.get(id) ?? "—";
  const fighter = (e: DowntimeEvent) => e.fighter?.name ?? "removed fighter";
  /** The captor_paid row for a returned captive (same fighter, same cycle). */
  const paymentFor = (e: DowntimeEvent) =>
    paid.find((p) => p.fighterId === e.fighterId && p.cycle === e.cycle);

  const stepClass =
    "flex flex-col gap-2 border border-rivet/60 p-3 clip-chamfer-sm";
  const stepTitle =
    "m-0 font-mono text-xs uppercase tracking-wider text-muted";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Downtime</CardTitle>
        <span className="ml-auto text-xs text-muted">
          effects applied on entering the Downtime cycle
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="m-0 text-sm text-muted">
          Steps A–C ran automatically inside the cycle change (recovery
          cleared, captives returned and their captors compensated,
          experienced Juves/Prospects promoted). A promotion the table
          disagrees with is reverted by editing the fighter&apos;s category
          — this log is the audit trail.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* A */}
          <section className={stepClass} aria-labelledby="dt-step-a">
            <h3 id="dt-step-a" className={stepTitle}>
              A · Fighters recover
            </h3>
            {recovered.length === 0 ? (
              <p className="m-0 text-xs text-muted">
                No fighters were in recovery.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
                {recovered.map((e) => (
                  <li key={e.id}>
                    <span className="text-ink">{fighter(e)}</span>
                    <span className="text-muted"> · {name(e.gangId)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* B */}
          <section className={stepClass} aria-labelledby="dt-step-b">
            <h3 id="dt-step-b" className={stepTitle}>
              B · Captives returned
            </h3>
            {returned.length === 0 ? (
              <p className="m-0 text-xs text-muted">No captives to return.</p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
                {returned.map((e) => {
                  const payment = paymentFor(e);
                  return (
                    <li key={e.id}>
                      <span className="text-ink">{fighter(e)}</span>
                      <span className="text-muted">
                        {" "}
                        back to {name(e.gangId)}
                      </span>
                      {payment ? (
                        <span className="text-muted">
                          {" "}
                          · {name(payment.gangId)} received{" "}
                          <span className="font-mono text-hazard">
                            +{payment.amount}c
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted"> · no captor on record</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* C */}
          <section className={stepClass} aria-labelledby="dt-step-c">
            <h3 id="dt-step-c" className={stepTitle}>
              C · Promotions ({DOWNTIME_PROMOTION_ADVANCEMENTS}+ advancements)
            </h3>
            {promoted.length === 0 ? (
              <p className="m-0 text-xs text-muted">
                No Juve or Prospect qualified.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
                {promoted.map((e) => {
                  const [from, to] = e.notes.split(" → ");
                  return (
                    <li key={e.id}>
                      <span className="text-ink">{fighter(e)}</span>
                      <span className="text-muted"> · {name(e.gangId)} · </span>
                      <Badge variant="muted">{CATEGORY_LABEL[from ?? ""] ?? from}</Badge>
                      <span className="text-muted" aria-hidden>
                        {" "}→{" "}
                      </span>
                      <span className="sr-only"> promoted to </span>
                      <Badge variant="toxic">{CATEGORY_LABEL[to ?? ""] ?? to}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* D */}
          <section className={stepClass} aria-labelledby="dt-step-d">
            <h3 id="dt-step-d" className={stepTitle}>
              D · Fresh Recruitment
            </h3>
            {recruitment.length > 0 && (
              <p className="m-0 text-xs text-muted">
                <span className="font-mono text-hazard">
                  +{recruitment[0]!.amount}c
                </span>{" "}
                to {recruitment.map((e) => name(e.gangId)).join(", ")}
              </p>
            )}
            {isFinished ? (
              recruitment.length === 0 && (
                <p className="m-0 text-xs text-muted">Not granted.</p>
              )
            ) : (
              <FreshRecruitmentForm
                campaignId={campaign.id}
                credits={FRESH_RECRUITMENT_CREDITS}
                activeGangCount={activeGangCount}
                grantedAt={campaign.freshRecruitmentAt?.toISOString() ?? null}
              />
            )}
          </section>
        </div>

        {/* E */}
        <p className="m-0 text-xs text-muted">
          <span className="font-mono uppercase tracking-wider">
            E · Declare allegiance
          </span>{" "}
          — each gang picks a side on its own panel; the{" "}
          <Link
            href="#civil-war"
            className="text-hazard underline-offset-2 hover:underline"
          >
            Civil war
          </Link>{" "}
          card above shows who has declared.
        </p>
      </CardContent>
    </Card>
  );
}
