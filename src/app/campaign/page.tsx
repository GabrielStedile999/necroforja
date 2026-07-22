import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import LoreNav from "@/components/lore/LoreNav";
import { ACCENT_HEX } from "@/components/lore/accents";
import CpHero from "@/components/campaign/CpHero";
import CpTimeline from "@/components/campaign/CpTimeline";
import CpTerritories from "@/components/campaign/CpTerritories";
import CpTriumphs from "@/components/campaign/CpTriumphs";
import CpAranthianSuccession from "@/components/campaign/CpAranthianSuccession";
import CpCTA from "@/components/campaign/CpCTA";
import type { CpAccent } from "@/components/campaign/content";
import { getCpContent } from "@/components/campaign/content.i18n";

/**
 * Campaign — modo de jogo de campanha persistente (issue #35).
 *
 * O ciclo de uma Dominion Campaign, Territórios & Boons, Triunfos, e a
 * conexão com a campanha narrativa em curso na NecroForja (The Aranthian
 * Succession). Fontes: Necromunda Core Rulebook (2023) e Cinderak Burning.
 */
export const metadata: Metadata = {
	title: "Campaign",
	description:
		"How Campaign play works in Necromunda: the campaign cycle, Territories & Boons, Triumphs, and how it compares to Skirmish play.",
	alternates: { canonical: "/campaign" },
	openGraph: {
		title: "Campaign · NecroForja",
		description: "One gang, many battles — how a Necromunda campaign turns a gang into a legend.",
	},
};

/** Per-locale strings owned by the page: chapter titles and intros. */
const PAGE_STRINGS: Record<
	Locale,
	{
		cycle: { title: string; intro: string };
		territories: { title: string; intro: string };
		triumphs: { title: string; intro: string };
		succession: { title: string; intro: string };
	}
> = {
	en: {
		cycle: {
			title: "The campaign cycle",
			intro:
				"A Dominion Campaign runs for seven cycles, split into three phases. The Arbitrator keeps the whole thing on rails.",
		},
		territories: {
			title: "Territories & Boons",
			intro: "Every battle is fought over a Territory — and holding one keeps its Boon flowing for as long as you control it. Here's one example, Generatorium, showing the full anatomy of a Territory entry.",
		},
		triumphs: {
			title: "Triumphs",
			intro: "There's no single winner in a campaign — there are five ways to go down in Underhive history.",
		},
		succession: {
			title: "The Aranthian Succession",
			intro: "This isn't just theory — it's the campaign currently live on NecroForja.",
		},
	},
	"pt-BR": {
		cycle: {
			title: "O ciclo da campanha",
			intro:
				"Uma Dominion Campaign dura sete ciclos, divididos em três fases. O Arbitrator mantém tudo nos trilhos.",
		},
		territories: {
			title: "Territórios & Boons",
			intro: "Toda batalha é disputada por um Território — e mantê-lo mantém o Boon fluindo enquanto durar o controle. Veja um exemplo, o Generatorium, mostrando a anatomia completa de uma entrada de Território.",
		},
		triumphs: {
			title: "Triunfos",
			intro: "Não existe um único vencedor em uma campanha — existem cinco jeitos de entrar para a história do Underhive.",
		},
		succession: {
			title: "The Aranthian Succession",
			intro: "Isso não é só teoria — é a campanha que roda ao vivo na NecroForja.",
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
	accent: CpAccent;
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

export default async function CampaignPage() {
	const locale = (await getLocale()) as Locale;
	const { CP_CHAPTERS } = getCpContent(locale);
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
				<CpHero />
				<LoreNav chapters={CP_CHAPTERS} />

				<Chapter id="ciclo" num="01" title={t.cycle.title} accent="hazard" intro={t.cycle.intro}>
					<CpTimeline />
				</Chapter>

				<Chapter id="territorios" num="02" title={t.territories.title} accent="violet" alt intro={t.territories.intro}>
					<CpTerritories />
				</Chapter>

				<Chapter id="triunfos" num="03" title={t.triumphs.title} accent="rust" intro={t.triumphs.intro}>
					<CpTriumphs accent={ACCENT_HEX.rust} />
				</Chapter>

				<Chapter id="aranthian-succession" num="04" title={t.succession.title} accent="toxic" alt intro={t.succession.intro}>
					<CpAranthianSuccession />
				</Chapter>

				<CpCTA />
			</main>

			<SiteFooter />
		</div>
	);
}
