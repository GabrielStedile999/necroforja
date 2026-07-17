/**
 * Locale selector for the Gangs page content (issue #8).
 *
 * - ./content.ts is the PT-BR source of truth (never modified).
 * - ./content.en.ts mirrors every export with the English translation.
 *
 * All logic keys (ids, slugs, nums, colors, matchers) are identical between
 * the two modules — only human-readable text differs. Same pattern as the
 * How to Play content (issue #7).
 */
import type { Locale } from "@/i18n/config";
import * as ptBR from "./content";
import * as en from "./content.en";

/** Shape of the full Gangs content module. */
export type GangsContent = typeof ptBR;

const CONTENT: Record<Locale, GangsContent> = {
	en,
	"pt-BR": ptBR,
};

/** Returns every Gangs content export for the given locale. */
export function getGangsContent(locale: Locale): GangsContent {
	return CONTENT[locale] ?? CONTENT.en;
}
