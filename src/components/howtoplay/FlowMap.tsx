"use client";

import { useLocale } from "next-intl";
import { ACCENT_HEX } from "@/components/lore/accents";
import type { Locale } from "@/i18n/config";
import { getHtpContent } from "./content.i18n";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<
	Locale,
	{
		kicker: string;
		heading: string;
		intro: string;
		viewChecklist: string;
		insideEachRound: string;
		repeat: string;
	}
> = {
	en: {
		kicker: "THE GAME LOOP",
		heading: "The 3 big phases",
		intro: "Every game of Necromunda happens in this order. Click a phase to jump straight to its checklist.",
		viewChecklist: "VIEW CHECKLIST →",
		insideEachRound: "INSIDE EACH ROUND:",
		repeat: "REPEAT ↻",
	},
	"pt-BR": {
		kicker: "O LOOP DO JOGO",
		heading: "As 3 grandes fases",
		intro: "Todo jogo de Necromunda acontece nesta ordem. Clique em uma fase para pular direto para o checklist dela.",
		viewChecklist: "VER CHECKLIST →",
		insideEachRound: "DENTRO DE CADA ROUND:",
		repeat: "REPETE ↻",
	},
};

/**
 * 01 · O loop do jogo — mapa interativo das 3 grandes fases.
 * Clicar em uma fase rola até a seção correspondente do guia.
 */
export default function FlowMap() {
	const locale = useLocale() as Locale;
	const { FLOW_PHASES } = getHtpContent(locale);
	const s = STRINGS[locale];

	const jump = (id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<section id="o-loop" className="ncf-section scroll-mt-[130px] border-t border-white/[0.06] py-[88px] bg-[#0a090c]">
			<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
				<div className="mb-[18px] flex items-center gap-[14px]">
					<span className="font-mono text-[13px] tracking-[4px] text-hazard">
						01 {"//"} {s.kicker}
					</span>
					<span className="h-px flex-1 bg-white/[0.1]" />
				</div>

				<h2 className="m-0 mb-4 text-[clamp(28px,4vw,44px)] font-bold uppercase leading-[1.02] tracking-[1px]">
					{s.heading}
				</h2>
				<p className="m-0 mb-[48px] max-w-[720px] text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.65)]">
					{s.intro}
				</p>

				{/* Diagrama de fluxo */}
				<div className="flex flex-col items-stretch gap-0 lg:flex-row lg:items-center">
					{FLOW_PHASES.map((phase, i) => {
						const hex = ACCENT_HEX[phase.accent];
						return (
							<div key={phase.id} className="flex flex-1 flex-col items-center lg:flex-row">
								<button
									onClick={() => jump(phase.target)}
									className="clip-chamfer group relative w-full cursor-pointer border bg-[#0f0d14] p-6 text-left transition-all duration-200 hover:-translate-y-[2px]"
									style={{ borderColor: `${hex}55` }}
								>
									{/* Barra superior */}
									<div
										className="absolute left-0 top-0 h-[3px] w-full"
										style={{ background: hex, boxShadow: `0 0 12px ${hex}88` }}
									/>

									<div className="mb-3 flex items-baseline justify-between">
										<span
											className="text-[46px] font-bold leading-none"
											style={{ color: hex, textShadow: `0 0 18px ${hex}66` }}
										>
											{phase.num}
										</span>
										{phase.loop && (
											<span
												className="inline-block animate-spin font-mono text-[20px]"
												style={{ color: hex, animationDuration: "6s" }}
												aria-hidden
											>
												↻
											</span>
										)}
									</div>

									<div className="mb-1 text-[19px] font-bold uppercase leading-[1.05] tracking-[0.5px]">
										{phase.title}
									</div>
									<div className="mb-3 font-mono text-[10px] tracking-[2px]" style={{ color: hex }}>
										{phase.sub}
									</div>
									<p className="m-0 mb-4 min-h-[63px] text-justify text-[13px] leading-[1.6] text-[rgba(245,245,250,.6)]">
										{phase.text}
									</p>
									<span
										className="font-mono text-[11px] tracking-[2px] opacity-70 transition-opacity group-hover:opacity-100"
										style={{ color: hex }}
									>
										{s.viewChecklist}
									</span>
								</button>

								{/* Conector */}
								{i < FLOW_PHASES.length - 1 && (
									<div className="flex items-center justify-center py-2 lg:px-2 lg:py-0" aria-hidden>
										<span className="hidden font-mono text-[22px] text-[rgba(245,245,250,.35)] lg:block">▸</span>
										<span className="font-mono text-[22px] text-[rgba(245,245,250,.35)] lg:hidden">▾</span>
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* Loop interno do battle round */}
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3 border border-white/[0.07] bg-[rgba(255,255,255,.02)] px-6 py-4 font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.55)]">
					<span style={{ color: ACCENT_HEX.rust }}>{s.insideEachRound}</span>
					<span>PRIORITY PHASE</span>
					<span className="opacity-50">→</span>
					<span>ACTION PHASE</span>
					<span className="opacity-50">→</span>
					<span>END PHASE</span>
					<span className="opacity-50">→</span>
					<span style={{ color: ACCENT_HEX.rust }}>{s.repeat}</span>
				</div>
			</div>
		</section>
	);
}
