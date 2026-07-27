import { describe, expect, it } from "vitest";
import * as ptBR from "@/components/creator/content";
import * as en from "@/components/creator/content.en";

/**
 * Creator page content (issue #39 follow-up):
 * - locale parity: every logic key (ids) must be identical between
 *   content.ts (PT-BR) and content.en.ts;
 * - the bio must stay non-trivial in both locales.
 */

describe("creator content locale parity", () => {
	it("bio paragraphs share ids and order", () => {
		expect(en.CREATOR_PARAGRAPHS.map(({ id }) => id)).toEqual(
			ptBR.CREATOR_PARAGRAPHS.map(({ id }) => id),
		);
	});

	it("facts share ids and order", () => {
		expect(en.CREATOR_FACTS.map(({ id }) => id)).toEqual(ptBR.CREATOR_FACTS.map(({ id }) => id));
	});

	it("both locales expose the same link keys", () => {
		expect(Object.keys(en.CREATOR_LINKS)).toEqual(Object.keys(ptBR.CREATOR_LINKS));
	});
});

describe("creator content integrity", () => {
	it("paragraph ids are unique", () => {
		const ids = ptBR.CREATOR_PARAGRAPHS.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("every paragraph is non-trivial in both locales", () => {
		for (const content of [ptBR, en]) {
			for (const paragraph of content.CREATOR_PARAGRAPHS) {
				expect(paragraph.text.length).toBeGreaterThan(40);
			}
		}
	});

	it("the bio mentions Necromunda and the current gangs", () => {
		const full = ptBR.CREATOR_PARAGRAPHS.map((p) => p.text).join(" ");
		expect(full).toContain("Necromunda");
		for (const gang of ["Delaque", "Goliath", "Van Saar"]) {
			expect(full).toContain(gang);
		}
	});
});
