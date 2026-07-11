"use client";

import { useState } from "react";
import LoreFigure from "./LoreFigure";
import type { LoreSection } from "./content";

/**
 * Grid expansível das cidades colmeia de Necromunda — cada card abre a
 * descrição completa da colmeia (uma por vez, estilo dossiê).
 */
export default function CityGrid({
  sections,
  accent,
}: {
  sections: LoreSection[];
  accent: string;
}) {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((s, idx) => {
        const isOpen = openId === s.id;
        const paras = s.blocks.filter((b) => b.type === "p" || b.type === "quote");
        const imgs = s.blocks.filter((b) => b.type === "img");
        const teaser = paras[0]?.text ?? "";

        return (
          <div
            key={s.id}
            className={`clip-chamfer-sm overflow-hidden border bg-[#0f0d14] transition-colors ${isOpen ? "md:col-span-2" : ""}`}
            style={{ borderColor: isOpen ? `${accent}88` : "rgba(255,255,255,.08)" }}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : s.id)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center gap-4 border-0 bg-transparent px-[22px] py-[18px] text-left"
            >
              <span className="font-mono text-[12px]" style={{ color: accent }}>
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-[17px] font-bold uppercase tracking-[1px] text-ink">
                {s.title}
              </span>
              <span
                className="font-mono text-[14px] transition-transform duration-200"
                style={{ color: accent, transform: isOpen ? "rotate(90deg)" : "none" }}
              >
                ▸
              </span>
            </button>

            {isOpen ? (
              <div className="animate-ncf-menu border-t border-white/[0.07] px-[22px] pb-[26px] pt-[20px]">
                <div className="flex flex-col gap-8 md:flex-row md:items-start">
                  <div className="min-w-0 flex-1">
                    {paras.map((b, i) => (
                      <p
                        key={i}
                        className="m-0 mb-4 text-justify text-[14px] leading-[1.75] text-[rgba(245,245,250,.68)] last:mb-0"
                      >
                        {b.text}
                      </p>
                    ))}
                  </div>
                  {imgs.length > 0 && (
                    <div className="flex w-full flex-col gap-5 md:w-[320px] md:shrink-0">
                      {imgs.map((b, i) =>
                        b.type === "img" ? (
                          <LoreFigure key={i} src={b.src} alt={b.alt} accent={accent} />
                        ) : null,
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-[22px] pb-[18px]">
                <p className="m-0 line-clamp-2 text-[12px] leading-[1.6] text-[rgba(245,245,250,.45)]">
                  {teaser}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
