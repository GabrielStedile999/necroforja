import Image from "next/image";
import type { HouseDossier } from "./content";

type UiLabels = {
	playstyleLabel: string;
	strengthsLabel: string;
	weaknessesLabel: string;
};

/**
 * Dossiê de uma Grande Casa (issue #8): arte da Casa de um lado, identidade,
 * estilo de jogo e pontos fortes/fracos do outro. Layout alterna de lado a
 * cada Casa (`flip`). Presentational — todo o texto vem de content.i18n.
 */
export default function HouseDossierCard({
	dossier,
	ui,
	flip,
}: {
	dossier: HouseDossier;
	ui: UiLabels;
	flip?: boolean;
}) {
	return (
		<article
			id={dossier.slug}
			className="clip-card relative scroll-mt-[140px] overflow-hidden border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))]"
		>
			{/* Barra de identidade da Casa */}
			<div className="h-1" style={{ background: dossier.color, boxShadow: `0 0 14px ${dossier.shadow}` }} />

			<div className={`grid gap-0 lg:grid-cols-[420px_1fr] ${flip ? "lg:[direction:rtl]" : ""}`}>
				{/* Arte */}
				<div className="relative min-h-[280px] overflow-hidden border-white/[0.07] max-lg:border-b lg:min-h-full lg:border-r [direction:ltr]">
					<Image
						src={`/lore/${dossier.image}.webp`}
						alt={dossier.imageAlt}
						width={dossier.imgW}
						height={dossier.imgH}
						className="h-full w-full object-cover object-top opacity-[0.85]"
					/>
					<div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(11,10,13,.85))]" />
					<div className="scanlines-dark pointer-events-none absolute inset-0 opacity-30" />
					<div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-5 pb-4">
						<span className="font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.5)]">{dossier.code}</span>
						<span
							className="px-[11px] py-1.5 font-mono text-[11px] tracking-[1px]"
							style={{ border: `1px solid ${dossier.shadow}`, color: dossier.color, background: "rgba(11,10,13,.7)" }}
						>
							{dossier.role}
						</span>
					</div>
				</div>

				{/* Dossiê */}
				<div className="flex flex-col px-[26px] py-6 lg:px-[34px] lg:py-7 [direction:ltr]">
					<h3 className="m-0 text-[26px] font-bold leading-[1.05] tracking-[0.5px]">{dossier.name}</h3>
					<div className="mb-4 mt-1 font-mono text-xs tracking-[1px]" style={{ color: dossier.color }}>
						{dossier.tagline}
					</div>

					<p className="m-0 mb-5 text-justify text-[14px] leading-[1.7] text-[rgba(245,245,250,.7)]">
						{dossier.desc}
					</p>

					<div className="mb-2 flex items-center gap-[10px]">
						<span className="h-px w-[22px]" style={{ background: dossier.color }} />
						<span className="font-mono text-[11px] tracking-[3px]" style={{ color: dossier.color }}>
							{ui.playstyleLabel}
						</span>
					</div>
					<p className="m-0 mb-6 text-justify text-[13.5px] leading-[1.65] text-[rgba(245,245,250,.62)]">
						{dossier.playstyle}
					</p>

					<div className="mt-auto grid gap-5 md:grid-cols-2">
						<div>
							<div className="mb-[10px] font-mono text-[11px] tracking-[3px] text-toxic">{ui.strengthsLabel}</div>
							<ul className="m-0 flex list-none flex-col gap-2 p-0">
								{dossier.strengths.map((item) => (
									<li key={item} className="flex gap-2 text-[12.5px] leading-[1.55] text-[rgba(245,245,250,.62)]">
										<span className="shrink-0 font-mono text-toxic">+</span>
										{item}
									</li>
								))}
							</ul>
						</div>
						<div>
							<div className="mb-[10px] font-mono text-[11px] tracking-[3px] text-hazard">{ui.weaknessesLabel}</div>
							<ul className="m-0 flex list-none flex-col gap-2 p-0">
								{dossier.weaknesses.map((item) => (
									<li key={item} className="flex gap-2 text-[12.5px] leading-[1.55] text-[rgba(245,245,250,.62)]">
										<span className="shrink-0 font-mono text-hazard">−</span>
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}
