import { ACCENT_HEX } from "./accents";
import LoreCallout from "./LoreCallout";
import LoreFigure from "./LoreFigure";
import HiveAnatomy from "./HiveAnatomy";
import CityGrid from "./CityGrid";
import { LORE_IMG_DIMS, type LoreChapter as Chapter, type LoreSection } from "./content";

/** Imagens largas viram figuras full-width; as demais vão para a coluna lateral. */
function isWide(src: string) {
  const d = LORE_IMG_DIMS[src];
  return d ? d.w >= 1000 && d.w / d.h >= 1.3 : false;
}

/**
 * Seção em prosa — texto à esquerda, imagens em coluna lateral (alternando
 * o lado a cada seção); imagens panorâmicas quebram em largura total.
 */
function ProseSection({
  section,
  accent,
  flip,
}: {
  section: LoreSection;
  accent: string;
  flip: boolean;
}) {
  const paras = section.blocks.filter((b) => b.type === "p" || b.type === "quote");
  const sideImgs = section.blocks.filter((b) => b.type === "img" && !isWide(b.src));
  const wideImgs = section.blocks.filter((b) => b.type === "img" && isWide(b.src));

  return (
    <div id={section.id} className="scroll-mt-[150px] py-[36px] first:pt-0">
      <div className="mb-[22px] flex items-center gap-[14px]">
        <span className="h-[14px] w-[3px]" style={{ background: accent, boxShadow: `0 0 10px ${accent}88` }} />
        <h3 className="m-0 text-[26px] font-bold uppercase leading-none tracking-[1px]">
          {section.title}
        </h3>
        <span className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <div className={`flex flex-col gap-10 md:items-start ${flip ? "md:flex-row-reverse" : "md:flex-row"}`}>
        <div className="min-w-0 flex-1">
          {paras.map((b, i) =>
            b.type === "quote" ? (
              <p
                key={i}
                className="m-0 mb-4 border-l-2 pl-4 text-justify text-[14px] italic leading-[1.7] text-[rgba(245,245,250,.72)]"
                style={{ borderColor: accent }}
              >
                {b.text}
              </p>
            ) : b.type === "p" ? (
              <p key={i} className="m-0 mb-4 text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.68)] last:mb-0">
                {b.text}
              </p>
            ) : null,
          )}
        </div>

        {sideImgs.length > 0 && (
          <div className="flex w-full flex-col gap-6 md:w-[340px] md:shrink-0">
            {sideImgs.map((b, i) =>
              b.type === "img" ? (
                <LoreFigure key={i} src={b.src} alt={b.alt} accent={accent} />
              ) : null,
            )}
          </div>
        )}
      </div>

      {wideImgs.map((b, i) =>
        b.type === "img" ? (
          <LoreFigure
            key={i}
            src={b.src}
            alt={b.alt}
            accent={accent}
            className="mt-8"
            sizes="(max-width: 768px) 100vw, 1284px"
          />
        ) : null,
      )}
    </div>
  );
}

/** Card de Casa Clã — barra superior na cor da Casa, texto + galeria. */
function HouseSection({ section }: { section: LoreSection }) {
  const color = section.color ?? "#f5f5fa";
  const paras = section.blocks.filter((b) => b.type === "p" || b.type === "quote");
  const imgs = section.blocks.filter((b) => b.type === "img");

  return (
    <div
      id={section.id}
      className="clip-chamfer scroll-mt-[150px] overflow-hidden border border-white/[0.08] bg-[#0f0d14]"
    >
      <div className="h-[4px] w-full" style={{ background: color, boxShadow: `0 0 16px ${color}66` }} />
      <div className="p-[28px] md:p-[36px]">
        <div className="mb-1 font-mono text-[11px] tracking-[3px]" style={{ color }}>
          {"// CASA CLÃ"}
        </div>
        <h3 className="m-0 mb-5 text-[30px] font-bold uppercase leading-none tracking-[1px]">
          {section.title}
        </h3>

        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            {paras.map((b, i) => (
              <p key={i} className="m-0 mb-4 text-justify text-[14px] leading-[1.75] text-[rgba(245,245,250,.68)] last:mb-0">
                {b.text}
              </p>
            ))}
          </div>
          {imgs.length > 0 && (
            <div className={`grid w-full gap-4 md:w-[360px] md:shrink-0 ${imgs.length > 1 ? "grid-cols-2 md:grid-cols-1" : "grid-cols-1"}`}>
              {imgs.map((b, i) =>
                b.type === "img" ? <LoreFigure key={i} src={b.src} alt={b.alt} accent={color} /> : null,
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Um capítulo do lore — cabeçalho numerado no padrão das seções da landing
 * e renderização específica por capítulo (anatomia interativa, grid de
 * colmeias, cards de Casas ou prosa).
 */
export default function LoreChapter({ chapter }: { chapter: Chapter }) {
  const accent = ACCENT_HEX[chapter.accent];
  const callouts = chapter.sections.filter((s) => s.kind === "callout");
  const regular = chapter.sections.filter((s) => s.kind !== "callout");

  return (
    <section
      id={chapter.id}
      className="ncf-section scroll-mt-[130px] border-t border-white/[0.06] py-[88px] odd:bg-[#0a090c]"
    >
      <div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
        {/* Cabeçalho do capítulo */}
        <div className="mb-[48px] flex items-center gap-[14px]">
          <span className="font-mono text-[13px] tracking-[4px]" style={{ color: accent }}>
            {chapter.num} {"//"} {chapter.title.toUpperCase()}
          </span>
          <span className="h-px flex-1 bg-white/[0.1]" />
        </div>

        {chapter.id === "anatomia" ? (
          <>
            <HiveAnatomy sections={regular} accent={accent} />
            {callouts.map((s) => (
              <LoreCallout key={s.id} section={s} accent={accent} />
            ))}
          </>
        ) : chapter.id === "cidades" ? (
          <CityGrid sections={regular} accent={accent} />
        ) : chapter.id === "casas" ? (
          <div className="flex flex-col gap-[40px]">
            {chapter.sections.map((s, i) =>
              s.kind === "callout" ? (
                <LoreCallout key={s.id} section={s} accent={accent} />
              ) : s.color ? (
                <HouseSection key={s.id} section={s} />
              ) : (
                <ProseSection key={s.id} section={s} accent={accent} flip={i % 2 === 1} />
              ),
            )}
          </div>
        ) : (
          <>
            {chapter.sections.map((s, i) =>
              s.kind === "callout" ? (
                <LoreCallout key={s.id} section={s} accent={accent} />
              ) : (
                <ProseSection key={s.id} section={s} accent={accent} flip={i % 2 === 1} />
              ),
            )}
          </>
        )}
      </div>
    </section>
  );
}
