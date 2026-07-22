import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { getCpContent } from "./content.i18n";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<Locale, { intro: string }> = {
	en: {
		intro:
			"Winning a Dominion Campaign isn't about one final winner — it's about which of these five titles your gang can claim when the last cycle ends.",
	},
	"pt-BR": {
		intro:
			"Vencer uma Dominion Campaign não é sobre um único campeão — é sobre qual desses cinco títulos sua gangue consegue reivindicar quando o último ciclo termina.",
	},
};

export default function CpTriumphs({ accent }: { accent: string }) {
	const locale = useLocale() as Locale;
	const { DOMINION_TRIUMPHS } = getCpContent(locale);
	const s = STRINGS[locale];

	return (
		<div className="flex flex-col gap-6">
			<p className="m-0 max-w-[760px] text-justify text-[13.5px] leading-[1.65] text-[rgba(245,245,250,.6)]">{s.intro}</p>
			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{DOMINION_TRIUMPHS.map((triumph) => (
					<div
						key={triumph.id}
						className="clip-chamfer border border-white/[0.08] bg-[#0f0d14] p-6 transition-colors hover:border-white/[0.2]"
					>
						<div className="mb-3 font-mono text-[10px] tracking-[2px]" style={{ color: accent }}>
							{"// TRIUMPH"}
						</div>
						<div className="mb-2 text-[19px] font-bold uppercase leading-[1.1] text-ink">{triumph.name}</div>
						<p className="m-0 text-justify text-[13px] leading-[1.6] text-[rgba(245,245,250,.62)]">{triumph.criteria}</p>
					</div>
				))}
			</div>
		</div>
	);
}
