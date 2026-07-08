import Link from "next/link";

/**
 * Site footer — Tailwind-only, no inline styles.
 */
const LINK_GROUPS = [
  {
    heading: "GAME",
    links: [
      { label: "Overview",  href: "/" },
      { label: "Factions",  href: "#factions" },
      { label: "Roadmap",   href: "/" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    heading: "COMMUNITY",
    links: [
      { label: "Discord",  href: "/" },
      { label: "News",     href: "/" },
      { label: "Creators", href: "/" },
      { label: "Forums",   href: "/" },
    ],
  },
  {
    heading: "SUPPORT",
    links: [
      { label: "Help",    href: "/" },
      { label: "Status",  href: "/" },
      { label: "Contact", href: "/" },
      { label: "Account", href: "/login" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="ncf-section border-t border-white/[0.08] bg-[#070609] pt-[72px] pb-[44px]">
      <div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
        {/* Main columns */}
        <div className="mb-[52px] flex flex-wrap justify-between gap-[40px]">

          {/* Brand */}
          <div className="basis-[320px] shrink-0">
            <div className="mb-4 flex items-center gap-[10px]">
              <span className="text-hazard text-[20px]">◣</span>
              <span className="font-bold tracking-[5px] text-[17px]">NECROFORJA</span>
            </div>
            <p className="m-0 max-w-[260px] text-[13px] leading-[1.6] text-[rgba(245,245,250,.45)]">
              Tales of Necromunda — The Aranthian Succession. A tabletop war of miniatures, dice and paint for the underhive.
            </p>
          </div>

          {/* Link groups */}
          <div className="ncf-footer-links flex flex-wrap gap-[72px] font-mono">
            {LINK_GROUPS.map((group) => (
              <div key={group.heading}>
                <div className="mb-4 text-xs tracking-[2px] text-[rgba(245,245,250,.4)]">
                  {group.heading}
                </div>
                <div className="flex flex-col gap-[11px] text-[13px] text-[rgba(245,245,250,.65)]">
                  {group.links.map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="ncf-util-link no-underline text-[rgba(245,245,250,.65)]"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-[14px] border-t border-white/[0.07] pt-[26px] font-mono text-[11px] tracking-[1px] text-[rgba(245,245,250,.35)]">
          <span>© 2026 NECROFORJA — FAN-MADE CONCEPT. NOT AFFILIATED WITH GAMES WORKSHOP.</span>
          <div className="flex gap-[18px]">
            <span className="cursor-pointer">PRIVACY</span>
            <span className="cursor-pointer">TERMS</span>
            <span>◈ ◇ ◆</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
