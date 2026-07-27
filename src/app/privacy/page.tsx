import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import LegalDocument from "@/components/legal/LegalDocument";
import { getLegalContent } from "@/components/legal/content.i18n";

/**
 * /privacy (issue #39 follow-up) — política de privacidade real no lugar do
 * <span> morto do footer. Conteúdo em @/components/legal/content*.ts.
 */
export const metadata: Metadata = {
	title: "Privacy Policy",
	description:
		"How NecroForja handles your data: essential cookies only, anonymous metrics, no ads, no selling data. An independent, non-commercial Necromunda fan project.",
	alternates: { canonical: "/privacy" },
	openGraph: {
		title: "Privacy Policy · NecroForja",
		description: "What NecroForja collects, why, and where it lives — without legalese.",
	},
};

export default async function PrivacyPage() {
	const locale = (await getLocale()) as Locale;
	const { PRIVACY } = getLegalContent(locale);

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
				<LegalDocument doc={PRIVACY} />
			</main>

			<SiteFooter />
		</div>
	);
}
