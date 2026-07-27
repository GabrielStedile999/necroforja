import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import { ContactForm } from "@/components/contact/ContactForm";
import { getContactContent } from "@/components/contact/content.i18n";

/**
 * /contact (issue #39 follow-up) — formulário de contato do site.
 *
 * O footer tinha um link "Contact" placeholder; a decisão final foi mantê-lo
 * apontando para esta página. A mensagem é entregue por e-mail ao mantenedor
 * (server action + Resend); o endereço de destino nunca aparece no código
 * nem no cliente — o repo é público.
 */
export const metadata: Metadata = {
	title: "Contact",
	description:
		"Get in touch with NecroForja — questions, bug reports, feature suggestions or image takedown requests for the Necromunda campaign manager.",
	alternates: { canonical: "/contact" },
	openGraph: {
		title: "Contact · NecroForja",
		description: "Questions, bug reports or suggestions? Talk to the forge.",
	},
};

export default async function ContactPage() {
	const locale = (await getLocale()) as Locale;
	const { CONTACT_INTRO } = getContactContent(locale);

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
				<section className="ncf-section py-[96px]">
					<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
						{/* Kicker */}
						<div className="mb-[18px] flex items-center gap-[14px]">
							<span className="font-mono text-[13px] tracking-[4px] text-hazard">
								{CONTACT_INTRO.kicker}
							</span>
							<span className="h-px flex-1 bg-white/[0.1]" />
						</div>

						<h1 className="glow-magenta m-0 mb-[24px] max-w-[820px] text-[clamp(34px,5vw,56px)] font-bold uppercase leading-[1] tracking-[2px]">
							{CONTACT_INTRO.title}
						</h1>

						<p className="m-0 mb-[48px] max-w-[720px] border-l-2 border-hazard pl-5 text-justify text-[16px] leading-[1.75] text-[rgba(245,245,250,.78)]">
							{CONTACT_INTRO.body}
						</p>

						<div className="max-w-[720px]">
							<ContactForm />
						</div>
					</div>
				</section>
			</main>

			<SiteFooter />
		</div>
	);
}
