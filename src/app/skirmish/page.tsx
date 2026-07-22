import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import LoreNav from "@/components/lore/LoreNav";
import { ACCENT_HEX } from "@/components/lore/accents";
import SkHero from "@/components/skirmish/SkHero";
import SkCompare from "@/components/skirmish/SkCompare";
import SkGangSetup from "@/components/skirmish/SkGangSetup";
import SkSequence from "@/components/skirmish/SkSequence";
import SkTips from "@/components/skirmish/SkTips";
import SkCTA from "@/components/skirmish/SkCTA";
import type { SkAccent } from "@/components/skirmish/content";
import { getSkContent } from "@/components/skirmish/content.i18n";

/**
 * Skirmish — modo de jogo de partida avulsa (issue #35).
 *
 * Comparativo com Campaign, criação de gangue standalone e o que muda no
 * fluxo de pre-/post-battle. Fonte: Necromunda Core Rulebook (2023).
 */
export const metadata: Metadata = {
	title: "Skirmish",
	description:
		"How Skirmish play works in Necromunda: standalone battles, gang creation without a campaign, and how it compares to Campaign play.",
	alternates: { canonical: "/skirmish" },
	openGraph: {
		title: "Skirmish · NecroForja",
		description: "One battle, no strings attached — how to build and play a standalone Necromunda gang.",
	},
};

/** Per-locale strings owned by the page: chapter titles and intros. */
const PAGE_STRINGS: Record<
	Locale,
	{
		compare: { title: string; intro: string };
		gangSetup: { title: string; intro: string };
		sequence: { title: string; intro: string };
		tips: { title: string; intro: string };
	}
> = {
	en: {
		compare: {
			title: "Skirmish vs Campaign",
			intro:
				"Same core rules, different stakes. Here's what changes between a one-off battle and a persistent campaign.",
		},
		gangSetup: {
			title: "Build your gang",
			intro: "Founding a gang for Skirmish play follows its own budget, skills and Reputation rules (Core Rulebook 2023, pg. 90-91).",
		},
		sequence: {
			title: "What changes in the sequence",
			intro: "Skirmish reuses the same pre- and post-battle sequences as a campaign — only a handful of steps are skipped or work differently.",
		},
		tips: {
			title: "When to play it",
			intro: "Skirmish shines whenever continuity isn't the point.",
		},
	},
	"pt-BR": {
		compare: {
			title: "Skirmish x Campaign",
			intro:
				"As mesmas regras de base, apostas diferentes. Veja o que muda entre uma partida avulsa e uma campanha persistente.",
		},
		gangSetup: {
			title: "Monte sua gangue",
			intro: "Fundar uma gangue para Skirmish segue regras próprias de budget, skills e Reputation (Core Rulebook 2023, pg. 90-91).",
		},
		sequence: {
			title: "O que muda na sequência",
			intro: "Skirmish reaproveita as mesmas sequências de pre- e post-battle de uma campanha — só alguns passos são pulados ou funcionam diferente.",
		},
		tips: {
			title: "Quando jogar",
			intro: "Skirmish brilha sempre que continuidade não é o ponto.",
		},
	},
};

/** Cabeçalho de capítulo no padrão das seções do lore/how-to-play. */
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
	accent: SkAccent;
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
					<span className="font-mono text-[13px] tracking-[4px]" style={{ color: hex }}>
						{num} {"//"} {title.toUpperCase()}
					</span>
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

export default async function SkirmishPage() {
	const locale = (await getLocale()) as Locale;
	const { SK_CHAPTERS } = getSkContent(locale);
	const t = PAGE_STRINGS[locale];

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
				<SkHero />
				<LoreNav chapters={SK_CHAPTERS} />

				<Chapter id="comparativo" num="01" title={t.compare.title} accent="hazard" intro={t.compare.intro}>
					<SkCompare accent={ACCENT_HEX.hazard} />
				</Chapter>

				<Chapter id="monte-a-gangue" num="02" title={t.gangSetup.title} accent="violet" alt intro={t.gangSetup.intro}>
					<SkGangSetup accent={ACCENT_HEX.violet} />
				</Chapter>

				<Chapter id="o-que-muda" num="03" title={t.sequence.title} accent="rust" intro={t.sequence.intro}>
					<SkSequence accent={ACCENT_HEX.rust} />
				</Chapter>

				<Chapter id="quando-jogar" num="04" title={t.tips.title} accent="toxic" alt intro={t.tips.intro}>
					<SkTips accent={ACCENT_HEX.toxic} />
				</Chapter>

				<SkCTA />
			</main>

			<SiteFooter />
		</div>
	);
}
