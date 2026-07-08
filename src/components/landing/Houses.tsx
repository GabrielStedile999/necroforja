/**
 * 02 // THE GANGS — Necromunda factions in four grouped rows.
 * Tailwind layout + globals.css utility classes.
 */
type Gang = {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  role: string;
  color: string;
  roleBorder: string;
};

type GangGroup = {
  subtitle: string;
  accent: string;
  gangs: Gang[];
};

const GROUPS: GangGroup[] = [
  {
    subtitle: "THE GREAT HOUSES",
    accent: "#ff2d6f",
    gangs: [
      { id: "GH-01", name: "HOUSE CAWDOR",   tagline: "FAITH & FIRE",       desc: "Religious fanatics fielding hordes with improvised weapons and cleansing flame. Includes the Redemptionists.", role: "ZEALOT",    color: "#ffc23d", roleBorder: "rgba(255,194,61,.4)"  },
      { id: "GH-02", name: "HOUSE DELAQUE",  tagline: "THE SHADOW HOUSE",   desc: "Espionage, infiltration, psychological control and mind-bending Psychoteric powers.",                       role: "INFILTRATE", color: "#b07bff", roleBorder: "rgba(176,123,255,.4)" },
      { id: "GH-03", name: "HOUSE ESCHER",   tagline: "BLADES & VENOM",     desc: "Speed, poisons, toxins and generations of genetic craft.",                                                   role: "TOXIN",     color: "#ff2d6f", roleBorder: "rgba(255,45,111,.4)"  },
      { id: "GH-04", name: "HOUSE GOLIATH",  tagline: "THE FORGE TYRANTS",  desc: "Brute strength, stimm-fuelled resilience and bio-engineered muscle.",                                        role: "BRAWN",     color: "#ff8a3d", roleBorder: "rgba(255,138,61,.4)"  },
      { id: "GH-05", name: "HOUSE ORLOCK",   tagline: "HOUSE OF IRON",      desc: "Versatile fighters, dependable firearms and a life lived on the road.",                                      role: "VERSATILE", color: "#59e36b", roleBorder: "rgba(89,227,107,.4)"  },
      { id: "GH-06", name: "HOUSE VAN SAAR", tagline: "THE ARCHTEKS",       desc: "Advanced technology, superior marksmanship and energy weaponry.",                                            role: "TECH",      color: "#00e5ff", roleBorder: "rgba(0,229,255,.4)"   },
    ],
  },
  {
    subtitle: "INDEPENDENT GANGS & CULTS",
    accent: "#00e5ff",
    gangs: [
      { id: "IG-01", name: "CORPSE GRINDER CULTS", tagline: "THE BUTCHERS",        desc: "Blood-crazed cultists of Khorne devoted to savage close combat.",                                                        role: "MELEE",    color: "#ff2d6f", roleBorder: "rgba(255,45,111,.4)"  },
      { id: "IG-02", name: "PALANITE ENFORCERS",   tagline: "THE HIVE'S LAW",      desc: "Necromunda's paramilitary police force, armed to keep order by any means.",                                              role: "LAW",      color: "#00e5ff", roleBorder: "rgba(0,229,255,.4)"   },
      { id: "IG-03", name: "SLAVE OGRYN GANGS",    tagline: "THE UNSHACKLED",      desc: "Escaped ogryns risen in revolt against their former masters.",                                                           role: "BRUTE",    color: "#ff8a3d", roleBorder: "rgba(255,138,61,.4)"  },
      { id: "IG-04", name: "HELOT CHAOS CULTS",    tagline: "THE CORRUPTED",       desc: "Generic Chaos cults that can represent followers of any of the Dark Gods.",                                              role: "CHAOS",    color: "#b07bff", roleBorder: "rgba(176,123,255,.4)" },
      { id: "IG-05", name: "GENESTEALER CULTS",    tagline: "THE HIDDEN BROOD",    desc: "Traditional Genestealer cults spreading quietly beneath the hive.",                                                      role: "XENOS",    color: "#59e36b", roleBorder: "rgba(89,227,107,.4)"  },
      { id: "IG-06", name: "VENATOR GANGS",        tagline: "BOUNTY HUNTERS",      desc: "Fully customizable hunter bands — humans, Squats, Ogryns, Beastmen and Ratlings since the 2025 update.",                 role: "HUNTER",   color: "#ffc23d", roleBorder: "rgba(255,194,61,.4)"  },
      { id: "IG-07", name: "UNDERHIVE OUTCASTS",   tagline: "THE FORGOTTEN",       desc: "The most open gang in the game: outlaws, mutants, wyrds, guilders, fallen nobles — almost any concept you can imagine.", role: "WILDCARD", color: "#c9c9d4", roleBorder: "rgba(201,201,212,.4)" },
    ],
  },
  {
    subtitle: "ASH WASTES GANGS",
    accent: "#ff8a3d",
    gangs: [
      { id: "AW-01", name: "ASH WASTE NOMADS",           tagline: "RIDERS OF THE WASTES", desc: "Native nomads of the wastelands: stealth, ambushes, giant insects and total mastery of the terrain. Expanded through 2025.", role: "AMBUSH",  color: "#59e36b", roleBorder: "rgba(89,227,107,.4)" },
      { id: "AW-02", name: "IRONHEAD SQUAT PROSPECTORS", tagline: "THE MINING CLANS",     desc: "Hardy Squat miners with industrial firepower and superb tech, heavily expanded in Halls of the Ancients.",                  role: "DURABLE", color: "#ff8a3d", roleBorder: "rgba(255,138,61,.4)" },
    ],
  },
  {
    subtitle: "HIVE SECUNDUS GANGS",
    accent: "#b07bff",
    gangs: [
      { id: "HS-01", name: "SPYRER HUNTING PARTY", tagline: "THE NOBLE HUNT",   desc: "Ultra-rich nobles in Hunting Rigs. Very few models, extremely powerful, growing through their own Terror Level mechanic.",              role: "ELITE", color: "#00e5ff", roleBorder: "rgba(0,229,255,.4)"  },
      { id: "HS-02", name: "MALSTRAIN GANG",       tagline: "THE TWISTED BROOD", desc: "The mutant Genestealers of Hive Secundus: hordes of Brood Scum backed by terrifying monsters, built for the Underhells.",             role: "HORDE", color: "#ff2d6f", roleBorder: "rgba(255,45,111,.4)" },
    ],
  },
];

export default function Houses() {
  return (
    <section id="factions" className="ncf-section border-t border-white/[0.06] bg-[#0b0a0d] py-[104px]">
      <div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">

        {/* Header */}
        <div className="ncf-houses-head mb-[14px] flex items-end justify-between gap-6">
          <span className="font-mono text-[13px] tracking-[4px] text-hazard">02 // THE GANGS</span>
          <span className="ncf-util-link font-mono text-[13px] tracking-[2px] text-[rgba(245,245,250,.6)]">
            COMPARE ALL GANGS →
          </span>
        </div>

        <h2 className="ncf-section-h m-0 mb-[48px] text-[40px] font-bold tracking-[1px]">
          Many gangs. One dying world. No one rules forever.
        </h2>

        {/* Grouped rows */}
        {GROUPS.map((group) => (
          <div key={group.subtitle} className="mb-[48px] last:mb-0">

            {/* Group subtitle */}
            <div className="mb-[22px] flex items-center gap-[14px]">
              <span className="h-px w-[34px]" style={{ background: group.accent }} />
              <span className="font-mono text-[12px] tracking-[4px]" style={{ color: group.accent }}>
                {group.subtitle}
              </span>
              <span className="h-px flex-1 bg-white/[0.08]" />
              <span className="font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.35)]">
                {String(group.gangs.length).padStart(2, "0")} GANGS
              </span>
            </div>

            {/* Cards */}
            <div className="ncf-houses grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
              {group.gangs.map((g) => (
                <div
                  key={g.id}
                  className="ncf-house-card relative cursor-pointer overflow-hidden border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))] clip-card"
                >
                  {/* Colored top bar */}
                  <div className="h-1" style={{ background: g.color, boxShadow: `0 0 12px ${g.roleBorder}` }} />

                  <div className="flex min-h-[280px] flex-col px-[22px] pb-[26px] pt-6">
                    <div className="mb-[18px] font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.4)]">
                      {g.id}
                    </div>
                    <div className="text-[20px] font-bold tracking-[0.5px] leading-[1.1]">{g.name}</div>
                    <div className="mb-4 mt-1 font-mono text-xs tracking-[1px]" style={{ color: g.color }}>
                      {g.tagline}
                    </div>
                    <p className="m-0 flex-1 text-[13px] leading-[1.6] text-[rgba(245,245,250,.58)]">
                      {g.desc}
                    </p>
                    <div className="mt-[18px] flex items-center justify-between">
                      <span
                        className="px-[11px] py-1.5 font-mono text-[11px] tracking-[1px]"
                        style={{ border: `1px solid ${g.roleBorder}`, color: g.color }}
                      >
                        {g.role}
                      </span>
                      <span className="text-[18px]" style={{ color: g.color }}>→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
