"use client";

import { useState } from "react";
import LoreFigure from "./LoreFigure";
import type { LoreSection } from "./content";

/** Metadados visuais de cada camada do corte transversal da colmeia. */
const LAYER_META: Record<string, { tag: string; width: number }> = {
  "as-torres":             { tag: "TOPO · NOBREZA",          width: 34 },
  "a-casca":               { tag: "CAMADA EXTERNA",          width: 46 },
  "dissipadores-de-calor": { tag: "INFRAESTRUTURA",          width: 56 },
  "zonas-habitacionais":   { tag: "CIDADE COLMEIA",          width: 66 },
  "zonas-de-manufatura":   { tag: "CIDADE COLMEIA",          width: 76 },
  "manufaturas-em-ruinas": { tag: "FRONTEIRA",               width: 84 },
  "a-sub-colmeia":         { tag: "SUB-COLMEIA",             width: 92 },
  "o-fundo-da-colmeia":    { tag: "FUNDO · ABISMO",          width: 100 },
  "as-favelas":            { tag: "EXTERIOR · SOLO DE CINZAS", width: 100 },
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
          <span>CORTE TRANSVERSAL</span>
          <span style={{ color: accent }}>
            NÍVEL {String(activeIdx + 1).padStart(2, "0")}/{String(sections.length).padStart(2, "0")}
          </span>
        </div>

        <div className="flex flex-col items-center gap-[6px]">
          {sections.map((s) => {
            const meta = LAYER_META[s.id] ?? { tag: "", width: 100 };
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
          DESERTOS DE CINZAS ▸ CAP. 04
        </div>
      </div>

      {/* ── Conteúdo da camada ativa ── */}
      <div
        key={active.id}
        className="animate-ncf-menu min-w-0 flex-1 border border-white/[0.08] bg-[#0f0d14] p-[28px] md:p-[36px]"
        style={{ borderLeft: `3px solid ${accent}` }}
      >
        <div className="mb-1 font-mono text-[11px] tracking-[3px]" style={{ color: accent }}>
          {"// "}{(LAYER_META[active.id]?.tag ?? "CAMADA")}
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
