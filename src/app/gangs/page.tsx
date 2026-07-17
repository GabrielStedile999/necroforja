import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import LoreNav from "@/components/lore/LoreNav";
import { ACCENT_HEX } from "@/components/lore/accents";
import GangsHero from "@/components/gangs/GangsHero";
import HouseDossierCard from "@/components/gangs/HouseDossierCard";
import GangCard from "@/components/gangs/GangCard";
import CampaignGangs, {
	type CampaignGangRow,
} from "@/components/gangs/CampaignGangs";
import GangsCTA from "@/components/gangs/GangsCTA";
import type { GangsChapter } from "@/components/gangs/content";
import { getGangsContent } from "@/components/gangs/content.i18n";
import { listGangsPublic } from "@/lib/db/queries";
import { logger } from "@/lib/logger";

/**
 * Gangues — as casas/facções de Necromunda (issue #8).
 *
 * Dossiês completos das seis Grandes Casas (arte, identidade, estilo de jogo
 * e pontos fortes/fracos) + cards das gangues independentes, dos Ash Wastes e
 * de Hive Secundus, no padrão visual do lore/how-to-play. A seção final
 * integra a tabela `gang` do banco: as gangues registradas na campanha ao
 * vivo, com fallback gracioso se o banco estiver indisponível.
 *
 * ISR: revalidate a cada 5 min — o conteúdo editorial é estático e os dados
 * de campanha mudam devagar (o dashboard continua sendo a visão ao vivo).
 */
export const revalidate = 300;

export const metadata: Metadata = {
	title: "The Gangs",
	description:
		"Meet the gangs of Necromunda: the six Great Clan Houses, independent gangs and cults, the Ash Wastes riders and the horrors of Hive Secundus — identity, playstyle, strengths and weaknesses of each.",
	alternates: { canonical: "/gangs" },
	openGraph: {
		title: "The Gangs · NecroForja",
		description:
			"Every gang is a promise of violence. Choose yours: identity, playstyle, strengths and weaknesses of all 17 Necromunda factions.",
	},
};

/** Cabeçalho de capítulo — mesmo padrão do How to Play (issue #7). */
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
	accent: GangsChapter["accent"];
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

/** Lê a tabela `gang` com fallback gracioso (null = banco indisponível). */
async function loadCampaignGangs(): Promise<CampaignGangRow[] | null> {
	try {
		return await listGangsPublic();
	} catch (error) {
		logger.error("gangs-page: failed to load campaign gangs", { error });
		return null;
	}
}

export default async function GangsPage() {
	const locale = (await getLocale()) as Locale;
	const {
		GANGS_CHAPTERS,
		GANGS_UI,
		HOUSE_DOSSIERS,
		GANG_GROUPS,
		GREAT_HOUSES_SECTION,
		CAMPAIGN_SECTION,
	} = getGangsContent(locale);
	const campaignGangs = await loadCampaignGangs();

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
				<GangsHero />
				<LoreNav chapters={GANGS_CHAPTERS} />

				{/* 00 · As Grandes Casas — dossiês completos */}
				<Chapter
					id={GREAT_HOUSES_SECTION.id}
					num={GREAT_HOUSES_SECTION.num}
					title={GREAT_HOUSES_SECTION.title}
					accent="hazard"
					intro={GREAT_HOUSES_SECTION.intro}
				>
					<div className="flex flex-col gap-7">
						{HOUSE_DOSSIERS.map((dossier, i) => (
							<HouseDossierCard
								key={dossier.slug}
								dossier={dossier}
								ui={GANGS_UI}
								flip={i % 2 === 1}
							/>
						))}
					</div>
				</Chapter>

				{/* 01–03 · Independentes & Cultos, Ash Wastes, Hive Secundus */}
				{GANG_GROUPS.map((group, i) => (
					<Chapter
						key={group.id}
						id={group.id}
						num={group.num}
						title={group.title}
						accent={group.accent}
						alt={i % 2 === 0}
						intro={group.intro}
					>
						<div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
							{group.gangs.map((gang) => (
								<GangCard key={gang.slug} gang={gang} ui={GANGS_UI} />
							))}
						</div>
						<div className="mt-6 text-right font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.35)]">
							{String(group.gangs.length).padStart(2, "0")} {GANGS_UI.gangCountSuffix}
						</div>
					</Chapter>
				))}

				{/* 04 · Na campanha — integração com a tabela `gang` */}
				<Chapter
					id={CAMPAIGN_SECTION.id}
					num={CAMPAIGN_SECTION.num}
					title={CAMPAIGN_SECTION.title}
					accent="toxic"
					alt
					intro={CAMPAIGN_SECTION.intro}
				>
					<CampaignGangs gangs={campaignGangs} ui={GANGS_UI} />
				</Chapter>

				<GangsCTA />
			</main>

			<SiteFooter />
		</div>
	);
}
