import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { avatarAccent, getInitials } from "@/lib/avatar";

/**
 * Issue #40 — área de usuário logado (UserMenu):
 * - helpers do avatar por iniciais são determinísticos (mesma entrada,
 *   mesmas iniciais e mesma cor em qualquer render);
 * - paridade de locales: o namespace UserMenu tem as mesmas chaves em
 *   en.json e pt-BR.json (mesmo padrão dos testes de conteúdo).
 */

describe("avatar initials", () => {
	it("uses first + last name initials", () => {
		expect(getInitials("Gabriel Stedile")).toBe("GS");
		expect(getInitials("Kal Jerico Sump-King")).toBe("KS");
	});

	it("single-word names use the first two letters", () => {
		expect(getInitials("Kal")).toBe("KA");
	});

	it("trims and survives extra whitespace", () => {
		expect(getInitials("  Gabriel   Stedile  ")).toBe("GS");
	});

	it("keeps accented characters", () => {
		expect(getInitials("Álvaro único")).toBe("ÁÚ");
	});

	it("falls back to ? on empty input", () => {
		expect(getInitials("")).toBe("?");
		expect(getInitials("   ")).toBe("?");
	});
});

describe("avatar accent", () => {
	it("is deterministic for the same seed", () => {
		expect(avatarAccent("Gabriel Stedile")).toEqual(avatarAccent("Gabriel Stedile"));
	});

	it("returns a complete accent (color/bg/border/shadow)", () => {
		const accent = avatarAccent("any seed");
		expect(accent.color).toMatch(/^#[0-9a-f]{6}$/i);
		expect(accent.bg).toMatch(/^rgba\(/);
		expect(accent.border).toMatch(/^rgba\(/);
		expect(accent.shadow).toMatch(/^rgba\(/);
	});

	it("spreads different seeds across the palette", () => {
		const seeds = ["a", "bb", "ccc", "dddd", "eeeee", "ffffff", "g", "hh"];
		const colors = new Set(seeds.map((s) => avatarAccent(s).color));
		expect(colors.size).toBeGreaterThan(1);
	});
});

describe("UserMenu i18n locale parity", () => {
	const load = (locale: string) =>
		JSON.parse(readFileSync(`messages/${locale}.json`, "utf-8")) as Record<
			string,
			Record<string, string>
		>;

	it("en and pt-BR expose the same UserMenu keys", () => {
		const en = load("en").UserMenu ?? {};
		const ptBR = load("pt-BR").UserMenu ?? {};
		expect(Object.keys(en).length).toBeGreaterThan(0);
		expect(Object.keys(ptBR).sort()).toEqual(Object.keys(en).sort());
	});

	it("keys used by the component exist", () => {
		const en = { UserMenu: load("en").UserMenu ?? {} };
		for (const key of [
			"openMenu",
			"roleAdmin",
			"rolePlayer",
			"dashboard",
			"myGang",
			"adminArea",
			"signOut",
		]) {
			expect(en.UserMenu[key], key).toBeTruthy();
		}
	});
});
