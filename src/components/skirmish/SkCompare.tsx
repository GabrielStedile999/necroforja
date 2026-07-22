"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { getSkContent } from "./content.i18n";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<
	Locale,
	{ skirmishTab: string; campaignTab: string; bothTab: string; skirmishHeader: string; campaignHeader: string }
> = {
	en: {
		skirmishTab: "FOCUS: SKIRMISH",
		campaignTab: "FOCUS: CAMPAIGN",
		bothTab: "BOTH",
		skirmishHeader: "SKIRMISH",
		campaignHeader: "CAMPAIGN",
	},
	"pt-BR": {
		skirmishTab: "FOCO: SKIRMISH",
		campaignTab: "FOCO: CAMPAIGN",
		bothTab: "OS DOIS",
		skirmishHeader: "SKIRMISH",
		campaignHeader: "CAMPAIGN",
	},
};

type Focus = "both" | "skirmish" | "campaign";

/**
 * 01 · Comparativo interativo Skirmish x Campaign. Clicar em um dos modos
 * destaca a coluna correspondente ao longo de toda a tabela.
 */
export default function SkCompare({ accent }: { accent: string }) {
	const locale = useLocale() as Locale;
	const { COMPARE_ROWS } = getSkContent(locale);
	const str = STRINGS[locale];
	const [focus, setFocus] = useState<Focus>("both");

	const dim = (side: "skirmish" | "campaign") => focus !== "both" && focus !== side;

	return (
		<div className="flex flex-col gap-6">
			{/* Seletor de foco */}
			<div className="flex flex-wrap gap-2">
				{([
					["both", str.bothTab],
					["skirmish", str.skirmishTab],
					["campaign", str.campaignTab],
				] as [Focus, string][]).map(([key, label]) => {
					const isActive = focus === key;
					return (
						<button
							key={key}
							onClick={() => setFocus(key)}
							aria-pressed={isActive}
							className="clip-chamfer-sm cursor-pointer border px-4 py-[10px] font-mono text-[12px] tracking-[1px] transition-all"
							style={{
								borderColor: isActive ? accent : "rgba(255,255,255,.12)",
								background: isActive ? `${accent}1e` : "rgba(255,255,255,.02)",
								color: isActive ? accent : "rgba(245,245,250,.7)",
								boxShadow: isActive ? `0 0 14px ${accent}44` : "none",
							}}
						>
							{label}
						</button>
					);
				})}
			</div>

			{/* Cabeçalho das colunas — visível a partir de md */}
			<div className="hidden gap-4 md:grid md:grid-cols-[180px_1fr_1fr]">
				<span />
				<span
					className="font-mono text-[11px] tracking-[3px] transition-opacity"
					style={{ color: accent, opacity: dim("skirmish") ? 0.3 : 1 }}
				>
					{str.skirmishHeader}
				</span>
				<span
					className="font-mono text-[11px] tracking-[3px] transition-opacity"
					style={{ color: "#00e5ff", opacity: dim("campaign") ? 0.3 : 1 }}
				>
					{str.campaignHeader}
				</span>
			</div>

			<div className="flex flex-col gap-3">
				{COMPARE_ROWS.map((row) => (
					<div
						key={row.id}
						className="grid gap-3 border-b border-white/[0.06] pb-4 last:border-0 md:grid-cols-[180px_1fr_1fr] md:items-start md:gap-4"
					>
						<div className="text-[13px] font-bold uppercase tracking-[0.5px] text-ink">{row.label}</div>
						<div
							className="clip-chamfer-sm border-l-2 bg-[rgba(255,255,255,.02)] p-3 text-justify text-[13px] leading-[1.6] text-[rgba(245,245,250,.68)] transition-opacity"
							style={{ borderColor: accent, opacity: dim("skirmish") ? 0.3 : 1 }}
						>
							<span className="mb-1 block font-mono text-[9px] tracking-[2px] text-[rgba(245,245,250,.4)] md:hidden">
								{str.skirmishHeader}
							</span>
							{row.skirmish}
						</div>
						<div
							className="clip-chamfer-sm border-l-2 border-cyan bg-[rgba(255,255,255,.02)] p-3 text-justify text-[13px] leading-[1.6] text-[rgba(245,245,250,.68)] transition-opacity"
							style={{ opacity: dim("campaign") ? 0.3 : 1 }}
						>
							<span className="mb-1 block font-mono text-[9px] tracking-[2px] text-[rgba(245,245,250,.4)] md:hidden">
								{str.campaignHeader}
							</span>
							{row.campaign}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
