import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import PostBody from "@/components/blog/PostBody";
import { POST_TYPES, toPostType } from "@/components/blog/postTypes";
import { getPublishedPostBySlug } from "@/lib/db/queries";
import { formatPostDate, pickPostText } from "@/lib/blog";
import { logger } from "@/lib/logger";

/**
 * Post individual do jornal de campanha (issue #5). ISR de 5 min — novos
 * slugs são renderizados on-demand e cacheados.
 */
export const revalidate = 300;

type Params = { slug: string };

const STRINGS: Record<Locale, { back: string }> = {
	en: { back: "← ALL DISPATCHES" },
	"pt-BR": { back: "← TODOS OS DESPACHOS" },
};

async function loadPost(slug: string) {
	try {
		return await getPublishedPostBySlug(slug);
	} catch (error) {
		logger.error("blog: failed to load post", { slug, error });
		return null;
	}
}

export async function generateMetadata({
	params,
}: {
	params: Promise<Params>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = await loadPost(slug);
	if (!post) return { title: "Campaign Journal" };

	// Metadata pública em EN (padrão do site — issue #12).
	return {
		title: post.titleEn,
		description: post.excerptEn || post.excerptPt || undefined,
		alternates: { canonical: `/blog/${post.slug}` },
		openGraph: {
			title: `${post.titleEn} · NecroForja`,
			description: post.excerptEn || undefined,
			...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
		},
	};
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
	const { slug } = await params;
	const locale = (await getLocale()) as Locale;
	const s = STRINGS[locale] ?? STRINGS.en;

	const post = await loadPost(slug);
	if (!post) notFound();

	const text = pickPostText(post, locale);
	const meta = POST_TYPES[toPostType(post.type)];
	const date = formatPostDate(post.publishedAt ?? post.createdAt);

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
				<article>
					{/* Cabeçalho do post */}
					<header className="border-b border-white/[0.08]">
						<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px] pb-[48px] pt-[72px]">
							<Link
								href="/blog"
								className="mb-8 inline-block font-mono text-[12px] tracking-[2px] text-[rgba(245,245,250,.55)] no-underline hover:text-cyan"
							>
								{s.back}
							</Link>

							<div className="mb-[16px] flex flex-wrap items-center gap-[14px] font-mono text-[12px] tracking-[2px]">
								<span
									className="px-[11px] py-1.5"
									style={{ border: `1px solid ${meta.shadow}`, color: meta.color }}
								>
									{meta.labels[locale] ?? meta.labels.en}
								</span>
								<span className="text-[rgba(245,245,250,.4)]">{date}</span>
							</div>

							<h1 className="glow-magenta m-0 max-w-[980px] text-[clamp(32px,5vw,58px)] font-bold uppercase leading-[1.02] tracking-[1.5px]">
								{text.title}
							</h1>

							{text.excerpt && (
								<p className="m-0 mt-[20px] max-w-[760px] border-l-2 border-hazard pl-5 text-justify text-[15px] leading-[1.7] text-[rgba(245,245,250,.68)]">
									{text.excerpt}
								</p>
							)}
						</div>
					</header>

					{/* Capa + corpo */}
					<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px] py-[56px]">
						{post.coverImage && (
							<figure className="clip-card relative m-0 mb-10 max-w-[980px] overflow-hidden border border-white/[0.09]">
								<Image
									src={post.coverImage}
									alt={post.coverAlt ?? text.title}
									width={1120}
									height={1400}
									priority
									className="h-auto w-full"
								/>
							</figure>
						)}

						<PostBody markdown={text.body} />
					</div>
				</article>
			</main>

			<SiteFooter />
		</div>
	);
}
