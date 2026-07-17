import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { CampaignStatus } from "@/components/CampaignStatus";
import { GangRankingTable } from "@/components/GangRankingTable";
import { SympathiserMap } from "@/components/SympathiserMap";
import { ChallengeLog } from "@/components/ChallengeLog";
import { Triumphs } from "@/components/Triumphs";
import { getPublicView } from "@/lib/repo";

/**
 * Public campaign dashboard — moved from / to /dashboard.
 *
 * Publicly indexable (the live campaign data is the portfolio showcase).
 * ISR: revalidate every 60 s so CDN can cache HTML without staling.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Campaign Dashboard",
  description:
    "Live Necromunda campaign dashboard — gang rankings, Sympathisers, and challenge log for The Aranthian Succession: Cinderak Burning.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/dashboard" },
};

export default async function DashboardPage() {
  const view = await getPublicView();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <CampaignStatus view={view} />
        <Triumphs
          triumphs={view.triumphs}
          campaignClosed={view.campaign.status === "finished"}
        />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <GangRankingTable gangs={view.gangs} />
            <ChallengeLog challenges={view.recentChallenges} />
          </div>
          <div className="min-w-0 lg:col-span-3">
            <SympathiserMap sympathisers={view.sympathisers} />
          </div>
        </div>
      </main>
      <footer className="border-t border-rivet px-4 py-6 text-center text-xs text-muted">
        <p className="m-0 mb-3">
          Campaign dashboard · Gabriel Stedile&apos;s portfolio project ·
          Campaign content for private use among players.
        </p>
        {/* GW IP disclaimer (issue #17). Static English on purpose: this route
            is ISR-cached and stays outside the cookie-based i18n. */}
        <p className="mx-auto m-0 max-w-4xl text-[11px] leading-[1.7] opacity-80">
          NecroForja is an unofficial, non-commercial fan project for the
          Necromunda tabletop game. It is in no way affiliated with, endorsed
          or licensed by Games Workshop Limited. Necromunda, Warhammer 40,000
          and all associated logos, illustrations, images, names, creatures,
          races, vehicles, locations, weapons, characters and marks are ®, ™
          and/or © Games Workshop Limited, variably registered around the
          world. Used without permission. No challenge to their status is
          intended. All rights reserved to their respective owners.
        </p>
      </footer>
    </>
  );
}
