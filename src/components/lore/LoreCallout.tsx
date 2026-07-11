import LoreFigure from "./LoreFigure";
import type { LoreSection } from "./content";

/**
 * Caixa de destaque narrativa — corresponde aos blocos em negrito do
 * documento original ("Os Portadores do Destino", "Mutação e Loucura"…).
 */
export default function LoreCallout({
  section,
  accent,
}: {
  section: LoreSection;
  accent: string;
}) {
  const img = section.blocks.find((b) => b.type === "img");
  const texts = section.blocks.filter((b) => b.type !== "img");

  return (
    <aside
      className="clip-chamfer relative my-[48px] overflow-hidden border bg-[linear-gradient(150deg,#15101b,#0a070d)]"
      style={{ borderColor: `${accent}44` }}
    >
      <div className="scanlines-dark pointer-events-none absolute inset-0 opacity-30" />
      <div
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: accent, boxShadow: `0 0 14px ${accent}88` }}
      />
      <div className="relative flex flex-col gap-8 p-[32px] md:flex-row md:items-center md:p-[40px]">
        <div className="flex-1">
          <div className="mb-3 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
            {"// REGISTRO DA COLMEIA"}
          </div>
          <h3 className="m-0 mb-4 text-[24px] font-bold uppercase leading-[1.05] tracking-[1px]">
            {section.title}
          </h3>
          {texts.map((b, i) => (
            <p
              key={i}
              className="m-0 mb-3 text-justify text-[14px] italic leading-[1.7] text-[rgba(245,245,250,.72)] last:mb-0"
            >
              {b.text}
            </p>
          ))}
        </div>
        {img && img.type === "img" && (
          <LoreFigure src={img.src} alt={img.alt} accent={accent} className="md:w-[300px] md:shrink-0" />
        )}
      </div>
    </aside>
  );
}
