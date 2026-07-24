/**
 * Pure helper for highlighting the matched search term inside a result's
 * title/excerpt (issue #15). No DOM/React dependency — the component wraps
 * "match" segments in <mark>.
 */
import { normalizeForSearch } from "./pages";

export type TextSegment = { text: string; match: boolean };

/**
 * Splits `text` into segments, marking the (case/accent-insensitive) ranges
 * that match `query`. Returns the whole text as a single non-matching
 * segment when the query is empty or not found — safe to render unchanged.
 */
export function splitByMatch(text: string, query: string): TextSegment[] {
	const q = query.trim();
	if (!q) return [{ text, match: false }];

	const normalizedText = normalizeForSearch(text);
	const normalizedQuery = normalizeForSearch(q);
	if (normalizedText.length !== text.length) {
		// Accent-stripping changed the length (rare with combining marks) —
		// bail out to a safe, unhighlighted render rather than risk a
		// misaligned slice.
		return [{ text, match: false }];
	}

	const segments: TextSegment[] = [];
	let cursor = 0;

	while (cursor < text.length) {
		const idx = normalizedText.indexOf(normalizedQuery, cursor);
		if (idx === -1) {
			segments.push({ text: text.slice(cursor), match: false });
			break;
		}
		if (idx > cursor) {
			segments.push({ text: text.slice(cursor, idx), match: false });
		}
		segments.push({ text: text.slice(idx, idx + normalizedQuery.length), match: true });
		cursor = idx + normalizedQuery.length;
	}

	return segments.length ? segments : [{ text, match: false }];
}
