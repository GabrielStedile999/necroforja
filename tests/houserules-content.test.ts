import { describe, expect, it } from "vitest";
import * as ptBR from "@/components/houserules/content";
import * as en from "@/components/houserules/content.en";

/**
 * Campaign Custom Rules content (issue #41):
 * - locale parity: every logic key (ids, nums, accents) must be identical
 *   between content.ts (PT-BR) and content.en.ts;
 * - the house rule from the issue body must be present with all clauses;
 * - chapters derive from the rules — they feed the LoreNav anchors and the
 *   search section index.
 */

describe("house rules content locale parity", () => {
	it("rules share ids, nums, accents and clause ids", () => {
		const logicKeys = (r: ptBR.HouseRule) => ({
			id: r.id,
			num: r.num,
			accent: r.accent,
			title: r.title,
			clauses: r.clauses.map(({ id }) => id),
		});
		expect(en.HOUSE_RULES.map(logicKeys)).toEqual(ptBR.HOUSE_RULES.map(logicKeys));
	});

	it("chapters share ids, nums and accents", () => {
		expect(en.HR_CHAPTERS.map(({ id, num, accent }) => ({ id, num, accent }))).toEqual(
			ptBR.HR_CHAPTERS.map(({ id, num, accent }) => ({ id, num, accent })),
		);
	});

	it("hero intro shares the backdrop image", () => {
		expect(en.HR_INTRO.image).toBe(ptBR.HR_INTRO.image);
	});
});

describe("house rules content integrity", () => {
	it("chapters map 1:1 to the rules (LoreNav/search anchors)", () => {
		expect(ptBR.HR_CHAPTERS.map((c) => c.id)).toEqual(ptBR.HOUSE_RULES.map((r) => r.id));
	});

	it("rule ids are unique", () => {
		const ids = ptBR.HOUSE_RULES.map((r) => r.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("includes the Infiltrate & Hidden Deployment rule with its 5 clauses", () => {
		for (const content of [ptBR, en]) {
			const rule = content.HOUSE_RULES.find((r) => r.id === "infiltrate-hidden-deployment");
			expect(rule).toBeDefined();
			expect(rule?.title).toBe("Infiltrate & Hidden Deployment");
			expect(rule?.clauses.map((c) => c.id)).toEqual([
				"limite",
				"advanced-assault",
				"posicionamento",
				"objetivos",
				"armas",
			]);
		}
	});

	it("every clause has a label and non-trivial text in both locales", () => {
		for (const content of [ptBR, en]) {
			for (const rule of content.HOUSE_RULES) {
				for (const clause of rule.clauses) {
					expect(clause.label.length).toBeGreaterThan(2);
					expect(clause.text.length).toBeGreaterThan(20);
				}
			}
		}
	});
});
