import { describe, expect, it } from "vitest";
import { pickPostText, formatPostDate, slugify, type PostText } from "@/lib/reports";
import { postSchema } from "@/lib/validation";
import { POST_TYPE_KEYS, toPostType } from "@/components/reports/postTypes";

/** Campaign journal helpers (issue #5). */

const FULL: PostText = {
	titleEn: "Weekly Mission Report",
	titlePt: "Relatório das Missões da Semana",
	excerptEn: "Two war zones burned.",
	excerptPt: "Duas zonas de guerra arderam.",
	bodyEn: "EN body",
	bodyPt: "Corpo PT",
};

describe("pickPostText", () => {
	it("picks the locale's fields", () => {
		expect(pickPostText(FULL, "pt-BR").title).toBe("Relatório das Missões da Semana");
		expect(pickPostText(FULL, "en").title).toBe("Weekly Mission Report");
		expect(pickPostText(FULL, "pt-BR").body).toBe("Corpo PT");
	});

	it("falls back to the other language when a field is empty", () => {
		const draft: PostText = { ...FULL, titlePt: "", bodyPt: "", excerptPt: "" };
		const picked = pickPostText(draft, "pt-BR");
		expect(picked.title).toBe("Weekly Mission Report");
		expect(picked.body).toBe("EN body");
		expect(picked.excerpt).toBe("Two war zones burned.");
	});
});

describe("formatPostDate", () => {
	it("formats as yyyy.mm.dd (UTC)", () => {
		expect(formatPostDate(new Date("2026-07-17T12:00:00Z"))).toBe("2026.07.17");
		expect(formatPostDate(new Date("2026-01-05T00:00:00Z"))).toBe("2026.01.05");
	});

	it("returns a placeholder for missing dates", () => {
		expect(formatPostDate(null)).toBe("—");
		expect(formatPostDate(undefined)).toBe("—");
	});
});

describe("slugify", () => {
	it("lowercases, strips accents and hyphenates", () => {
		expect(slugify("Relatório das Missões da Semana")).toBe(
			"relatorio-das-missoes-da-semana",
		);
		expect(slugify("Weekly Mission Report")).toBe("weekly-mission-report");
	});

	it("trims stray hyphens and caps length", () => {
		expect(slugify("  --Hello!!  ")).toBe("hello");
		expect(slugify("a".repeat(120)).length).toBeLessThanOrEqual(80);
	});
});

describe("postSchema", () => {
	const base = {
		type: "session_report",
		titleEn: "Weekly Mission Report",
		titlePt: "Relatório das Missões",
		bodyEn: "body",
		bodyPt: "corpo",
	};

	it("accepts a valid post with optional slug omitted", () => {
		const parsed = postSchema.safeParse(base);
		expect(parsed.success).toBe(true);
	});

	it("rejects invalid slugs", () => {
		expect(postSchema.safeParse({ ...base, slug: "Bad Slug!" }).success).toBe(false);
		expect(postSchema.safeParse({ ...base, slug: "ok-slug-1" }).success).toBe(true);
	});

	it("rejects non-https cover URLs", () => {
		expect(postSchema.safeParse({ ...base, coverImage: "http://x.com/a.png" }).success).toBe(false);
		expect(postSchema.safeParse({ ...base, coverImage: "/reports/a.png" }).success).toBe(true);
		expect(
			postSchema.safeParse({ ...base, coverImage: "https://x.supabase.co/a.png" }).success,
		).toBe(true);
	});
});

describe("toPostType", () => {
	it("passes known types through and defaults unknown to news", () => {
		for (const key of POST_TYPE_KEYS) expect(toPostType(key)).toBe(key);
		expect(toPostType("whatever")).toBe("news");
	});
});
