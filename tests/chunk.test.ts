import { describe, it, expect } from "vitest";
import { chunkMarkdown, chunkPlain } from "@/lib/ai/chunk";

const SAMPLE = `# Title A

Paragraph one of section A with some rule content.

Paragraph two of section A.

## Title B

Paragraph of section B.`;

describe("chunkMarkdown", () => {
  it("preserves the heading in each chunk", () => {
    const chunks = chunkMarkdown(SAMPLE, "test.md", { maxChars: 1000 });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks.every((c) => c.source === "test.md")).toBe(true);
    const headings = new Set(chunks.map((c) => c.heading));
    expect(headings.has("Title A")).toBe(true);
    expect(headings.has("Title B")).toBe(true);
  });

  it("groups paragraphs respecting maxChars (breaks into smaller chunks)", () => {
    const chunks = chunkMarkdown(SAMPLE, "test.md", { maxChars: 60 });
    // with a small limit, section A should produce more than one chunk
    const secA = chunks.filter((c) => c.heading === "Title A");
    expect(secA.length).toBeGreaterThanOrEqual(2);
  });

  it("does not produce empty chunks", () => {
    const chunks = chunkMarkdown(SAMPLE, "test.md");
    expect(chunks.every((c) => c.content.trim().length > 0)).toBe(true);
  });

  it("text without a heading becomes a chunk with an empty heading", () => {
    const chunks = chunkMarkdown("Just a loose paragraph.", "x.md");
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.heading).toBe("");
    expect(chunks[0]!.content).toContain("loose paragraph");
  });
});

describe("chunkPlain (book pages)", () => {
  it("breaks a large paragraph into multiple chunks", () => {
    const big = "Sentence one. Sentence two. ".repeat(200);
    const chunks = chunkPlain(big, 500);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 700)).toBe(true);
    expect(chunks.every((c) => c.trim().length > 0)).toBe(true);
  });

  it("keeps small text in a single chunk", () => {
    const chunks = chunkPlain("Paragraph A.\n\nParagraph B.", 1000);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toContain("Paragraph A");
    expect(chunks[0]).toContain("Paragraph B");
  });

  it("isolates UPPERCASE entries into separate chunks (glossary)", () => {
    const text =
      "Some introductory text present here. " +
      "WEB If the wound roll succeeds the target becomes Webbed instantly. " +
      "TOXIN Instead of a wound roll, roll a D6 for the toxic effect now.";
    const chunks = chunkPlain(text, 60);
    const web = chunks.find((c) => c.includes("WEB If"));
    const toxin = chunks.find((c) => c.includes("TOXIN Instead"));
    expect(web).toBeDefined();
    expect(toxin).toBeDefined();
    expect(web).not.toBe(toxin);
    expect(web).not.toContain("TOXIN");
  });
});
