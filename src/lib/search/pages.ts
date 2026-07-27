/**
 * Static site-page index for the site search (issue #15).
 *
 * Pure data + a pure filter function — no DB access, unit-testable. Kept in
 * sync manually as new public pages are added (issues #7, #8, #9…).
 */
import type { Locale } from "@/i18n/config";

export type SearchablePage = {
	/** Stable id — also used as the React key. */
	id: string;
	href: string;
	titleEn: string;
	titlePt: string;
	/** Extra terms that should match even if absent from the title (en/pt). */
	keywordsEn: string;
	keywordsPt: string;
};

export const SEARCHABLE_PAGES: SearchablePage[] = [
	{
		id: "home",
		href: "/",
		titleEn: "Home",
		titlePt: "Início",
		keywordsEn: "landing overview",
		keywordsPt: "página inicial visão geral",
	},
	{
		id: "how-to-play",
		href: "/how-to-play",
		titleEn: "How to Play",
		titlePt: "Como Jogar",
		keywordsEn: "rules basics getting started tutorial",
		keywordsPt: "regras básico começar tutorial",
	},
	{
		id: "lore",
		href: "/lore",
		titleEn: "Lore & Setting",
		titlePt: "Lore & Cenário",
		keywordsEn: "world setting story background Aranthian Succession Cinderak Burning",
		keywordsPt: "mundo cenário história fundo Aranthian Succession Cinderak Burning",
	},
	{
		id: "gangs",
		href: "/gangs",
		titleEn: "Gangs & Houses",
		titlePt: "Gangues & Casas",
		keywordsEn:
			"factions house cawdor delaque escher goliath orlock van saar compare",
		keywordsPt:
			"facções casa cawdor delaque escher goliath orlock van saar comparar",
	},
	{
		id: "campaign",
		href: "/campaign",
		titleEn: "Campaign Mode",
		titlePt: "Modo Campanha",
		keywordsEn: "game mode long-form territory",
		keywordsPt: "modo de jogo território longa duração",
	},
	{
		id: "skirmish",
		href: "/skirmish",
		titleEn: "Skirmish Mode",
		titlePt: "Modo Skirmish",
		keywordsEn: "game mode one-off standalone",
		keywordsPt: "modo de jogo partida avulsa",
	},
	{
		id: "faq",
		href: "/faq",
		titleEn: "FAQ",
		titlePt: "FAQ",
		keywordsEn: "questions answers frequently asked help",
		keywordsPt: "perguntas respostas frequentes ajuda dúvidas",
	},
	{
		id: "house-rules",
		href: "/house-rules",
		titleEn: "Campaign Custom Rules",
		titlePt: "Custom Rules da Campanha",
		keywordsEn: "house rules infiltrate hidden deployment custom skill",
		keywordsPt: "regras da casa infiltrate hidden deployment skill custom",
	},
	{
		id: "reports",
		href: "/reports",
		titleEn: "Campaign Journal",
		titlePt: "Jornal de Campanha",
		keywordsEn: "blog news reports posts",
		keywordsPt: "blog notícias relatórios posts",
	},
	{
		id: "gallery",
		href: "/gallery",
		titleEn: "Gallery",
		titlePt: "Galeria",
		keywordsEn: "photos miniatures battle reports images",
		keywordsPt: "fotos miniaturas batalhas imagens",
	},
	{
		id: "dashboard",
		href: "/dashboard",
		titleEn: "Public Dashboard",
		titlePt: "Dashboard Público",
		keywordsEn: "rankings standings gangs live",
		keywordsPt: "ranking classificação gangues ao vivo",
	},
];

/** Case/accent-insensitive normalization for matching. */
export function normalizeForSearch(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

/**
 * Filters the static page index by a free-text query, matching against the
 * display-locale title, the other locale's title (so switching language
 * doesn't break search) and the locale's keywords.
 */
export function filterPages(query: string, locale: Locale): SearchablePage[] {
	const q = normalizeForSearch(query.trim());
	if (!q) return [];

	return SEARCHABLE_PAGES.filter((page) => {
		const haystack = normalizeForSearch(
			[
				page.titleEn,
				page.titlePt,
				locale === "pt-BR" ? page.keywordsPt : page.keywordsEn,
			].join(" "),
		);
		return haystack.includes(q);
	});
}
