import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreatePlayerForm } from "@/components/admin/CreatePlayerForm";
import { EditPlayerForm } from "@/components/admin/EditPlayerForm";
import { GangAdminPanel } from "@/components/admin/GangAdminPanel";
import { CreateGangForm } from "@/components/admin/CreateGangForm";
import { listPlayers, listUnassignedGangs } from "@/lib/db/queries";
import { togglePlayerActive } from "./actions";
import { ShieldAlert, FileDown, Swords } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arbitrator",
  robots: { index: false, follow: false },
};

// Always fresh data (administrative area).
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [players, unassignedGangs] = await Promise.all([
    listPlayers(),
    listUnassignedGangs(),
  ]);

  // Accounts able to RECEIVE a gang on transfer (one gang per player).
  const transferCandidates = players
    .filter((p) => p.gangs.length === 0 && p.isActive)
    .map((p) => ({ id: p.id, displayName: p.displayName }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-hazard" aria-hidden />
          <h1 className="stencil text-2xl font-bold text-ink">
            Arbitrator Dashboard
          </h1>
          <Badge variant="hazard">Admin</Badge>
          <div className="ml-auto flex gap-2">
            <Link href="/admin/reports">
              <Button variant="outline">Journal →</Button>
            </Link>
            <Link href="/admin/gallery">
              <Button variant="outline">Gallery →</Button>
            </Link>
            <Link href="/admin/campaign">
              <Button variant="outline">Campaign Panel →</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New player account</CardTitle>
            <span className="ml-auto text-xs text-muted">
              no self-signup
            </span>
          </CardHeader>
          <CardContent>
            <CreatePlayerForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Players ({players.length})</CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {players.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">
                No players yet. Create the first account above.
              </p>
            ) : (
              <ul className="divide-y divide-rivet/50">
                {players.map((p) => (
                  <li key={p.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-display text-base font-semibold uppercase text-ink">
                          {p.gangs[0]?.name ?? "— no gang —"}
                        </div>
                        <div className="text-xs text-muted">
                          {p.displayName} · {p.email}
                          {p.gangs[0] ? ` · ${p.gangs[0].house}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={p.isActive ? "toxic" : "muted"}>
                          {p.isActive ? "active" : "inactive"}
                        </Badge>
                        {p.gangs[0] && (
                          <>
                            <Link
                              href={`/admin/gangs/${p.gangs[0].id}`}
                              title="Manage roster, stash and fighters (Arbitrator mode)"
                            >
                              <Button
                                variant="outline"
                                type="button"
                                className="gap-1 text-xs"
                              >
                                <Swords className="h-4 w-4" aria-hidden />
                                Manage
                              </Button>
                            </Link>
                            <a
                              href={`/admin/gangs/${p.gangs[0].id}/export`}
                              target="_blank"
                              rel="noreferrer"
                              title="Export gang sheet as PDF"
                            >
                              <Button variant="ghost" type="button" className="gap-1 text-xs">
                                <FileDown className="h-4 w-4" aria-hidden />
                                PDF
                              </Button>
                            </a>
                          </>
                        )}
                        <form action={togglePlayerActive}>
                          <input type="hidden" name="userId" value={p.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(p.isActive)}
                          />
                          <Button variant="outline" type="submit">
                            {p.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </form>
                      </div>
                    </div>
                    {/* issue #57 — edição da conta (nome, login, senha) */}
                    <details className="mt-2">
                      <summary className="cursor-pointer py-1 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-hazard">
                        Edit account
                      </summary>
                      <div className="mt-3 border-t border-rivet/50 pt-4">
                        <EditPlayerForm
                          player={{
                            id: p.id,
                            displayName: p.displayName,
                            email: p.email,
                          }}
                        />
                      </div>
                    </details>
                    {/* issue #64 — gang identity, transfer, delete / create */}
                    <details className="mt-2">
                      <summary className="cursor-pointer py-1 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-hazard">
                        {p.gangs[0] ? "Edit gang" : "Create gang"}
                      </summary>
                      <div className="mt-3 border-t border-rivet/50 pt-4">
                        {p.gangs[0] ? (
                          <GangAdminPanel
                            gang={{
                              id: p.gangs[0].id,
                              name: p.gangs[0].name,
                              house: p.gangs[0].house,
                              reputation: p.gangs[0].reputation,
                            }}
                            candidates={transferCandidates}
                          />
                        ) : (
                          <CreateGangForm
                            userId={p.id}
                            userName={p.displayName}
                          />
                        )}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* issue #64 — gangs released from their owner keep being manageable */}
        {unassignedGangs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Unassigned gangs ({unassignedGangs.length})</CardTitle>
              <span className="ml-auto text-xs text-muted">
                no owner — transfer or delete
              </span>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <ul className="divide-y divide-rivet/50">
                {unassignedGangs.map((g) => (
                  <li key={g.id} className="px-5 py-3">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-display text-base font-semibold uppercase text-ink">
                        {g.name}
                      </span>
                      <span className="text-xs text-muted">
                        {g.house} · Rep {g.reputation}
                      </span>
                    </div>
                    <details>
                      <summary className="cursor-pointer py-1 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-hazard">
                        Manage gang
                      </summary>
                      <div className="mt-3 border-t border-rivet/50 pt-4">
                        <GangAdminPanel gang={g} candidates={transferCandidates} />
                      </div>
                    </details>
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
