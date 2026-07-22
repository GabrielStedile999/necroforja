import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { getCpContent } from "./content.i18n";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<
	Locale,
	{
		cardTag: string;
		territoryBoonLabel: string;
		enhancedBoonLabel: string;
		enhancedBoonHouseTag: (house: string) => string;
		mechanicsLabel: string;
	}
> = {
	en: {
		cardTag: "TERRITORY CARD",
		territoryBoonLabel: "TERRITORY BOON",
		enhancedBoonLabel: "ENHANCED BOON",
		enhancedBoonHouseTag: (house) => `${house.toUpperCase()} ONLY`,
		mechanicsLabel: "HOW TERRITORIES WORK",
	},
	"pt-BR": {
		cardTag: "CARTA DE TERRITÓRIO",
		territoryBoonLabel: "TERRITORY BOON",
		enhancedBoonLabel: "ENHANCED BOON",
		enhancedBoonHouseTag: (house) => `EXCLUSIVO DE ${house.toUpperCase()}`,
		mechanicsLabel: "COMO OS TERRITÓRIOS FUNCIONAM",
	},
};

const ACCENT = "#b07bff";

/**
 * 02 · Territórios & Boons — um único exemplo completo (Generatorium/Van Saar)
 * cobrindo toda a anatomia de uma entrada de Território: flavor, Territory
 * Boon e Enhanced Boon exclusivo de House. Sem seletor: com um só exemplo,
 * a interatividade de "trocar de território" deixou de fazer sentido.
 */
export default function CpTerritories() {
	const locale = useLocale() as Locale;
	const { TERRITORIES, TERRITORY_MECHANICS } = getCpContent(locale);
	const str = STRINGS[locale];
	const territory = TERRITORIES[0];

	if (!territory) return null;

	return (
		<div className="flex flex-col gap-8">
			{/* Carta de Território */}
			<div
				className="clip-chamfer border bg-[#0f0d14] p-7"
				style={{ borderColor: "rgba(176,123,255,.3)", borderLeft: `3px solid ${ACCENT}` }}
			>
				<div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
					<div>
						<div className="mb-1 font-mono text-[11px] tracking-[3px]" style={{ color: ACCENT }}>
							{str.cardTag} {"// "} {territory.card.toUpperCase()}
						</div>
						<h3 className="m-0 text-[26px] font-bold uppercase leading-[1.05] text-ink">{territory.name}</h3>
					</div>
					<span
						className="clip-chamfer-sm shrink-0 border px-3 py-1 font-mono text-[11px] tracking-[1.5px]"
						style={{ borderColor: `${ACCENT}66`, color: ACCENT, background: `${ACCENT}14` }}
					>
						{territory.house.toUpperCase()}
					</span>
				</div>

				<p className="m-0 mb-6 max-w-[760px] text-justify text-[14px] italic leading-[1.7] text-[rgba(245,245,250,.6)]">
					{territory.flavor}
				</p>

				<div className="grid gap-5 lg:grid-cols-2">
					{/* Territory Boon */}
					<div className="clip-chamfer-sm border border-white/[0.08] bg-[rgba(255,255,255,.02)] p-5">
						<div className="mb-2 flex items-center gap-2 font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.55)]">
							{str.territoryBoonLabel}
							<span className="h-px flex-1 bg-white/[0.08]" />
						</div>
						<div className="mb-2 text-[13.5px] font-bold uppercase text-ink">{territory.boonLabel}</div>
						<p className="m-0 text-justify text-[13px] leading-[1.65] text-[rgba(245,245,250,.68)]">{territory.boonText}</p>
					</div>

					{/* Enhanced Boon */}
					<div className="clip-chamfer-sm border p-5" style={{ borderColor: `${ACCENT}44`, background: `${ACCENT}0d` }}>
						<div className="mb-2 flex items-center gap-2 font-mono text-[11px] tracking-[2px]" style={{ color: ACCENT }}>
							{str.enhancedBoonLabel}
							<span className="h-px flex-1" style={{ background: `${ACCENT}33` }} />
						</div>
						<div className="mb-2 flex flex-wrap items-baseline gap-2">
							<span className="text-[13.5px] font-bold uppercase text-ink">{territory.enhancedBoonLabel}</span>
							<span className="font-mono text-[10px] tracking-[1px]" style={{ color: ACCENT }}>
								{str.enhancedBoonHouseTag(territory.house)}
							</span>
						</div>
						<p className="m-0 text-justify text-[13px] leading-[1.65] text-[rgba(245,245,250,.68)]">{territory.enhancedBoonText}</p>
					</div>
				</div>
			</div>

			{/* Mecânicas gerais de Território */}
			<div>
				<div className="mb-3 font-mono text-[11px] tracking-[3px] text-[rgba(245,245,250,.5)]">{"// "}{str.mechanicsLabel}</div>
				<div className="flex flex-col gap-[10px]">
					{TERRITORY_MECHANICS.map((m, i) => (
						<div key={i} className="flex items-start gap-3 text-[13px] leading-[1.55]">
							<span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: ACCENT }} />
							<span className="text-justify text-[rgba(245,245,250,.65)]">{m}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
