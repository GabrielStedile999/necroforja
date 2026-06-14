import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateChallengeForm } from "@/components/admin/CreateChallengeForm";
import { ResolveChallengeForm } from "@/components/admin/ResolveChallengeForm";
import { SympathiserAssignForm } from "@/components/admin/SympathiserAssignForm";
import { AwardTriumphForm } from "@/components/admin/AwardTriumphForm";
import {
  getLatestCampaign,
  listGangsBasic,
  listChallenges,
  listSympathisers,
  getSympathiserControllerMap,
  listTriumphs,
} from "@/lib/db/queries";
import { SYMPATHISERS } from "@/lib/data/sympathisers";
import { advanceCycle, toggleSympathiser, finishCampaign } from "./actions";
import type { CampaignPhase } from "@/types";
import { Swords, Trophy } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaign",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const PHASE_LABEL: Record<CampaignPhase, string> = {
  great_darkness: "Great Darkness",
  downtime: "Downtime",
  spark_of_rebellion: "Spark of Rebellion",
};

export default async function CampaignAdminPage() {
  const campaign = await getLatestCampaign();

  if (!campaign) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="stencil text-2xl font-bold text-ink">
            No campaign found
          </h1>
          <p className="mt-2 text-sm text-muted">
            Connect the database and run <code>npm run db:seed</code> to start.
          </p>
        </main>
      </>
    );
  }

  const isFinished = campaign.status === "finished";
  const isLastCycle = campaign.currentCycle >= campaign.totalCycles;

  const [gangs, challenges, controllerMap, allSymps, triumphs] =
    await Promise.all([
      listGangsBasic(campaign.id),
      listChallenges(campaign.id, 30),
      getSympathiserControllerMap(),
      listSympathisers(),
      listTriumphs(campaign.id),
    ]);

  const gangName = new Map(gangs.map((g) => [g.id, g.name]));
  const sympName = new Map(SYMPATHISERS.map((s) => [s.id, s.name]));
  const sympOrder = new Map(SYMPATHISERS.map((s, i) => [s.id, i]));

  // sort according to the catalogue
  const sympsOrdered = allSymps
    .slice()
    .sort((a, b) => (sympOrder.get(a.id) ?? 0) - (sympOrder.get(b.id) ?? 0));
  const enabledCount = sympsOrdered.filter((s) => s.enabled).length;

  // only enabled ones can enter challenges
  const sympOptions = sympsOrdered
    .filter((s) => s.enabled)
    .map((s) => ({
      id: s.id,
      name: s.name,
      controllerName: controllerMap[s.id]
        ? (gangName.get(controllerMap[s.id]!) ?? null)
        : null,
    }));

  const pending = challenges.filter((c) => !c.resolved);
  const resolved = challenges.filter((c) => c.resolved);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Swords className="h-6 w-6 text-hazard" aria-hidden />
          <h1 className="stencil text-2xl font-bold text-ink">
            Campaign Panel
          </h1>
          <Badge variant="hazard">{PHASE_LABEL[campaign.phase]}</Badge>
          {isFinished && (
            <Badge variant="muted" className="border-blood/40 text-blood">
              Closed
            </Badge>
          )}
          <Link href="/admin" className="ml-auto">
            <Button variant="ghost">Accounts →</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Cycle {campaign.currentCycle} / {campaign.totalCycles}
            </CardTitle>
            {!isFinished && (
              <form action={advanceCycle} className="ml-auto">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isLastCycle}
                >
                  Advance cycle →
                </Button>
              </form>
            )}
          </CardHeader>
          <CardContent className="text-sm text-muted">
            Great Darkness (cycles 1-3) · Downtime (4) · Spark of Rebellion
            (5-7). Advancing the cycle automatically adjusts the phase.
          </CardContent>
        </Card>

        {/* ── Campaign Closure (shown when on last cycle or already finished) ── */}
        {(isLastCycle || isFinished) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-hazard" aria-hidden />
                Campaign Closure
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Existing Triumphs */}
              {triumphs.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                    Awarded Triumphs
                  </p>
                  <ul className="flex flex-col divide-y divide-rivet/50">
                    {triumphs.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-3 py-2 text-sm"
                      >
                        <span className="font-semibold text-hazard">
                          {t.title}
                        </span>
                        <span className="text-muted">
                          {t.gangId ? (gangName.get(t.gangId) ?? "—") : "Campaign-wide"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Award Triumph form */}
              <div>
                <p className="mb-3 text-sm text-muted">
                  Award a Triumph to a gang or to the campaign as a whole.
                </p>
                <AwardTriumphForm gangs={gangs} />
              </div>

              {/* Close Campaign button */}
              {!isFinished && (
                <div className="border-t border-rivet pt-4">
                  <p className="mb-3 text-sm text-muted">
                    Once closed, the campaign is read-only and the result is
                    shown on the public landing.
                  </p>
                  <form action={finishCampaign}>
                    <Button type="submit" variant="outline" className="border-blood/50 text-blood hover:bg-blood/10">
                      Close campaign
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sympathisers in the campaign</CardTitle>
            <span className="ml-auto text-xs text-muted">
              {enabledCount}/{sympsOrdered.length} active
            </span>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted">
              Choose which Sympathisers appear in the campaign and on the home
              screen. Inactive ones disappear from the public map and cannot be
              contested.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sympsOrdered.map((s) => (
                <form
                  key={s.id}
                  action={toggleSympathiser}
                  className={`flex items-center justify-between gap-2 rounded-sm border px-3 py-2 ${
                    s.enabled
                      ? "border-toxic/40 bg-toxic/5"
                      : "border-rivet bg-elevated/40 opacity-70"
                  }`}
                >
                  <input type="hidden" name="sympathiserId" value={s.id} />
                  <input
                    type="hidden"
                    name="enabled"
                    value={String(s.enabled)}
                  />
                  <span className="text-sm text-ink">
                    {s.name.replace(" Sympathisers", "")}
                  </span>
                  <button
                    type="submit"
                    className={`shrink-0 rounded-sm border px-2 py-0.5 text-xs uppercase tracking-wide ${
                      s.enabled
                        ? "border-rivet text-muted hover:text-ink"
                        : "border-toxic/50 text-toxic hover:bg-toxic/10"
                    }`}
                  >
                    {s.enabled ? "Deactivate" : "Activate"}
                  </button>
                </form>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sympathiser Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted">
              Manually define who controls each Sympathiser — initial state or
              correction after a match. Changes are reflected on the public map
              immediately.
            </p>
            <div className="flex flex-col divide-y divide-rivet/50">
              {sympsOrdered.map((s) => {
                const ctrlGangId = controllerMap[s.id] ?? null;
                const ctrlName = ctrlGangId
                  ? (gangName.get(ctrlGangId) ?? null)
                  : null;
                return (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2"
                  >
                    <span className="w-44 shrink-0 text-sm text-ink">
                      {s.name.replace(" Sympathisers", "")}
                    </span>
                    <span className="w-28 shrink-0 text-xs text-muted">
                      {ctrlName ?? "free"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <SympathiserAssignForm
                        sympathiserId={s.id}
                        currentGangId={ctrlGangId}
                        gangs={gangs}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Challenge panel — read-only when campaign is finished ── */}
        {isFinished ? (
          <Card>
            <CardHeader>
              <CardTitle>Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">
                The campaign is closed — challenges are read-only.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>New challenge</CardTitle>
            </CardHeader>
            <CardContent>
              {gangs.length < 2 ? (
                <p className="text-sm text-muted">
                  At least two gangs are required.
                </p>
              ) : (
                <CreateChallengeForm gangs={gangs} sympathisers={sympOptions} />
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Pending challenges ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {pending.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">
                No open challenges.
              </p>
            ) : (
              <ul className="divide-y divide-rivet/50">
                {pending.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="text-sm">
                      <span className="font-mono text-xs text-muted">
                        C{c.cycle}{" "}
                      </span>
                      <span className="text-ink">
                        {gangName.get(c.challengerGangId) ?? "—"}
                      </span>
                      <span className="text-muted"> vs </span>
                      <span className="text-ink">
                        {c.challengedGangId
                          ? (gangName.get(c.challengedGangId) ?? "—")
                          : "free"}
                      </span>
                      <span className="text-muted">
                        {" · "}
                        {c.sympathiserId
                          ? sympName
                              .get(c.sympathiserId)
                              ?.replace(" Sympathisers", "")
                          : "—"}
                      </span>
                      {c.scenario && (
                        <div className="text-xs text-muted">{c.scenario}</div>
                      )}
                    </div>
                    {/* Read-only when finished */}
                    {!isFinished && (
                      <ResolveChallengeForm
                        challengeId={c.id}
                        hasDefender={!!c.challengedGangId}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {resolved.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>History ({resolved.length})</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <ul className="divide-y divide-rivet/50">
                {resolved.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                  >
                    <span>
                      <span className="font-mono text-xs text-muted">
                        C{c.cycle}{" "}
                      </span>
                      <span className="text-ink">
                        {gangName.get(c.challengerGangId) ?? "—"}
                      </span>
                      <span className="text-muted">
                        {" · "}
                        {c.sympathiserId
                          ? sympName
                              .get(c.sympathiserId)
                              ?.replace(" Sympathisers", "")
                          : "—"}
                      </span>
                    </span>
                    <Badge variant="muted">{c.outcome}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
