"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { woundTarget, type CombatStep } from "./content";
import { getHtpContent } from "./content.i18n";

type TabId = "shoot" | "fight" | "hit";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<
	Locale,
	{
		tabShoot: string;
		tabFight: string;
		tabHit: string;
		stepAria: (n: number) => string;
		prev: string;
		next: string;
		hitModifiers: string;
		fightTip: { before: string; bold: string; after: string };
		calcTitle: string;
		calcIntro: string;
		attackStrength: string;
		targetToughness: string;
		onD6ToWound: string;
	}
> = {
	en: {
		tabShoot: "SHOOTING",
		tabFight: "CLOSE COMBAT",
		tabHit: "RESOLVE HITS",
		stepAria: (n) => `Step ${n}`,
		prev: "← PREVIOUS",
		next: "NEXT →",
		hitModifiers: "HIT MODIFIERS",
		fightTip: {
			before: "Close combat is deadly for both sides: whoever takes the hits and survives engaged ",
			bold: "strikes back",
			after: " in the same activation. Do the maths before you charge.",
		},
		calcTitle: "TO WOUND CALCULATOR",
		calcIntro:
			"The weapon's Strength against the target's Toughness — the die shows what you need to roll to wound.",
		attackStrength: "ATTACK STRENGTH",
		targetToughness: "TARGET TOUGHNESS",
		onD6ToWound: "ON THE D6 TO WOUND",
	},
	"pt-BR": {
		tabShoot: "TIRO",
		tabFight: "CORPO A CORPO",
		tabHit: "RESOLVER HITS",
		stepAria: (n) => `Passo ${n}`,
		prev: "← ANTERIOR",
		next: "PRÓXIMO →",
		hitModifiers: "MODIFICADORES DE ACERTO",
		fightTip: {
			before: "Corpo a corpo é mortal para os dois lados: quem apanha e sobrevive engaged ",
			bold: "bate de volta",
			after: " na mesma ativação. Faça as contas antes de dar charge.",
		},
		calcTitle: "CALCULADORA TO WOUND",
		calcIntro:
			"Strength da arma contra Toughness do alvo — o dado mostra o que você precisa rolar para ferir.",
		attackStrength: "STRENGTH DO ATAQUE",
		targetToughness: "TOUGHNESS DO ALVO",
		onD6ToWound: "NO D6 PARA FERIR",
	},
};

/** Sequência passo a passo com navegação anterior/próximo. */
function StepWalker({ steps, accent }: { steps: readonly CombatStep[]; accent: string }) {
	const locale = useLocale() as Locale;
	const s = STRINGS[locale];
	const [idx, setIdx] = useState(0);
	const step = steps[Math.min(idx, steps.length - 1)];

	if (!step) return null;

	return (
		<div>
			{/* Trilha de passos */}
			<div className="mb-5 flex items-center gap-[6px]">
				{steps.map((_, i) => (
					<button
						key={i}
						onClick={() => setIdx(i)}
						aria-label={s.stepAria(i + 1)}
						aria-current={i === idx}
						className="h-[8px] flex-1 cursor-pointer border-0 p-0 transition-all"
						style={{
							background: i <= idx ? accent : "rgba(255,255,255,.08)",
							boxShadow: i === idx ? `0 0 10px ${accent}88` : "none",
							opacity: i < idx ? 0.45 : 1,
						}}
					/>
				))}
			</div>

			{/* Passo ativo */}
			<div key={idx} className="animate-ncf-menu flex min-h-[150px] gap-5">
				<span
					className="shrink-0 text-[52px] font-bold leading-none"
					style={{ color: accent, textShadow: `0 0 20px ${accent}66` }}
				>
					{String(idx + 1).padStart(2, "0")}
				</span>
				<div>
					<div className="mb-2 text-[18px] font-bold uppercase leading-[1.1] tracking-[0.5px]">{step.title}</div>
					<p className="m-0 text-justify text-[14px] leading-[1.7] text-[rgba(245,245,250,.68)]">{step.text}</p>
				</div>
			</div>

			{/* Navegação */}
			<div className="mt-5 flex items-center justify-between font-mono text-[12px] tracking-[2px]">
				<button
					onClick={() => setIdx(Math.max(0, idx - 1))}
					disabled={idx === 0}
					className="cursor-pointer border border-white/[0.15] bg-transparent px-4 py-2 text-[rgba(245,245,250,.7)] transition-colors hover:border-white/[0.4] disabled:cursor-default disabled:opacity-30"
				>
					{s.prev}
				</button>
				<span className="text-[rgba(245,245,250,.4)]">
					{idx + 1} / {steps.length}
				</span>
				<button
					onClick={() => setIdx(Math.min(steps.length - 1, idx + 1))}
					disabled={idx === steps.length - 1}
					className="cursor-pointer border bg-transparent px-4 py-2 transition-colors disabled:cursor-default disabled:opacity-30"
					style={{ borderColor: `${accent}77`, color: accent }}
				>
					{s.next}
				</button>
			</div>
		</div>
	);
}

/** Face de dado com o alvo necessário. */
function DieFace({ value, color }: { value: string; color: string }) {
	return (
		<div
			className="flex h-[86px] w-[86px] items-center justify-center border-2 text-[30px] font-bold"
			style={{
				borderColor: color,
				color,
				boxShadow: `0 0 22px ${color}55, inset 0 0 14px ${color}22`,
				borderRadius: "10px",
			}}
		>
			{value}
		</div>
	);
}

/** Linha de seleção 1–9 da calculadora To Wound. */
function SelectRow({
	label,
	value,
	set,
	color,
}: {
	label: string;
	value: number;
	set: (n: number) => void;
	color: string;
}) {
	return (
		<div className="mb-4">
			<div className="mb-2 font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.55)]">{label}</div>
			<div className="flex gap-[5px]">
				{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
					<button
						key={v}
						onClick={() => set(v)}
						aria-pressed={v === value}
						className="h-[34px] flex-1 cursor-pointer border font-mono text-[13px] transition-all"
						style={{
							borderColor: v === value ? color : "rgba(255,255,255,.12)",
							background: v === value ? `${color}22` : "transparent",
							color: v === value ? color : "rgba(245,245,250,.6)",
							boxShadow: v === value ? `0 0 10px ${color}55` : "none",
						}}
					>
						{v}
					</button>
				))}
			</div>
		</div>
	);
}

/** Calculadora To Wound — escolha S e T e veja o alvo do D6. */
function WoundCalculator({ accent }: { accent: string }) {
	const locale = useLocale() as Locale;
	const str = STRINGS[locale];
	const [s, setS] = useState(3);
	const [t, setT] = useState(3);
	const target = woundTarget(s, t);

	return (
		<div className="clip-chamfer border border-white/[0.08] bg-[#0f0d14] p-6 md:p-8">
			<div className="mb-1 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
				{"// "}
				{str.calcTitle}
			</div>
			<p className="m-0 mb-6 text-justify text-[13px] leading-[1.6] text-[rgba(245,245,250,.55)]">
				{str.calcIntro}
			</p>

			<SelectRow label={str.attackStrength} value={s} set={setS} color="#ff2d6f" />
			<SelectRow label={str.targetToughness} value={t} set={setT} color="#00e5ff" />

			<div className="mt-6 flex items-center justify-center gap-6">
				<div className="text-right">
					<div className="font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.5)]">S{s} vs T{t}</div>
					<div className="font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.5)]">
						{s >= 2 * t ? "S ≥ 2×T" : s > t ? "S > T" : s === t ? "S = T" : s * 2 <= t ? "S ≤ T/2" : "S < T"}
					</div>
				</div>
				<DieFace value={target} color={accent} />
				<div className="max-w-[120px] font-mono text-[11px] leading-[1.6] tracking-[1px] text-[rgba(245,245,250,.5)]">
					{str.onD6ToWound}
				</div>
			</div>
		</div>
	);
}

/**
 * 04 · Combate — as três sequências (tiro, corpo a corpo, resolução de hits)
 * em passo a passo interativo, com calculadora To Wound, modificadores de
 * acerto e o significado dos Injury dice.
 */
export default function CombatFlow({ accent }: { accent: string }) {
	const locale = useLocale() as Locale;
	const { SHOOT_STEPS, FIGHT_STEPS, HIT_STEPS, INJURY_DICE, HIT_MODIFIERS } =
		getHtpContent(locale);
	const s = STRINGS[locale];

	const TABS = [
		{ id: "shoot", label: s.tabShoot, sub: "Shoot Action · pg. 116", steps: SHOOT_STEPS },
		{ id: "fight", label: s.tabFight, sub: "Fight Action · pg. 120", steps: FIGHT_STEPS },
		{ id: "hit", label: s.tabHit, sub: "Resolve Hits · pg. 124", steps: HIT_STEPS },
	] as const;

	const [tab, setTab] = useState<TabId>("shoot");
	const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

	return (
		<div>
			{/* Abas */}
			<div className="mb-6 flex flex-wrap gap-2">
				{TABS.map((t) => {
					const isActive = t.id === tab;
					return (
						<button
							key={t.id}
							onClick={() => setTab(t.id)}
							aria-pressed={isActive}
							className="clip-chamfer-sm cursor-pointer border px-5 py-3 text-left transition-all"
							style={{
								borderColor: isActive ? accent : "rgba(255,255,255,.1)",
								background: isActive ? `${accent}18` : "rgba(255,255,255,.02)",
								boxShadow: isActive ? `0 0 16px ${accent}44` : "none",
							}}
						>
							<span className="block text-[14px] font-bold tracking-[1px]" style={{ color: isActive ? accent : "rgba(245,245,250,.8)" }}>
								{t.label}
							</span>
							<span className="block font-mono text-[10px] tracking-[1px] text-[rgba(245,245,250,.4)]">{t.sub}</span>
						</button>
					);
				})}
			</div>

			<div className="grid gap-8 lg:grid-cols-[1fr_420px]">
				{/* Sequência ativa */}
				<div
					key={activeTab.id}
					className="animate-ncf-menu border border-white/[0.08] bg-[#0f0d14] p-6 md:p-8"
					style={{ borderLeft: `3px solid ${accent}` }}
				>
					<StepWalker steps={activeTab.steps} accent={accent} />

					{tab === "shoot" && (
						<div className="mt-8 border-t border-white/[0.06] pt-6">
							<div className="mb-3 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
								{"// "}
								{s.hitModifiers}
							</div>
							<div className="flex flex-col gap-[6px]">
								{HIT_MODIFIERS.map((m) => (
									<div key={m.label} className="flex items-center justify-between gap-4 border-b border-white/[0.05] pb-[6px] text-[13px]">
										<span className="text-[rgba(245,245,250,.65)]">{m.label}</span>
										<span className="font-mono font-bold tracking-[1px]" style={{ color: m.mod.startsWith("-") || m.mod === "ERRA" || m.mod === "MISS" ? "#ff2d6f" : "#59e36b" }}>
											{m.mod}
										</span>
									</div>
								))}
							</div>
						</div>
					)}

					{tab === "fight" && (
						<p className="m-0 mt-8 border-l-2 border-cyan bg-[rgba(0,229,255,.05)] p-4 pl-5 text-justify text-[13px] leading-[1.65] text-[rgba(245,245,250,.65)]">
							{s.fightTip.before}
							<strong className="text-ink">{s.fightTip.bold}</strong>
							{s.fightTip.after}
						</p>
					)}
				</div>

				{/* Coluna lateral: calculadora + injury dice */}
				<div className="flex flex-col gap-6">
					<WoundCalculator accent={accent} />

					<div className="clip-chamfer border border-white/[0.08] bg-[#0f0d14] p-6">
						<div className="mb-4 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
							{"// "}INJURY DICE
						</div>
						<div className="flex flex-col gap-4">
							{INJURY_DICE.map((d) => (
								<div key={d.short} className="flex items-center gap-4">
									<div
										className="flex h-[46px] w-[46px] shrink-0 items-center justify-center border-2 font-mono text-[13px] font-bold"
										style={{ borderColor: d.color, color: d.color, borderRadius: "8px", boxShadow: `0 0 12px ${d.color}44` }}
									>
										{d.short}
									</div>
									<div>
										<div className="text-[13px] font-bold uppercase tracking-[0.5px]" style={{ color: d.color }}>
											{d.name}
										</div>
										<div className="text-justify text-[12.5px] leading-[1.55] text-[rgba(245,245,250,.6)]">{d.text}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
