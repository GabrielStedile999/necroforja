/**
 * Locale selector for the legal pages content (Privacy & Terms).
 *
 * - ./content.ts is the PT-BR source of truth (never modified).
 * - ./content.en.ts mirrors every export with the English translation.
 */
import type { Locale } from "@/i18n/config";
import * as ptBR from "./content";
import * as en from "./content.en";

/** Shape of the full legal content module. */
export type LegalContent = typeof ptBR;

const CONTENT: Record<Locale, LegalContent> = {
	en,
	"pt-BR": ptBR,
};

/** Returns every legal content export for the given locale. */
export function getLegalContent(locale: Locale): LegalContent {
	return CONTENT[locale] ?? CONTENT.en;
}
