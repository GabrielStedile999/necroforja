import Link from "next/link";
import { useTranslations } from "next-intl";

/**
 * 02 // THE GANGS — Necromunda factions in four grouped rows.
 * Tailwind layout + globals.css utility classes.
 *
 * i18n (issue #12): structural data (ids, names, roles, colors) is
 * canonical English; display copy (taglines, descriptions, headings)
 * is looked up in messages/<locale>.json keyed by the stable gang id.
 *
 * Each card links to its anchor on the dedicated Gangs page (issue #8);
 * slugs mirror src/components/gangs/content.ts.
 */
type Gang = {
  id: string;
  slug: string;
  name: string;
  role: string;
  color: string;
  roleBorder: string;
};

type GangGroup = {
  key: string;
  accent: string;
  gangs: Gang[];
};

const GROUPS: GangGroup[] = [
  {
    key: "greatHouses",
    accent: "#ff2d6f",
    gangs: [
      { id: "GH-01", slug: "house-cawdor",   name: "HOUSE CAWDOR",   role: "ZEALOT",    color: "#ffc23d", roleBorder: "rgba(255,194,61,.4)"  },
      { id: "GH-02", slug: "house-delaque",  name: "HOUSE DELAQUE",  role: "INFILTRATE", color: "#b07bff", roleBorder: "rgba(176,123,255,.4)" },
      { id: "GH-03", slug: "house-escher",   name: "HOUSE ESCHER",   role: "TOXIN",     color: "#ff2d6f", roleBorder: "rgba(255,45,111,.4)"  },
      { id: "GH-04", slug: "house-goliath",  name: "HOUSE GOLIATH",  role: "BRAWN",     color: "#ff8a3d", roleBorder: "rgba(255,138,61,.4)"  },
      { id: "GH-05", slug: "house-orlock",   name: "HOUSE ORLOCK",   role: "VERSATILE", color: "#59e36b", roleBorder: "rgba(89,227,107,.4)"  },
      { id: "GH-06", slug: "house-van-saar", name: "HOUSE VAN SAAR", role: "TECH",      color: "#00e5ff", roleBorder: "rgba(0,229,255,.4)"   },
    ],
  },
  {
    key: "independent",
    accent: "#00e5ff",
    gangs: [
      { id: "IG-01", slug: "corpse-grinder-cults", name: "CORPSE GRINDER CULTS", role: "MELEE",    color: "#ff2d6f", roleBorder: "rgba(255,45,111,.4)"  },
      { id: "IG-02", slug: "palanite-enforcers",   name: "PALANITE ENFORCERS",   role: "LAW",      color: "#00e5ff", roleBorder: "rgba(0,229,255,.4)"   },
      { id: "IG-03", slug: "slave-ogryn",          name: "SLAVE OGRYN GANGS",    role: "BRUTE",    color: "#ff8a3d", roleBorder: "rgba(255,138,61,.4)"  },
      { id: "IG-04", slug: "helot-chaos",          name: "HELOT CHAOS CULTS",    role: "CHAOS",    color: "#b07bff", roleBorder: "rgba(176,123,255,.4)" },
      { id: "IG-05", slug: "genestealer-cults",    name: "GENESTEALER CULTS",    role: "XENOS",    color: "#59e36b", roleBorder: "rgba(89,227,107,.4)"  },
      { id: "IG-06", slug: "venators",             name: "VENATOR GANGS",        role: "HUNTER",   color: "#ffc23d", roleBorder: "rgba(255,194,61,.4)"  },
      { id: "IG-07", slug: "underhive-outcasts",   name: "UNDERHIVE OUTCASTS",   role: "WILDCARD", color: "#c9c9d4", roleBorder: "rgba(201,201,212,.4)" },
    ],
  },
  {
    key: "ashWastes",
    accent: "#ff8a3d",
    gangs: [
      { id: "AW-01", slug: "ash-waste-nomads", name: "ASH WASTE NOMADS",           role: "AMBUSH",  color: "#59e36b", roleBorder: "rgba(89,227,107,.4)" },
      { id: "AW-02", slug: "ironhead-squats",  name: "IRONHEAD SQUAT PROSPECTORS", role: "DURABLE", color: "#ff8a3d", roleBorder: "rgba(255,138,61,.4)" },
    ],
  },
  {
    key: "hiveSecundus",
    accent: "#b07bff",
    gangs: [
      { id: "HS-01", slug: "spyrers",   name: "SPYRER HUNTING PARTY", role: "ELITE", color: "#00e5ff", roleBorder: "rgba(0,229,255,.4)"  },
      { id: "HS-02", slug: "malstrain", name: "MALSTRAIN GANG",       role: "HORDE", color: "#ff2d6f", roleBorder: "rgba(255,45,111,.4)" },
    ],
  },
];

export default function Houses() {
  const t = useTranslations("Gangs");

  return (
    <section id="factions" className="ncf-section border-t border-white/[0.06] bg-[#0b0a0d] py-[104px]">
      <div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">

        {/* Header */}
        <div className="ncf-houses-head mb-[14px] flex items-end justify-between gap-6">
          <span className="font-mono text-[13px] tracking-[4px] text-hazard">{t("sectionLabel")}</span>
          <Link
            href="/gangs"
            className="ncf-util-link font-mono text-[13px] tracking-[2px] text-[rgba(245,245,250,.6)] no-underline"
          >
            {t("compareAll")}
          </Link>
        </div>

        <h2 className="ncf-section-h m-0 mb-[48px] text-[40px] font-bold tracking-[1px]">
          {t("heading")}
        </h2>

        {/* Grouped rows */}
        {GROUPS.map((group) => (
          <div key={group.key} className="mb-[48px] last:mb-0">

            {/* Group subtitle */}
            <div className="mb-[22px] flex items-center gap-[14px]">
              <span className="h-px w-[34px]" style={{ background: group.accent }} />
              <span className="font-mono text-[12px] tracking-[4px]" style={{ color: group.accent }}>
                {t(`groups.${group.key}`)}
              </span>
              <span className="h-px flex-1 bg-white/[0.08]" />
              <span className="font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.35)]">
                {String(group.gangs.length).padStart(2, "0")} {t("countSuffix")}
              </span>
            </div>

            {/* Cards */}
            <div className="ncf-houses grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
              {group.gangs.map((g) => (
                <Link
                  key={g.id}
                  href={`/gangs#${g.slug}`}
                  className="ncf-house-card relative cursor-pointer overflow-hidden border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))] clip-card no-underline text-ink"
                >
                  {/* Colored top bar */}
                  <div className="h-1" style={{ background: g.color, boxShadow: `0 0 12px ${g.roleBorder}` }} />

                  <div className="flex min-h-[280px] flex-col px-[22px] pb-[26px] pt-6">
                    <div className="mb-[18px] font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.4)]">
                      {g.id}
                    </div>
                    <div className="text-[20px] font-bold tracking-[0.5px] leading-[1.1]">{g.name}</div>
                    <div className="mb-4 mt-1 font-mono text-xs tracking-[1px]" style={{ color: g.color }}>
                      {t(`cards.${g.id}.tagline`)}
                    </div>
                    <p className="m-0 flex-1 text-[13px] leading-[1.6] text-[rgba(245,245,250,.58)]">
                      {t(`cards.${g.id}.desc`)}
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
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
