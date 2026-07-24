import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isLocale, defaultLocale } from "@/i18n/config";
import { filterPages } from "@/lib/search/pages";
import { filterSections } from "@/lib/search/sections";
import { searchPublishedPosts, searchRuleChunksByText } from "@/lib/db/queries";
import { pickPostText } from "@/lib/reports";
import { rateLimit } from "@/lib/ai/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

export type SearchResultItem = {
  kind: "page" | "post" | "rule";
  id: string;
  href: string;
  title: string;
  subtitle: string;
};

export type SearchResponse = {
  query: string;
  results: SearchResultItem[];
};

/**
 * Public site search (issue #15) — command-palette results across static
 * pages, the campaign journal (issue #5) and, for logged-in users only, the
 * rules corpus (plain keyword match, not the semantic search used by the
 * rules assistant). Anonymous visitors only ever search the public surface
 * (pages + journal) — rules stay behind the same session gate as the Rules
 * Assistant itself (/player/assistant, where a rule result links to).
 *
 * Public (no auth required to call it, unlike /api/assistant) but
 * IP-rate-limited: this runs on every keystroke from anonymous visitors, so
 * it needs a higher, cheaper ceiling than the authenticated assistant chat
 * rather than the assistant's own per-user limit.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q") ?? "";
  const localeParam = searchParams.get("locale") ?? defaultLocale;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  const query = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json<SearchResponse>({ query, results: [] });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const allowed = await rateLimit(`search:${ip}`, 60, 60);
  if (!allowed) {
    return new NextResponse("Too many searches in a short time. Please wait a moment.", {
      status: 429,
    });
  }

  const pageResults: SearchResultItem[] = filterPages(query, locale).map((page) => ({
    kind: "page",
    id: page.id,
    href: page.href,
    title: locale === "pt-BR" ? page.titlePt : page.titleEn,
    subtitle: "",
  }));

  // In-page sections (issue #15 follow-up) — same "page" kind/group as
  // pageResults, but the href includes the section's real DOM anchor and the
  // subtitle names the parent page, so a hit reads as "Combat — How to Play"
  // rather than just landing generically on /how-to-play.
  const sectionResults: SearchResultItem[] = filterSections(query).map((section) => ({
    kind: "page",
    id: section.id,
    href: section.href,
    title: locale === "pt-BR" ? section.titlePt : section.titleEn,
    subtitle: locale === "pt-BR" ? section.pageTitlePt : section.pageTitleEn,
  }));

  let postResults: SearchResultItem[] = [];
  let ruleResults: SearchResultItem[] = [];

  // Rules are only searched for logged-in users — anonymous visitors get the
  // public surface only (static pages + journal), mirroring the auth gate on
  // the Rules Assistant page itself.
  const session = await auth();
  const includeRules = Boolean(session?.user);

  try {
    const [posts, rules] = await Promise.all([
      searchPublishedPosts(query),
      includeRules ? searchRuleChunksByText(query) : Promise.resolve([]),
    ]);

    postResults = posts.map((post) => {
      const text = pickPostText(post, locale);
      return {
        // `?q=` lets the post page (client-side) scroll to and highlight the
        // first match inside the markdown body — journal posts have no
        // internal anchors to link straight to like the static-page sections
        // above, so this is the equivalent "jump to where the term is" for
        // free-text content.
        kind: "post",
        id: post.id,
        href: `/reports/${post.slug}?q=${encodeURIComponent(query)}`,
        title: text.title,
        subtitle: text.excerpt,
      };
    });

    ruleResults = rules.map((rule) => ({
      kind: "rule",
      id: rule.id,
      href: "/player/assistant",
      title: rule.heading || rule.source,
      subtitle: rule.content.slice(0, 140),
    }));
  } catch (error) {
    // Database unavailable — degrade to page-only results rather than 500.
    logger.warn("search: DB-backed lookup failed", { error, query });
  }

  return NextResponse.json<SearchResponse>({
    query,
    results: [...pageResults, ...sectionResults, ...postResults, ...ruleResults],
  });
}
