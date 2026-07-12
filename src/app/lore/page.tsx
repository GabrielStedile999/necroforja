import type { Metadata } from "next";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import LoreHero from "@/components/lore/LoreHero";
import LoreNav from "@/components/lore/LoreNav";
import LoreChapter from "@/components/lore/LoreChapter";
import LoreCTA from "@/components/lore/LoreCTA";
import { LORE_CHAPTERS } from "@/components/lore/content";

/**
 * Lore & Setting — introdução ao cenário de Necromunda (issue #9).
 *
 * Conteúdo estruturado a partir do documento de lore da campanha:
 * o Império, a anatomia de uma cidade colmeia (interativa), as colmeias
 * de Necromunda, os Desertos de Cinzas e as Casas.
 */
export const metadata: Metadata = {
  title: "Lore & Setting",
  description:
    "Introdução ao cenário de Necromunda: o Império, os mundos colmeia, a sub-colmeia, os Desertos de Cinzas e as Casas que disputam o Underhive.",
  alternates: { canonical: "/lore" },
  openGraph: {
    title: "Lore & Setting · NecroForja",
    description:
      "Bem-vindo a Necromunda. Conheça o mundo colmeia, o Underhive e as Casas antes de forjar sua gangue.",
  },
};

export default function LorePage() {
  return (
    <div
      className="relative w-full overflow-x-clip text-ink"
      style={{
        background: "#0b0a0d",
        backgroundImage:
          "radial-gradient(1400px 700px at 25% -10%,rgba(255,45,111,.07),transparent),radial-gradient(1200px 700px at 95% 6%,rgba(0,229,255,.05),transparent)",
        fontFamily: "'Chakra Petch', sans-serif",
      }}
    >
      <Ticker />
      <SiteNav />

      <main>
        <LoreHero />
        <LoreNav chapters={LORE_CHAPTERS.map(({ id, num, title, accent }) => ({ id, num, title, accent }))} />

        {LORE_CHAPTERS.map((chapter) => (
          <LoreChapter key={chapter.id} chapter={chapter} />
        ))}

        <LoreCTA />
      </main>

      <SiteFooter />
    </div>
  );
}
