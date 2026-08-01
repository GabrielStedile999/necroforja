import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { GangManager } from "@/components/gang/GangManager";
import { requireAdmin } from "@/lib/auth/guards";
import {
  getGangById,
  getSympathiserControlMap,
  getOtherGangsInCampaign,
} from "@/lib/db/queries";
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
        exportHref={`/admin/gangs/${gang.id}/export`}
        arbitratorMode
      />
    </>
  );
}
