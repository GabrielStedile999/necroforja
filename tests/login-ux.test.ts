import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Issues #54 e #55 — UX de login:
 * - #54: chaves i18n do toggle de senha existem e têm paridade en/pt-BR
 *   (os aria-labels dinâmicos do PasswordInput dependem delas);
 * - #55: o domínio-padrão do seed é @player.necroforja e o literal antigo
 *   @campaign.local não sobrevive em código nem docs (contas de produção
 *   existentes ficam fora de escopo — só o padrão de novas contas muda).
 */

const read = (path: string) => readFileSync(path, "utf-8");

describe("password toggle i18n (issue #54)", () => {
	const login = (locale: string) =>
		(JSON.parse(read(`messages/${locale}.json`)) as Record<string, Record<string, string>>)
			.Login ?? {};

	it("showPassword/hidePassword exist in both locales", () => {
		for (const locale of ["en", "pt-BR"]) {
			const keys = login(locale);
			expect(keys.showPassword, `${locale}.showPassword`).toBeTruthy();
			expect(keys.hidePassword, `${locale}.hidePassword`).toBeTruthy();
		}
	});

	it("en and pt-BR Login namespaces share the same keys", () => {
		expect(Object.keys(login("pt-BR")).sort()).toEqual(Object.keys(login("en")).sort());
	});

	it("PasswordInput keeps autoComplete untouched in LoginForm", () => {
		const form = read("src/components/auth/LoginForm.tsx");
		expect(form).toContain('autoComplete="current-password"');
		expect(form).toContain("PasswordInput");
	});
});

describe("default login domain (issue #55)", () => {
	it("seed uses @player.necroforja for generated players", () => {
		const seed = read("src/lib/db/seed.ts");
		expect(seed).toContain("@player.necroforja");
		expect(seed).not.toContain("@campaign.local");
	});

	it("docs no longer reference @campaign.local", () => {
		const docs = read("docs/PROJECT_CONTEXT.md");
		expect(docs).toContain("@player.necroforja");
		expect(docs).not.toContain("@campaign.local");
	});
});
