import Link from "next/link";

/**
 * "ENTER THE UNDERHIVE" — full-width call-to-action strip.
 * Tailwind layout + globals.css stripe/grid utilities.
 */
export default function BigCTA() {
  return (
    <section className="ncf-section relative overflow-hidden border-t border-white/[0.06] py-[130px] text-center bg-[radial-gradient(120%_140%_at_50%_120%,#1c0e18,#08070a_70%)]">

      {/* Diagonal stripe top bar */}
      <div className="absolute left-0 right-0 top-0 h-1.5 opacity-80 stripe-hazard-top" />

      {/* Perspective grid floor */}
      <div
        className="absolute bottom-0 opacity-[0.12] grid-cta animate-grid-cta"
        style={{ left: "-10%", right: "-10%", height: "60%" }}
      />

      <div className="ncf-wrap relative z-[2] mx-auto max-w-[1380px] px-[48px]">
        <div className="mb-[22px] font-mono text-[13px] tracking-[6px] text-hazard">
          FREE TO PLAY · PC · CONSOLE · CLOUD
        </div>

        <h2 className="ncf-cta-h text-glow-cta m-0 mb-[30px] text-[clamp(48px,7vw,92px)] font-bold leading-[0.95] tracking-[2px]">
          ENTER THE UNDERHIVE
        </h2>

        <div className="flex flex-wrap justify-center gap-[18px]">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-[46px] py-[18px] text-[18px] font-bold tracking-[3px] text-[#0a0a0c] bg-hazard cursor-pointer no-underline clip-btn-72 shadow-cta-magenta-lg transition-[filter] hover:brightness-[1.12]"
          >
            PLAY NOW
          </Link>

          <div className="inline-flex cursor-pointer items-center border border-white/[0.22] px-[42px] py-[18px] text-[18px] font-semibold tracking-[3px] text-ink transition-[border-color] hover:border-cyan">
            + WISHLIST
          </div>
        </div>
      </div>
    </section>
  );
}
