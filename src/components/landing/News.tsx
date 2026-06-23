/**
 * 03 // DISPATCHES — three static news rows.
 * Tailwind layout + globals.css stripe utilities.
 */
const DISPATCHES = [
  {
    tag: "PATCH 1.4",  tagColor: "text-hazard",  date: "2026.06.18",
    title: "The Sump Sea Expansion",
    summary: "A new toxic biome, two gangs, and a reworked loot economy hit the underhive.",
    thumbBg: "bg-[linear-gradient(135deg,#1a1320,#0a0810)]",
    thumbStripe: "stripe-thumb-magenta",
    borderBottom: false,
  },
  {
    tag: "DEV DIARY",  tagColor: "text-cyan",     date: "2026.06.11",
    title: "Rebuilding Territory Control",
    summary: "How we tore down zone capture and rebuilt it around live, shifting front lines.",
    thumbBg: "bg-[linear-gradient(135deg,#0a1418,#06090d)]",
    thumbStripe: "stripe-thumb-cyan",
    borderBottom: false,
  },
  {
    tag: "SEASON",     tagColor: "text-hazard",  date: "2026.06.02",
    title: "Season 2: The Aranthian Succession",
    summary: "The spire throne is empty. Five Houses. One hive. Claim it.",
    thumbBg: "bg-[linear-gradient(135deg,#16101b,#0a070d)]",
    thumbStripe: "stripe-thumb-magenta-16",
    borderBottom: true,
  },
];

export default function News() {
  return (
    <section className="ncf-section border-t border-white/[0.06] bg-[#0a090c] py-[96px]">
      <div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">

        {/* Header */}
        <div className="ncf-houses-head mb-[44px] flex items-end justify-between gap-4">
          <span className="font-mono text-[13px] tracking-[4px] text-hazard">03 // DISPATCHES</span>
          <span className="ncf-util-link font-mono text-[13px] tracking-[2px] text-[rgba(245,245,250,.7)]">
            READ ALL DISPATCHES →
          </span>
        </div>

        <div className="flex flex-col">
          {DISPATCHES.map((d, i) => (
            <div
              key={i}
              className={`
                ncf-news-row ncf-news-row-item
                flex items-center gap-7 px-2 py-6
                border-t border-white/[0.09]
                ${d.borderBottom ? "border-b border-white/[0.09]" : ""}
              `}
            >
              {/* Tag + date */}
              <div className="w-[130px] shrink-0 font-mono">
                <div className={`text-xs tracking-[1px] ${d.tagColor}`}>{d.tag}</div>
                <div className="mt-1 text-xs text-[rgba(245,245,250,.4)]">{d.date}</div>
              </div>

              {/* Thumbnail */}
              <div className={`ncf-news-thumb relative h-[84px] w-[160px] shrink-0 overflow-hidden border border-white/[0.08] ${d.thumbBg}`}>
                <div className={`absolute inset-0 ${d.thumbStripe}`} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="ncf-news-text-h mb-1.5 text-[25px] font-bold tracking-[0.5px]">{d.title}</div>
                <div className="text-[14px] leading-[1.55] text-[rgba(245,245,250,.55)]">{d.summary}</div>
              </div>

              {/* Arrow */}
              <span className="ncf-news-arrow text-[22px] text-hazard">→</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
