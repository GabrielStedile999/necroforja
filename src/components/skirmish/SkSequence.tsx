"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { getSkContent } from "./content.i18n";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<
	Locale,
	{ preTab: string; postTab: string; preNote: string; postNote: string; skippedLabel: string }
> = {
	en: {
		preTab: "PRE-BATTLE SEQUENCE",
		postTab: "POST-BATTLE SEQUENCE",
		preNote: "Steps that either don't apply or work differently in Skirmish, out of the 8 steps on pg. 97-98. Everything not listed here works exactly as in a campaign.",
		postNote: "Steps that are skipped in Skirmish, out of the 7 steps on pg. 142-147. Everything not listed here works exactly as in a campaign.",
		skippedLabel: "SKIPPED / DIFFERENT",
	},
	"pt-BR": {
		preTab: "PRE-BATTLE SEQUENCE",
		postTab: "POST-BATTLE SEQUENCE",
		preNote: "Passos que não se aplicam ou funcionam diferente em Skirmish, dos 8 passos das pg. 97-98. Tudo que não está listado aqui funciona exatamente como em uma campanha.",
		postNote: "Passos que são ignorados em Skirmish, dos 7 passos das pg. 142-147. Tudo que não está listado aqui funciona exatamente como em uma campanha.",
		skippedLabel: "PULADO / DIFERENTE",
	},
};

export default function SkSequence({ accent }: { accent: string }) {
	const locale = useLocale() as Locale;
	const { PRE_BATTLE_DIFFS, POST_BATTLE_DIFFS } = getSkContent(locale);
	const str = STRINGS[locale];
	const [tab, setTab] = useState<"pre" | "post">("pre");

	const rows = tab === "pre" ? PRE_BATTLE_DIFFS : POST_BATTLE_DIFFS;
	const note = tab === "pre" ? str.preNote : str.postNote;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap gap-2">
				{([
					["pre", str.preTab],
					["post", str.postTab],
				] as ["pre" | "post", string][]).map(([key, label]) => {
					const isActive = tab === key;
					return (
						<button
							key={key}
							onClick={() => setTab(key)}
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

			<p className="m-0 max-w-[760px] text-justify text-[13.5px] leading-[1.65] text-[rgba(245,245,250,.6)]">{note}</p>

			<div key={tab} className="animate-ncf-menu flex flex-col gap-3">
				{rows.map((row) => (
					<div
						key={row.id}
						className="clip-chamfer-sm flex flex-col gap-2 border-l-2 bg-[#0f0d14] p-5 sm:flex-row sm:items-start sm:gap-5"
						style={{ borderColor: accent }}
					>
						<div className="shrink-0 sm:w-[280px]">
							<div className="text-[13.5px] font-bold uppercase leading-[1.3] text-ink">{row.step}</div>
							<div className="font-mono text-[10px] tracking-[1px]" style={{ color: accent }}>
								{row.ref}
							</div>
						</div>
						<p className="m-0 text-justify text-[13px] leading-[1.6] text-[rgba(245,245,250,.65)]">{row.text}</p>
					</div>
				))}
			</div>

			<div className="font-mono text-[10px] tracking-[2px] text-[rgba(245,245,250,.4)]">{"// "}{str.skippedLabel}</div>
		</div>
	);
}
