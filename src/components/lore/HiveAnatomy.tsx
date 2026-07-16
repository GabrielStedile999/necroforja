"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import LoreFigure from "./LoreFigure";
import type { LoreSection } from "./content";
import { toLocale } from "./content.i18n";

/** Largura visual (%) de cada camada do corte transversal — igual nos dois idiomas. */
const LAYER_WIDTH: Record<string, number> = {
  "as-torres":             34,
  "a-casca":               46,
  "dissipadores-de-calor": 56,
  "zonas-habitacionais":   66,
  "zonas-de-manufatura":   76,
  "manufaturas-em-ruinas": 84,
  "a-sub-colmeia":         92,
  "o-fundo-da-colmeia":    100,
  "as-favelas":            100,
};

/** Etiqueta mono de cada camada, por locale. */
const LAYER_TAG: Record<Locale, Record<string, string>> = {
  en: {
    "as-torres":             "TOP · NOBILITY",
    "a-casca":               "OUTER LAYER",
    "dissipadores-de-calor": "INFRASTRUCTURE",
    "zonas-habitacionais":   "HIVE CITY",
    "zonas-de-manufatura":   "HIVE CITY",
    "manufaturas-em-ruinas": "FRONTIER",
    "a-sub-colmeia":         "UNDERHIVE",
    "o-fundo-da-colmeia":    "BOTTOM · ABYSS",
    "as-favelas":            "OUTSIDE · ASH GROUND",
  },
  "pt-BR": {
    "as-torres":             "TOPO · NOBREZA",
    "a-casca":               "CAMADA EXTERNA",
    "dissipadores-de-calor": "INFRAESTRUTURA",
    "zonas-habitacionais":   "CIDADE COLMEIA",
    "zonas-de-manufatura":   "CIDADE COLMEIA",
    "manufaturas-em-ruinas": "FRONTEIRA",
    "a-sub-colmeia":         "SUB-COLMEIA",
    "o-fundo-da-colmeia":    "FUNDO · ABISMO",
    "as-favelas":            "EXTERIOR · SOLO DE CINZAS",
  },
};

/** Strings fixas da UI do corte transversal, por locale. */
const STRINGS: Record<
  Locale,
  { crossSection: string; level: string; ashWastes: string; layerFallback: string }
> = {
  en: {
    crossSection: "CROSS-SECTION",
    level: "LEVEL",
    ashWastes: "ASH WASTES ▸ CH. 04",
    layerFallback: "LAYER",
  },
  "pt-BR": {
    crossSection: "CORTE TRANSVERSAL",
    level: "NÍVEL",
    ashWastes: "DESERTOS DE CINZAS ▸ CAP. 04",
    layerFallback: "CAMADA",
  },
};

/**
 * Corte transversal interativo da cidade colmeia — clique em uma camada
 * (do Espiral no topo ao Fundo da Colmeia) para explorar sua descrição.
 */
export default function HiveAnatomy({
  sections,
  accent,
}: {
  sections: LoreSection[];
  accent: string;
}) {
  const locale = toLocale(useLocale());
  const t = STRINGS[locale];
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const active = sections.find((s) => s.id === activeId) ?? sections[0];
  const activeIdx = sections.findIndex((s) => s.id === active?.id);

  if (!active) return null;

  const paras = active.blocks.filter((b) => b.type === "p" || b.type === "quote");
  const imgs = active.blocks.filter((b) => b.type === "img");

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
      {/* ── Corte transversal ── */}
      <div className="w-full lg:w-[400px] lg:shrink-0">
        <div className="mb-4 flex items-baseline justify-between font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.45)]">
          <span>{t.crossSection}</span>
          <span style={{ color: accent }}>
            {t.level} {String(activeIdx + 1).padStart(2, "0")}/{String(sections.length).padStart(2, "0")}
          </span>
        </div>

        <div className="flex flex-col items-center gap-[6px]">
          {sections.map((s) => {
            const meta = {
              tag: LAYER_TAG[locale][s.id] ?? "",
              width: LAYER_WIDTH[s.id] ?? 100,
            };
            const isActive = s.id === active.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                aria-pressed={isActive}
                className="clip-chamfer-sm cursor-pointer border px-4 py-[11px] text-left transition-all duration-200"
                style={{
                  width: `${meta.width}%`,
                  minWidth: "170px",
                  background: isActive
                    ? `linear-gradient(135deg, ${accent}26, ${accent}0d)`
                    : "rgba(255,255,255,.03)",
                  borderColor: isActive ? accent : "rgba(255,255,255,.1)",
                  boxShadow: isActive ? `0 0 18px ${accent}44` : "none",
                }}
              >
                <span
                  className="block text-[13px] font-bold uppercase tracking-[1px]"
                  style={{ color: isActive ? accent : "rgba(245,245,250,.8)" }}
                >
                  {s.title}
                </span>
                <span className="block font-mono text-[9px] tracking-[2px] text-[rgba(245,245,250,.38)]">
                  {meta.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Solo de cinzas */}
        <div className="mt-[6px] h-[8px] w-full opacity-70 hazard-stripes" />
        <div className="mt-2 text-center font-mono text-[10px] tracking-[3px] text-[rgba(245,245,250,.35)]">
          {t.ashWastes}
        </div>
      </div>

      {/* ── Conteúdo da camada ativa ── */}
      <div
        key={active.id}
        className="animate-ncf-menu min-w-0 flex-1 border border-white/[0.08] bg-[#0f0d14] p-[28px] md:p-[36px]"
        style={{ borderLeft: `3px solid ${accent}` }}
      >
        <div className="mb-1 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
          {"// "}{(LAYER_TAG[locale][active.id] ?? t.layerFallback)}
        </div>
        <h3 className="m-0 mb-5 text-[28px] font-bold uppercase leading-none tracking-[1px]">
          {active.title}
        </h3>

        {paras.map((b, i) => (
          <p key={i} className="m-0 mb-4 text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.68)] last:mb-0">
            {b.text}
          </p>
        ))}

        {imgs.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-1">
            {imgs.map((b, i) =>
              b.type === "img" ? (
                <LoreFigure
                  key={i}
                  src={b.src}
                  alt={b.alt}
                  accent={accent}
                  sizes="(max-width: 1024px) 100vw, 900px"
                />
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  );
}
