/**
 * Issue #52 — autor da pintura + rating 1–5 + comentários pré-moderados.
 * Unit tests dos blocos puros: hash de identidade anônima, validação zod
 * das interações e formatação/agregação exibida na UI.
 */
import { describe, expect, it } from "vitest";
import { hashAnonId, ANON_COOKIE, ANON_COOKIE_MAX_AGE } from "@/lib/gallery-anon";
import { formatRatingAvg } from "@/lib/gallery";
import {
	galleryCommentModerationSchema,
	galleryCommentSchema,
	galleryConfirmSchema,
	galleryRatingSchema,
	galleryUpdateSchema,
} from "@/lib/validation";

/* --------------------------- anonymous identity --------------------------- */

describe("hashAnonId (voter_hash)", () => {
	const uuid = "6f9619ff-8b86-4d01-b42d-00cf4fc964ff";

	it("is deterministic for the same (anonId, secret) — the upsert key", () => {
		expect(hashAnonId(uuid, "secret")).toBe(hashAnonId(uuid, "secret"));
	});

	it("produces a 64-char lowercase hex digest (SHA-256)", () => {
		expect(hashAnonId(uuid, "secret")).toMatch(/^[0-9a-f]{64}$/);
	});

	it("changes with the anonId (different visitors, different hashes)", () => {
		expect(hashAnonId(uuid, "secret")).not.toBe(
			hashAnonId("11111111-2222-4333-8444-555555555555", "secret"),
		);
	});

	it("changes with the secret (table alone cannot be correlated)", () => {
		expect(hashAnonId(uuid, "secret-a")).not.toBe(hashAnonId(uuid, "secret-b"));
	});

	it("never leaks the raw anonId in the digest", () => {
		expect(hashAnonId(uuid, "secret")).not.toContain(uuid);
	});

	it("cookie constants: sane name and ~1 year lifetime", () => {
		expect(ANON_COOKIE).toBe("ncf_anon");
		expect(ANON_COOKIE_MAX_AGE).toBe(60 * 60 * 24 * 365);
	});
});

/* ------------------------------ rating schema ----------------------------- */

describe("galleryRatingSchema", () => {
	it("accepts whole stars 1 through 5", () => {
		for (const rating of [1, 2, 3, 4, 5]) {
			expect(galleryRatingSchema.safeParse({ rating }).success).toBe(true);
		}
	});

	it("coerces numeric strings (JSON bodies from exotic clients)", () => {
		expect(galleryRatingSchema.parse({ rating: "4" }).rating).toBe(4);
	});

	it("rejects out-of-range, fractional and non-numeric values", () => {
		for (const rating of [0, 6, -1, 3.5, "abc", null, undefined]) {
			expect(galleryRatingSchema.safeParse({ rating }).success).toBe(false);
		}
	});
});

/* ----------------------------- comment schema ----------------------------- */

describe("galleryCommentSchema", () => {
	const base = { authorName: "Ragnar", body: "Great paintjob on the Goliaths!" };

	it("accepts a valid comment and trims whitespace", () => {
		const parsed = galleryCommentSchema.parse({
			authorName: "  Ragnar  ",
			body: "  Nice!  ",
		});
		expect(parsed.authorName).toBe("Ragnar");
		expect(parsed.body).toBe("Nice!");
	});

	it("requires a name of 2–40 chars", () => {
		expect(galleryCommentSchema.safeParse({ ...base, authorName: "R" }).success).toBe(false);
		expect(
			galleryCommentSchema.safeParse({ ...base, authorName: "x".repeat(41) }).success,
		).toBe(false);
	});

	it("requires a body of 3–800 chars (800 is the issue's hard cap)", () => {
		expect(galleryCommentSchema.safeParse({ ...base, body: "ok" }).success).toBe(false);
		expect(
			galleryCommentSchema.safeParse({ ...base, body: "x".repeat(801) }).success,
		).toBe(false);
		expect(
			galleryCommentSchema.safeParse({ ...base, body: "x".repeat(800) }).success,
		).toBe(true);
	});

	it("whitespace-only fields fail after trim", () => {
		expect(galleryCommentSchema.safeParse({ ...base, body: "    " }).success).toBe(false);
	});
});

/* ---------------------------- moderation schema ---------------------------- */

describe("galleryCommentModerationSchema", () => {
	const id = "6f9619ff-8b86-4d01-b42d-00cf4fc964ff";

	it("accepts the three admin decisions", () => {
		for (const decision of ["approve", "reject", "delete"]) {
			expect(galleryCommentModerationSchema.safeParse({ id, decision }).success).toBe(true);
		}
	});

	it("rejects unknown decisions and bad ids", () => {
		expect(
			galleryCommentModerationSchema.safeParse({ id, decision: "publish" }).success,
		).toBe(false);
		expect(
			galleryCommentModerationSchema.safeParse({ id: "not-a-uuid", decision: "approve" })
				.success,
		).toBe(false);
	});
});

/* ------------------------- author on image schemas ------------------------- */

describe("gallery image schemas — authorName (issue #52)", () => {
	const confirmBase = {
		path: "painting/goliath-a1b2c3.webp",
		category: "painting",
		altEn: "A freshly painted Goliath",
		width: 1200,
		height: 800,
	};

	it("defaults to empty (author is optional on every category)", () => {
		expect(galleryConfirmSchema.parse(confirmBase).authorName).toBe("");
	});

	it("trims and accepts up to 60 chars", () => {
		expect(
			galleryConfirmSchema.parse({ ...confirmBase, authorName: "  Gabriel  " }).authorName,
		).toBe("Gabriel");
		expect(
			galleryConfirmSchema.safeParse({ ...confirmBase, authorName: "x".repeat(61) })
				.success,
		).toBe(false);
	});

	it("galleryUpdateSchema (admin edit) carries the same field", () => {
		const parsed = galleryUpdateSchema.parse({
			id: "6f9619ff-8b86-4d01-b42d-00cf4fc964ff",
			category: "painting",
			altEn: "Valid alt",
			authorName: "Gabriel Stedile",
			published: true,
		});
		expect(parsed.authorName).toBe("Gabriel Stedile");
	});
});

/* ------------------------------ UI formatting ------------------------------ */

describe("formatRatingAvg", () => {
	it("always shows one decimal so the scale reads next to the star", () => {
		expect(formatRatingAvg(4)).toBe("4.0");
		expect(formatRatingAvg(4.25)).toBe("4.3");
		expect(formatRatingAvg(4.24)).toBe("4.2");
		expect(formatRatingAvg(5)).toBe("5.0");
		expect(formatRatingAvg(1)).toBe("1.0");
	});

	it("survives float noise from avg() aggregates", () => {
		expect(formatRatingAvg(3.3333333333)).toBe("3.3");
		expect(formatRatingAvg(2.6666666667)).toBe("2.7");
	});
});
