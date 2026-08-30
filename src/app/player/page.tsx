import { SiteHeader } from "@/components/SiteHeader";
import { GangManager } from "@/components/gang/GangManager";
import { requireUser } from "@/lib/auth/guards";
import {
  getGangByOwnerId,
  getSympathiserControlMap,
  getOtherGangsInCampaign,
  listEnabledCatalogItems,
  listKeywordRules,
  getSympathiserBoonMap,
  getActiveCampaign,
} from "@/lib/db/queries";
import { keywordRuleMap } from "@/lib/keywords";
import { getSympathiser } from "@/lib/data/sympathisers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Gang",
  robots: { index: false, follow: false },
};
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
            No gang found
          </h1>
          <p className="mt-2 text-sm text-muted">
            Ask the Arbitrator to link a gang to your account.
          </p>
        </main>
      </>
    );
  }

  const [controlMap, otherGangs, catalog, keywordRules, boonMap, campaign] =
    await Promise.all([
      getSympathiserControlMap(),
      getOtherGangsInCampaign(gang.id),
      listEnabledCatalogItems(),
      listKeywordRules(),
      getSympathiserBoonMap(),
      getActiveCampaign(),
    ]);
  // issue #85 — controlled Sympathisers feed the boon panel (id + name).
  const controlled = (controlMap[gang.id] ?? [])
    .map((id) => getSympathiser(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const symps = controlled.map((s) => s.name);

  return (
    <>
      <SiteHeader />
      <GangManager
        gang={gang}
        otherGangs={otherGangs}
        sympathiserNames={symps}
        controlledSympathisers={controlled}
        boonSummaries={boonMap}
        campaignPhase={campaign?.phase}
        exportHref="/player/export"
        assistantHref="/player/assistant"
        catalog={catalog}
        keywordRules={keywordRuleMap(keywordRules)}
      />
    </>
  );
}
