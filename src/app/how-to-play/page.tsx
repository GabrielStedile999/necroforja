import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import LoreNav from "@/components/lore/LoreNav";
import { ACCENT_HEX } from "@/components/lore/accents";
import HtpHero from "@/components/howtoplay/HtpHero";
import StartKit from "@/components/howtoplay/StartKit";
import FlowMap from "@/components/howtoplay/FlowMap";
import PhaseChecklist from "@/components/howtoplay/PhaseChecklist";
import RoundLoop from "@/components/howtoplay/RoundLoop";
import CombatFlow from "@/components/howtoplay/CombatFlow";
import QuickRef from "@/components/howtoplay/QuickRef";
import HtpCTA from "@/components/howtoplay/HtpCTA";
import type { HtpAccent } from "@/components/howtoplay/content";
import { getHtpContent } from "@/components/howtoplay/content.i18n";

/**
 * How to Play — como começar a jogar Necromunda (issue #7).
 *
 * Estruturado a partir do documento "Fluxo Completo de um Jogo":
 * o que é preciso para começar, o loop pre-battle → rounds → post-battle
 * em checklists interativos, as sequências de combate e a referência rápida.
 */
export const metadata: Metadata = {
	title: "How to Play",
	description:
		"Learn to play Necromunda: what you need to get started, the complete flow of a game (pre-battle, battle rounds, post-battle) and a quick rules reference.",
	alternates: { canonical: "/how-to-play" },
	openGraph: {
		title: "How to Play · NecroForja",
		description:
			"From the pre-battle handshake to the final report: the complete flow of a Necromunda game in interactive checklists.",
	},
};

/** Per-locale strings owned by the page: chapter titles, intros and labels. */
const PAGE_STRINGS: Record<
	Locale,
	{
		preBattle: { title: string; intro: string; doneLabel: string };
		battleRound: { title: string; intro: string };
		combat: { title: string; intro: string };
		postBattle: { title: string; intro: string; doneLabel: string };
		quickRef: { title: string; intro: string };
	}
> = {
	en: {
		preBattle: {
			title: "Pre-battle sequence",
			intro:
				"Before the battlefield is set up and the battle begins — 8 admin steps, done with both players present (Core Rulebook 2023, pg. 97). Tick each step as you complete it.",
			doneLabel: "PRE-BATTLE COMPLETE — LET THE BATTLE BEGIN",
		},
		battleRound: {
			title: "Battle round",
			intro:
				"The battle itself. Each round has 3 sub-phases in this order: Priority → Action → End (Core Rulebook 2023, pg. 99). The loop repeats until someone wins, everyone bottles out, or the scenario ends.",
		},
		combat: {
			title: "Combat",
			intro:
				"The two ways to bring an enemy down — shooting and close combat — and what happens when a hit connects. Walk through each sequence step by step and use the To Wound calculator.",
		},
		postBattle: {
			title: "Post-battle sequence",
			intro:
				"After the final round is over — 7 steps, in this order, with both players present (Core Rulebook 2023, pg. 142). In a skirmish, skip the campaign-specific steps.",
			doneLabel: "POST-BATTLE COMPLETE — UNTIL THE NEXT BATTLE",
		},
		quickRef: {
			title: "Quick reference",
			intro:
				"The pocket summaries to consult mid-game: statuses and conditions, characteristic tests, automatic XP, end of battle and falling damage.",
		},
	},
	"pt-BR": {
		preBattle: {
			title: "Pre-battle sequence",
			intro:
				"Antes do tabuleiro ser montado e da batalha começar — 8 passos administrativos, feitos com os dois jogadores presentes (Core Rulebook 2023, pg. 97). Marque cada passo conforme executa.",
			doneLabel: "PRE-BATTLE COMPLETO — QUE COMECE A BATALHA",
		},
		battleRound: {
			title: "Battle round",
			intro:
				"A batalha em si. Cada round tem 3 sub-fases nesta ordem: Priority → Action → End (Core Rulebook 2023, pg. 99). O loop se repete até alguém vencer, todo mundo dar bottle out, ou o cenário terminar.",
		},
		combat: {
			title: "Combate",
			intro:
				"As duas formas de derrubar um inimigo — tiro e corpo a corpo — e o que acontece quando um hit conecta. Percorra cada sequência passo a passo e use a calculadora To Wound.",
		},
		postBattle: {
			title: "Post-battle sequence",
			intro:
				"Depois que o último round terminou — 7 passos, nesta ordem, com os dois jogadores presentes (Core Rulebook 2023, pg. 142). Em skirmish, pule os passos específicos de campanha.",
			doneLabel: "POST-BATTLE COMPLETO — ATÉ A PRÓXIMA BATALHA",
		},
		quickRef: {
			title: "Referência rápida",
			intro:
				"Os resumos de bolso para consultar no meio do jogo: statuses e conditions, testes de característica, XP automático, fim de batalha e dano por queda.",
		},
	},
};

/** Cabeçalho de capítulo no padrão das seções do lore/landing. */
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
	accent: HtpAccent;
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

export default async function HowToPlayPage() {
	const locale = (await getLocale()) as Locale;
	const { HTP_CHAPTERS, PRE_BATTLE_STEPS, POST_BATTLE_STEPS } = getHtpContent(locale);
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
				<HtpHero />
				<LoreNav chapters={HTP_CHAPTERS} />

				<StartKit />
				<FlowMap />

				<Chapter
					id="pre-battle"
					num="02"
					title={t.preBattle.title}
					accent="violet"
					intro={t.preBattle.intro}
				>
					<PhaseChecklist
						steps={PRE_BATTLE_STEPS}
						accent={ACCENT_HEX.violet}
						doneLabel={t.preBattle.doneLabel}
					/>
				</Chapter>

				<Chapter
					id="battle-round"
					num="03"
					title={t.battleRound.title}
					accent="rust"
					alt
					intro={t.battleRound.intro}
				>
					<RoundLoop accent={ACCENT_HEX.rust} />
				</Chapter>

				<Chapter
					id="combate"
					num="04"
					title={t.combat.title}
					accent="hazard"
					intro={t.combat.intro}
				>
					<CombatFlow accent={ACCENT_HEX.hazard} />
				</Chapter>

				<Chapter
					id="post-battle"
					num="05"
					title={t.postBattle.title}
					accent="toxic"
					alt
					intro={t.postBattle.intro}
				>
					<PhaseChecklist
						steps={POST_BATTLE_STEPS}
						accent={ACCENT_HEX.toxic}
						doneLabel={t.postBattle.doneLabel}
					/>
				</Chapter>

				<Chapter
					id="referencia"
					num="06"
					title={t.quickRef.title}
					accent="cyan"
					intro={t.quickRef.intro}
				>
					<QuickRef accent={ACCENT_HEX.cyan} />
				</Chapter>

				<HtpCTA />
			</main>

			<SiteFooter />
		</div>
	);
}
