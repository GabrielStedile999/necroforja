import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { pickGalleryText, type GalleryItem } from "@/lib/gallery";
import { listPublishedGalleryImages } from "@/lib/db/queries";
import { GALLERY_BUCKET, storagePublicUrl } from "@/lib/storage";
import { logger } from "@/lib/logger";

/**
 * Galeria de fotos (issues #6/#24) — miniaturas, mesas e momentos da
 * campanha, servidos do Supabase Storage via next/image.
 *
 * ISR: revalidate a cada 5 min; filtro por álbum é client-side para manter
 * a página estática (mesmo padrão do jornal /reports).
 */
export const revalidate = 300;

export const metadata: Metadata = {
	title: "Gallery",
	description:
		"Photos from The Aranthian Succession: battle snapshots from the table, painted miniatures, gangs and terrain of the Underhive.",
	alternates: { canonical: "/gallery" },
	openGraph: {
		title: "Gallery · NecroForja",
		description:
			"Battle snapshots, painted miniatures and tables — the campaign in pictures.",
	},
};

const PAGE_STRINGS: Record<Locale, { kicker: string; lead: string; body: string }> = {
	en: {
		kicker: "// GALLERY",
		lead: "The campaign, frame by frame.",
		body:
			"Snapshots from the table, freshly painted miniatures, gangs mid-brawl and the terrain they bleed on — the visual archive of The Aranthian Succession.",
	},
	"pt-BR": {
		kicker: "// GALERIA",
		lead: "A campanha, quadro a quadro.",
		body:
			"Registros da mesa, miniaturas recém-pintadas, gangues no meio da briga e o terreno onde elas sangram — o arquivo visual de The Aranthian Succession.",
	},
};

/** Lê as fotos publicadas com fallback gracioso (null = banco indisponível). */
async function loadImages(): Promise<
	Awaited<ReturnType<typeof listPublishedGalleryImages>> | null
> {
	try {
		return await listPublishedGalleryImages();
	} catch (error) {
		logger.error("gallery: failed to load published images", { error });
		return null;
	}
}

export default async function GalleryPage() {
	const locale = (await getLocale()) as Locale;
	const t = PAGE_STRINGS[locale] ?? PAGE_STRINGS.en;
	const rows = await loadImages();

	const items: GalleryItem[] = (rows ?? []).map((row) => {
		const text = pickGalleryText(row, locale);
		return {
			id: row.id,
			url: storagePublicUrl(GALLERY_BUCKET, row.path),
			category: row.category,
			tags: row.tags,
			alt: text.alt,
			caption: text.caption,
			width: row.width,
			height: row.height,
		};
	});

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
				{/* Cabeçalho */}
				<section className="border-b border-white/[0.08]">
					<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px] pb-[56px] pt-[80px]">
						<div className="mb-[18px] flex items-center gap-[14px]">
							<span className="font-mono text-[13px] tracking-[4px] text-hazard">{t.kicker}</span>
							<span className="h-px w-[120px] bg-hazard/40" />
						</div>
						<h1 className="glow-magenta m-0 mb-[22px] max-w-[900px] text-[clamp(36px,5.5vw,64px)] font-bold uppercase leading-[0.98] tracking-[2px]">
							{t.lead}
						</h1>
						<p className="m-0 max-w-[760px] border-l-2 border-hazard pl-5 text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.72)]">
							{t.body}
						</p>
					</div>
				</section>

				{/* Grid */}
				<section className="ncf-section py-[64px]">
					<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
						<GalleryGrid items={items} offline={rows === null} />
					</div>
				</section>
			</main>

			<SiteFooter />
		</div>
	);
}
