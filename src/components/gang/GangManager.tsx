import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddFighterForm } from "@/components/player/AddFighterForm";
import { AddEquipmentForm } from "@/components/player/AddEquipmentForm";
import { AddStashItemForm } from "@/components/player/AddStashItemForm";
import type { CatalogOption } from "@/components/player/CatalogPicker";
import type { KeywordRuleMap } from "@/components/rules/KeywordChips";
import { StashCreditsForm } from "@/components/player/StashCreditsForm";
import { EquipFromStashForm } from "@/components/player/EquipFromStashForm";
import { UpdateFighterStatusForm } from "@/components/player/UpdateFighterStatusForm";
import { FighterXpForm } from "@/components/player/FighterXpForm";
import { EditFighterForm } from "@/components/player/EditFighterForm";
import { FighterAvatarForm } from "@/components/player/FighterAvatarForm";
import Image from "next/image";
import { Bot, FileDown } from "lucide-react";
import { GALLERY_BUCKET, storagePublicUrl } from "@/lib/storage";
import {
  removeFighter,
  removeEquipment,
  removeStashItem,
} from "@/app/player/actions";
import {
  gangRating,
  gangWealth,
  fighterTotalCost,
  creditsRemaining,
} from "@/lib/scoring";
import type { Gang } from "@/types";

interface GangOption {
  id: string;
  name: string;
}

/**
 * Full gang management panel (roster, stash, recruit) — extracted from
 * /player (issue #65) so the SAME flows serve the owner at /player and the
 * Arbitrator at /admin/gangs/[gangId]. Every form posts a hidden `gangId`;
 * authorisation happens server-side in resolveGangForWrite (admin: any
 * gang; player: only their own).
 */
export function GangManager({
  gang,
  otherGangs,
  sympathiserNames,
  exportHref,
  assistantHref,
  arbitratorMode = false,
  catalog = [],
  keywordRules = {},
}: {
  gang: Gang & { id: string };
  otherGangs: GangOption[];
  sympathiserNames: string[];
  exportHref: string;
  assistantHref?: string;
  arbitratorMode?: boolean;
  /** Enabled catalogue items (issue #67) — feeds the equipment pickers. */
  catalog?: CatalogOption[];
  /** Keyword glossary map (issue #67 follow-up) — clickable trait chips. */
  keywordRules?: KeywordRuleMap;
}) {
  const gangId = gang.id;

  /**
   * Portrait public URL (issue #63) — falls back to the site crest when the
   * fighter has none or the storage env is absent (build sandboxes).
   */
  const avatarSrc = (path: string | null | undefined): string =>
    path && process.env.SUPABASE_URL
      ? storagePublicUrl(GALLERY_BUCKET, path)
      : "/brand/logo-light.png";

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="stencil text-3xl font-bold text-ink">{gang.name}</h1>
            {arbitratorMode && <Badge variant="hazard">Arbitrator mode</Badge>}
          </div>
          <p className="text-sm text-muted">
            {gang.ownerName} · {gang.house}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {assistantHref && (
              <Link href={assistantHref}>
                <Button variant="outline" className="gap-2">
                  <Bot className="h-4 w-4" aria-hidden />
                  Rules Assistant
                </Button>
              </Link>
            )}
            <a href={exportHref} target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" aria-hidden />
                Export PDF
              </Button>
            </a>
          </div>
        </div>
        <div className="flex gap-6 font-mono">
          <Metric label="Rating" value={gangRating(gang)} />
          <Metric label="Wealth" value={gangWealth(gang)} />
          <Metric label="Rep" value={gang.reputation} />
          <Metric label="Stash" value={`${gang.stashCredits}c`} accent />
        </div>
      </div>

      {sympathiserNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted">
            Controlled Sympathisers:
          </span>
          {sympathiserNames.map((name) => (
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
            remaining budget: {creditsRemaining(gang)}c
          </span>
        </CardHeader>
        <CardContent className="px-0 py-0">
          {gang.fighters.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">
              No fighters yet. Recruit the first one below.
            </p>
          ) : (
            <ul className="divide-y divide-rivet/50">
              {gang.fighters.map((f) => (
                <li key={f.id} className="flex flex-col">
                  {/* Fighter header */}
                  <div className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={avatarSrc(f.avatarPath)}
                        alt={`Portrait of ${f.name}`}
                        width={80}
                        height={80}
                        className="h-20 w-20 shrink-0 border border-rivet object-cover"
                      />
                      <div>
                      <div className="flex items-center gap-2 font-medium text-ink">
                        {f.name}
                        {f.status !== "active" && (
                          <Badge
                            variant={f.status === "dead" ? "blood" : "muted"}
                          >
                            {f.status === "in_recovery" ? "recovery" : f.status}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted">
                        {f.type} · {f.category} · XP {f.xp}
                      </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-ink">
                        {fighterTotalCost(f)}c
                      </span>
                      <form action={removeFighter}>
                        <input type="hidden" name="fighterId" value={f.id} />
                        <input type="hidden" name="gangId" value={gangId} />
                        <Button variant="ghost" type="submit">
                          Remove fighter
                        </Button>
                      </form>
                    </div>
                  </div>

                  {/* Fighter equipment */}
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
                              <input
                                type="hidden"
                                name="gangId"
                                value={gangId}
                              />
                              <Button
                                variant="ghost"
                                type="submit"
                                className="h-7 px-2 text-xs text-blood hover:text-blood"
                              >
                                Remove
                              </Button>
                            </form>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Controls: status + XP */}
                  <div className="border-t border-rivet/30 bg-void/40 px-5 py-3">
                    <div className="flex flex-wrap gap-6">
                      <div className="flex-1 min-w-0">
                        <UpdateFighterStatusForm
                          key={`status-${f.id}-${f.status}`}
                          fighterId={f.id}
                          currentStatus={f.status}
                          otherGangs={otherGangs}
                          gangId={gangId}
                        />
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                          Experience
                        </p>
                        <FighterXpForm fighterId={f.id} gangId={gangId} />
                      </div>
                    </div>
                  </div>

                  {/* Add equipment form */}
                  <div className="border-t border-rivet/30 bg-void/40 px-5 py-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                      Equip
                    </p>
                    <AddEquipmentForm
                      fighterId={f.id}
                      gangId={gangId}
                      catalog={catalog}
                      keywordRules={keywordRules}
                    />
                  </div>

                  {/* Edit fighter (issue #63) */}
                  <details className="border-t border-rivet/30 bg-void/40 px-5 py-3">
                    <summary className="cursor-pointer py-1 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-hazard">
                      Edit fighter
                    </summary>
                    <div className="mt-3 flex flex-col gap-6 border-t border-rivet/50 pt-4">
                      <FighterAvatarForm
                        fighterId={f.id}
                        gangId={gangId}
                        fighterName={f.name}
                        currentUrl={
                          f.avatarPath ? avatarSrc(f.avatarPath) : null
                        }
                      />
                      <EditFighterForm fighter={f} gangId={gangId} />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ---- Stash Panel -------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Stash</CardTitle>
          <span className="ml-auto font-mono text-xs text-muted">
            Wealth: {gangWealth(gang)}
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Credits */}
          <StashCreditsForm
            currentCredits={gang.stashCredits}
            gangId={gangId}
          />

          {/* Stored items */}
          {gang.stash.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                Stored items
              </p>
              <ul className="divide-y divide-rivet/50">
                {gang.stash.map((item) => (
                  <li key={item.id} className="flex flex-col gap-3 py-3">
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
                          <input type="hidden" name="gangId" value={gangId} />
                          <Button
                            variant="ghost"
                            type="submit"
                            className="h-7 px-2 text-xs text-blood hover:text-blood"
                          >
                            Remove
                          </Button>
                        </form>
                      </div>
                    </div>
                    <EquipFromStashForm
                      stashItemId={item.id}
                      gangId={gangId}
                      fighters={gang.fighters
                        .filter((f) => f.status !== "dead")
                        .map((f) => ({ id: f.id, name: f.name }))}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted">Stash empty.</p>
          )}

          {/* Add item to Stash */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
              Add item
            </p>
            <AddStashItemForm
              gangId={gangId}
              catalog={catalog}
              keywordRules={keywordRules}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recruit fighter</CardTitle>
        </CardHeader>
        <CardContent>
          <AddFighterForm gangId={gangId} />
        </CardContent>
      </Card>
    </main>
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
      <div className={`text-2xl font-bold ${accent ? "text-toxic" : "text-ink"}`}>
        {value}
      </div>
    </div>
  );
}
