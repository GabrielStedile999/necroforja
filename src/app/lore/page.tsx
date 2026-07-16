import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import LoreHero from "@/components/lore/LoreHero";
import LoreNav from "@/components/lore/LoreNav";
import LoreChapter from "@/components/lore/LoreChapter";
import LoreCTA from "@/components/lore/LoreCTA";
import { getLoreChapters, toLocale } from "@/components/lore/content.i18n";

/**
 * Lore & Setting — introdução ao cenário de Necromunda (issue #9).
 *
 * Conteúdo estruturado a partir do documento de lore da campanha:
 * o Império, a anatomia de uma cidade colmeia (interativa), as colmeias
 * de Necromunda, os Desertos de Cinzas e as Casas. Texto selecionado por
 * locale (issue #12): EN é o padrão, PT-BR preserva o documento original.
 */
export const metadata: Metadata = {
  title: "Lore & Setting",
  description:
    "An introduction to the setting of Necromunda: the Imperium, the hive worlds, the underhive, the Ash Wastes and the Houses that fight over the Underhive.",
  alternates: { canonical: "/lore" },
  openGraph: {
    title: "Lore & Setting · NecroForja",
    description:
      "Welcome to Necromunda. Get to know the hive world, the Underhive and the Houses before forging your gang.",
  },
};

export default async function LorePage() {
  const locale = toLocale(await getLocale());
  const chapters = getLoreChapters(locale);

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
        <LoreNav chapters={chapters.map(({ id, num, title, accent }) => ({ id, num, title, accent }))} />

        {chapters.map((chapter) => (
          <LoreChapter key={chapter.id} chapter={chapter} />
        ))}

        <LoreCTA />
      </main>

      <SiteFooter />
    </div>
  );
}
