import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import LegalDocument from "@/components/legal/LegalDocument";
import { getLegalContent } from "@/components/legal/content.i18n";

/**
 * /terms (issue #39 follow-up) — termos de uso reais no lugar do <span>
 * morto do footer. Conteúdo em @/components/legal/content*.ts.
 */
export const metadata: Metadata = {
	title: "Terms of Use",
	description:
		"Terms of use for NecroForja — a free, unofficial, non-commercial Necromunda fan project: accounts, acceptable use and intellectual property.",
	alternates: { canonical: "/terms" },
	openGraph: {
		title: "Terms of Use · NecroForja",
		description: "Short terms for a simple site: a free fan project tracking a Necromunda campaign.",
	},
};

export default async function TermsPage() {
	const locale = (await getLocale()) as Locale;
	const { TERMS } = getLegalContent(locale);

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
				<LegalDocument doc={TERMS} />
			</main>

			<SiteFooter />
		</div>
	);
}
