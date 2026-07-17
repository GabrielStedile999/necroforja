import { describe, expect, it } from "vitest";
import * as ptBR from "@/components/gangs/content";
import * as en from "@/components/gangs/content.en";
import { IDENTITY_BY_SLUG, matchHouseSlug } from "@/components/gangs/match";

/**
 * Gangs page content (issue #8):
 * - locale parity: every logic key (ids, slugs, nums, colors, matchers) must
 *   be identical between content.ts (PT-BR) and content.en.ts;
 * - matchHouseSlug: the free-text `gang.house` column must resolve to the
 *   right catalogue card for the values used by the campaign seed.
 */

describe("gangs content locale parity", () => {
	it("chapters share ids, nums and accents", () => {
		expect(en.GANGS_CHAPTERS.map(({ id, num, accent }) => ({ id, num, accent }))).toEqual(
			ptBR.GANGS_CHAPTERS.map(({ id, num, accent }) => ({ id, num, accent })),
		);
	});

	it("house dossiers share slugs, codes, colors and images", () => {
		const logicKeys = (d: ptBR.HouseDossier) => ({
			slug: d.slug,
			code: d.code,
			name: d.name,
			role: d.role,
			color: d.color,
			image: d.image,
			imgW: d.imgW,
			imgH: d.imgH,
		});
		expect(en.HOUSE_DOSSIERS.map(logicKeys)).toEqual(ptBR.HOUSE_DOSSIERS.map(logicKeys));
	});

	it("gang groups share ids and gang slugs/codes/colors", () => {
		const logicKeys = (g: ptBR.GangGroup) => ({
			id: g.id,
			num: g.num,
			accent: g.accent,
			gangs: g.gangs.map(({ slug, code, name, role, color }) => ({ slug, code, name, role, color })),
		});
		expect(en.GANG_GROUPS.map(logicKeys)).toEqual(ptBR.GANG_GROUPS.map(logicKeys));
	});

	it("house matchers are identical", () => {
		expect(en.HOUSE_MATCHERS).toEqual(ptBR.HOUSE_MATCHERS);
	});

	it("every matcher key points at an existing catalogue slug", () => {
		const slugs = new Set([
			...ptBR.HOUSE_DOSSIERS.map((d) => d.slug),
			...ptBR.GANG_GROUPS.flatMap((g) => g.gangs.map((x) => x.slug)),
		]);
		for (const key of Object.keys(ptBR.HOUSE_MATCHERS)) {
			expect(slugs.has(key), `matcher key "${key}" has no catalogue card`).toBe(true);
		}
	});

	it("every catalogue slug has a matcher (campaign section can link back)", () => {
		const matcherKeys = new Set(Object.keys(ptBR.HOUSE_MATCHERS));
		const slugs = [
			...ptBR.HOUSE_DOSSIERS.map((d) => d.slug),
			...ptBR.GANG_GROUPS.flatMap((g) => g.gangs.map((x) => x.slug)),
		];
		for (const slug of slugs) {
			expect(matcherKeys.has(slug), `slug "${slug}" has no matcher`).toBe(true);
		}
	});

	it("chapter ids match the rendered section ids", () => {
		const sectionIds = [
			ptBR.GREAT_HOUSES_SECTION.id,
			...ptBR.GANG_GROUPS.map((g) => g.id),
			ptBR.CAMPAIGN_SECTION.id,
		];
		expect(ptBR.GANGS_CHAPTERS.map((c) => c.id)).toEqual(sectionIds);
	});
});

describe("matchHouseSlug", () => {
	it.each([
		// values used by the campaign seed (src/lib/data/campaign.ts)
		["Corpse Grinder Cult", "corpse-grinder-cults"],
		["Delaque", "house-delaque"],
		["Squat Prospectors", "ironhead-squats"],
		["Corrupted Outcast", "underhive-outcasts"],
		// common spellings for the remaining houses
		["Escher", "house-escher"],
		["House Goliath", "house-goliath"],
		["Van Saar", "house-van-saar"],
		["Cawdor", "house-cawdor"],
		["Orlock", "house-orlock"],
		["Palanite Enforcers", "palanite-enforcers"],
		["Ash Waste Nomads", "ash-waste-nomads"],
	])("resolves %s → %s", (house, slug) => {
		expect(matchHouseSlug(house)).toBe(slug);
	});

	it("is case-insensitive", () => {
		expect(matchHouseSlug("GOLIATH")).toBe("house-goliath");
	});

	it("returns null for unknown houses", () => {
		expect(matchHouseSlug("House Ulanti")).toBeNull();
	});

	it("every matched slug has a visual identity", () => {
		for (const slug of Object.keys(ptBR.HOUSE_MATCHERS)) {
			expect(IDENTITY_BY_SLUG[slug], `slug "${slug}" missing identity`).toBeDefined();
		}
	});
});
