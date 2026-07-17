import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import PostList, { type PostListItem } from "@/components/blog/PostList";
import { toPostType } from "@/components/blog/postTypes";
import { listPublishedPosts } from "@/lib/db/queries";
import { formatPostDate, pickPostText } from "@/lib/blog";
import { logger } from "@/lib/logger";

/**
 * Jornal de campanha (issue #5) — listagem pública dos posts publicados:
 * relatos de sessão, crônicas, diários de pintura e despachos.
 *
 * ISR: revalidate a cada 5 min; o filtro por tipo é client-side para manter
 * a página estática (sem searchParams).
 */
export const revalidate = 300;

export const metadata: Metadata = {
	title: "Campaign Journal",
	description:
		"The campaign journal of The Aranthian Succession: session reports, character chronicles, painting logs and dispatches from the Underhive.",
	alternates: { canonical: "/blog" },
	openGraph: {
		title: "Campaign Journal · NecroForja",
		description:
			"Session reports, chronicles and painting logs — the living record of NecroForja's Necromunda campaign.",
	},
};

const PAGE_STRINGS: Record<Locale, { kicker: string; lead: string; body: string }> = {
	en: {
		kicker: "// CAMPAIGN JOURNAL",
		lead: "Every battle leaves a record.",
		body:
			"Session reports from the table, chronicles of fighters who lived (and died) in the Underhive, painting logs and campaign dispatches — the living memory of The Aranthian Succession.",
	},
	"pt-BR": {
		kicker: "// DIÁRIO DE CAMPANHA",
		lead: "Toda batalha deixa registro.",
		body:
			"Relatos de sessão direto da mesa, crônicas de fighters que viveram (e morreram) no Underhive, diários de pintura e despachos da campanha — a memória viva de The Aranthian Succession.",
	},
};

/** Lê os posts publicados com fallback gracioso (null = banco indisponível). */
async function loadPosts(): Promise<Awaited<ReturnType<typeof listPublishedPosts>> | null> {
	try {
		return await listPublishedPosts();
	} catch (error) {
		logger.error("blog: failed to load published posts", { error });
		return null;
	}
}

export default async function BlogPage() {
	const locale = (await getLocale()) as Locale;
	const t = PAGE_STRINGS[locale] ?? PAGE_STRINGS.en;
	const rows = await loadPosts();

	const posts: PostListItem[] = (rows ?? []).map((post) => {
		const text = pickPostText(post, locale);
		return {
			id: post.id,
			slug: post.slug,
			type: toPostType(post.type),
			title: text.title,
			excerpt: text.excerpt,
			coverImage: post.coverImage,
			coverAlt: post.coverAlt,
			date: formatPostDate(post.publishedAt ?? post.createdAt),
		};
	});

	return (
		<div
			className="relative w-full overflow-x-clip text-ink"
			style={{
				background: "#0b0a0d",
				backgroundImage:
					"radial-gradient(1400px 700px at 25% -10%,rgba(255,45,111,.07),transparent),radial-gradient(1200px 700px at 95% 6%,rgba(0,229,255,.05),transparent)",
				fontFamily: "'Chakra Petch', sans-serif",
			}}
		>
			<Ticker />
			<SiteNav />

			<main>
				{/* Cabeçalho */}
				<section className="border-b border-white/[0.08]">
					<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px] pb-[56px] pt-[80px]">
						<div className="mb-[18px] flex items-center gap-[14px]">
							<span className="font-mono text-[13px] tracking-[4px] text-hazard">{t.kicker}</span>
							<span className="h-px w-[120px] bg-hazard/40" />
						</div>
						<h1 className="glow-magenta m-0 mb-[22px] max-w-[900px] text-[clamp(36px,5.5vw,64px)] font-bold uppercase leading-[0.98] tracking-[2px]">
							{t.lead}
						</h1>
						<p className="m-0 max-w-[760px] border-l-2 border-hazard pl-5 text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.72)]">
							{t.body}
						</p>
					</div>
				</section>

				{/* Lista */}
				<section className="ncf-section py-[64px]">
					<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
						<PostList posts={posts} offline={rows === null} />
					</div>
				</section>
			</main>

			<SiteFooter />
		</div>
	);
}
