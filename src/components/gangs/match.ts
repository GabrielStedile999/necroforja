// Ligações entre o texto livre `gang.house` do banco e o catálogo da página
// de Gangues (issue #8). Módulo puro (sem React) para ser testável no vitest.
//
// Cores, slugs e matchers são chaves de lógica idênticas entre locales, então
// importar do módulo PT-BR é seguro (issue #12).

import { GANG_GROUPS, HOUSE_DOSSIERS, HOUSE_MATCHERS } from "./content";

/** Identidade visual (cor + sombra) por slug do catálogo. */
export const IDENTITY_BY_SLUG: Record<string, { color: string; shadow: string }> =
	Object.fromEntries([
		...HOUSE_DOSSIERS.map((d) => [d.slug, { color: d.color, shadow: d.shadow }] as const),
		...GANG_GROUPS.flatMap((g) => g.gangs).map(
			(g) => [g.slug, { color: g.color, shadow: g.shadow }] as const,
		),
	]);

/** Liga o texto livre `gang.house` do banco a um card do catálogo (ou null). */
export function matchHouseSlug(house: string): string | null {
	const needle = house.toLowerCase();
	for (const [slug, keywords] of Object.entries(HOUSE_MATCHERS)) {
		if (keywords.some((k) => needle.includes(k))) return slug;
	}
	return null;
}
