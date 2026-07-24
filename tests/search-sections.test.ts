import { describe, expect, it } from "vitest";
import { filterSections, SEARCHABLE_SECTIONS } from "@/lib/search/sections";

/** In-page section search index (issue #15 follow-up — search by location). */

describe("filterSections", () => {
	it("returns nothing for an empty query", () => {
		expect(filterSections("")).toEqual([]);
		expect(filterSections("   ")).toEqual([]);
	});

	it("matches a house name and points at the gangs page anchor", () => {
		const results = filterSections("escher");
		expect(results).toHaveLength(1);
		expect(results[0]).toMatchObject({
			href: "/gangs#house-escher",
			pageTitleEn: "Gangs & Houses",
		});
	});

	it("matches a how-to-play section regardless of accents/case", () => {
		const results = filterSections("COMBATE");
		expect(results.some((s) => s.href === "/how-to-play#combate")).toBe(true);
	});

	it("matches the other locale's title too", () => {
		const results = filterSections("referência rápida");
		expect(results.some((s) => s.href === "/how-to-play#referencia")).toBe(true);
	});

	it("matches a lore chapter", () => {
		const results = filterSections("Ash Wastes");
		expect(results.some((s) => s.href === "/lore#ermos")).toBe(true);
	});

	it("returns an empty array when nothing matches", () => {
		expect(filterSections("xyz-does-not-exist")).toEqual([]);
	});

	it("every section has a unique id and an href with a page anchor", () => {
		const ids = new Set(SEARCHABLE_SECTIONS.map((s) => s.id));
		expect(ids.size).toBe(SEARCHABLE_SECTIONS.length);
		for (const section of SEARCHABLE_SECTIONS) {
			expect(section.href).toMatch(/^\/[a-z-]+#[a-z0-9-]+$/);
		}
	});
});
