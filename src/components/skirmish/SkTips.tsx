import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import type { TipCard } from "./content";
import { getSkContent } from "./content.i18n";

function TipIcon({ name, color }: { name: TipCard["icon"]; color: string }) {
	const common = {
		width: 26,
		height: 26,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: color,
		strokeWidth: 1.7,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
	};
	switch (name) {
		case "spark":
			return (
				<svg {...common}>
					<path d="M13 2 4 14h6l-1 8 9-12h-6z" />
				</svg>
			);
		case "target":
			return (
				<svg {...common}>
					<circle cx="12" cy="12" r="9" />
					<circle cx="12" cy="12" r="5" />
					<circle cx="12" cy="12" r="1" fill={color} stroke="none" />
				</svg>
			);
		case "scale":
			return (
				<svg {...common}>
					<path d="M12 3v18M5 8l-3 6a3.5 3.5 0 0 0 7 0l-3-6zM19 8l-3 6a3.5 3.5 0 0 0 7 0l-3-6zM5 8h14M9 3h6" />
				</svg>
			);
		case "clock":
			return (
				<svg {...common}>
					<circle cx="12" cy="12" r="9" />
					<path d="M12 7v5l3 3" />
				</svg>
			);
	}
}

export default function SkTips({ accent }: { accent: string }) {
	const locale = useLocale() as Locale;
	const { SKIRMISH_TIPS } = getSkContent(locale);

	return (
		<div className="grid gap-5 md:grid-cols-2">
			{SKIRMISH_TIPS.map((tip) => (
				<div
					key={tip.id}
					className="clip-chamfer border border-white/[0.08] bg-[#0f0d14] p-6 transition-colors hover:border-white/[0.2]"
				>
					<div className="mb-4">
						<TipIcon name={tip.icon} color={accent} />
					</div>
					<div className="mb-2 text-[16px] font-bold uppercase leading-[1.15] tracking-[0.3px] text-ink">{tip.title}</div>
					<p className="m-0 text-justify text-[13px] leading-[1.65] text-[rgba(245,245,250,.62)]">{tip.text}</p>
				</div>
			))}
		</div>
	);
}
