/**
 * Locale selector for the Campaign Custom Rules content.
 *
 * - ./content.ts is the PT-BR source of truth (never modified).
 * - ./content.en.ts mirrors every export with the English translation.
 *
 * All logic keys (ids, nums, accents) are identical between the two modules —
 * only human-readable text differs.
 */
import type { Locale } from "@/i18n/config";
import * as ptBR from "./content";
import * as en from "./content.en";

/** Shape of the full Custom Rules content module. */
export type HrContent = typeof ptBR;

const CONTENT: Record<Locale, HrContent> = {
	en,
	"pt-BR": ptBR,
};

/** Returns every Custom Rules content export for the given locale. */
export function getHrContent(locale: Locale): HrContent {
	return CONTENT[locale] ?? CONTENT.en;
}
