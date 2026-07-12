import type { Metadata } from "next";
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
import {
	HTP_CHAPTERS,
	PRE_BATTLE_STEPS,
	POST_BATTLE_STEPS,
	type HtpAccent,
} from "@/components/howtoplay/content";

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
		"Aprenda a jogar Necromunda: o que você precisa para começar, o fluxo completo de uma partida (pre-battle, battle rounds, post-battle) e referência rápida de regras.",
	alternates: { canonical: "/how-to-play" },
	openGraph: {
		title: "How to Play · NecroForja",
		description:
			"Do aperto de mãos ao relatório final: o fluxo completo de um jogo de Necromunda em checklists interativos.",
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
					<p className="m-0 mb-[44px] max-w-[760px] text-[15px] leading-[1.75] text-[rgba(245,245,250,.65)]">
						{intro}
					</p>
				)}
				{children}
			</div>
		</section>
	);
}

export default function HowToPlayPage() {
	return (
		<div
			className="relative w-full overflow-x-hidden text-ink"
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
					title="Pre-battle sequence"
					accent="violet"
					intro="Antes do tabuleiro ser montado e da batalha começar — 8 passos administrativos, feitos com os dois jogadores presentes (Core Rulebook 2023, pg. 97). Marque cada passo conforme executa."
				>
					<PhaseChecklist
						steps={PRE_BATTLE_STEPS}
						accent={ACCENT_HEX.violet}
						doneLabel="PRE-BATTLE COMPLETO — QUE COMECE A BATALHA"
					/>
				</Chapter>

				<Chapter
					id="battle-round"
					num="03"
					title="Battle round"
					accent="rust"
					alt
					intro="A batalha em si. Cada round tem 3 sub-fases nesta ordem: Priority → Action → End (Core Rulebook 2023, pg. 99). O loop se repete até alguém vencer, todo mundo dar bottle out, ou o cenário terminar."
				>
					<RoundLoop accent={ACCENT_HEX.rust} />
				</Chapter>

				<Chapter
					id="combate"
					num="04"
					title="Combate"
					accent="hazard"
					intro="As duas formas de derrubar um inimigo — tiro e corpo a corpo — e o que acontece quando um hit conecta. Percorra cada sequência passo a passo e use a calculadora To Wound."
				>
					<CombatFlow accent={ACCENT_HEX.hazard} />
				</Chapter>

				<Chapter
					id="post-battle"
					num="05"
					title="Post-battle sequence"
					accent="toxic"
					alt
					intro="Depois que o último round terminou — 7 passos, nesta ordem, com os dois jogadores presentes (Core Rulebook 2023, pg. 142). Em skirmish, pule os passos específicos de campanha."
				>
					<PhaseChecklist
						steps={POST_BATTLE_STEPS}
						accent={ACCENT_HEX.toxic}
						doneLabel="POST-BATTLE COMPLETO — ATÉ A PRÓXIMA BATALHA"
					/>
				</Chapter>

				<Chapter
					id="referencia"
					num="06"
					title="Referência rápida"
					accent="cyan"
					intro="Os resumos de bolso para consultar no meio do jogo: statuses e conditions, testes de característica, XP automático, fim de batalha e dano por queda."
				>
					<QuickRef accent={ACCENT_HEX.cyan} />
				</Chapter>

				<HtpCTA />
			</main>

			<SiteFooter />
		</div>
	);
}
