/**
 * Gallery helpers (issues #6/#24) — pure functions shared by the admin
 * upload flow, the public page and the unit tests.
 *
 * Object organisation in the `gallery` bucket:
 *   <category>/<slug>-<rand6>.<ext>      e.g. battle/goliath-ambush-k3f9a2.webp
 *
 * The category prefix keeps the bucket browsable in the Supabase dashboard;
 * the random suffix avoids collisions and cache-busts re-uploads (objects are
 * served with `Cache-Control: immutable`).
 */
import type { Locale } from "@/i18n/config";
import { slugify } from "@/lib/reports";
import type { GalleryCategory } from "@/lib/validation";

/** File extension for each accepted MIME type. */
const EXT_BY_MIME: Record<string, string> = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/webp": "webp",
	"image/gif": "gif",
};

/** Random lowercase base36 suffix (no Math.random typing woes in tests). */
export function randomSuffix(length = 6, rng: () => number = Math.random): string {
	const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
	let out = "";
	for (let i = 0; i < length; i++) {
		out += alphabet[Math.floor(rng() * alphabet.length) % alphabet.length];
	}
	return out;
}

/**
 * Builds the object path for a new gallery upload.
 * The original filename only contributes a human-readable slug — it is never
 * trusted as-is (no traversal, no unicode, no extension spoofing).
 */
export function buildGalleryObjectPath(
	category: GalleryCategory,
	originalFilename: string,
	mime: string,
	rng?: () => number,
): string {
	const ext = EXT_BY_MIME[mime];
	if (!ext) throw new Error(`Unsupported MIME type: ${mime}`);
	const base = slugify(originalFilename.replace(/\.[^.]+$/, "")).slice(0, 60) || "image";
	return `${category}/${base}-${randomSuffix(6, rng)}.${ext}`;
}

/** Row shape the public grid needs (locale already resolved server-side). */
export type GalleryItem = {
	id: string;
	url: string;
	category: GalleryCategory;
	tags: string[];
	alt: string;
	caption: string;
	/** Who painted the minis (issue #52) — "" when not informed. */
	author: string;
	/** Rating aggregates via ISR (issue #52) — null avg when nobody voted. */
	ratingAvg: number | null;
	ratingCount: number;
	width: number;
	height: number;
};

/**
 * Formats an average rating for display (issue #52): one decimal, always
 * shown ("4.0", not "4") so the scale is obvious next to the star glyph.
 */
export function formatRatingAvg(avg: number): string {
	return (Math.round(avg * 10) / 10).toFixed(1);
}

/** Picks the locale variant with graceful fallback to English. */
export function pickGalleryText(
	row: { altEn: string; altPt: string; captionEn: string; captionPt: string },
	locale: Locale,
): { alt: string; caption: string } {
	const pt = locale === "pt-BR";
	return {
		alt: (pt ? row.altPt : row.altEn) || row.altEn,
		caption: (pt ? row.captionPt : row.captionEn) || row.captionEn,
	};
}
