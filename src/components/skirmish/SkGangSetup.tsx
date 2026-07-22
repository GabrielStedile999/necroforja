"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { getSkContent } from "./content.i18n";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<
	Locale,
	{
		budgetLabel: string;
		skillsLabel: string;
		skillsIntro: string;
		allocationLabel: string;
		reputationLabel: string;
		reputationIntro: string;
		notesLabel: string;
	}
> = {
	en: {
		budgetLabel: "BUDGET",
		skillsLabel: "EXTRA SKILLS BY CREDIT TIER",
		skillsIntro: "No XP means no Advancements — so a Skirmish gang gets extra skills and stat bumps up front, scaled to how big its budget was. Click a tier.",
		allocationLabel: "HOW SKILLS ARE DISTRIBUTED",
		reputationLabel: "REPUTATION (CHOOSE ONE)",
		reputationIntro: "Reputation is picked when the gang is founded — higher Reputation means more Hangers-on and Brutes allowed.",
		notesLabel: "OTHER RULES",
	},
	"pt-BR": {
		budgetLabel: "BUDGET",
		skillsLabel: "SKILLS EXTRAS POR FAIXA DE CRÉDITOS",
		skillsIntro: "Sem XP, não há Advancements — então uma gangue de Skirmish recebe skills e aumentos de característica extras já na criação, proporcionais ao tamanho do budget. Clique em uma faixa.",
		allocationLabel: "COMO AS SKILLS SÃO DISTRIBUÍDAS",
		reputationLabel: "REPUTATION (ESCOLHA UMA)",
		reputationIntro: "A Reputation é escolhida ao fundar a gangue — quanto maior, mais Hangers-on e Brutes são permitidos.",
		notesLabel: "OUTRAS REGRAS",
	},
};

export default function SkGangSetup({ accent }: { accent: string }) {
	const locale = useLocale() as Locale;
	const { BUDGET_NOTE, SKILL_TIERS, SKILL_ALLOCATION, REPUTATION_OPTIONS, GANG_SETUP_NOTES } = getSkContent(locale);
	const str = STRINGS[locale];
	const [tierId, setTierId] = useState(SKILL_TIERS[0]?.id ?? "");
	const [repIdx, setRepIdx] = useState(0);
	const activeTier = SKILL_TIERS.find((t) => t.id === tierId) ?? SKILL_TIERS[0];

	if (!activeTier) return null;

	return (
		<div className="flex flex-col gap-10">
			{/* Budget */}
			<div className="clip-chamfer border border-white/[0.08] bg-[#0f0d14] p-6">
				<div className="mb-3 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
					{"// "}
					{str.budgetLabel}
				</div>
				<div className="mb-2 text-[26px] font-bold" style={{ color: accent }}>
					{BUDGET_NOTE.range}
				</div>
				<p className="m-0 max-w-[720px] text-justify text-[13.5px] leading-[1.65] text-[rgba(245,245,250,.65)]">
					{BUDGET_NOTE.text}
				</p>
			</div>

			{/* Skills por faixa de créditos */}
			<div>
				<div className="mb-2 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
					{"// "}
					{str.skillsLabel}
				</div>
				<p className="m-0 mb-5 max-w-[760px] text-justify text-[13.5px] leading-[1.65] text-[rgba(245,245,250,.6)]">
					{str.skillsIntro}
				</p>

				<div className="grid gap-3 sm:grid-cols-3">
					{SKILL_TIERS.map((tier) => {
						const isActive = tier.id === activeTier.id;
						return (
							<button
								key={tier.id}
								onClick={() => setTierId(tier.id)}
								aria-pressed={isActive}
								className="clip-chamfer-sm cursor-pointer border p-4 text-left transition-all"
								style={{
									borderColor: isActive ? accent : "rgba(255,255,255,.1)",
									background: isActive ? `${accent}14` : "rgba(255,255,255,.02)",
									boxShadow: isActive ? `0 0 14px ${accent}33` : "none",
								}}
							>
								<div className="mb-1 font-mono text-[11px] tracking-[1px]" style={{ color: isActive ? accent : "rgba(245,245,250,.55)" }}>
									{tier.range}
								</div>
								<div className="text-[15px] font-bold text-ink">{tier.skills}</div>
							</button>
						);
					})}
				</div>

				<div className="mt-5">
					<div className="mb-3 font-mono text-[10px] tracking-[2px] text-[rgba(245,245,250,.45)]">{str.allocationLabel}</div>
					<div className="flex flex-col gap-[10px]">
						{SKILL_ALLOCATION.map((line, i) => (
							<div key={i} className="flex items-start gap-3 text-[13px] leading-[1.55]">
								<span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: accent }} />
								<span className="text-justify text-[rgba(245,245,250,.65)]">{line}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Reputation */}
			<div>
				<div className="mb-2 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
					{"// "}
					{str.reputationLabel}
				</div>
				<p className="m-0 mb-5 max-w-[760px] text-justify text-[13.5px] leading-[1.65] text-[rgba(245,245,250,.6)]">
					{str.reputationIntro}
				</p>
				<div className="flex flex-wrap gap-3">
					{REPUTATION_OPTIONS.map((opt, i) => {
						const isActive = i === repIdx;
						return (
							<button
								key={opt.rep}
								onClick={() => setRepIdx(i)}
								aria-pressed={isActive}
								className="clip-chamfer-sm flex cursor-pointer items-center gap-3 border px-5 py-3 transition-all"
								style={{
									borderColor: isActive ? accent : "rgba(255,255,255,.1)",
									background: isActive ? `${accent}14` : "rgba(255,255,255,.02)",
								}}
							>
								<span className="text-[22px] font-bold" style={{ color: isActive ? accent : "rgba(245,245,250,.75)" }}>
									{opt.rep}
								</span>
								<span className="text-[12.5px] text-[rgba(245,245,250,.6)]">{opt.hangers}</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Notas adicionais */}
			<div className="clip-chamfer border-l-2 border-hazard bg-[rgba(255,45,111,.05)] p-5">
				<div className="mb-3 font-mono text-[10px] tracking-[2px] text-hazard">{str.notesLabel}</div>
				<div className="flex flex-col gap-2">
					{GANG_SETUP_NOTES.map((n, i) => (
						<p key={i} className="m-0 text-justify text-[12.5px] leading-[1.6] text-[rgba(245,245,250,.65)]">
							{n}
						</p>
					))}
				</div>
			</div>
		</div>
	);
}
