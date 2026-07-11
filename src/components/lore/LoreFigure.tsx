import Image from "next/image";
import { LORE_IMG_DIMS } from "./content";

/**
 * Figura padrão do lore — imagem com borda chanfrada, moldura sutil e
 * legenda mono no rodapé. A legenda é o próprio `alt`, único por imagem.
 */
export default function LoreFigure({
	src,
	alt,
	accent = "#ff2d6f",
	className = "",
	sizes = "(max-width: 768px) 100vw, 400px",
	showCaption = true,
}: {
	src: string;
	alt: string;
	accent?: string;
	className?: string;
	/** Larguras de renderização para o next/image (ajustar em figuras full-width). */
	sizes?: string;
	showCaption?: boolean;
}) {
	const dims = LORE_IMG_DIMS[src];
	if (!dims) return null;

	return (
		<figure className={`m-0 ${className}`}>
			<div
				className="clip-chamfer relative overflow-hidden border border-white/[0.1] bg-panel"
				style={{ borderBottomColor: `${accent}55` }}
			>
				<Image
					src={`/lore/${src}.webp`}
					alt={alt}
					width={dims.w}
					height={dims.h}
					quality={90}
					className="block h-auto w-full"
					sizes={sizes}
				/>
				<div className="scanlines-dark pointer-events-none absolute inset-0 opacity-20" />
			</div>
			{showCaption && (
				<figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[2px] text-[rgba(245,245,250,.4)]">
					<span style={{ color: accent }}>▸</span> {alt}
				</figcaption>
			)}
		</figure>
	);
}
