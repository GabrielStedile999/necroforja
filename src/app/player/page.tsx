import { SiteHeader } from "@/components/SiteHeader";
import { GangManager } from "@/components/gang/GangManager";
import { requireUser } from "@/lib/auth/guards";
import {
  getGangByOwnerId,
  getSympathiserControlMap,
  getOtherGangsInCampaign,
  listEnabledCatalogItems,
  listKeywordRules,
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

  const [controlMap, otherGangs, catalog, keywordRules] = await Promise.all([
    getSympathiserControlMap(),
    getOtherGangsInCampaign(gang.id),
    listEnabledCatalogItems(),
    listKeywordRules(),
  ]);
  const symps = (controlMap[gang.id] ?? [])
    .map((id) => getSympathiser(id)?.name)
    .filter((n): n is string => Boolean(n));

  return (
    <>
      <SiteHeader />
      <GangManager
        gang={gang}
        otherGangs={otherGangs}
        sympathiserNames={symps}
        exportHref="/player/export"
        assistantHref="/player/assistant"
        catalog={catalog}
        keywordRules={keywordRuleMap(keywordRules)}
      />
    </>
  );
}
