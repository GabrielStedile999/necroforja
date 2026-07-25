import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

/**
 * 03 // REPORTS — os relatórios mais recentes do jornal de campanha
 * (issue #5). A landing carrega os posts publicados no servidor e passa
 * itens prontos para exibição; cada linha linka para /reports/<slug>.
 *
 * i18n: rótulos do cabeçalho vêm de messages/<locale>.json (News);
 * título/resumo/tag chegam já resolvidos para o locale.
 */
export type NewsItem = {
	slug: string;
	title: string;
	excerpt: string;
	tagLabel: string;
	tagColor: string;
	date: string;
	coverImage: string | null;
	coverAlt: string | null;
};

/** Fundos de thumb para posts sem capa (mesma rotação do design original). */
const THUMB_FALLBACKS = [
	{ bg: "bg-[linear-gradient(135deg,#1a1320,#0a0810)]", stripe: "stripe-thumb-magenta" },
	{ bg: "bg-[linear-gradient(135deg,#0a1418,#06090d)]", stripe: "stripe-thumb-cyan" },
	{ bg: "bg-[linear-gradient(135deg,#16101b,#0a070d)]", stripe: "stripe-thumb-magenta-16" },
];

export default function News({ items }: { items: NewsItem[] }) {
	const t = useTranslations("News");

	return (
		<section className="ncf-section border-t border-white/[0.06] bg-[#0a090c] py-[96px]">
			<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
				{/* Header */}
				{/* Section label — <h2> real (issue #42), mantendo o visual de label. */}
				<div className="ncf-houses-head mb-[44px] flex items-end justify-between gap-4">
					<h2 className="m-0 font-mono text-[13px] font-normal tracking-[4px] text-hazard">
						{t("sectionLabel")}
					</h2>
					<Link
						href="/reports"
						className="ncf-util-link font-mono text-[13px] tracking-[2px] text-[rgba(245,245,250,.7)] no-underline"
					>
						{t("readAll")}
					</Link>
				</div>

				{items.length === 0 ? (
					<p className="m-0 border-y border-white/[0.09] px-2 py-8 text-[14px] text-[rgba(245,245,250,.5)]">
						{t("empty")}
					</p>
				) : (
					<div className="flex flex-col">
						{items.map((item, i) => {
							const fallback =
								THUMB_FALLBACKS[i % THUMB_FALLBACKS.length] ??
								{ bg: "bg-[linear-gradient(135deg,#1a1320,#0a0810)]", stripe: "stripe-thumb-magenta" };
							return (
								<Link
									key={item.slug}
									href={`/reports/${item.slug}`}
									className={`
                    ncf-news-row ncf-news-row-item
                    flex items-center gap-7 px-2 py-6
                    border-t border-white/[0.09] no-underline text-ink
                    ${i === items.length - 1 ? "border-b border-white/[0.09]" : ""}
                  `}
								>
									{/* Tag + date */}
									<div className="w-[150px] shrink-0 font-mono">
										<div className="text-xs tracking-[1px]" style={{ color: item.tagColor }}>
											{item.tagLabel}
										</div>
										{/* .55 = contraste AA sobre o fundo escuro (issue #42). */}
										<div className="mt-1 text-xs text-[rgba(245,245,250,.55)]">{item.date}</div>
									</div>

									{/* Thumbnail */}
									<div
										className={`ncf-news-thumb relative h-[84px] w-[160px] shrink-0 overflow-hidden border border-white/[0.08] ${fallback.bg}`}
									>
										{item.coverImage ? (
											<Image
												src={item.coverImage}
												alt={item.coverAlt ?? item.title}
												width={320}
												height={168}
												className="h-full w-full object-cover object-top"
											/>
										) : (
											<div className={`absolute inset-0 ${fallback.stripe}`} />
										)}
									</div>

									{/* Text — título do report é heading real (issue #42). */}
									<div className="min-w-0 flex-1">
										<h3 className="ncf-news-text-h m-0 mb-1.5 text-[25px] font-bold tracking-[0.5px]">
											{item.title}
										</h3>
										{item.excerpt && (
											<div className="text-[14px] leading-[1.55] text-[rgba(245,245,250,.55)]">
												{item.excerpt}
											</div>
										)}
									</div>

									{/* Arrow */}
									<span className="ncf-news-arrow text-[22px]" style={{ color: item.tagColor }}>
										→
									</span>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		</section>
	);
}
