import Image from "next/image";
import { HTP_INTRO, HOW_TO_READ } from "./content";

/** Ícones inline da legenda "como ler este guia". */
function LegendIcon({ name }: { name: string }) {
	const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 } as const;
	if (name === "checklist")
		return (
			<svg {...common}>
				<rect x="3" y="3" width="18" height="18" rx="1" />
				<path d="M8 12l3 3 5-6" />
			</svg>
		);
	if (name === "box")
		return (
			<svg {...common}>
				<rect x="3" y="5" width="18" height="14" rx="1" />
				<line x1="3" y1="9" x2="21" y2="9" />
			</svg>
		);
	return (
		<svg {...common}>
			<path d="M4 19V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z" />
			<line x1="8" y1="7" x2="15" y2="7" />
			<line x1="8" y1="11" x2="15" y2="11" />
		</svg>
	);
}

/**
 * Hero do How to Play — mesma linguagem do LoreHero (backdrop + scanlines),
 * com a caixa "como ler este guia" do documento original.
 */
export default function HtpHero() {
	return (
		<section className="relative overflow-hidden border-b border-white/[0.08]">
			{/* Backdrop */}
			<div className="absolute inset-0">
				<Image
					src={`/lore/${HTP_INTRO.image}.webp`}
					alt="Gangues em combate no Underhive"
					width={1284}
					height={963}
					priority
					className="h-full w-full object-cover object-center opacity-[0.26]"
				/>
				<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,13,.55),rgba(11,10,13,.35)_45%,#0b0a0d_96%)]" />
				<div className="scanlines-dark pointer-events-none absolute inset-0 opacity-40" />
			</div>

			<div className="ncf-wrap relative z-[2] mx-auto max-w-[1380px] px-[48px] py-[110px]">
				<div className="mb-[18px] flex items-center gap-[14px]">
					<span className="font-mono text-[13px] tracking-[4px] text-hazard">{HTP_INTRO.kicker}</span>
					<span className="h-px w-[120px] bg-hazard/40" />
				</div>

				<h1 className="glow-magenta m-0 mb-[28px] max-w-[940px] text-[clamp(38px,6vw,72px)] font-bold uppercase leading-[0.98] tracking-[2px]">
					{HTP_INTRO.lead}
				</h1>

				<p className="m-0 mb-[20px] max-w-[760px] border-l-2 border-hazard pl-5 text-justify text-[16px] leading-[1.75] text-[rgba(245,245,250,.78)]">
					{HTP_INTRO.body}
				</p>

				<p className="m-0 mb-[48px] font-mono text-[13px] tracking-[2px] text-cyan">
					{HTP_INTRO.close}
				</p>

				{/* Como ler este guia */}
				<div className="grid gap-4 md:grid-cols-3">
					{HOW_TO_READ.map((item) => (
						<div
							key={item.title}
							className="clip-chamfer-sm border border-white/[0.1] bg-[rgba(15,13,20,.82)] p-5 backdrop-blur-[4px]"
						>
							<div className="mb-3 flex items-center gap-3 text-cyan">
								<LegendIcon name={item.icon} />
								<span className="font-mono text-[11px] tracking-[3px]">{item.title.toUpperCase()}</span>
							</div>
							<p className="m-0 text-[13px] leading-[1.6] text-[rgba(245,245,250,.62)]">{item.text}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
