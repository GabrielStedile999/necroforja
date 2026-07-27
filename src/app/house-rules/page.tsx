import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import LoreNav from "@/components/lore/LoreNav";
import { ACCENT_HEX } from "@/components/lore/accents";
import HrHero from "@/components/houserules/HrHero";
import HrRule from "@/components/houserules/HrRule";
import { getHrContent } from "@/components/houserules/content.i18n";

/**
 * Campaign Custom Rules (issue #41).
 *
 * Regras da casa desta campanha — substituem/complementam o rulebook
 * oficial. Um capítulo por regra (a primeira: "Infiltrate & Hidden
 * Deployment", do corpo da issue). O FAQ vive na rota irmã /faq — ambas
 * linkadas na coluna Campaign Tools do mega-menu GAME.
 */
export const metadata: Metadata = {
	title: "Campaign Custom Rules",
	description:
		"The custom house rules used in The Aranthian Succession campaign tracked on NecroForja — tweaks agreed at the table on top of the official Necromunda rulebook.",
	alternates: { canonical: "/house-rules" },
	openGraph: {
		title: "Campaign Custom Rules · NecroForja",
		description:
			"The house rules this Necromunda campaign runs on top of the rulebook — in writing, so nobody claims surprise mid-battle.",
	},
};

export default async function HouseRulesPage() {
	const locale = (await getLocale()) as Locale;
	const { HOUSE_RULES, HR_CHAPTERS } = getHrContent(locale);

	return (
		<div
			className="relative w-full overflow-x-clip text-ink"
			style={{
				background: "#0b0a0d",
				backgroundImage:
					"radial-gradient(1400px 700px at 25% -10%,rgba(255,45,111,.07),transparent),radial-gradient(1200px 700px at 95% 6%,rgba(0,229,255,.05),transparent)",
				fontFamily: "'Chakra Petch', sans-serif",
			}}
		>
			<Ticker />
			<SiteNav />

			<main>
				<HrHero />
				<LoreNav chapters={HR_CHAPTERS} />

				{HOUSE_RULES.map((rule, index) => {
					const hex = ACCENT_HEX[rule.accent];
					return (
						<section
							key={rule.id}
							id={rule.id}
							className={`ncf-section scroll-mt-[130px] border-t border-white/[0.06] py-[88px] ${index % 2 === 1 ? "bg-[#0a090c]" : ""}`}
						>
							<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
								{/* Cabeçalho de capítulo — <h2> real (issue #42), visual de label. */}
								<div className="mb-[18px] flex items-center gap-[14px]">
									<h2
										className="m-0 font-mono text-[13px] font-normal tracking-[4px]"
										style={{ color: hex }}
									>
										{rule.num} {"//"} {rule.title.toUpperCase()}
									</h2>
									<span className="h-px flex-1 bg-white/[0.1]" />
								</div>

								<HrRule rule={rule} accent={hex} />
							</div>
						</section>
					);
				})}
			</main>

			<SiteFooter />
		</div>
	);
}
