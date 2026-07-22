/**
 * Locale selector for the Skirmish content.
 *
 * - ./content.ts is the PT-BR source of truth (never modified).
 * - ./content.en.ts mirrors every export with the English translation.
 *
 * All logic keys (ids, nums, refs, colors) are identical between the two
 * modules — only human-readable text differs.
 */
import type { Locale } from "@/i18n/config";
import * as ptBR from "./content";
import * as en from "./content.en";

/** Shape of the full Skirmish content module. */
export type SkContent = typeof ptBR;

const CONTENT: Record<Locale, SkContent> = {
	en,
	"pt-BR": ptBR,
};

/** Returns every Skirmish content export for the given locale. */
export function getSkContent(locale: Locale): SkContent {
	return CONTENT[locale] ?? CONTENT.en;
}
