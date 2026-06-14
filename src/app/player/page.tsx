import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddFighterForm } from "@/components/player/AddFighterForm";
import { AddEquipmentForm } from "@/components/player/AddEquipmentForm";
import { AddStashItemForm } from "@/components/player/AddStashItemForm";
import { StashCreditsForm } from "@/components/player/StashCreditsForm";
import { EquipFromStashForm } from "@/components/player/EquipFromStashForm";
import { UpdateFighterStatusForm } from "@/components/player/UpdateFighterStatusForm";
import { FighterXpForm } from "@/components/player/FighterXpForm";
import { Bot } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import {
  getGangByOwnerId,
  getSympathiserControlMap,
  getOtherGangsInCampaign,
} from "@/lib/db/queries";
import { getSympathiser } from "@/lib/data/sympathisers";
import { removeFighter, removeEquipment, removeStashItem } from "./actions";
import {
  gangRating,
  gangWealth,
  fighterTotalCost,
  creditsRemaining,
} from "@/lib/scoring";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Minha Gangue" };
export const dynamic = "force-dynamic";

export default async function PlayerPage() {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);

  if (!gang) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="stencil text-2xl font-bold text-ink">
            Nenhuma gangue encontrada
          </h1>
          <p className="mt-2 text-sm text-muted">
            Peça ao Arbitrator para vincular uma gangue à sua conta.
          </p>
        </main>
      </>
    );
  }

  const [controlMap, otherGangs] = await Promise.all([
    getSympathiserControlMap(),
    getOtherGangsInCampaign(gang.id),
  ]);
  const symps = (controlMap[gang.id] ?? [])
    .map((id) => getSympathiser(id)?.name)
    .filter((n): n is string => Boolean(n));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="stencil text-3xl font-bold text-ink">{gang.name}</h1>
            <p className="text-sm text-muted">
              {gang.ownerName} · {gang.house}
            </p>
            <Link href="/player/assistant">
              <Button variant="outline" className="mt-2 gap-2">
                <Bot className="h-4 w-4" aria-hidden />
                Assistente de Regras
              </Button>
            </Link>
          </div>
          <div className="flex gap-6 font-mono">
            <Metric label="Rating" value={gangRating(gang)} />
            <Metric label="Wealth" value={gangWealth(gang)} />
            <Metric label="Stash" value={`${gang.stashCredits}c`} accent />
          </div>
        </div>

        {symps.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted">
              Sympathisers controlados:
            </span>
            {symps.map((name) => (
              <Badge key={name} variant="toxic">
                {name.replace(" Sympathisers", "")}
              </Badge>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Roster ({gang.fighters.length})</CardTitle>
            <span className="ml-auto font-mono text-xs text-muted">
              orçamento restante: {creditsRemaining(gang)}c
            </span>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {gang.fighters.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">
                Nenhum fighter ainda. Recrute o primeiro abaixo.
              </p>
            ) : (
              <ul className="divide-y divide-rivet/50">
                {gang.fighters.map((f) => (
                  <li key={f.id} className="flex flex-col">
                    {/* Cabeçalho do fighter */}
                    <div className="flex items-center justify-between gap-3 px-5 py-3">
                      <div>
                        <div className="flex items-center gap-2 font-medium text-ink">
                          {f.name}
                          {f.status !== "active" && (
                            <Badge
                              variant={
                                f.status === "dead" ? "blood" : "muted"
                              }
                            >
                              {f.status === "in_recovery"
                                ? "recovery"
                                : f.status}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted">
                          {f.type} · {f.category} · XP {f.xp}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-ink">
                          {fighterTotalCost(f)}c
                        </span>
                        <form action={removeFighter}>
                          <input type="hidden" name="fighterId" value={f.id} />
                          <Button variant="ghost" type="submit">
                            Remover fighter
                          </Button>
                        </form>
                      </div>
                    </div>

                    {/* Equipamentos do fighter */}
                    {f.equipment.length > 0 && (
                      <ul className="border-t border-rivet/30 px-5 py-2">
                        {f.equipment.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-2 py-1 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="muted">{item.category}</Badge>
                              <span className="text-ink">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted">
                                {item.cost}c
                              </span>
                              <form action={removeEquipment}>
                                <input
                                  type="hidden"
                                  name="fighterId"
                                  value={f.id}
                                />
                                <input
                                  type="hidden"
                                  name="equipmentId"
                                  value={item.id}
                                />
                                <Button
                                  variant="ghost"
                                  type="submit"
                                  className="h-7 px-2 text-xs text-blood hover:text-blood"
                                >
                                  Remover
                                </Button>
                              </form>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Controles: status + XP */}
                    <div className="border-t border-rivet/30 bg-void/40 px-5 py-3">
                      <div className="flex flex-wrap gap-6">
                        <div className="flex-1 min-w-0">
                          <UpdateFighterStatusForm
                            key={`status-${f.id}-${f.status}`}
                            fighterId={f.id}
                            currentStatus={f.status}
                            otherGangs={otherGangs}
                          />
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                            Experiência
                          </p>
                          <FighterXpForm fighterId={f.id} />
                        </div>
                      </div>
                    </div>

                    {/* Formulário de adicionar equipamento */}
                    <div className="border-t border-rivet/30 bg-void/40 px-5 py-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                        Equipar
                      </p>
                      <AddEquipmentForm fighterId={f.id} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ---- Painel de Stash ----------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Stash</CardTitle>
            <span className="ml-auto font-mono text-xs text-muted">
              Wealth: {gangWealth(gang)}
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Créditos */}
            <StashCreditsForm currentCredits={gang.stashCredits} />

            {/* Itens guardados */}
            {gang.stash.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                  Itens guardados
                </p>
                <ul className="divide-y divide-rivet/50">
                  {gang.stash.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="muted">{item.equipment.category}</Badge>
                          <span className="text-sm text-ink">
                            {item.equipment.name}
                          </span>
                          {item.qty > 1 && (
                            <span className="font-mono text-xs text-muted">
                              ×{item.qty}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted">
                            {item.equipment.cost}c
                          </span>
                          <form action={removeStashItem}>
                            <input
                              type="hidden"
                              name="stashItemId"
                              value={item.id}
                            />
                            <Button
                              variant="ghost"
                              type="submit"
                              className="h-7 px-2 text-xs text-blood hover:text-blood"
                            >
                              Remover
                            </Button>
                          </form>
                        </div>
                      </div>
                      <EquipFromStashForm
                        stashItemId={item.id}
                        fighters={gang.fighters
                          .filter((f) => f.status !== "dead")
                          .map((f) => ({ id: f.id, name: f.name }))}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted">Stash vazio.</p>
            )}

            {/* Adicionar item ao Stash */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                Adicionar item
              </p>
              <AddStashItemForm />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recrutar fighter</CardTitle>
          </CardHeader>
          <CardContent>
            <AddFighterForm />
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-xs uppercase text-muted">{label}</div>
      <div
        className={`text-2xl font-bold ${accent ? "text-toxic" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}
