"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ACCENT_HEX } from "@/components/lore/accents";
import type { Locale } from "@/i18n/config";
import { getCpContent } from "./content.i18n";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<
	Locale,
	{
		phasesLabel: string;
		allegianceLabel: string;
		allegianceIntro: string;
		triumphsLabel: string;
		ctaLabel: string;
	}
> = {
	en: {
		phasesLabel: "THE SUCCESSION CAMPAIGN PHASES",
		allegianceLabel: "PICK A SIDE",
		allegianceIntro: "During Downtime, every gang declares an allegiance. Click one to see what it grants.",
		triumphsLabel: "SUCCESSION TRIUMPHS",
		ctaLabel: "VIEW THE LIVE CAMPAIGN DASHBOARD →",
	},
	"pt-BR": {
		phasesLabel: "AS FASES DA SUCCESSION CAMPAIGN",
		allegianceLabel: "ESCOLHA UM LADO",
		allegianceIntro: "Durante o Downtime, toda gangue declara uma aliança. Clique em uma para ver o que ela concede.",
		triumphsLabel: "TRIUNFOS DA SUCCESSION",
		ctaLabel: "VER O DASHBOARD DA CAMPANHA AO VIVO →",
	},
};

const ACCENT = "#59e36b";

export default function CpAranthianSuccession() {
	const locale = useLocale() as Locale;
	const { SUCCESSION_INTRO, SUCCESSION_PHASES, ALLEGIANCES, SUCCESSION_TRIUMPHS, SUCCESSION_CTA } = getCpContent(locale);
	const str = STRINGS[locale];
	const [allegianceId, setAllegianceId] = useState(ALLEGIANCES[0]?.id ?? "");
	const activeAllegiance = ALLEGIANCES.find((a) => a.id === allegianceId) ?? ALLEGIANCES[0];

	if (!activeAllegiance) return null;

	return (
		<div className="flex flex-col gap-10">
			<p className="m-0 max-w-[820px] text-justify text-[14.5px] leading-[1.75] text-[rgba(245,245,250,.7)]">
				{SUCCESSION_INTRO.text}
			</p>

			{/* Fases da Succession Campaign */}
			<div>
				<div className="mb-4 font-mono text-[11px] tracking-[3px]" style={{ color: ACCENT }}>
					{"// "}
					{str.phasesLabel}
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					{SUCCESSION_PHASES.map((phase) => (
						<div key={phase.id} className="clip-chamfer-sm border border-white/[0.08] bg-[#0f0d14] p-5">
							<div className="mb-2 flex items-baseline justify-between">
								<span className="text-[15px] font-bold uppercase text-ink">{phase.title}</span>
								<span className="font-mono text-[10px] tracking-[1px]" style={{ color: ACCENT }}>
									{phase.length.toUpperCase()}
								</span>
							</div>
							<p className="m-0 text-justify text-[12.5px] leading-[1.6] text-[rgba(245,245,250,.6)]">{phase.text}</p>
						</div>
					))}
				</div>
			</div>

			{/* Allegiance picker */}
			<div>
				<div className="mb-2 font-mono text-[11px] tracking-[3px]" style={{ color: ACCENT }}>
					{"// "}
					{str.allegianceLabel}
				</div>
				<p className="m-0 mb-5 max-w-[720px] text-justify text-[13.5px] leading-[1.65] text-[rgba(245,245,250,.6)]">
					{str.allegianceIntro}
				</p>

				<div className="grid gap-5 lg:grid-cols-[repeat(3,1fr)]">
					{ALLEGIANCES.map((allegiance) => {
						const hex = ACCENT_HEX[allegiance.accent];
						const isActive = allegiance.id === activeAllegiance.id;
						return (
							<button
								key={allegiance.id}
								onClick={() => setAllegianceId(allegiance.id)}
								aria-pressed={isActive}
								className="clip-chamfer group cursor-pointer border p-5 text-left transition-all"
								style={{
									borderColor: isActive ? hex : "rgba(255,255,255,.1)",
									background: isActive ? `${hex}14` : "rgba(255,255,255,.02)",
									boxShadow: isActive ? `0 0 16px ${hex}33` : "none",
								}}
							>
								<div className="mb-1 text-[17px] font-bold uppercase leading-[1.1]" style={{ color: isActive ? hex : "rgba(245,245,250,.85)" }}>
									{allegiance.name}
								</div>
								<div className="mb-3 font-mono text-[11px] tracking-[1px] text-[rgba(245,245,250,.5)]">{allegiance.tagline}</div>
								{isActive && (
									<div className="animate-ncf-menu flex flex-col gap-2 border-t border-white/[0.08] pt-3">
										{allegiance.benefits.map((b, i) => (
											<p key={i} className="m-0 text-justify text-[12.5px] leading-[1.55] text-[rgba(245,245,250,.68)]">
												{b}
											</p>
										))}
									</div>
								)}
							</button>
						);
					})}
				</div>
			</div>

			{/* Succession Triumphs */}
			<div>
				<div className="mb-4 font-mono text-[11px] tracking-[3px]" style={{ color: ACCENT }}>
					{"// "}
					{str.triumphsLabel}
				</div>
				<div className="grid gap-3 sm:grid-cols-2">
					{SUCCESSION_TRIUMPHS.map((triumph) => (
						<div key={triumph.id} className="clip-chamfer-sm flex flex-col gap-1 border-l-2 bg-[rgba(255,255,255,.02)] p-4" style={{ borderColor: ACCENT }}>
							<span className="text-[13.5px] font-bold uppercase text-ink">{triumph.name}</span>
							<span className="text-[12px] leading-[1.5] text-[rgba(245,245,250,.6)]">{triumph.criteria}</span>
						</div>
					))}
				</div>
			</div>

			{/* CTA para o dashboard ao vivo */}
			<div className="clip-chamfer flex flex-col items-start gap-4 border border-toxic/30 bg-[linear-gradient(150deg,#0e1a10,#080a08)] p-6 sm:flex-row sm:items-center sm:justify-between">
				<p className="m-0 max-w-[560px] text-justify text-[13.5px] leading-[1.6] text-[rgba(245,245,250,.75)]">{SUCCESSION_CTA.text}</p>
				<Link
					href="/dashboard"
					className="clip-chamfer-sm shrink-0 whitespace-nowrap border border-toxic/50 bg-[rgba(89,227,107,.1)] px-5 py-3 font-mono text-[12px] tracking-[1px] text-toxic no-underline transition-colors hover:border-toxic"
				>
					{str.ctaLabel}
				</Link>
			</div>
		</div>
	);
}
