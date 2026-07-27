import type { Metadata } from "next";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import CreatorProfile from "@/components/creator/CreatorProfile";
import { buildCreatorJsonLd } from "@/lib/seo/json-ld";
import { SITE_URL } from "@/lib/site-url";

/**
 * /creator (issue #39 follow-up) — quem fez a NecroForja.
 *
 * O footer tinha um link "Creators" placeholder; a decisão final foi mantê-lo
 * (no singular) apontando para esta página: foto + bio do Gabriel, ficha
 * técnica do hobby e links para o LinkedIn e o repositório público.
 */
export const metadata: Metadata = {
	title: "Creator",
	description:
		"Meet Gabriel Stedile — biologist, software developer for over a decade and miniature painter — the creator of NecroForja, the digital Necromunda campaign manager.",
	alternates: { canonical: "/creator" },
	openGraph: {
		title: "Creator · NecroForja",
		description:
			"Who builds NecroForja: Gabriel Stedile, developer and Necromunda player — Delaque, Goliath and Van Saar on the table.",
	},
};

export default function CreatorPage() {
	const creatorJsonLd = buildCreatorJsonLd(SITE_URL);

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
			{/* JSON-LD structured data (ProfilePage) */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(creatorJsonLd) }}
			/>

			<Ticker />
			<SiteNav />

			<main>
				<CreatorProfile />
			</main>

			<SiteFooter />
		</div>
	);
}
