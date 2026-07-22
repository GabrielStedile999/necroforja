/**
 * Locale selector for the Campaign content.
 *
 * - ./content.ts is the PT-BR source of truth (never modified).
 * - ./content.en.ts mirrors every export with the English translation.
 *
 * All logic keys (ids, nums, cards, houses) are identical between the two
 * modules — only human-readable text differs.
 */
import type { Locale } from "@/i18n/config";
import * as ptBR from "./content";
import * as en from "./content.en";

/** Shape of the full Campaign content module. */
export type CpContent = typeof ptBR;

const CONTENT: Record<Locale, CpContent> = {
	en,
	"pt-BR": ptBR,
};

/** Returns every Campaign content export for the given locale. */
export function getCpContent(locale: Locale): CpContent {
	return CONTENT[locale] ?? CONTENT.en;
}
