/**
 * Locale selector for the Contact page content.
 *
 * - ./content.ts is the PT-BR source of truth (never modified).
 * - ./content.en.ts mirrors every export with the English translation.
 */
import type { Locale } from "@/i18n/config";
import * as ptBR from "./content";
import * as en from "./content.en";

/** Shape of the full Contact content module. */
export type ContactContent = typeof ptBR;

const CONTENT: Record<Locale, ContactContent> = {
	en,
	"pt-BR": ptBR,
};

/** Returns every Contact content export for the given locale. */
export function getContactContent(locale: Locale): ContactContent {
	return CONTENT[locale] ?? CONTENT.en;
}
