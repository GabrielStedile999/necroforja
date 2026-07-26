"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import s from "./Hero.module.scss";

/**
 * WATCH TRAILER button + fullscreen video modal.
 * - Darkened translucent backdrop (site still visible, interaction blocked)
 * - Autoplay on open (allowed with sound: triggered by user click)
 * - Close: top-right button, ESC, or backdrop click
 * - Body scroll locked while open
 * - Rendered via portal on document.body (issue #49): dentro da árvore do
 *   Hero (overflow-hidden + camadas com efeitos), o Safari iOS tratava o
 *   `position: fixed` como relativo ao hero (containing block) e o vídeo
 *   aparecia cortado quando a página estava scrollada.
 */
export default function TrailerModal({ src = "/trailer.mp4" }: { src?: string }) {
	const t = useTranslations("Hero");
	const [open, setOpen] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	const close = useCallback(() => setOpen(false), []);

	// Scroll lock + ESC while open
	useEffect(() => {
		if (!open) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") close();
		};
		window.addEventListener("keydown", onKey);

		// Autoplay (user gesture opened the modal, so sound is allowed)
		videoRef.current?.play().catch(() => {
			/* if the browser still blocks it, controls remain available */
		});

		return () => {
			document.body.style.overflow = prevOverflow;
			window.removeEventListener("keydown", onKey);
		};
	}, [open, close]);

	return (
		<>
			{/* Trigger — WATCH TRAILER */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				className={`${s.ctaSecondary} appearance-none bg-transparent text-left text-ink`}
				aria-haspopup="dialog"
			>
				<div className={s.trailerThumb}>
					<span className="relative text-[16px] text-white [text-shadow:0_0_8px_#00e5ff]">
						▶
					</span>
				</div>
				<div className="flex flex-col">
					<span className="text-[14px] font-semibold tracking-[2px]">
						{t("watchTrailer")}
					</span>
					<span className="font-mono text-[11px] tracking-[1px] text-[rgba(245,245,250,.5)]">
						{t("trailerSub")}
					</span>
				</div>
			</button>

			{/* Modal — via portal no <body>, fora de qualquer containing block (issue #49) */}
			{/* `open` só vira true com clique (client) — portal nunca roda no SSR */}
			{open &&
				createPortal(
					<div
						role="dialog"
						aria-modal="true"
						aria-label={t("trailerAria")}
						onClick={close}
						className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-4 md:p-10"
					>
						{/* Close — top right of the screen */}
						<button
							type="button"
							onClick={close}
							aria-label={t("closeTrailer")}
							className="absolute right-5 top-5 z-[2] flex h-11 w-11 cursor-pointer items-center justify-center border border-white/[0.25] bg-black/50 text-ink transition-colors hover:border-hazard hover:text-hazard"
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<line x1="5" y1="5" x2="19" y2="19" />
								<line x1="19" y1="5" x2="5" y2="19" />
							</svg>
						</button>

						{/* Video — clicks inside must not close the modal */}
						<div
							onClick={(e) => e.stopPropagation()}
							className="w-full max-w-[960px] border border-white/[0.15] bg-black shadow-[0_0_60px_rgba(0,0,0,.8)]"
						>
							<video
								ref={videoRef}
								src={src}
								autoPlay
								controls
								playsInline
								className="block h-auto w-full"
							/>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
