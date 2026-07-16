"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { ACCENT_HEX } from "./accents";
import type { LoreChapter } from "./content";
import { toLocale } from "./content.i18n";

type ChapterLink = Pick<LoreChapter, "id" | "num" | "title" | "accent">;

const STRINGS: Record<Locale, { chaptersLabel: string }> = {
  en: { chaptersLabel: "Chapters" },
  "pt-BR": { chaptersLabel: "Capítulos" },
};

/**
 * Sub-navegação dos capítulos — sticky logo abaixo do SiteNav (74px),
 * com scrollspy e barra de progresso de leitura.
 */
export default function LoreNav({ chapters }: { chapters: ChapterLink[] }) {
  const locale = toLocale(useLocale());
  const [active, setActive] = useState<string>(chapters[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, window.scrollY / total) : 0);

      // Scrollspy: último capítulo cujo topo passou do meio da viewport.
      let current = chapters[0]?.id ?? "";
      for (const c of chapters) {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) {
          current = c.id;
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapters]);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-[74px] z-[50] border-b border-white/[0.08] bg-[rgba(10,9,12,.92)] backdrop-blur-[10px]">
      <nav
        aria-label={STRINGS[locale].chaptersLabel}
        className="ncf-wrap mx-auto flex max-w-[1380px] items-center gap-1 overflow-x-auto px-[24px] py-0 [scrollbar-width:none]"
      >
        {chapters.map((c) => {
          const hex = ACCENT_HEX[c.accent];
          const isActive = active === c.id;
          return (
            <button
              key={c.id}
              onClick={() => jump(c.id)}
              className="flex shrink-0 cursor-pointer items-center gap-2 border-0 bg-transparent px-[16px] py-[14px] font-mono text-[11px] tracking-[2px] transition-colors"
              style={{
                color: isActive ? hex : "rgba(245,245,250,.55)",
                boxShadow: isActive ? `inset 0 -2px 0 ${hex}` : "none",
                textShadow: isActive ? `0 0 12px ${hex}66` : "none",
              }}
            >
              <span className="opacity-60">{c.num}</span>
              <span className="uppercase">{c.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Barra de progresso de leitura */}
      <div className="h-[2px] w-full bg-white/[0.05]">
        <div
          className="h-full bg-[linear-gradient(90deg,#ff2d6f,#00e5ff)] transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
