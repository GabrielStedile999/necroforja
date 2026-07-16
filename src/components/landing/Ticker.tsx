import { useTranslations } from "next-intl";

/**
 * Ticker — scrolling magenta marquee bar at the top of the landing.
 */
export default function Ticker() {
	const t = useTranslations("Ticker");
	const items = t.raw("items") as string[];

	// Doubled for seamless loop (animation moves -50%)
	const all = [...items, ...items];

	return (
		<div className="relative z-30 flex h-8 items-center overflow-hidden bg-hazard font-mono text-xs tracking-[1px] whitespace-nowrap text-[#0a0a0c]">
			<div className="flex gap-[46px] pl-[46px] animate-ticker">
				{all.map((item, i) => (
					<span key={i}>{item}</span>
				))}
			</div>
		</div>
	);
}
