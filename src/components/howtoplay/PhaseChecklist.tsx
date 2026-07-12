"use client";

import { useState } from "react";
import type { HtpStep } from "./content";

/**
 * Checklist interativo de uma fase (pre-battle / post-battle).
 * Cada passo expande para mostrar os itens e pode ser marcado como feito —
 * o cabeçalho acompanha o progresso, como a folha de mesa do documento.
 */
export default function PhaseChecklist({
	steps,
	accent,
	doneLabel,
}: {
	steps: HtpStep[];
	accent: string;
	doneLabel: string;
}) {
	const [open, setOpen] = useState<string | null>(steps[0]?.id ?? null);
	const [done, setDone] = useState<Set<string>>(new Set());

	const toggleDone = (id: string) => {
		setDone((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const pct = steps.length > 0 ? (done.size / steps.length) * 100 : 0;

	return (
		<div>
			{/* Progresso */}
			<div className="mb-6 flex items-center gap-4">
				<div className="h-[6px] flex-1 overflow-hidden bg-white/[0.06]">
					<div
						className="h-full transition-[width] duration-300"
						style={{ width: `${pct}%`, background: accent, boxShadow: `0 0 12px ${accent}88` }}
					/>
				</div>
				<span className="shrink-0 font-mono text-[12px] tracking-[2px]" style={{ color: accent }}>
					{done.size}/{steps.length} PASSOS
				</span>
			</div>

			{done.size === steps.length && (
				<div
					className="clip-chamfer-sm mb-6 border px-5 py-3 font-mono text-[12px] tracking-[2px]"
					style={{ borderColor: accent, color: accent, background: `${accent}12` }}
				>
					✓ {doneLabel}
				</div>
			)}

			<div className="flex flex-col gap-3">
				{steps.map((step) => {
					const isOpen = open === step.id;
					const isDone = done.has(step.id);
					return (
						<div
							key={step.id}
							className="clip-chamfer-sm border bg-[#0f0d14] transition-colors"
							style={{
								borderColor: isOpen ? `${accent}88` : "rgba(255,255,255,.08)",
								opacity: isDone && !isOpen ? 0.55 : 1,
							}}
						>
							{/* Cabeçalho do passo */}
							<div className="flex items-center gap-4 px-5 py-4">
								{/* Checkbox */}
								<button
									onClick={() => toggleDone(step.id)}
									aria-label={isDone ? `Desmarcar ${step.title}` : `Marcar ${step.title} como feito`}
									aria-pressed={isDone}
									className="flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center border text-[13px] font-bold transition-all"
									style={{
										borderColor: isDone ? accent : "rgba(255,255,255,.25)",
										background: isDone ? `${accent}22` : "transparent",
										color: accent,
										boxShadow: isDone ? `0 0 10px ${accent}55` : "none",
									}}
								>
									{isDone ? "✓" : ""}
								</button>

								<button
									onClick={() => setOpen(isOpen ? null : step.id)}
									aria-expanded={isOpen}
									className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 border-0 bg-transparent p-0 text-left"
								>
									<span className="shrink-0 font-mono text-[13px] tracking-[1px]" style={{ color: accent }}>
										{step.num}
									</span>
									<span
										className={`min-w-0 flex-1 truncate text-[15px] font-bold uppercase tracking-[0.5px] ${isDone ? "line-through" : ""}`}
										style={{ color: isDone ? "rgba(245,245,250,.5)" : "#f5f5fa" }}
									>
										{step.title}
									</span>
									<span className="hidden shrink-0 font-mono text-[10px] tracking-[1px] text-[rgba(245,245,250,.4)] sm:block">
										{step.ref}
									</span>
									<span
										className="shrink-0 font-mono text-[12px] transition-transform duration-200"
										style={{ color: accent, transform: isOpen ? "rotate(90deg)" : "none" }}
										aria-hidden
									>
										▸
									</span>
								</button>
							</div>

							{/* Corpo expandido */}
							{isOpen && (
								<div className="animate-ncf-menu border-t border-white/[0.06] px-5 py-5 pl-[61px]">
									<ul className="m-0 flex list-none flex-col gap-3 p-0">
										{step.items.map((item, i) => (
											<li key={i} className="flex gap-3 text-[14px] leading-[1.65] text-[rgba(245,245,250,.68)]">
												<span className="mt-[2px] shrink-0 font-mono text-[11px]" style={{ color: accent }}>
													☐
												</span>
												<span className="text-justify">{item}</span>
											</li>
										))}
									</ul>

									{step.note && (
										<div
											className="mt-5 border-l-2 p-4 pl-5"
											style={{
												borderColor: step.note.tone === "key" ? "#ff2d6f" : "#00e5ff",
												background: step.note.tone === "key" ? "rgba(255,45,111,.06)" : "rgba(0,229,255,.05)",
											}}
										>
											<div
												className="mb-2 font-mono text-[11px] tracking-[2px]"
												style={{ color: step.note.tone === "key" ? "#ff2d6f" : "#00e5ff" }}
											>
												{step.note.tone === "key" ? "⚠ " : "ℹ "}
												{step.note.title.toUpperCase()}
											</div>
											{step.note.lines.map((line, i) => (
												<p key={i} className="m-0 text-justify text-[13px] leading-[1.65] text-[rgba(245,245,250,.68)]">
													{line}
												</p>
											))}
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
