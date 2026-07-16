import Image from "next/image";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { LORE_IMG_DIMS } from "./content";
import { getLoreIntro, toLocale } from "./content.i18n";

const STRINGS: Record<Locale, { backdropAlt: string }> = {
  en: { backdropAlt: "A hive city of Necromunda" },
  "pt-BR": { backdropAlt: "Cidade colmeia de Necromunda" },
};

/**
 * Hero da página de lore — citação de abertura do documento sobre um
 * backdrop da colmeia, com scanlines e a estética hazard/cyan do site.
 */
export default function LoreHero() {
  const locale = toLocale(useLocale());
  const intro = getLoreIntro(locale);
  const dims = LORE_IMG_DIMS[intro.image] ?? { w: 1284, h: 963 };

  return (
    <section className="relative overflow-hidden border-b border-white/[0.08]">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <Image
          src={`/lore/${intro.image}.webp`}
          alt={STRINGS[locale].backdropAlt}
          width={dims.w}
          height={dims.h}
          priority
          className="h-full w-full object-cover object-center opacity-[0.28]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,13,.55),rgba(11,10,13,.35)_45%,#0b0a0d_96%)]" />
        <div className="scanlines-dark pointer-events-none absolute inset-0 opacity-40" />
      </div>

      <div className="ncf-wrap relative z-[2] mx-auto max-w-[1380px] px-[48px] py-[120px]">
        <div className="mb-[18px] flex items-center gap-[14px]">
          <span className="font-mono text-[13px] tracking-[4px] text-hazard">{"// LORE & SETTING"}</span>
          <span className="h-px w-[120px] bg-hazard/40" />
        </div>

        <h1 className="glow-magenta m-0 mb-[28px] max-w-[900px] text-[clamp(38px,6vw,76px)] font-bold uppercase leading-[0.98] tracking-[2px]">
          {intro.lead}
        </h1>

        <p className="m-0 mb-[20px] max-w-[760px] border-l-2 border-hazard pl-5 text-justify text-[16px] leading-[1.75] text-[rgba(245,245,250,.78)]">
          {intro.body}
        </p>

        <p className="m-0 font-mono text-[13px] tracking-[2px] text-cyan">
          {intro.close}
        </p>
      </div>
    </section>
  );
}
