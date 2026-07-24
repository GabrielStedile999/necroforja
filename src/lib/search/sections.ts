/**
 * Static index of in-page sections (issue #15 follow-up) — lets search
 * results point at the exact chapter/anchor a term lives in, not just the
 * page as a whole. Every entry's `id` is a real DOM anchor already rendered
 * by the corresponding page (Chapter/LoreChapter components render
 * `id={id}` with a `scroll-mt-*` offset for the sticky nav), so a plain
 * `href="/page#id"` link — client or full navigation — lands right on it.
 *
 * Titles here mirror the pages' own copy (PAGE_STRINGS in how-to-play/
 * skirmish/campaign's page.tsx, HTP_CHAPTERS/LORE_CHAPTERS content
 * modules, the house roster in SiteNav) rather than being derived
 * automatically, since several of those are page-local constants, not
 * exports. If a page's section titles change, update the matching entry
 * here too — pure data, no DB/component coupling.
 */

export type SearchableSection = {
	id: string;
	href: string;
	/** Name of the page this section lives on (shown as the result's subtitle). */
	pageTitleEn: string;
	pageTitlePt: string;
	titleEn: string;
	titlePt: string;
};

const GANGS_HOUSES: { id: string; nameEn: string; namePt: string }[] = [
	{ id: "house-cawdor", nameEn: "House Cawdor", namePt: "House Cawdor" },
	{ id: "house-delaque", nameEn: "House Delaque", namePt: "House Delaque" },
	{ id: "house-escher", nameEn: "House Escher", namePt: "House Escher" },
	{ id: "house-goliath", nameEn: "House Goliath", namePt: "House Goliath" },
	{ id: "house-orlock", nameEn: "House Orlock", namePt: "House Orlock" },
	{ id: "house-van-saar", nameEn: "House Van Saar", namePt: "House Van Saar" },
];

const HOW_TO_PLAY_SECTIONS = [
	{ id: "pre-battle", titleEn: "Pre-battle sequence", titlePt: "Pre-battle sequence" },
	{ id: "battle-round", titleEn: "Battle round", titlePt: "Battle round" },
	{ id: "combate", titleEn: "Combat", titlePt: "Combate" },
	{ id: "post-battle", titleEn: "Post-battle sequence", titlePt: "Post-battle sequence" },
	{ id: "referencia", titleEn: "Quick reference", titlePt: "Referência rápida" },
];

const SKIRMISH_SECTIONS = [
	{ id: "comparativo", titleEn: "Skirmish vs Campaign", titlePt: "Skirmish x Campaign" },
	{ id: "monte-a-gangue", titleEn: "Build your gang", titlePt: "Monte sua gangue" },
	{
		id: "o-que-muda",
		titleEn: "What changes in the sequence",
		titlePt: "O que muda na sequência",
	},
	{ id: "quando-jogar", titleEn: "When to play it", titlePt: "Quando jogar" },
];

const CAMPAIGN_SECTIONS = [
	{ id: "ciclo", titleEn: "The campaign cycle", titlePt: "O ciclo da campanha" },
	{ id: "territorios", titleEn: "Territories & Boons", titlePt: "Territórios & Boons" },
	{ id: "triunfos", titleEn: "Triumphs", titlePt: "Triunfos" },
	{
		id: "aranthian-succession",
		titleEn: "The Aranthian Succession",
		titlePt: "The Aranthian Succession",
	},
];

const LORE_SECTIONS = [
	{ id: "imperio", titleEn: "Empire Among the Stars", titlePt: "Império nas Estrelas" },
	{ id: "anatomia", titleEn: "Anatomy of a Hive City", titlePt: "Anatomia de uma Cidade Colmeia" },
	{ id: "cidades", titleEn: "Hive Cities of Necromunda", titlePt: "Cidades Colmeia de Necromunda" },
	{ id: "ermos", titleEn: "The Ash Wastes", titlePt: "Os Desertos de Cinzas" },
	{ id: "casas", titleEn: "The Houses of Necromunda", titlePt: "As Casas de Necromunda" },
];

const PAGES = [
	{ href: "/gangs", titleEn: "Gangs & Houses", titlePt: "Gangues & Casas" },
	{ href: "/how-to-play", titleEn: "How to Play", titlePt: "Como Jogar" },
	{ href: "/skirmish", titleEn: "Skirmish Mode", titlePt: "Modo Skirmish" },
	{ href: "/campaign", titleEn: "Campaign Mode", titlePt: "Modo Campanha" },
	{ href: "/lore", titleEn: "Lore & Setting", titlePt: "Lore & Cenário" },
] as const;

const [GANGS_PAGE, HTP_PAGE, SKIRMISH_PAGE, CAMPAIGN_PAGE, LORE_PAGE] = PAGES;

export const SEARCHABLE_SECTIONS: SearchableSection[] = [
	...GANGS_HOUSES.map((h) => ({
		id: `gangs-${h.id}`,
		href: `${GANGS_PAGE.href}#${h.id}`,
		pageTitleEn: GANGS_PAGE.titleEn,
		pageTitlePt: GANGS_PAGE.titlePt,
		titleEn: h.nameEn,
		titlePt: h.namePt,
	})),
	...HOW_TO_PLAY_SECTIONS.map((s) => ({
		id: `htp-${s.id}`,
		href: `${HTP_PAGE.href}#${s.id}`,
		pageTitleEn: HTP_PAGE.titleEn,
		pageTitlePt: HTP_PAGE.titlePt,
		titleEn: s.titleEn,
		titlePt: s.titlePt,
	})),
	...SKIRMISH_SECTIONS.map((s) => ({
		id: `skirmish-${s.id}`,
		href: `${SKIRMISH_PAGE.href}#${s.id}`,
		pageTitleEn: SKIRMISH_PAGE.titleEn,
		pageTitlePt: SKIRMISH_PAGE.titlePt,
		titleEn: s.titleEn,
		titlePt: s.titlePt,
	})),
	...CAMPAIGN_SECTIONS.map((s) => ({
		id: `campaign-${s.id}`,
		href: `${CAMPAIGN_PAGE.href}#${s.id}`,
		pageTitleEn: CAMPAIGN_PAGE.titleEn,
		pageTitlePt: CAMPAIGN_PAGE.titlePt,
		titleEn: s.titleEn,
		titlePt: s.titlePt,
	})),
	...LORE_SECTIONS.map((s) => ({
		id: `lore-${s.id}`,
		href: `${LORE_PAGE.href}#${s.id}`,
		pageTitleEn: LORE_PAGE.titleEn,
		pageTitlePt: LORE_PAGE.titlePt,
		titleEn: s.titleEn,
		titlePt: s.titlePt,
	})),
];

/** Same normalization as `lib/search/pages.ts` (case/accent-insensitive). */
function normalize(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

/**
 * Filters the section index by a free-text query, matching either locale's
 * title at once (no `locale` param needed here — unlike `filterPages`, every
 * entry's title is matched regardless of display locale; the caller picks
 * which one to *show* separately).
 */
export function filterSections(query: string): SearchableSection[] {
	const q = normalize(query.trim());
	if (!q) return [];

	return SEARCHABLE_SECTIONS.filter((section) => {
		const haystack = normalize(`${section.titleEn} ${section.titlePt}`);
		return haystack.includes(q);
	});
}
