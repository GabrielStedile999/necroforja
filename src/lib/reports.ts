/**
 * Pure helpers for the campaign journal (issue #5) — no DB access, unit-testable.
 */
import type { Locale } from "@/i18n/config";

/** The bilingual text columns of a post row (subset of schema.posts). */
export type PostText = {
	titleEn: string;
	titlePt: string;
	excerptEn: string;
	excerptPt: string;
	bodyEn: string;
	bodyPt: string;
};

/**
 * Picks title/excerpt/body for the display locale, falling back to the other
 * language when a field is empty (posts may be drafted in one language first).
 */
export function pickPostText(
	post: PostText,
	locale: Locale,
): { title: string; excerpt: string; body: string } {
	const pt = locale === "pt-BR";
	return {
		title: (pt ? post.titlePt : post.titleEn) || post.titleEn || post.titlePt,
		excerpt:
			(pt ? post.excerptPt : post.excerptEn) || post.excerptEn || post.excerptPt,
		body: (pt ? post.bodyPt : post.bodyEn) || post.bodyEn || post.bodyPt,
	};
}

/** Formats a date in the site's mono style: 2026.07.17 (UTC-safe). */
export function formatPostDate(date: Date | null | undefined): string {
	if (!date) return "—";
	const y = date.getUTCFullYear();
	const m = String(date.getUTCMonth() + 1).padStart(2, "0");
	const d = String(date.getUTCDate()).padStart(2, "0");
	return `${y}.${m}.${d}`;
}

/** Derives a URL-safe slug from a title (logic keys in English, issue #12). */
export function slugify(title: string): string {
	return title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // strip combining diacritics
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "")
		.slice(0, 80);
}
