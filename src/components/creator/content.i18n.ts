/**
 * Locale selector for the Creator page content.
 *
 * - ./content.ts is the PT-BR source of truth (never modified).
 * - ./content.en.ts mirrors every export with the English translation.
 */
import type { Locale } from "@/i18n/config";
import * as ptBR from "./content";
import * as en from "./content.en";

/** Shape of the full Creator content module. */
export type CreatorContent = typeof ptBR;

const CONTENT: Record<Locale, CreatorContent> = {
	en,
	"pt-BR": ptBR,
};

/** Returns every Creator content export for the given locale. */
export function getCreatorContent(locale: Locale): CreatorContent {
	return CONTENT[locale] ?? CONTENT.en;
}
