/**
 * i18n config — single source of truth for supported locales.
 *
 * Rules (issue #12):
 * - Default is ALWAYS English. No browser/Accept-Language detection.
 * - pt-BR is a display-only translation layer for the front end.
 * - All logic, database values and identifiers stay in English.
 */
export const locales = ["en", "pt-BR"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that persists the user's explicit language choice. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string): value is Locale {
	return (locales as readonly string[]).includes(value);
}
