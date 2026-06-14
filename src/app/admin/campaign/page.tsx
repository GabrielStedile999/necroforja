import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateChallengeForm } from "@/components/admin/CreateChallengeForm";
import { ResolveChallengeForm } from "@/components/admin/ResolveChallengeForm";
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

export const metadata: Metadata = { title: "Campanha" };
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
            Nenhuma campanha ativa
          </h1>
          <p className="mt-2 text-sm text-muted">
            Conecte o banco e rode <code>npm run db:seed</code> para iniciar.
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

  // ordena conforme o catálogo
  const sympsOrdered = allSymps
    .slice()
    .sort((a, b) => (sympOrder.get(a.id) ?? 0) - (sympOrder.get(b.id) ?? 0));
  const enabledCount = sympsOrdered.filter((s) => s.enabled).length;

  // só os habilitados podem entrar em desafios
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
            Painel da Campanha
          </h1>
          <Badge variant="hazard">{PHASE_LABEL[campaign.phase]}</Badge>
          <Link href="/admin" className="ml-auto">
            <Button variant="ghost">Contas →</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Ciclo {campaign.currentCycle} / {campaign.totalCycles}
            </CardTitle>
            <form action={advanceCycle} className="ml-auto">
              <Button
                type="submit"
                variant="outline"
                disabled={campaign.currentCycle >= campaign.totalCycles}
              >
                Avançar ciclo →
              </Button>
            </form>
          </CardHeader>
          <CardContent className="text-sm text-muted">
            Great Darkness (ciclos 1-3) · Downtime (4) · Spark of Rebellion
            (5-7). Avançar o ciclo ajusta a fase automaticamente.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sympathisers na campanha</CardTitle>
            <span className="ml-auto text-xs text-muted">
              {enabledCount}/{sympsOrdered.length} ativos
            </span>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted">
              Escolha quais Sympathisers aparecem na campanha e na tela inicial.
              Os inativos somem do mapa público e não podem ser disputados.
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
                    {s.enabled ? "Desativar" : "Ativar"}
                  </button>
                </form>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novo desafio</CardTitle>
          </CardHeader>
          <CardContent>
            {gangs.length < 2 ? (
              <p className="text-sm text-muted">
                São necessárias ao menos duas gangues.
              </p>
            ) : (
              <CreateChallengeForm gangs={gangs} sympathisers={sympOptions} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desafios pendentes ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {pending.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">
                Nenhum desafio em aberto.
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
                          : "livre"}
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
              <CardTitle>Histórico ({resolved.length})</CardTitle>
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
