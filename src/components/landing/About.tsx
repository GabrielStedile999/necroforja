import Link from "next/link";
import { useTranslations } from "next-intl";
import { SITE_REPO_URL } from "@/lib/seo/json-ld";

/**
 * 05 // WHAT IS NECROFORJA — texto "sobre" indexável (issue #47).
 *
 * A landing era visualmente pesada mas rasa em texto descritivo, e o AI
 * Overview do Google preenchia a lacuna com conteúdo de terceiros (confusão
 * com a marca de miniaturas "NecroForge"). Esta seção dá ao crawler 3
 * parágrafos claros e citáveis dizendo o que a NecroForja é — um gerenciador
 * digital de campanha — e o que não é (uma loja de miniaturas).
 *
 * Texto puro + 2 links (repo público e FAQ): nenhum asset novo, custo zero
 * de performance (issues #42/#46).
 */
export default function About() {
  const t = useTranslations("About");

  return (
    <section id="about" className="ncf-section border-t border-white/[0.06] py-[96px]">
      <div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
        {/* Section label — <h2> real (issue #42), mantendo o visual de label. */}
        <div className="mb-[44px] flex items-center gap-[14px]">
          <h2 className="m-0 font-mono text-[13px] font-normal tracking-[4px] text-toxic">
            {t("sectionLabel")}
          </h2>
          <span className="h-px flex-1 bg-white/[0.1]" />
        </div>

        <h3 className="m-0 mb-6 max-w-[820px] text-[clamp(24px,3vw,34px)] font-bold uppercase leading-[1.1] tracking-[1px]">
          {t("title")}
        </h3>

        <div className="flex max-w-[820px] flex-col gap-4">
          <p className="m-0 text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.7)]">
            {t("p1")}
          </p>
          <p className="m-0 text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.7)]">
            {t("p2")}
          </p>
          <p className="m-0 text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.7)]">
            {t("p3")}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-6 font-mono text-[13px] tracking-[2px]">
          <a
            href={SITE_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ncf-util-link text-[rgba(245,245,250,.7)] no-underline"
          >
            {t("repoLink")}
          </a>
          <Link href="/faq" className="ncf-util-link text-[rgba(245,245,250,.7)] no-underline">
            {t("faqLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}
