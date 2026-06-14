import { SiteHeader } from "@/components/SiteHeader";
import { CampaignStatus } from "@/components/CampaignStatus";
import { GangRankingTable } from "@/components/GangRankingTable";
import { SympathiserMap } from "@/components/SympathiserMap";
import { ChallengeLog } from "@/components/ChallengeLog";
import { Triumphs } from "@/components/Triumphs";
import { getPublicView } from "@/lib/repo";
import { buildWebsiteJsonLd, buildAppJsonLd } from "@/lib/seo/json-ld";

/**
 * ISR: revalidate every 60 seconds.
 *
 * The landing shows live campaign data that changes only when the admin
 * advances the campaign or resolves a challenge — at most a few times per
 * session. 60 s is fresh enough for players at the table while allowing
 * Vercel's CDN to serve cached HTML for the vast majority of requests,
 * improving TTFB and Lighthouse Performance.
 *
 * (Previously force-dynamic; removed to unlock caching.)
 */
export const revalidate = 60;

const siteUrl =
  process.env.AUTH_URL || "https://necroforja.vercel.app";

export default async function HomePage() {
  const view = await getPublicView();

  const websiteJsonLd = buildWebsiteJsonLd(siteUrl);
  const appJsonLd = buildAppJsonLd(siteUrl);

  return (
    <>
      {/* JSON-LD structured data — not rendered in the UI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

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
      <footer className="border-t border-rivet py-6 text-center text-xs text-muted">
        Campaign dashboard · Gabriel Stedile&apos;s portfolio project ·
        Campaign content for private use among players.
      </footer>
    </>
  );
}
