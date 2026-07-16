"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { getHtpContent } from "./content.i18n";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<
	Locale,
	{
		phase: string;
		repeat: string;
		acronyms: string;
		howToActivate: string;
		actionTypes: string;
		actionGuide: string;
		action: string;
		effect: string;
		actionPhaseAlt: string;
	}
> = {
	en: {
		phase: "PHASE",
		repeat: "↻ REPEAT",
		acronyms: "ACRONYMS: ",
		howToActivate: "HOW TO RUN AN ACTIVATION",
		actionTypes: "ACTION TYPES",
		actionGuide: "ACTION GUIDE",
		action: "ACTION",
		effect: "EFFECT",
		actionPhaseAlt: "Escher and Goliath fighting in the Underhive",
	},
	"pt-BR": {
		phase: "FASE",
		repeat: "↻ REPETE",
		acronyms: "SIGLAS: ",
		howToActivate: "COMO EXECUTAR UMA ATIVAÇÃO",
		actionTypes: "TIPOS DE AÇÃO",
		actionGuide: "GUIA DE AÇÕES",
		action: "AÇÃO",
		effect: "EFEITO",
		actionPhaseAlt: "Escher e Goliath em combate no Underhive",
	},
};

/**
 * 03 · Battle round — loop interativo Priority → Action → End.
 * Selecione uma sub-fase para explorá-la; a Action Phase abre também
 * o fluxo de uma ativação e os tipos de ação.
 */
export default function RoundLoop({ accent }: { accent: string }) {
	const locale = useLocale() as Locale;
	const { ROUND_PHASES, ACTIVATION_FLOW, ACTION_TYPES, GAME_ACTIONS, ACTION_TYPE_COLOR } =
		getHtpContent(locale);
	const s = STRINGS[locale];
	const [activeId, setActiveId] = useState(ROUND_PHASES[0]?.id ?? "");
	const active = ROUND_PHASES.find((p) => p.id === activeId) ?? ROUND_PHASES[0];

	if (!active) return null;
	const isAction = active.id === "round-action";

	return (
		<div>
			{/* Seletor circular do loop */}
			<div className="mb-8 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
				{ROUND_PHASES.map((phase, i) => {
					const isActive = phase.id === active.id;
					return (
						<div
							key={phase.id}
							className="flex flex-1 flex-col items-center gap-2 sm:flex-row"
						>
							<button
								onClick={() => setActiveId(phase.id)}
								aria-pressed={isActive}
								className="clip-chamfer-sm w-full cursor-pointer border px-5 py-4 text-left transition-all duration-200"
								style={{
									background: isActive
										? `linear-gradient(135deg, ${accent}26, ${accent}0d)`
										: "rgba(255,255,255,.03)",
									borderColor: isActive ? accent : "rgba(255,255,255,.1)",
									boxShadow: isActive ? `0 0 18px ${accent}44` : "none",
								}}
							>
								<span
									className="mb-1 block font-mono text-[11px] tracking-[2px]"
									style={{ color: accent }}
								>
									{s.phase} {phase.letter}
								</span>
								<span
									className="block text-[16px] font-bold uppercase tracking-[1px]"
									style={{ color: isActive ? accent : "rgba(245,245,250,.85)" }}
								>
									{phase.title}
								</span>
							</button>
							{i < ROUND_PHASES.length - 1 && (
								<span
									className="shrink-0 font-mono text-[18px] text-[rgba(245,245,250,.35)] max-sm:rotate-90"
									aria-hidden
								>
									→
								</span>
							)}
						</div>
					);
				})}
				<span
					className="hidden shrink-0 items-center gap-2 pl-1 font-mono text-[12px] tracking-[1px] lg:flex"
					style={{ color: accent }}
					aria-hidden
				>
					{s.repeat}
				</span>
			</div>

			{/* Painel da sub-fase ativa */}
			<div
				key={active.id}
				className="animate-ncf-menu border border-white/[0.08] bg-[#0f0d14] p-[28px] md:p-[36px]"
				style={{ borderLeft: `3px solid ${accent}` }}
			>
				<div
					className="mb-1 flex items-center justify-between font-mono text-[11px] tracking-[3px]"
					style={{ color: accent }}
				>
					<span>
						{"// "}2.{active.letter} — {active.title.toUpperCase()}
					</span>
					<span className="text-[rgba(245,245,250,.4)]">{active.ref}</span>
				</div>
				<p className="m-0 mb-5 text-justify text-[15px] italic leading-[1.6] text-[rgba(245,245,250,.72)]">
					{active.tagline}
				</p>

				<ul className="m-0 flex list-none flex-col gap-3 p-0">
					{active.items.map((item, i) => (
						<li
							key={i}
							className="flex gap-3 text-[14px] leading-[1.65] text-[rgba(245,245,250,.68)]"
						>
							<span
								className="mt-[6px] h-[7px] w-[7px] shrink-0"
								style={{ background: accent }}
							/>
							<span className="text-justify">{item}</span>
						</li>
					))}
				</ul>

				{/* Nota de rodapé — siglas usadas na End Phase */}
				{active.id === "round-end" && (
					<p className="m-0 mt-6 border-t border-white/[0.06] pt-4 font-mono text-[11px] leading-[1.8] tracking-[0.5px] text-[rgba(245,245,250,.45)]">
						<span style={{ color: accent }}>{s.acronyms}</span>
						SI = Seriously Injured · OOA = Out of Action ·
					</p>
				)}

				{/* Conteúdo extra da Action Phase */}
				{isAction && (
					<div className="mt-8 grid gap-8 lg:grid-cols-2">
						{/* Fluxo de uma ativação */}
						<div>
							<div
								className="mb-4 font-mono text-[11px] tracking-[3px]"
								style={{ color: accent }}
							>
								{"// "}
								{s.howToActivate}
							</div>
							<ol className="m-0 flex list-none flex-col gap-0 p-0">
								{ACTIVATION_FLOW.map((step, i) => (
									<li key={i} className="relative flex gap-4 pb-4 last:pb-0">
										{/* Linha vertical */}
										{i < ACTIVATION_FLOW.length - 1 && (
											<span
												className="absolute left-[13px] top-[28px] h-[calc(100%-28px)] w-px bg-white/[0.12]"
												aria-hidden
											/>
										)}
										<span
											className="flex h-[27px] w-[27px] shrink-0 items-center justify-center border font-mono text-[12px]"
											style={{ borderColor: accent, color: accent }}
										>
											{i + 1}
										</span>
										<div className="pt-[3px]">
											<div className="text-[13px] font-bold uppercase tracking-[0.5px]">
												{step.title}
											</div>
											<div className="text-justify text-[12.5px] leading-[1.55] text-[rgba(245,245,250,.55)]">
												{step.text}
											</div>
										</div>
									</li>
								))}
							</ol>
						</div>

						{/* Arte do Underhive — ocupa o espaço dos tipos de ação */}
						<div className="clip-chamfer relative min-h-[280px] overflow-hidden border border-white/[0.08] lg:min-h-0">
							<Image
								src="/howtoplay/action-phase.webp"
								alt={s.actionPhaseAlt}
								fill
								sizes="(max-width: 1024px) 100vw, 620px"
								className="object-cover object-center"
							/>
							<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(11,10,13,.65))]" />
							<div
								className="absolute bottom-0 left-0 h-[3px] w-full"
								style={{
									background: accent,
									boxShadow: `0 0 12px ${accent}88`,
								}}
							/>
						</div>
					</div>
				)}

				{/* Tipos de ação + guia de ações, lado a lado */}
				{isAction && (
					<div className="mt-10 border-t border-white/[0.06] pt-8">
						<div className="grid gap-8 lg:grid-cols-[340px_1fr]">
							{/* Tipos de ação */}
							<div>
								<div
									className="mb-4 font-mono text-[11px] tracking-[3px]"
									style={{ color: accent }}
								>
									{"// "}
									{s.actionTypes}
								</div>
								<div className="flex flex-col gap-3">
									{ACTION_TYPES.map((type) => (
										<div
											key={type.name}
											className="clip-chamfer-sm border border-white/[0.08] bg-[rgba(255,255,255,.02)] p-4 text-justify"
											style={{ borderLeft: `3px solid ${type.color}` }}
										>
											<span
												className="mr-3 font-mono text-[13px] font-bold tracking-[1px]"
												style={{ color: type.color }}
											>
												{type.name.toUpperCase()}
											</span>
											<span className="text-[13px] leading-[1.55] text-[rgba(245,245,250,.65)]">
												{type.desc}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Guia de ações */}
							<div>
								<div
									className="mb-4 font-mono text-[11px] tracking-[3px]"
									style={{ color: accent }}
								>
									{"// "}
									{s.actionGuide}
								</div>

								{/* Cabeçalho */}
								<div className="grid grid-cols-[170px_1fr] gap-3 border-b border-white/[0.12] pb-2 font-mono text-[10px] tracking-[2px] text-[rgba(245,245,250,.45)] max-sm:grid-cols-[120px_1fr]">
									<span>{s.action}</span>
									<span>{s.effect}</span>
								</div>

								{GAME_ACTIONS.map((a) => {
									const meta = ACTION_TYPE_COLOR[a.type];
									return (
										<div
											key={a.name}
											className="grid grid-cols-[170px_1fr] items-center gap-3 border-b border-white/[0.05] py-[9px] text-[13px] last:border-0 max-sm:grid-cols-[120px_1fr]"
										>
											<span
												className="font-bold uppercase tracking-[0.5px]"
												style={{
													color: meta.color,
													textShadow: `0 0 10px ${meta.color}44`,
												}}
												title={meta.label}
											>
												{a.name}
											</span>
											<span className="text-justify leading-[1.5] text-[rgba(245,245,250,.65)]">
												{a.effect}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
