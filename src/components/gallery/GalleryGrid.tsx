"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import type { GalleryItem } from "@/lib/gallery";
import { GALLERY_CATEGORIES, type GalleryCategory } from "@/lib/validation";

/** Cores dos chips de filtro — paleta das casas/tema do site. */
const CATEGORY_COLORS: Record<GalleryCategory, string> = {
	battle: "#ff2d6f",
	painting: "#b07bff",
	gang: "#ff8a3d",
	terrain: "#59e36b",
	misc: "#00e5ff",
};

const STRINGS: Record<
	Locale,
	{ all: string; empty: string; offline: string; close: string; prev: string; next: string; categories: Record<GalleryCategory, string> }
> = {
	en: {
		all: "ALL",
		empty: "No photos yet — the pict-recorders are still developing the first batch.",
		offline: "The gallery is unavailable right now. Try again in a moment.",
		close: "Close",
		prev: "Previous image",
		next: "Next image",
		categories: {
			battle: "BATTLES",
			painting: "PAINTING",
			gang: "GANGS",
			terrain: "TABLES & TERRAIN",
			misc: "MISC",
		},
	},
	"pt-BR": {
		all: "TODAS",
		empty: "Nenhuma foto ainda — os pict-recorders estão revelando o primeiro lote.",
		offline: "A galeria está indisponível no momento. Tente de novo em instantes.",
		close: "Fechar",
		prev: "Imagem anterior",
		next: "Próxima imagem",
		categories: {
			battle: "BATALHAS",
			painting: "PINTURA",
			gang: "GANGUES",
			terrain: "MESAS & TERRENO",
			misc: "OUTRAS",
		},
	},
};

/**
 * Grid da galeria (issues #6/#24) — colunas CSS (masonry leve), filtro
 * client-side por álbum (a lista completa chega via ISR, como no PostList)
 * e lightbox acessível (ESC, setas, backdrop, scroll lock).
 */
export default function GalleryGrid({
	items,
	offline,
}: {
	items: GalleryItem[];
	offline?: boolean;
}) {
	const locale = useLocale() as Locale;
	const s = STRINGS[locale] ?? STRINGS.en;
	const [filter, setFilter] = useState<GalleryCategory | "all">("all");
	const [lightbox, setLightbox] = useState<number | null>(null);

	const visible = useMemo(
		() => (filter === "all" ? items : items.filter((i) => i.category === filter)),
		[items, filter],
	);

	// Só mostra chips de álbuns que têm fotos.
	const usedCategories = useMemo(
		() => GALLERY_CATEGORIES.filter((c) => items.some((i) => i.category === c)),
		[items],
	);

	const close = useCallback(() => setLightbox(null), []);
	const step = useCallback(
		(delta: number) => {
			setLightbox((cur) =>
				cur === null ? cur : (cur + delta + visible.length) % visible.length,
			);
		},
		[visible.length],
	);

	// Teclado + scroll lock enquanto o lightbox está aberto.
	useEffect(() => {
		if (lightbox === null) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") close();
			if (e.key === "ArrowLeft") step(-1);
			if (e.key === "ArrowRight") step(1);
		};
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prevOverflow;
			window.removeEventListener("keydown", onKey);
		};
	}, [lightbox, close, step]);

	if (offline || items.length === 0) {
		return (
			<div className="clip-chamfer-sm border border-white/[0.1] bg-[rgba(15,13,20,.82)] p-6">
				<p className="m-0 text-[14px] leading-[1.7] text-[rgba(245,245,250,.6)]">
					{offline ? s.offline : s.empty}
				</p>
			</div>
		);
	}

	const current = lightbox !== null ? visible[lightbox] : null;

	return (
		<div>
			{/* Filtro por álbum */}
			<div className="mb-6 flex flex-wrap items-center gap-2">
				{(["all", ...usedCategories] as const).map((key) => {
					const active = filter === key;
					const color = key === "all" ? "#f5f5fa" : CATEGORY_COLORS[key];
					return (
						<button
							key={key}
							type="button"
							onClick={() => {
								setFilter(key);
								setLightbox(null);
							}}
							className="clip-chamfer-sm cursor-pointer border px-3 py-1 font-mono text-[11px] tracking-[2px] transition-colors"
							style={{
								borderColor: active ? color : "rgba(255,255,255,.14)",
								color: active ? color : "rgba(245,245,250,.55)",
								background: active ? `${color}14` : "transparent",
							}}
							aria-pressed={active}
						>
							{key === "all" ? s.all : s.categories[key]}
						</button>
					);
				})}
			</div>

			{/* Grid — CSS columns para masonry leve sem JS de layout */}
			<div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>figure]:mb-4">
				{visible.map((item, idx) => (
					<figure key={item.id} className="m-0 break-inside-avoid">
						<button
							type="button"
							onClick={() => setLightbox(idx)}
							className="group block w-full cursor-zoom-in appearance-none border border-white/[0.1] bg-transparent p-0 transition-colors hover:border-hazard/60"
							aria-label={item.alt}
						>
							<Image
								src={item.url}
								alt={item.alt}
								width={item.width}
								height={item.height}
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								className="block h-auto w-full opacity-90 transition-opacity group-hover:opacity-100"
								loading="lazy"
							/>
						</button>
						{item.caption && (
							<figcaption className="mt-1 font-mono text-[11px] tracking-[1px] text-[rgba(245,245,250,.5)]">
								{item.caption}
							</figcaption>
						)}
					</figure>
				))}
			</div>

			{/* Lightbox */}
			{current && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label={current.alt}
					className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
					onClick={close}
				>
					<button
						type="button"
						onClick={close}
						aria-label={s.close}
						className="absolute right-4 top-4 z-[210] cursor-pointer appearance-none border border-white/30 bg-black/60 px-3 py-1 font-mono text-sm text-white hover:border-hazard"
					>
						✕
					</button>

					{visible.length > 1 && (
						<>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									step(-1);
								}}
								aria-label={s.prev}
								className="absolute left-2 z-[210] cursor-pointer appearance-none border border-white/30 bg-black/60 px-3 py-2 font-mono text-lg text-white hover:border-hazard sm:left-6"
							>
								←
							</button>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									step(1);
								}}
								aria-label={s.next}
								className="absolute right-2 z-[210] cursor-pointer appearance-none border border-white/30 bg-black/60 px-3 py-2 font-mono text-lg text-white hover:border-hazard sm:right-6"
							>
								→
							</button>
						</>
					)}

					<figure
						className="m-0 flex max-h-full max-w-[1200px] flex-col items-center gap-3"
						onClick={(e) => e.stopPropagation()}
					>
						<Image
							src={current.url}
							alt={current.alt}
							width={current.width}
							height={current.height}
							sizes="100vw"
							quality={90}
							className="h-auto max-h-[82vh] w-auto max-w-full border border-white/20"
							priority
						/>
						{(current.caption || current.tags.length > 0) && (
							<figcaption className="flex flex-wrap items-center gap-3 font-mono text-[12px] tracking-[1px] text-[rgba(245,245,250,.7)]">
								{current.caption && <span>{current.caption}</span>}
								{current.tags.map((tag) => (
									<span key={tag} className="text-[rgba(0,229,255,.8)]">
										#{tag}
									</span>
								))}
							</figcaption>
						)}
					</figure>
				</div>
			)}
		</div>
	);
}
