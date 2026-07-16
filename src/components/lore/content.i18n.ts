// Locale selector for the lore content (issue #12).
//
// content.ts holds the PT-BR source of truth; content.en.ts mirrors it in
// English. Everything here selects by display locale only — ids and other
// logic keys are identical across locales and always stay in English.

import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import {
	LORE_CHAPTERS as LORE_CHAPTERS_PT_BR,
	LORE_INTRO as LORE_INTRO_PT_BR,
	type LoreChapter,
} from "./content";
import {
	LORE_CHAPTERS as LORE_CHAPTERS_EN,
	LORE_INTRO as LORE_INTRO_EN,
} from "./content.en";

/** Narrows the (string) locale reported by next-intl to a supported Locale. */
export function toLocale(value: string): Locale {
	return isLocale(value) ? value : defaultLocale;
}

/** Hero flavor text for the given locale. */
export function getLoreIntro(locale: Locale): typeof LORE_INTRO_PT_BR {
	return locale === "pt-BR" ? LORE_INTRO_PT_BR : LORE_INTRO_EN;
}

/** Full chapter tree for the given locale (same ids/structure in both). */
export function getLoreChapters(locale: Locale): LoreChapter[] {
	return locale === "pt-BR" ? LORE_CHAPTERS_PT_BR : LORE_CHAPTERS_EN;
}

/** Convenience selector returning all per-locale lore exports at once. */
export function getLoreContent(locale: Locale): {
	intro: typeof LORE_INTRO_PT_BR;
	chapters: LoreChapter[];
} {
	return { intro: getLoreIntro(locale), chapters: getLoreChapters(locale) };
}
