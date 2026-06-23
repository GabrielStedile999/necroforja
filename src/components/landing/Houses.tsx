/**
 * 02 // THE HOUSES — five house cards in a flex row.
 * Tailwind layout + globals.css utility classes.
 */
const HOUSES = [
  { id: "H-01", name: "HOUSE VEX",    tagline: "THE RUSTSAINTS",   desc: "Scrap-priests who bless every blade with rust and prayer.",          role: "ZEALOT",    color: "#ff2d6f", barShadow: "shadow-bar-vex", hoverClass: "ncf-house-card-vex", roleBorder: "rgba(255,45,111,.4)"  },
  { id: "H-02", name: "CLAN KARRAN",  tagline: "THE SPLICE-BORN",  desc: "Gene-smiths trading flesh for chrome and colder nerves.",            role: "CYBERTECH", color: "#00e5ff", barShadow: "shadow-bar-kar", hoverClass: "ncf-house-card-kar", roleBorder: "rgba(0,229,255,.4)"   },
  { id: "H-03", name: "HOUSE GREIL",  tagline: "THE IRONBOUND",    desc: "Foundry lords who march behind walls of welded plate.",              role: "BULWARK",   color: "#ff8a3d", barShadow: "shadow-bar-gre", hoverClass: "ncf-house-card-gre", roleBorder: "rgba(255,138,61,.4)"  },
  { id: "H-04", name: "THE SUMP-BORN",tagline: "TOXIN CULTS",      desc: "Drowned tribes weaponizing the poison that birthed them.",           role: "TOXIN",     color: "#59e36b", barShadow: "shadow-bar-sum", hoverClass: "ncf-house-card-sum", roleBorder: "rgba(89,227,107,.4)"  },
  { id: "H-05", name: "SPIRE EXILES", tagline: "THE DISINHERITED", desc: "Fallen nobility buying back a throne with other men's blood.",       role: "CONTROL",   color: "#b07bff", barShadow: "shadow-bar-spi", hoverClass: "ncf-house-card-spi", roleBorder: "rgba(176,123,255,.4)" },
];

export default function Houses() {
  return (
    <section id="factions" className="ncf-section border-t border-white/[0.06] bg-[#0b0a0d] py-[104px]">
      <div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">

        {/* Header */}
        <div className="ncf-houses-head mb-[14px] flex items-end justify-between gap-6">
          <span className="font-mono text-[13px] tracking-[4px] text-hazard">02 // THE HOUSES</span>
          <span className="ncf-util-link font-mono text-[13px] tracking-[2px] text-[rgba(245,245,250,.6)]">
            COMPARE ALL HOUSES →
          </span>
        </div>

        <h2 className="ncf-section-h m-0 mb-[48px] text-[40px] font-bold tracking-[1px]">
          Five dynasties. One empty throne.
        </h2>

        {/* Cards */}
        <div className="ncf-houses flex items-stretch gap-5">
          {HOUSES.map((h) => (
            <div
              key={h.id}
              className={`ncf-house-card ${h.hoverClass} relative flex-1 cursor-pointer overflow-hidden border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))] clip-card`}
            >
              {/* Colored top bar */}
              <div className={`h-1 ${h.barShadow}`} style={{ background: h.color }} />

              <div className="flex h-[280px] flex-col px-[22px] pb-[26px] pt-6">
                <div className="mb-[18px] font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.4)]">
                  {h.id}
                </div>
                <div className="text-[22px] font-bold tracking-[0.5px]">{h.name}</div>
                <div className="mb-4 mt-1 font-mono text-xs tracking-[1px]" style={{ color: h.color }}>
                  {h.tagline}
                </div>
                <p className="m-0 flex-1 text-[13px] leading-[1.6] text-[rgba(245,245,250,.58)]">
                  {h.desc}
                </p>
                <div className="mt-[18px] flex items-center justify-between">
                  <span
                    className="px-[11px] py-1.5 font-mono text-[11px] tracking-[1px]"
                    style={{ border: `1px solid ${h.roleBorder}`, color: h.color }}
                  >
                    {h.role}
                  </span>
                  <span className="text-[18px]" style={{ color: h.color }}>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
