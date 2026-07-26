import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Houses from "@/components/landing/Houses";
import Players, { type PlayerCardData } from "@/components/landing/Players";
import News, { type NewsItem } from "@/components/landing/News";
import BigCTA from "@/components/landing/BigCTA";
import SiteFooter from "@/components/landing/SiteFooter";
import { POST_TYPES, toPostType } from "@/components/reports/postTypes";
import { buildWebsiteJsonLd, buildAppJsonLd } from "@/lib/seo/json-ld";
import { listActivePlayersPublic, listPublishedPosts } from "@/lib/db/queries";
import { formatPostDate, pickPostText } from "@/lib/reports";
import { logger } from "@/lib/logger";
import { SITE_URL } from "@/lib/site-url";

/**
 * Hi-Fi marketing landing page — pixel-faithful React implementation
 * of the NecroForja Claude Design Hi-Fi mockup.
 *
 * i18n (issue #12): the locale is read from the NEXT_LOCALE cookie, which
 * makes this route dynamic — the previous ISR (revalidate 60s) no longer
 * applies and was removed to avoid confusion.
 *
 * A seção 03 // REPORTS carrega os 3 relatórios mais recentes do jornal de
 * campanha (issue #5), com fallback gracioso se o banco estiver fora.
 */

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  title: "NecroForja — Necromunda Campaign Manager",
  description:
    "The ultimate Necromunda campaign manager. Track gangs, Sympathisers, and the ranking of The Aranthian Succession: Cinderak Burning.",
  alternates: { canonical: "/" },
};

/** Últimos relatórios publicados para a seção 03 // REPORTS. */
async function loadLatestReports(locale: Locale): Promise<NewsItem[]> {
  try {
    const rows = await listPublishedPosts(3);
    return rows.map((post) => {
      const text = pickPostText(post, locale);
      const meta = POST_TYPES[toPostType(post.type)];
      return {
        slug: post.slug,
        title: text.title,
        excerpt: text.excerpt,
        tagLabel: meta.labels[locale] ?? meta.labels.en,
        tagColor: meta.color,
        date: formatPostDate(post.publishedAt ?? post.createdAt),
        coverImage: post.coverImage,
        coverAlt: post.coverAlt,
      };
    });
  } catch (error) {
    logger.error("landing: failed to load latest reports", { error });
    return [];
  }
}

/** Jogadores ativos para a seção 03 // THE PLAYERS (issue #18). */
async function loadActivePlayers(): Promise<PlayerCardData[]> {
  try {
    return await listActivePlayersPublic();
  } catch (error) {
    logger.error("landing: failed to load active players", { error });
    return []; // seção some graciosamente com banco offline
  }
}

export default async function LandingPage() {
  const locale = (await getLocale()) as Locale;
  const [reports, players] = await Promise.all([
    loadLatestReports(locale),
    loadActivePlayers(),
  ]);
  const websiteJsonLd = buildWebsiteJsonLd(siteUrl);
  const appJsonLd = buildAppJsonLd(siteUrl);

  return (
    <div
      // overflow-x-clip (e não hidden): hidden quebra o position:sticky do
      // SiteNav — mesmo padrão das páginas /lore, /how-to-play e /gangs.
      className="relative w-full overflow-x-clip text-ink"
      style={{
        background: "#0b0a0d",
        backgroundImage:
          "radial-gradient(1400px 700px at 25% -10%,rgba(255,45,111,.07),transparent),radial-gradient(1200px 700px at 95% 6%,rgba(0,229,255,.05),transparent)",
        fontFamily: "'Chakra Petch', sans-serif",
      }}
    >
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      <Ticker />
      <SiteNav />

      <main>
        <Hero />
        <Features />
        <Houses />
        <Players players={players} />
        <News items={reports} />
        <BigCTA />
      </main>

      <SiteFooter />
    </div>
  );
}
