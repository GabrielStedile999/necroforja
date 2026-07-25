"use client";

import Image from "next/image";
import type { GalleryItem } from "@/lib/gallery";

/**
 * Lightbox da galeria (issues #6/#24), extraído do GalleryGrid na issue #42
 * para ser carregado via next/dynamic só quando o usuário abre uma foto —
 * fora do bundle inicial de /gallery. Estado (índice atual, teclado, scroll
 * lock) continua no GalleryGrid; este componente é só a camada visual.
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
	);
}
