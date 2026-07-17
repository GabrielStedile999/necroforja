import Image from "next/image";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { getGangsContent } from "./content.i18n";

/** Small per-locale UI strings owned by this component. */
const STRINGS: Record<Locale, { heroAlt: string }> = {
	en: { heroAlt: "The Clan Houses of Necromunda side by side" },
	"pt-BR": { heroAlt: "As Casas Clã de Necromunda lado a lado" },
};

/**
 * Hero da página de Gangues — mesma linguagem do LoreHero/HtpHero
 * (backdrop + scanlines + kicker hazard), com a arte das Casas.
 */
export default function GangsHero() {
	const locale = useLocale() as Locale;
	const { GANGS_INTRO } = getGangsContent(locale);
	const s = STRINGS[locale];

	return (
		<section className="relative overflow-hidden border-b border-white/[0.08]">
			{/* Backdrop */}
			<div className="absolute inset-0">
				<Image
					src={`/lore/${GANGS_INTRO.image}.webp`}
					alt={s.heroAlt}
					width={928}
					height={759}
					priority
					className="h-full w-full object-cover object-center opacity-[0.26]"
				/>
				<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,13,.55),rgba(11,10,13,.35)_45%,#0b0a0d_96%)]" />
				<div className="scanlines-dark pointer-events-none absolute inset-0 opacity-40" />
			</div>

			<div className="ncf-wrap relative z-[2] mx-auto max-w-[1380px] px-[48px] py-[110px]">
				<div className="mb-[18px] flex items-center gap-[14px]">
					<span className="font-mono text-[13px] tracking-[4px] text-hazard">{GANGS_INTRO.kicker}</span>
					<span className="h-px w-[120px] bg-hazard/40" />
				</div>

				<h1 className="glow-magenta m-0 mb-[28px] max-w-[940px] text-[clamp(38px,6vw,72px)] font-bold uppercase leading-[0.98] tracking-[2px]">
					{GANGS_INTRO.lead}
				</h1>

				<p className="m-0 mb-[20px] max-w-[760px] border-l-2 border-hazard pl-5 text-justify text-[16px] leading-[1.75] text-[rgba(245,245,250,.78)]">
					{GANGS_INTRO.body}
				</p>

				<p className="m-0 font-mono text-[13px] tracking-[2px] text-cyan">
					{GANGS_INTRO.close}
				</p>
			</div>
		</section>
	);
}
