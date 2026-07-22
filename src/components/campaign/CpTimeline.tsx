"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { ACCENT_HEX } from "@/components/lore/accents";
import type { Locale } from "@/i18n/config";
import { getCpContent } from "./content.i18n";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<Locale, { arbitratorTag: string }> = {
	en: { arbitratorTag: "WHO RUNS THIS?" },
	"pt-BR": { arbitratorTag: "QUEM COMANDA ISSO?" },
};

/**
 * 01 · Timeline interativa das 3 fases da campanha (Dominion Campaign).
 * Clicar em uma fase abre o detalhe abaixo — mesmo padrão do QuickRef.
 */
export default function CpTimeline() {
	const locale = useLocale() as Locale;
	const { CAMPAIGN_PHASES, ARBITRATOR_ROLE } = getCpContent(locale);
	const str = STRINGS[locale];
	const [activeId, setActiveId] = useState(CAMPAIGN_PHASES[0]?.id ?? "");
	const active = CAMPAIGN_PHASES.find((p) => p.id === activeId) ?? CAMPAIGN_PHASES[0];

	if (!active) return null;
	const hex = ACCENT_HEX[active.accent];

	return (
		<div className="flex flex-col gap-8">
			{/* Seletor de fases */}
			<div className="flex flex-col items-stretch gap-0 lg:flex-row lg:items-center">
				{CAMPAIGN_PHASES.map((phase, i) => {
					const isActive = phase.id === active.id;
					const phaseHex = ACCENT_HEX[phase.accent];
					return (
						<div key={phase.id} className="flex flex-1 flex-col items-center lg:flex-row">
							<button
								onClick={() => setActiveId(phase.id)}
								aria-pressed={isActive}
								className="clip-chamfer group relative w-full cursor-pointer border bg-[#0f0d14] p-6 text-left transition-all duration-200 hover:-translate-y-[2px]"
								style={{
									borderColor: isActive ? phaseHex : "rgba(255,255,255,.12)",
									boxShadow: isActive ? `0 0 18px ${phaseHex}44` : "none",
								}}
							>
								<div
									className="absolute left-0 top-0 h-[3px] w-full transition-opacity"
									style={{ background: phaseHex, boxShadow: `0 0 12px ${phaseHex}88`, opacity: isActive ? 1 : 0.3 }}
								/>
								<div className="mb-3 flex items-baseline justify-between">
									<span className="text-[40px] font-bold leading-none" style={{ color: phaseHex }}>
										{phase.num}
									</span>
									<span className="font-mono text-[10px] tracking-[2px]" style={{ color: phaseHex }}>
										{phase.length.toUpperCase()}
									</span>
								</div>
								<div className="text-[18px] font-bold uppercase leading-[1.05] tracking-[0.5px] text-ink">{phase.title}</div>
							</button>

							{i < CAMPAIGN_PHASES.length - 1 && (
								<div className="flex items-center justify-center py-2 lg:px-2 lg:py-0" aria-hidden>
									<span className="hidden font-mono text-[22px] text-[rgba(245,245,250,.35)] lg:block">▸</span>
									<span className="font-mono text-[22px] text-[rgba(245,245,250,.35)] lg:hidden">▾</span>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Detalhe da fase ativa */}
			<div
				key={active.id}
				className="animate-ncf-menu clip-chamfer border border-white/[0.08] bg-[#0f0d14] p-7"
				style={{ borderLeft: `3px solid ${hex}` }}
			>
				<p className="m-0 mb-4 max-w-[760px] text-justify text-[14.5px] leading-[1.7] text-[rgba(245,245,250,.75)]">{active.text}</p>
				<div className="flex flex-col gap-[10px]">
					{active.bullets.map((b, i) => (
						<div key={i} className="flex items-start gap-3 text-[13px] leading-[1.55]">
							<span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: hex }} />
							<span className="text-justify text-[rgba(245,245,250,.65)]">{b}</span>
						</div>
					))}
				</div>
			</div>

			{/* Arbitrator */}
			<div className="clip-chamfer border-l-2 border-cyan bg-[rgba(0,229,255,.05)] p-6">
				<div className="mb-2 font-mono text-[11px] tracking-[3px] text-cyan">{str.arbitratorTag}</div>
				<div className="mb-2 text-[16px] font-bold uppercase text-ink">{ARBITRATOR_ROLE.title}</div>
				<p className="m-0 max-w-[760px] text-justify text-[13.5px] leading-[1.65] text-[rgba(245,245,250,.65)]">{ARBITRATOR_ROLE.text}</p>
			</div>
		</div>
	);
}
