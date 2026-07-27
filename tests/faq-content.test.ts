import { describe, expect, it } from "vitest";
import * as ptBR from "@/components/faq/content";
import * as en from "@/components/faq/content.en";

/**
 * FAQ content (issue #41):
 * - locale parity: every logic key (ids, nums, accents) must be identical
 *   between content.ts (PT-BR) and content.en.ts;
 * - chapters (one per group) must match the groups — they feed the LoreNav
 *   anchors and the search section index;
 * - the brand-disambiguation answer (issue #47) must be present.
 */

describe("faq content locale parity", () => {
	it("chapters share ids, nums and accents", () => {
		expect(en.FAQ_CHAPTERS.map(({ id, num, accent }) => ({ id, num, accent }))).toEqual(
			ptBR.FAQ_CHAPTERS.map(({ id, num, accent }) => ({ id, num, accent })),
		);
	});

	it("faq groups share ids and item ids", () => {
		const logicKeys = (g: ptBR.FaqGroup) => ({
			id: g.id,
			items: g.items.map(({ id }) => id),
		});
		expect(en.FAQ_GROUPS.map(logicKeys)).toEqual(ptBR.FAQ_GROUPS.map(logicKeys));
	});

	it("hero intro shares the backdrop image", () => {
		expect(en.FAQ_INTRO.image).toBe(ptBR.FAQ_INTRO.image);
	});
});

describe("faq content integrity", () => {
	it("chapters map 1:1 to the question groups (LoreNav/search anchors)", () => {
		expect(ptBR.FAQ_CHAPTERS.map((c) => c.id)).toEqual(ptBR.FAQ_GROUPS.map((g) => g.id));
	});

	it("faq item ids are unique across groups", () => {
		const ids = ptBR.FAQ_GROUPS.flatMap((g) => g.items.map((i) => i.id));
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("every question and answer is non-trivial in both locales", () => {
		for (const content of [ptBR, en]) {
			for (const group of content.FAQ_GROUPS) {
				for (const item of group.items) {
					expect(item.question.length).toBeGreaterThan(5);
					expect(item.answer.length).toBeGreaterThan(20);
				}
			}
		}
	});

	it("the brand-disambiguation answer states NecroForja is not a store (issue #47)", () => {
		const enAnswer = en.FAQ_GROUPS.flatMap((g) => g.items).find((i) => i.id === "loja");
		expect(enAnswer?.answer).toContain("not a store");
		expect(enAnswer?.answer).toContain("NecroForge");
	});
});
