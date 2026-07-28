"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import type { GalleryItem } from "@/lib/gallery";
import GalleryRating from "./GalleryRating";

/**
 * Comentários (issue #52) — chunk próprio via next/dynamic, mesmo padrão do
 * lightbox na issue #42: só baixa quando o visitante abre o painel; nada
 * entra no bundle inicial de /gallery.
 */
const GalleryComments = dynamic(() => import("./GalleryComments"), {
	ssr: false,
	loading: () => (
		<p className="m-0 font-mono text-[12px] text-[rgba(245,245,250,.5)]">…</p>
	),
});

const STRINGS: Record<
	Locale,
	{ paintedBy: string; showComments: string; hideComments: string }
> = {
	en: {
		paintedBy: "PAINTED BY //",
		showComments: "COMMENTS ▾",
		hideComments: "COMMENTS ▴",
	},
	"pt-BR": {
		paintedBy: "PINTADO POR //",
		showComments: "COMENTÁRIOS ▾",
		hideComments: "COMENTÁRIOS ▴",
	},
};

/**
 * Lightbox da galeria (issues #6/#24), extraído do GalleryGrid na issue #42
 * para ser carregado via next/dynamic só quando o usuário abre uma foto —
 * fora do bundle inicial de /gallery. Estado (índice atual, teclado, scroll
 * lock) continua no GalleryGrid; este componente é a camada visual + as
 * interações de visitante da issue #52 (autor em destaque, rating 1–5 e
 * comentários pré-moderados, carregados sob demanda).
 */
export default function GalleryLightbox({
	current,
	count,
	labels,
	onClose,
	onStep,
}: {
	current: GalleryItem;
	count: number;
	labels: { close: string; prev: string; next: string };
	onClose: () => void;
	onStep: (delta: number) => void;
}) {
	const locale = useLocale() as Locale;
	const s = STRINGS[locale] ?? STRINGS.en;
	// Guarda o id da foto com o painel aberto: navegar para outra foto fecha
	// os comentários naturalmente, sem resetar estado via effect.
	const [commentsFor, setCommentsFor] = useState<string | null>(null);
	const showComments = commentsFor === current.id;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label={current.alt}
			className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
			onClick={onClose}
		>
			<button
				type="button"
				onClick={onClose}
				aria-label={labels.close}
				className="absolute right-4 top-4 z-[210] cursor-pointer appearance-none border border-white/30 bg-black/60 px-3 py-1 font-mono text-sm text-white hover:border-hazard"
			>
				✕
			</button>

			{count > 1 && (
				<>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onStep(-1);
						}}
						aria-label={labels.prev}
						className="absolute left-2 z-[210] cursor-pointer appearance-none border border-white/30 bg-black/60 px-3 py-2 font-mono text-lg text-white hover:border-hazard sm:left-6"
					>
						←
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onStep(1);
						}}
						aria-label={labels.next}
						className="absolute right-2 z-[210] cursor-pointer appearance-none border border-white/30 bg-black/60 px-3 py-2 font-mono text-lg text-white hover:border-hazard sm:right-6"
					>
						→
					</button>
				</>
			)}

			<figure
				className="m-0 flex max-h-full w-full max-w-[1200px] flex-col items-center gap-3 overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<Image
					src={current.url}
					alt={current.alt}
					width={current.width}
					height={current.height}
					sizes="100vw"
					quality={90}
					className="h-auto max-h-[78vh] w-auto max-w-full border border-white/20"
					priority
				/>
				{(current.caption || current.author || current.tags.length > 0) && (
					<figcaption className="flex flex-wrap items-center justify-center gap-3 font-mono text-[12px] tracking-[1px] text-[rgba(245,245,250,.7)]">
						{/* Autor em destaque (issue #52): bold + cor de acento. */}
						{current.author && (
							<span className="font-bold text-hazard">
								{s.paintedBy} {current.author}
							</span>
						)}
						{current.caption && <span>{current.caption}</span>}
						{current.tags.map((tag) => (
							<span key={tag} className="text-[rgba(0,229,255,.8)]">
								#{tag}
							</span>
						))}
					</figcaption>
				)}

				{/* Interações de visitante (issue #52) — rating + comentários. */}
				<div className="flex w-full max-w-[720px] flex-col items-center gap-3 pb-2">
					<div className="flex flex-wrap items-center justify-center gap-4">
						<GalleryRating
							key={current.id}
							imageId={current.id}
							initialAvg={current.ratingAvg}
							initialCount={current.ratingCount}
						/>
						<button
							type="button"
							onClick={() => setCommentsFor(showComments ? null : current.id)}
							aria-expanded={showComments}
							className="cursor-pointer appearance-none border border-white/30 bg-black/60 px-3 py-1 font-mono text-[12px] tracking-[2px] text-white hover:border-hazard"
						>
							{showComments ? s.hideComments : s.showComments}
						</button>
					</div>
					{showComments && (
						<GalleryComments key={current.id} imageId={current.id} />
					)}
				</div>
			</figure>
		</div>
	);
}
