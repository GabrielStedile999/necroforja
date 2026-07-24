import { describe, expect, it } from "vitest";
import { filterPages, normalizeForSearch, SEARCHABLE_PAGES } from "@/lib/search/pages";

/** Static site-page search index (issue #15). */

describe("normalizeForSearch", () => {
	it("lowercases and strips accents", () => {
		expect(normalizeForSearch("Lore & Cenário")).toBe("lore & cenario");
		expect(normalizeForSearch("SKIRMISH")).toBe("skirmish");
	});
});

describe("filterPages", () => {
	it("returns nothing for an empty query", () => {
		expect(filterPages("", "en")).toEqual([]);
		expect(filterPages("   ", "en")).toEqual([]);
	});

	it("matches by title in the display locale, case/accent-insensitively", () => {
		const results = filterPages("como jogar", "pt-BR");
		expect(results.map((p) => p.id)).toContain("how-to-play");
	});

	it("matches the other locale's title too (switching language mid-search)", () => {
		const results = filterPages("how to play", "pt-BR");
		expect(results.map((p) => p.id)).toContain("how-to-play");
	});

	it("matches by locale-specific keywords", () => {
		const resultsEn = filterPages("Cinderak Burning", "en");
		expect(resultsEn.map((p) => p.id)).toContain("lore");

		const resultsPt = filterPages("facções", "pt-BR");
		expect(resultsPt.map((p) => p.id)).toContain("gangs");
	});

	it("returns an empty array when nothing matches", () => {
		expect(filterPages("xyz-does-not-exist", "en")).toEqual([]);
	});

	it("every page has a unique id and an href starting with /", () => {
		const ids = new Set(SEARCHABLE_PAGES.map((p) => p.id));
		expect(ids.size).toBe(SEARCHABLE_PAGES.length);
		for (const page of SEARCHABLE_PAGES) {
			expect(page.href.startsWith("/")).toBe(true);
		}
	});
});
