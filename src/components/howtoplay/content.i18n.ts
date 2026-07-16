/**
 * Locale selector for the How to Play content.
 *
 * - ./content.ts is the PT-BR source of truth (never modified).
 * - ./content.en.ts mirrors every export with the English translation.
 *
 * All logic keys (ids, nums, refs, colors, srcs) are identical between the
 * two modules — only human-readable text differs.
 */
import type { Locale } from "@/i18n/config";
import * as ptBR from "./content";
import * as en from "./content.en";

/** Shape of the full How to Play content module. */
export type HtpContent = typeof ptBR;

const CONTENT: Record<Locale, HtpContent> = {
	en,
	"pt-BR": ptBR,
};

/** Returns every How to Play content export for the given locale. */
export function getHtpContent(locale: Locale): HtpContent {
	return CONTENT[locale] ?? CONTENT.en;
}
