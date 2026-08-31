import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { GangManager } from "@/components/gang/GangManager";
import { requireAdmin } from "@/lib/auth/guards";
import {
  getGangById,
  getSympathiserControlMap,
  getOtherGangsInCampaign,
  listEnabledCatalogItems,
  listKeywordRules,
  getSympathiserBoonMap,
  getActiveCampaign,
  listCaptivesHeldBy,
  listCaptiveEvents,
} from "@/lib/db/queries";
import { fighterTotalCost } from "@/lib/scoring";
import { keywordRuleMap } from "@/lib/keywords";
import { getSympathiser } from "@/lib/data/sympathisers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Gang",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Arbitrator mode (issue #65): the admin manages ANY gang through the same
 * panel the owner uses at /player. Authorisation on every write happens in
 * resolveGangForWrite (the hidden gangId in each form addresses this gang).
 */
export default async function AdminGangPage({
  params,
}: {
  params: Promise<{ gangId: string }>;
}) {
  await requireAdmin();
  const { gangId } = await params;

  const gang = await getGangById(gangId);
  if (!gang) notFound();

  const [
    controlMap,
    otherGangs,
    catalog,
    keywordRules,
    boonMap,
    campaign,
    captiveRows,
    captiveEvents,
  ] = await Promise.all([
    getSympathiserControlMap(),
    getOtherGangsInCampaign(gang.id),
    listEnabledCatalogItems(),
    listKeywordRules(),
    getSympathiserBoonMap(),
    getActiveCampaign(),
    listCaptivesHeldBy(gang.id),
    listCaptiveEvents(gang.id),
  ]);
  // issue #86 — held captives priced server-side (equipment + advancements).
  const captivesHeld = captiveRows.map((c) => ({
    id: c.id,
    name: c.name,
    ownerGangName: c.gang?.name ?? "—",
    value: fighterTotalCost({
      baseCost: c.baseCost,
      equipment: c.equipment.map((fe) => ({ cost: fe.equipment.cost })),
      advancements: c.advancements,
    }),
  }));
  // issue #85 — controlled Sympathisers feed the boon panel (id + name).
  const controlled = (controlMap[gang.id] ?? [])
    .map((id) => getSympathiser(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const symps = controlled.map((s) => s.name);

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Link
          href="/admin"
          className="font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-hazard"
        >
          ← Arbitrator Dashboard
        </Link>
      </div>
      <GangManager
        gang={gang}
        otherGangs={otherGangs}
        sympathiserNames={symps}
        controlledSympathisers={controlled}
        boonSummaries={boonMap}
        campaignPhase={campaign?.phase}
        captivesHeld={captivesHeld}
        captiveEvents={captiveEvents}
        exportHref={`/admin/gangs/${gang.id}/export`}
        arbitratorMode
        catalog={catalog}
        keywordRules={keywordRuleMap(keywordRules)}
      />
    </>
  );
}
