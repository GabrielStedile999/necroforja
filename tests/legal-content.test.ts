import { describe, expect, it } from "vitest";
import * as ptBR from "@/components/legal/content";
import * as en from "@/components/legal/content.en";

/**
 * Legal pages content (issue #39 follow-up):
 * - locale parity: section ids must be identical between content.ts (PT-BR)
 *   and content.en.ts, for both documents;
 * - the documents must reflect the project's real nature (non-commercial fan
 *   project, GW disclaimer, LGPD rights).
 */

describe("legal content locale parity", () => {
	it("privacy sections share ids and order", () => {
		expect(en.PRIVACY.sections.map(({ id }) => id)).toEqual(
			ptBR.PRIVACY.sections.map(({ id }) => id),
		);
	});

	it("terms sections share ids and order", () => {
		expect(en.TERMS.sections.map(({ id }) => id)).toEqual(ptBR.TERMS.sections.map(({ id }) => id));
	});
});

describe("legal content integrity", () => {
	it("section ids are unique within each document", () => {
		for (const doc of [ptBR.PRIVACY, ptBR.TERMS]) {
			const ids = doc.sections.map((s) => s.id);
			expect(new Set(ids).size).toBe(ids.length);
		}
	});

	it("every section has non-trivial paragraphs in both locales", () => {
		for (const content of [ptBR, en]) {
			for (const doc of [content.PRIVACY, content.TERMS]) {
				expect(doc.intro.length).toBeGreaterThan(40);
				for (const section of doc.sections) {
					expect(section.paragraphs.length).toBeGreaterThan(0);
					for (const paragraph of section.paragraphs) {
						expect(paragraph.length).toBeGreaterThan(40);
					}
				}
			}
		}
	});

	it("privacy covers LGPD rights and cookies", () => {
		const ids = ptBR.PRIVACY.sections.map((s) => s.id);
		expect(ids).toContain("direitos");
		expect(ids).toContain("cookies");
		const direitos = en.PRIVACY.sections.find((s) => s.id === "direitos");
		expect(direitos?.paragraphs.join(" ")).toContain("LGPD");
	});

	it("terms keep the Games Workshop fan-project disclaimer", () => {
		const gw = en.TERMS.sections.find((s) => s.id === "pi-gw");
		expect(gw?.paragraphs.join(" ")).toContain("Games Workshop");
		expect(gw?.paragraphs.join(" ")).toContain("unofficial");
	});

	it("neither document exposes a contact e-mail address", () => {
		for (const content of [ptBR, en]) {
			const everything = JSON.stringify(content);
			expect(everything).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
		}
	});
});
