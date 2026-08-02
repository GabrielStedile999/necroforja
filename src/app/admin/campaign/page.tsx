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
  CreateCampaignForm,
  EditCampaignForm,
} from "@/components/admin/CampaignLifecycleForms";
import { SetCycleForm } from "@/components/admin/SetCycleForm";
import { toggleGangActive } from "@/app/admin/gangs/actions";
import { downtimeCycle } from "@/lib/campaign-rules";
import {
  getActiveCampaign,
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
  // Prefer the ACTIVE campaign (same rule as the public repo/landing) and
  // only fall back to the most recent one when none is active (closed-
  // campaign view). Using "latest" alone showed an empty panel when a
  // stray newer campaign row existed alongside the active one.
  const campaign = (await getActiveCampaign()) ?? (await getLatestCampaign());

  if (!campaign) {
    // issue #66 — a campaign is born from the UI now, not from the seed.
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
          <h1 className="stencil text-2xl font-bold text-ink">
            No campaign yet
          </h1>
          <Card>
            <CardHeader>
              <CardTitle>Start a campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateCampaignForm />
            </CardContent>
          </Card>
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
  /**
   * Only gangs currently taking part in the campaign enter challenges and
   * Sympathiser assignment (issue #66 follow-up); the full list (including
   * inactive) still names historical challenges above. The option label
   * carries the player's name for quick identification.
   */
  const activeGangs = gangs
    .filter((g) => g.isActive)
    .map((g) => ({
      id: g.id,
      name: g.ownerName ? `${g.name} (${g.ownerName})` : g.name,
    }));
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
          <CardContent className="flex flex-col gap-3 text-sm text-muted">
            <p>
              Great Darkness (cycles 1-{downtimeCycle(campaign.totalCycles) - 1})
              · Downtime ({downtimeCycle(campaign.totalCycles)}) · Spark of
              Rebellion ({downtimeCycle(campaign.totalCycles) + 1}-
              {campaign.totalCycles}). Advancing the cycle automatically
              adjusts the phase.
            </p>
            {/* issue #66 follow-up — jump to a specific cycle (regret button) */}
            {!isFinished && (
              <SetCycleForm
                campaignId={campaign.id}
                currentCycle={campaign.currentCycle}
                totalCycles={campaign.totalCycles}
              />
            )}
            {/* issue #66 — edit name/dates/length of the campaign */}
            {!isFinished && (
              <details>
                <summary className="cursor-pointer py-1 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-hazard">
                  Edit campaign
                </summary>
                <div className="mt-3 border-t border-rivet/50 pt-4">
                  <EditCampaignForm
                    campaign={{
                      id: campaign.id,
                      name: campaign.name,
                      totalCycles: campaign.totalCycles,
                      startDate: campaign.startDate,
                      endDate: campaign.endDate,
                    }}
                  />
                </div>
              </details>
            )}
          </CardContent>
        </Card>

        {/* issue #66 follow-up — who takes part in the campaign */}
        <Card>
          <CardHeader>
            <CardTitle>
              Campaign players (
              {gangs.filter((g) => g.isActive).length}/{gangs.length} active)
            </CardTitle>
            <Link href="/admin" className="ml-auto">
              <Button variant="ghost" className="text-xs">
                Add players (accounts) →
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {gangs.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">
                No gangs in this campaign yet — create accounts and gangs in
                the Accounts panel.
              </p>
            ) : (
              <>
                <ul className="divide-y divide-rivet/50">
                  {gangs.map((g) => (
                    <li
                      key={g.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 font-medium text-ink">
                            {g.name}
                            {!g.isActive && (
                              <Badge variant="muted">sitting out</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted">
                            {g.ownerName ?? "no owner"} · Rating {g.ratingCached}
                          </div>
                        </div>
                      </div>
                      {!isFinished && (
                        <form action={toggleGangActive}>
                          <input type="hidden" name="gangId" value={g.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(g.isActive)}
                          />
                          <Button variant="outline" type="submit">
                            {g.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="px-5 py-3 text-xs text-muted">
                  Inactive gangs keep their data but leave the public ranking
                  and the challenge/Sympathiser options. Add new players in
                  the Accounts panel (account + gang).
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* issue #66 — the previous campaign is finished: a new one can start */}
        {isFinished && (
          <Card>
            <CardHeader>
              <CardTitle>Start a new campaign</CardTitle>
              <span className="ml-auto text-xs text-muted">
                gangs stay linked to the finished campaign
              </span>
            </CardHeader>
            <CardContent>
              <CreateCampaignForm />
            </CardContent>
          </Card>
        )}

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
            {/* issue #66 follow-up — two columns; options = active gangs */}
            <div className="grid gap-x-8 sm:grid-cols-2">
              {sympsOrdered.map((s) => {
                const ctrlGangId = controllerMap[s.id] ?? null;
                const ctrlName = ctrlGangId
                  ? (gangName.get(ctrlGangId) ?? null)
                  : null;
                return (
                  <div
                    key={s.id}
                    className="border-b border-rivet/40 py-2"
                  >
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="text-sm text-ink">
                        {s.name.replace(" Sympathisers", "")}
                      </span>
                      <span className="text-xs text-muted">
                        {ctrlName ?? "free"}
                      </span>
                    </div>
                    <SympathiserAssignForm
                      sympathiserId={s.id}
                      currentGangId={ctrlGangId}
                      gangs={activeGangs}
                    />
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
                <CreateChallengeForm gangs={activeGangs} sympathisers={sympOptions} />
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
