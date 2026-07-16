import { useTranslations } from "next-intl";

/**
 * 01 // THE GAME — two alternating feature rows.
 * Tailwind layout + globals.css utility classes for grids and stripes.
 */
export default function Features() {
  const t = useTranslations("Features");
  return (
    <section id="game" className="ncf-section bg-[#0a090c] py-[104px]">
      <div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">

        {/* Section label */}
        <div className="mb-[56px] flex items-center gap-[14px]">
          <span className="font-mono text-[13px] tracking-[4px] text-cyan">{t("sectionLabel")}</span>
          <span className="h-px flex-1 bg-white/[0.1]" />
        </div>

        {/* ── Feature 1: media left, text right ── */}
        <div className="ncf-feature-row mb-[44px] flex items-stretch gap-[56px]">

          {/* Media */}
          <div className="ncf-feature-media relative h-[340px] shrink-0 basis-[560px] overflow-hidden border border-white/[0.08] bg-[linear-gradient(135deg,#15101b,#0a070d)] clip-media-bl">
            <div className="absolute inset-0 grid-feature-magenta opacity-[0.08]" />
            <div className="absolute left-7 top-6 font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.5)]">
              {t("rosterLabel")}
            </div>
            {/* Roster rows */}
            <div className="absolute bottom-7 left-7 right-7 flex flex-col gap-[10px]">
              {[
                { name: "VEX, THE RUSTSAINT",  level: "230 ¢", leftColor: "#ff2d6f", bg: "linear-gradient(135deg,#ff2d6f,#3a1020)" },
                { name: 'KARRAN-9 "SPLICE"',   level: "185 ¢", leftColor: "#00e5ff", bg: "linear-gradient(135deg,#00e5ff,#0a2a30)" },
                { name: t("recruitRow"),       level: "320 ¢", leftColor: "rgba(255,255,255,.2)", bg: "linear-gradient(135deg,#444,#111)" },
              ].map((row) => (
                <div key={row.name} className="flex items-center gap-3 bg-white/[0.04] px-[14px] py-[11px]"
                  style={{ borderLeft: `2px solid ${row.leftColor}` }}>
                  <span className="h-[30px] w-[30px] shrink-0" style={{ background: row.bg }} />
                  <span className="flex-1 text-[13px] font-semibold">{row.name}</span>
                  <span className="font-mono text-[11px] text-cyan">{row.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="ncf-feature-text flex flex-1 flex-col justify-center">
            <span className="mb-[14px] font-mono text-[13px] tracking-[3px] text-hazard">{t("f1Kicker")}</span>
            <h3 className="ncf-feature-h m-0 mb-4 text-[48px] font-bold leading-none tracking-[1px]">{t("f1Title")}</h3>
            <p className="m-0 mb-[26px] max-w-[460px] text-[17px] leading-[1.65] text-[rgba(245,245,250,.6)]">
              {t("f1Desc")}
            </p>
            <div className="ncf-feature-tags flex flex-wrap gap-[10px]">
              {(t.raw("f1Tags") as string[]).map((tag) => (
                <span key={tag} className="border border-white/[0.14] px-[14px] py-2 font-mono text-xs tracking-[1px] text-[rgba(245,245,250,.7)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Feature 2: media right, text left (row-reverse) ── */}
        <div className="ncf-feature-row flex flex-row-reverse items-stretch gap-[56px]">

          {/* Media */}
          <div className="ncf-feature-media relative h-[340px] shrink-0 basis-[560px] overflow-hidden border border-white/[0.08] bg-[linear-gradient(135deg,#0a1418,#06090d)] clip-media-br">
            {/* Perspective grid */}
            <div
              className="absolute h-[80%] opacity-[0.12] grid-feature-cyan"
              style={{ left: "-20%", right: "-20%", bottom: "-10%" }}
            />
            <div className="absolute left-7 top-6 font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.5)]">
              {t("territoryLabel")}
            </div>
            {/* Radar circle */}
            <div className="absolute left-[30%] top-[42%] h-[90px] w-[90px] rounded-full border border-hazard opacity-50" />
            {/* Sweep arm */}
            <div className="absolute left-[30%] top-[42%] h-[90px] w-[90px]">
              <div
                className="absolute left-1/2 top-1/2 h-px w-[45px] origin-left bg-gradient-to-r from-hazard to-transparent animate-sweep"
              />
            </div>
            {/* Map dots */}
            <div className="absolute right-[60px] top-[90px] h-[14px] w-[14px] bg-hazard shadow-dot-magenta2" />
            <div className="absolute bottom-[80px] right-[120px] h-[10px] w-[10px] bg-cyan shadow-dot-cyan" />
            <div className="absolute bottom-[30px] left-[40px] font-mono text-[11px] tracking-[1px] text-cyan">{t("control")}</div>
          </div>

          {/* Text (right-aligned) */}
          <div className="ncf-feature-text flex flex-1 flex-col items-end justify-center text-right">
            <span className="mb-[14px] font-mono text-[13px] tracking-[3px] text-cyan">{t("f2Kicker")}</span>
            <h3 className="ncf-feature-h m-0 mb-4 text-[48px] font-bold leading-none tracking-[1px]">{t("f2Title")}</h3>
            <p className="m-0 mb-[26px] max-w-[460px] text-[17px] leading-[1.65] text-[rgba(245,245,250,.6)]">
              {t("f2Desc")}
            </p>
            <div className="ncf-feature-tags flex flex-wrap justify-end gap-[10px]">
              {(t.raw("f2Tags") as string[]).map((tag) => (
                <span key={tag} className="border border-white/[0.14] px-[14px] py-2 font-mono text-xs tracking-[1px] text-[rgba(245,245,250,.7)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
