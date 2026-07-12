"use client";

import { useState } from "react";
import { STATUSES, CHAR_TESTS, XP_TABLE, END_CONDITIONS, FALL_TABLE } from "./content";

/**
 * 06 · Referência rápida — statuses interativos, testes de característica,
 * XP automático, fim de batalha e dano por queda. Os "resumos de bolso"
 * do documento original.
 */
export default function QuickRef({ accent }: { accent: string }) {
	const [activeId, setActiveId] = useState(STATUSES[0]?.id ?? "");
	const active = STATUSES.find((s) => s.id === activeId) ?? STATUSES[0];

	if (!active) return null;

	return (
		<div className="flex flex-col gap-10">
			{/* Statuses interativos */}
			<div>
				<div className="mb-4 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
					{"// "}STATUSES & CONDITIONS DE FIGHTER
				</div>
				<div className="grid gap-6 lg:grid-cols-[1fr_380px]">
					<div className="flex flex-wrap content-start gap-2">
						{STATUSES.map((s) => {
							const isActive = s.id === active.id;
							return (
								<button
									key={s.id}
									onClick={() => setActiveId(s.id)}
									aria-pressed={isActive}
									className="clip-chamfer-sm cursor-pointer border px-4 py-[10px] font-mono text-[12px] tracking-[1px] transition-all"
									style={{
										borderColor: isActive ? s.color : "rgba(255,255,255,.12)",
										background: isActive ? `${s.color}1e` : "rgba(255,255,255,.02)",
										color: isActive ? s.color : "rgba(245,245,250,.7)",
										boxShadow: isActive ? `0 0 14px ${s.color}44` : "none",
									}}
								>
									{s.name.toUpperCase()}
								</button>
							);
						})}
					</div>

					<div
						key={active.id}
						className="animate-ncf-menu self-start border border-white/[0.08] bg-[#0f0d14] p-6"
						style={{ borderLeft: `3px solid ${active.color}` }}
					>
						<div className="mb-1 font-mono text-[10px] tracking-[2px] text-[rgba(245,245,250,.45)]">
							{active.kind === "status" ? "STATUS" : "CONDITION"}
						</div>
						<div className="mb-3 text-[18px] font-bold uppercase tracking-[0.5px]" style={{ color: active.color }}>
							{active.name}
						</div>
						<p className="m-0 text-[13.5px] leading-[1.65] text-[rgba(245,245,250,.68)]">{active.text}</p>
					</div>
				</div>
			</div>

			{/* Grade de tabelas */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Testes de característica */}
				<div className="clip-chamfer border border-white/[0.08] bg-[#0f0d14] p-6">
					<div className="mb-4 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
						{"// "}TESTES DE CARACTERÍSTICA
					</div>
					<div className="flex flex-col gap-3">
						{CHAR_TESTS.map((t) => (
							<div key={t.stat} className="border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
								<div className="flex items-baseline justify-between gap-3">
									<span className="text-[13px] font-bold tracking-[0.5px]">{t.stat}</span>
									<span className="font-mono text-[13px]" style={{ color: accent }}>{t.roll}</span>
								</div>
								<div className="font-mono text-[11px] text-[rgba(245,245,250,.45)]">{t.note}</div>
							</div>
						))}
					</div>
					<p className="m-0 mt-4 border-l-2 border-hazard bg-[rgba(255,45,111,.06)] p-3 pl-4 text-[12.5px] leading-[1.6] text-[rgba(245,245,250,.65)]">
						Natural 1 em Hit ou Save = falha automática. Roll-off: maior vence;
						empate rola de novo.
					</p>
				</div>

				{/* XP automático */}
				<div className="clip-chamfer border border-white/[0.08] bg-[#0f0d14] p-6">
					<div className="mb-4 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
						{"// "}XP GANHO NA BATALHA (PG. 148)
					</div>
					<div className="flex flex-col gap-[10px]">
						{XP_TABLE.map((row, i) => (
							<div key={i} className="flex items-start gap-3 text-[13px] leading-[1.55]">
								<span
									className="mt-[1px] shrink-0 border px-2 py-[2px] font-mono text-[11px] font-bold"
									style={{ borderColor: `${accent}66`, color: accent }}
								>
									{row.xp}
								</span>
								<span className="text-[rgba(245,245,250,.65)]">{row.text}</span>
							</div>
						))}
					</div>
				</div>

				{/* Quando a batalha termina */}
				<div className="clip-chamfer border border-white/[0.08] bg-[#0f0d14] p-6">
					<div className="mb-4 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
						{"// "}QUANDO A BATALHA TERMINA
					</div>
					<div className="flex flex-col gap-4">
						{END_CONDITIONS.map((c) => (
							<div key={c.title}>
								<div className="mb-1 text-[13px] font-bold uppercase tracking-[0.5px]">{c.title}</div>
								<p className="m-0 text-[12.5px] leading-[1.6] text-[rgba(245,245,250,.6)]">{c.text}</p>
							</div>
						))}
					</div>
				</div>

				{/* Queda */}
				<div className="clip-chamfer border border-white/[0.08] bg-[#0f0d14] p-6">
					<div className="mb-4 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
						{"// "}DANO POR QUEDA (3″+)
					</div>
					<div className="flex flex-col gap-[6px] font-mono text-[13px]">
						<div className="flex justify-between border-b border-white/[0.1] pb-2 text-[10px] tracking-[2px] text-[rgba(245,245,250,.45)]">
							<span>ALTURA</span>
							<span>PERFIL DO HIT</span>
						</div>
						{FALL_TABLE.map((row) => (
							<div key={row.range} className="flex justify-between border-b border-white/[0.05] pb-[6px] last:border-0">
								<span className="text-[rgba(245,245,250,.75)]">{row.range}</span>
								<span style={{ color: accent }}>
									{row.s} · {row.ap} · {row.d}
								</span>
							</div>
						))}
					</div>
					<p className="m-0 mt-4 text-[12px] leading-[1.6] text-[rgba(245,245,250,.5)]">
						Quanto mais alto o Underhive, mais longa a queda. Cuidado nas passarelas.
					</p>
				</div>
			</div>
		</div>
	);
}
