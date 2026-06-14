import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateChallengeForm } from "@/components/admin/CreateChallengeForm";
import { ResolveChallengeForm } from "@/components/admin/ResolveChallengeForm";
import { SympathiserAssignForm } from "@/components/admin/SympathiserAssignForm";
import {
  getActiveCampaign,
  listGangsBasic,
  listChallenges,
  listSympathisers,
  getSympathiserControllerMap,
} from "@/lib/db/queries";
import { SYMPATHISERS } from "@/lib/data/sympathisers";
import { advanceCycle, toggleSympathiser } from "./actions";
import type { CampaignPhase } from "@/types";
import { Swords } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Campaign" };
export const dynamic = "force-dynamic";

const PHASE_LABEL: Record<CampaignPhase, string> = {
  great_darkness: "Great Darkness",
  downtime: "Downtime",
  spark_of_rebellion: "Spark of Rebellion",
};

export default async function CampaignAdminPage() {
  const campaign = await getActiveCampaign();

  if (!campaign) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="stencil text-2xl font-bold text-ink">
            No active campaign
          </h1>
          <p className="mt-2 text-sm text-muted">
            Connect the database and run <code>npm run db:seed</code> to start.
          </p>
        </main>
      </>
    );
  }

  const [gangs, challenges, controllerMap, allSymps] = await Promise.all([
    listGangsBasic(campaign.id),
    listChallenges(campaign.id, 30),
    getSympathiserControllerMap(),
    listSympathisers(),
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
          <Link href="/admin" className="ml-auto">
            <Button variant="ghost">Accounts →</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Cycle {campaign.currentCycle} / {campaign.totalCycles}
            </CardTitle>
            <form action={advanceCycle} className="ml-auto">
              <Button
                type="submit"
                variant="outline"
                disabled={campaign.currentCycle >= campaign.totalCycles}
              >
                Advance cycle →
              </Button>
            </form>
          </CardHeader>
          <CardContent className="text-sm text-muted">
            Great Darkness (cycles 1-3) · Downtime (4) · Spark of Rebellion
            (5-7). Advancing the cycle automatically adjusts the phase.
          </CardContent>
        </Card>

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
                    <ResolveChallengeForm
                      challengeId={c.id}
                      hasDefender={!!c.challengedGangId}
                    />
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
