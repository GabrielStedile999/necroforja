"use client";

import { useState } from "react";
import { ROUND_PHASES, ACTIVATION_FLOW, ACTION_TYPES } from "./content";

/**
 * 03 · Battle round — loop interativo Priority → Action → End.
 * Selecione uma sub-fase para explorá-la; a Action Phase abre também
 * o fluxo de uma ativação e os tipos de ação.
 */
export default function RoundLoop({ accent }: { accent: string }) {
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
						<div key={phase.id} className="flex flex-1 flex-col items-center gap-2 sm:flex-row">
							<button
								onClick={() => setActiveId(phase.id)}
								aria-pressed={isActive}
								className="clip-chamfer-sm w-full cursor-pointer border px-5 py-4 text-left transition-all duration-200"
								style={{
									background: isActive ? `linear-gradient(135deg, ${accent}26, ${accent}0d)` : "rgba(255,255,255,.03)",
									borderColor: isActive ? accent : "rgba(255,255,255,.1)",
									boxShadow: isActive ? `0 0 18px ${accent}44` : "none",
								}}
							>
								<span className="mb-1 block font-mono text-[11px] tracking-[2px]" style={{ color: accent }}>
									FASE {phase.letter}
								</span>
								<span
									className="block text-[16px] font-bold uppercase tracking-[1px]"
									style={{ color: isActive ? accent : "rgba(245,245,250,.85)" }}
								>
									{phase.title}
								</span>
							</button>
							{i < ROUND_PHASES.length - 1 && (
								<span className="shrink-0 font-mono text-[18px] text-[rgba(245,245,250,.35)] max-sm:rotate-90" aria-hidden>
									→
								</span>
							)}
						</div>
					);
				})}
				<span className="hidden shrink-0 items-center gap-2 pl-1 font-mono text-[12px] tracking-[1px] lg:flex" style={{ color: accent }} aria-hidden>
					↻ REPETE
				</span>
			</div>

			{/* Painel da sub-fase ativa */}
			<div
				key={active.id}
				className="animate-ncf-menu border border-white/[0.08] bg-[#0f0d14] p-[28px] md:p-[36px]"
				style={{ borderLeft: `3px solid ${accent}` }}
			>
				<div className="mb-1 flex items-center justify-between font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
					<span>{"// "}2.{active.letter} — {active.title.toUpperCase()}</span>
					<span className="text-[rgba(245,245,250,.4)]">{active.ref}</span>
				</div>
				<p className="m-0 mb-5 text-[15px] italic leading-[1.6] text-[rgba(245,245,250,.72)]">
					{active.tagline}
				</p>

				<ul className="m-0 flex list-none flex-col gap-3 p-0">
					{active.items.map((item, i) => (
						<li key={i} className="flex gap-3 text-[14px] leading-[1.65] text-[rgba(245,245,250,.68)]">
							<span className="mt-[6px] h-[7px] w-[7px] shrink-0" style={{ background: accent }} />
							<span>{item}</span>
						</li>
					))}
				</ul>

				{/* Conteúdo extra da Action Phase */}
				{isAction && (
					<div className="mt-8 grid gap-8 lg:grid-cols-2">
						{/* Fluxo de uma ativação */}
						<div>
							<div className="mb-4 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
								{"// "}COMO EXECUTAR UMA ATIVAÇÃO
							</div>
							<ol className="m-0 flex list-none flex-col gap-0 p-0">
								{ACTIVATION_FLOW.map((step, i) => (
									<li key={i} className="relative flex gap-4 pb-4 last:pb-0">
										{/* Linha vertical */}
										{i < ACTIVATION_FLOW.length - 1 && (
											<span className="absolute left-[13px] top-[28px] h-[calc(100%-28px)] w-px bg-white/[0.12]" aria-hidden />
										)}
										<span
											className="flex h-[27px] w-[27px] shrink-0 items-center justify-center border font-mono text-[12px]"
											style={{ borderColor: accent, color: accent }}
										>
											{i + 1}
										</span>
										<div className="pt-[3px]">
											<div className="text-[13px] font-bold uppercase tracking-[0.5px]">{step.title}</div>
											<div className="text-[12.5px] leading-[1.55] text-[rgba(245,245,250,.55)]">{step.text}</div>
										</div>
									</li>
								))}
							</ol>
						</div>

						{/* Tipos de ação */}
						<div>
							<div className="mb-4 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
								{"// "}TIPOS DE AÇÃO
							</div>
							<div className="flex flex-col gap-3">
								{ACTION_TYPES.map((type) => (
									<div
										key={type.name}
										className="clip-chamfer-sm border border-white/[0.08] bg-[rgba(255,255,255,.02)] p-4"
										style={{ borderLeft: `3px solid ${type.color}` }}
									>
										<span className="mr-3 font-mono text-[13px] font-bold tracking-[1px]" style={{ color: type.color }}>
											{type.name.toUpperCase()}
										</span>
										<span className="text-[13px] leading-[1.55] text-[rgba(245,245,250,.65)]">{type.desc}</span>
									</div>
								))}
							</div>
							<p className="m-0 mt-4 border-l-2 border-cyan bg-[rgba(0,229,255,.05)] p-4 pl-5 text-[13px] leading-[1.6] text-[rgba(245,245,250,.65)]">
								Cada fighter faz até <strong className="text-ink">2 ações</strong> por
								ativação: duas Simple iguais, duas diferentes, ou uma Double que
								consome as duas.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
