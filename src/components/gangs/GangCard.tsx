import type { GangCardData } from "./content";

type UiLabels = {
	playstyleLabel: string;
	strengthsLabel: string;
	weaknessesLabel: string;
};

/**
 * Card de gangue sem dossiê completo (independentes, Ash Wastes e Hive
 * Secundus): identidade visual + descrição + estilo + fortes/fracos.
 * Evolução do card compacto da landing (Houses.tsx) para a página dedicada.
 */
export default function GangCard({ gang, ui }: { gang: GangCardData; ui: UiLabels }) {
	return (
		<article
			id={gang.slug}
			className="clip-card relative flex scroll-mt-[140px] flex-col overflow-hidden border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))]"
		>
			{/* Barra de identidade */}
			<div className="h-1" style={{ background: gang.color, boxShadow: `0 0 12px ${gang.shadow}` }} />

			<div className="flex flex-1 flex-col px-[22px] pb-[24px] pt-5">
				<div className="mb-[14px] flex items-center justify-between">
					<span className="font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.4)]">{gang.code}</span>
					<span
						className="px-[10px] py-1 font-mono text-[10.5px] tracking-[1px]"
						style={{ border: `1px solid ${gang.shadow}`, color: gang.color }}
					>
						{gang.role}
					</span>
				</div>

				<h3 className="m-0 text-[19px] font-bold leading-[1.1] tracking-[0.5px]">{gang.name}</h3>
				<div className="mb-3 mt-1 font-mono text-[11.5px] tracking-[1px]" style={{ color: gang.color }}>
					{gang.tagline}
				</div>

				<p className="m-0 mb-4 text-justify text-[12.5px] leading-[1.6] text-[rgba(245,245,250,.6)]">
					{gang.desc}
				</p>

				<div className="mb-1 font-mono text-[10.5px] tracking-[2px]" style={{ color: gang.color }}>
					{ui.playstyleLabel}
				</div>
				<p className="m-0 mb-4 text-justify text-[12.5px] leading-[1.55] text-[rgba(245,245,250,.55)]">
					{gang.playstyle}
				</p>

				<div className="mt-auto flex flex-col gap-3 border-t border-white/[0.07] pt-4">
					<div>
						<div className="mb-[6px] font-mono text-[10.5px] tracking-[2px] text-toxic">{ui.strengthsLabel}</div>
						<ul className="m-0 flex list-none flex-col gap-[6px] p-0">
							{gang.strengths.map((item) => (
								<li key={item} className="flex gap-2 text-[12px] leading-[1.5] text-[rgba(245,245,250,.58)]">
									<span className="shrink-0 font-mono text-toxic">+</span>
									{item}
								</li>
							))}
						</ul>
					</div>
					<div>
						<div className="mb-[6px] font-mono text-[10.5px] tracking-[2px] text-hazard">{ui.weaknessesLabel}</div>
						<ul className="m-0 flex list-none flex-col gap-[6px] p-0">
							{gang.weaknesses.map((item) => (
								<li key={item} className="flex gap-2 text-[12px] leading-[1.5] text-[rgba(245,245,250,.58)]">
									<span className="shrink-0 font-mono text-hazard">−</span>
									{item}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</article>
	);
}
