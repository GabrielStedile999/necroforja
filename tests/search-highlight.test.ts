import { describe, expect, it } from "vitest";
import { splitByMatch } from "@/lib/search/highlight";

/** Search-result term highlighting (issue #15). */

describe("splitByMatch", () => {
	it("returns the whole text unmarked when the query is empty", () => {
		expect(splitByMatch("Ambush at the Sump", "")).toEqual([
			{ text: "Ambush at the Sump", match: false },
		]);
	});

	it("marks a single match in the middle", () => {
		expect(splitByMatch("Ambush at the Sump", "the")).toEqual([
			{ text: "Ambush at ", match: false },
			{ text: "the", match: true },
			{ text: " Sump", match: false },
		]);
	});

	it("is case-insensitive but preserves original casing in the output", () => {
		expect(splitByMatch("Bottling Out", "bottling")).toEqual([
			{ text: "Bottling", match: true },
			{ text: " Out", match: false },
		]);
	});

	it("marks a match at the very start", () => {
		expect(splitByMatch("Sump Ambush", "Sump")).toEqual([
			{ text: "Sump", match: true },
			{ text: " Ambush", match: false },
		]);
	});

	it("marks multiple occurrences", () => {
		expect(splitByMatch("gang gang gang", "gang")).toEqual([
			{ text: "gang", match: true },
			{ text: " ", match: false },
			{ text: "gang", match: true },
			{ text: " ", match: false },
			{ text: "gang", match: true },
		]);
	});

	it("returns the whole text unmarked when there is no match", () => {
		expect(splitByMatch("Ambush at the Sump", "xyz")).toEqual([
			{ text: "Ambush at the Sump", match: false },
		]);
	});
});
