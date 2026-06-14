import { describe, it, expect } from "vitest";
import { mergeChunks, citationLabel } from "@/lib/ai/retrieval";
import type { RetrievedChunk } from "@/lib/ai/retrieval";

function chunk(content: string, similarity: number): RetrievedChunk {
  return { heading: "", content, source: "test", book: null, page: null, similarity };
}

describe("mergeChunks", () => {
  it("returns an empty array when both lists are empty", () => {
    expect(mergeChunks([], [], 8)).toEqual([]);
  });

  it("sorts results by similarity descending", () => {
    const a = [chunk("low", 0.3), chunk("high", 0.8), chunk("mid", 0.5)];
    const result = mergeChunks(a, [], 8);
    expect(result[0]!.similarity).toBe(0.8);
    expect(result[1]!.similarity).toBe(0.5);
    expect(result[2]!.similarity).toBe(0.3);
  });

  it("deduplicates by first 120 chars of content", () => {
    const content = "A".repeat(200);
    const result = mergeChunks([chunk(content, 0.7)], [chunk(content, 0.5)], 8);
    expect(result).toHaveLength(1);
    // original (first list) wins
    expect(result[0]!.similarity).toBe(0.7);
  });

  it("does not deduplicate different content", () => {
    const a = [chunk("content A", 0.7)];
    const b = [chunk("content B", 0.5)];
    expect(mergeChunks(a, b, 8)).toHaveLength(2);
  });

  it("caps the result at k", () => {
    const a = Array.from({ length: 5 }, (_, i) => chunk(`chunk-a-${i}`, 0.5 + i * 0.05));
    const b = Array.from({ length: 5 }, (_, i) => chunk(`chunk-b-${i}`, 0.3 + i * 0.05));
    expect(mergeChunks(a, b, 6)).toHaveLength(6);
  });

  it("keeps the highest-similarity version when a duplicate appears in the expanded list", () => {
    const content = "same content here";
    const result = mergeChunks(
      [chunk(content, 0.9)],
      [chunk(content, 0.4)],
      8,
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.similarity).toBe(0.9);
  });

  it("returns list a when list b is empty", () => {
    const a = [chunk("only result", 0.6)];
    expect(mergeChunks(a, [], 8)).toEqual(a);
  });
});

describe("citationLabel", () => {
  it("returns 'Book, p. X' when book and page are present", () => {
    expect(
      citationLabel({ book: "Core Rulebook", page: 92, source: "rules.md", heading: "Rating" }),
    ).toBe("Core Rulebook, p. 92");
  });

  it("returns just the book name when page is null", () => {
    expect(
      citationLabel({ book: "Core Rulebook", page: null, source: "rules.md", heading: "Rating" }),
    ).toBe("Core Rulebook");
  });

  it("returns 'source — heading' when book is null and heading exists", () => {
    expect(
      citationLabel({ book: null, page: null, source: "rules.md", heading: "Web trait" }),
    ).toBe("rules.md — Web trait");
  });

  it("returns just the source when both book and heading are absent", () => {
    expect(
      citationLabel({ book: null, page: null, source: "rules.md", heading: "" }),
    ).toBe("rules.md");
  });
});
