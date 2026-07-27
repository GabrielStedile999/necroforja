import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import LoreNav from "@/components/lore/LoreNav";
import { ACCENT_HEX } from "@/components/lore/accents";
import FaqHero from "@/components/faq/FaqHero";
import FaqList from "@/components/faq/FaqList";
import type { FaqAccent } from "@/components/faq/content";
import { getFaqContent } from "@/components/faq/content.i18n";
import { FAQ_GROUPS as FAQ_GROUPS_EN } from "@/components/faq/content.en";
import { buildFaqJsonLd } from "@/lib/seo/json-ld";
import { SITE_URL } from "@/lib/site-url";

/**
 * FAQ (issue #41).
 *
 * Perguntas frequentes sobre o site e a campanha, agrupadas por tema (um
 * capítulo por grupo). As regras da casa vivem na rota irmã /house-rules —
 * ambas linkadas na coluna Campaign Tools do mega-menu GAME.
 *
 * SEO (issue #47): a página emite FAQPage JSON-LD com as perguntas em EN —
 * o Google só enxerga o locale padrão (cookie), e as respostas ancoram a
 * entidade "NecroForja = campaign manager, não loja de miniaturas".
 */
export const metadata: Metadata = {
	title: "FAQ",
	description:
		"Frequently asked questions about NecroForja — the digital Necromunda campaign manager — and The Aranthian Succession campaign it tracks.",
	alternates: { canonical: "/faq" },
	openGraph: {
		title: "FAQ · NecroForja",
		description:
			"What NecroForja is (and isn't), how the campaign works and what you can do on the site.",
	},
};

/** Per-locale strings owned by the page: intros per chapter/group. */
const PAGE_STRINGS: Record<Locale, { intros: Record<string, string> }> = {
	en: {
		intros: {
			geral: "What NecroForja is (and isn't), what Necromunda is and which languages the site speaks.",
			campanha:
				"How The Aranthian Succession is tracked here — rankings, Sympathisers, house rules and battle reports.",
			"site-conta": "Accounts and using the site on your phone.",
		},
	},
	"pt-BR": {
		intros: {
			geral: "O que a NecroForja é (e o que não é), o que é Necromunda e em que idiomas o site fala.",
			campanha:
				"Como a The Aranthian Succession é acompanhada aqui — ranking, Sympathisers, regras da casa e relatórios de batalha.",
			"site-conta": "Contas e o uso do site no celular.",
		},
	},
};

/** Cabeçalho de capítulo no padrão das seções do lore/skirmish — com <h2> real (issue #42). */
function Chapter({
	id,
	num,
	title,
	accent,
	intro,
	alt,
	children,
}: {
	id: string;
	num: string;
	title: string;
	accent: FaqAccent;
	intro?: string;
	alt?: boolean;
	children: React.ReactNode;
}) {
	const hex = ACCENT_HEX[accent];
	return (
		<section
			id={id}
			className={`ncf-section scroll-mt-[130px] border-t border-white/[0.06] py-[88px] ${alt ? "bg-[#0a090c]" : ""}`}
		>
			<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
				<div className="mb-[18px] flex items-center gap-[14px]">
					<h2 className="m-0 font-mono text-[13px] font-normal tracking-[4px]" style={{ color: hex }}>
						{num} {"//"} {title.toUpperCase()}
					</h2>
					<span className="h-px flex-1 bg-white/[0.1]" />
				</div>
				{intro && (
					<p className="m-0 mb-[44px] max-w-[760px] text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.65)]">
						{intro}
					</p>
				)}
				{children}
			</div>
		</section>
	);
}

export default async function FaqPage() {
	const locale = (await getLocale()) as Locale;
	const { FAQ_CHAPTERS } = getFaqContent(locale);
	const t = PAGE_STRINGS[locale];

	// FAQPage JSON-LD sempre em EN — é o locale que o crawler enxerga (#47).
	const faqJsonLd = buildFaqJsonLd(
		SITE_URL,
		FAQ_GROUPS_EN.flatMap((group) =>
			group.items.map((item) => ({ question: item.question, answer: item.answer })),
		),
	);

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
			{/* JSON-LD structured data (FAQPage) */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
			/>

			<Ticker />
			<SiteNav />

			<main>
				<FaqHero />
				<LoreNav chapters={FAQ_CHAPTERS} />

				{FAQ_CHAPTERS.map((chapter, index) => (
					<Chapter
						key={chapter.id}
						id={chapter.id}
						num={chapter.num}
						title={chapter.title}
						accent={chapter.accent}
						alt={index % 2 === 1}
						intro={t.intros[chapter.id]}
					>
						<FaqList groupId={chapter.id} accent={ACCENT_HEX[chapter.accent]} />
					</Chapter>
				))}
			</main>

			<SiteFooter />
		</div>
	);
}
