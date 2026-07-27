import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/validation";

/** Contact form schema (issue #39 follow-up) — mirrors the native form attributes. */

const VALID = {
	name: "Kal Jericho",
	email: "kal@underhive.example",
	subject: "Bounty enquiry",
	message: "I would like to report a suspiciously well-painted Delaque gang.",
};

describe("contactSchema", () => {
	it("accepts a complete, valid submission", () => {
		const parsed = contactSchema.safeParse(VALID);
		expect(parsed.success).toBe(true);
	});

	it("trims surrounding whitespace before validating", () => {
		const parsed = contactSchema.parse({
			...VALID,
			name: "  Kal Jericho  ",
			subject: "  Bounty enquiry  ",
		});
		expect(parsed.name).toBe("Kal Jericho");
		expect(parsed.subject).toBe("Bounty enquiry");
	});

	it("rejects an invalid e-mail", () => {
		expect(contactSchema.safeParse({ ...VALID, email: "not-an-email" }).success).toBe(false);
	});

	it("rejects a too-short name, subject and message", () => {
		expect(contactSchema.safeParse({ ...VALID, name: "K" }).success).toBe(false);
		expect(contactSchema.safeParse({ ...VALID, subject: "Hi" }).success).toBe(false);
		expect(contactSchema.safeParse({ ...VALID, message: "Too short" }).success).toBe(false);
	});

	it("rejects oversized fields (spam guard)", () => {
		expect(contactSchema.safeParse({ ...VALID, subject: "x".repeat(121) }).success).toBe(false);
		expect(contactSchema.safeParse({ ...VALID, message: "x".repeat(4001) }).success).toBe(false);
	});

	it("rejects missing fields", () => {
		expect(contactSchema.safeParse({}).success).toBe(false);
	});
});
