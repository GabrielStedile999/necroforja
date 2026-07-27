import type { LegalDoc } from "./content";

/**
 * Renderizador compartilhado das páginas legais (issue #39 follow-up) —
 * /privacy e /terms usam o mesmo layout: hero enxuto + seções numeradas na
 * linguagem visual dos capítulos do FAQ/lore, com <h2> reais (issue #42).
 */
export default function LegalDocument({ doc }: { doc: LegalDoc }) {
	return (
		<>
			{/* Hero enxuto */}
			<section className="ncf-section border-b border-white/[0.08] py-[88px]">
				<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
					<div className="mb-[18px] flex items-center gap-[14px]">
						<span className="font-mono text-[13px] tracking-[4px] text-hazard">{doc.kicker}</span>
						<span className="h-px flex-1 bg-white/[0.1]" />
					</div>

					<h1 className="glow-magenta m-0 mb-[14px] max-w-[820px] text-[clamp(34px,5vw,56px)] font-bold uppercase leading-[1] tracking-[2px]">
						{doc.title}
					</h1>

					<p className="m-0 mb-[24px] font-mono text-[12px] tracking-[2px] text-[rgba(245,245,250,.45)]">
						{doc.lastUpdated}
					</p>

					<p className="m-0 max-w-[760px] border-l-2 border-hazard pl-5 text-justify text-[16px] leading-[1.75] text-[rgba(245,245,250,.78)]">
						{doc.intro}
					</p>
				</div>
			</section>

			{/* Seções numeradas */}
			{doc.sections.map((section, index) => (
				<section
					key={section.id}
					id={section.id}
					className={`ncf-section scroll-mt-[130px] border-t border-white/[0.06] py-[56px] ${
						index % 2 === 1 ? "bg-[#0a090c]" : ""
					}`}
				>
					<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
						<div className="mb-[22px] flex items-center gap-[14px]">
							<h2 className="m-0 font-mono text-[13px] font-normal tracking-[4px] text-cyan">
								{String(index + 1).padStart(2, "0")} {"//"} {section.title.toUpperCase()}
							</h2>
							<span className="h-px flex-1 bg-white/[0.1]" />
						</div>

						<div className="flex max-w-[820px] flex-col gap-4">
							{section.paragraphs.map((paragraph) => (
								<p
									key={paragraph.slice(0, 32)}
									className="m-0 text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.7)]"
								>
									{paragraph}
								</p>
							))}
						</div>
					</div>
				</section>
			))}
		</>
	);
}
