import Image from "next/image";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { getSkContent } from "./content.i18n";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<Locale, { heroAlt: string; stats: { value: string; label: string }[] }> = {
	en: {
		heroAlt: "A lone gang fighting in the Underhive",
		stats: [
			{ value: "1", label: "BATTLE" },
			{ value: "0", label: "XP GAINED" },
			{ value: "FREE", label: "BUDGET" },
		],
	},
	"pt-BR": {
		heroAlt: "Uma gangue solitária em combate no Underhive",
		stats: [
			{ value: "1", label: "BATALHA" },
			{ value: "0", label: "XP GANHO" },
			{ value: "LIVRE", label: "BUDGET" },
		],
	},
};

/**
 * Hero da página Skirmish — mesma linguagem visual do HtpHero (backdrop +
 * scanlines), com uma faixa de estatísticas no lugar da caixa "como ler".
 */
export default function SkHero() {
	const locale = useLocale() as Locale;
	const { SK_INTRO } = getSkContent(locale);
	const s = STRINGS[locale];

	return (
		<section id="o-que-e" className="relative overflow-hidden border-b border-white/[0.08]">
			{/* Backdrop */}
			<div className="absolute inset-0">
				<Image
					src={`/lore/${SK_INTRO.image}.webp`}
					alt={s.heroAlt}
					width={1600}
					height={1114}
					priority
					className="h-full w-full object-cover object-center opacity-[0.26]"
				/>
				<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,13,.55),rgba(11,10,13,.35)_45%,#0b0a0d_96%)]" />
				<div className="scanlines-dark pointer-events-none absolute inset-0 opacity-40" />
			</div>

			<div className="ncf-wrap relative z-[2] mx-auto max-w-[1380px] px-[48px] py-[110px]">
				<div className="mb-[18px] flex items-center gap-[14px]">
					<span className="font-mono text-[13px] tracking-[4px] text-hazard">{SK_INTRO.kicker}</span>
					<span className="h-px w-[120px] bg-hazard/40" />
				</div>

				<h1 className="glow-magenta m-0 mb-[28px] max-w-[940px] text-[clamp(38px,6vw,72px)] font-bold uppercase leading-[0.98] tracking-[2px]">
					{SK_INTRO.lead}
				</h1>

				<p className="m-0 mb-[20px] max-w-[760px] border-l-2 border-hazard pl-5 text-justify text-[16px] leading-[1.75] text-[rgba(245,245,250,.78)]">
					{SK_INTRO.body}
				</p>

				<p className="m-0 mb-[48px] font-mono text-[13px] tracking-[2px] text-cyan">{SK_INTRO.close}</p>

				{/* Faixa de estatísticas */}
				<div className="grid gap-4 sm:grid-cols-3 sm:max-w-[560px]">
					{s.stats.map((stat) => (
						<div
							key={stat.label}
							className="clip-chamfer-sm border border-white/[0.1] bg-[rgba(15,13,20,.82)] p-5 text-center backdrop-blur-[4px]"
						>
							<div className="mb-1 text-[28px] font-bold leading-none text-cyan">{stat.value}</div>
							<div className="font-mono text-[10px] tracking-[2px] text-[rgba(245,245,250,.55)]">{stat.label}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
