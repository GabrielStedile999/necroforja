import { describe, it, expect } from "vitest";
import { chunkMarkdown, chunkPlain } from "@/lib/ai/chunk";

const SAMPLE = `# Título A

Parágrafo um da seção A com algum conteúdo de regra.

Parágrafo dois da seção A.

## Título B

Parágrafo da seção B.`;

describe("chunkMarkdown", () => {
  it("preserva o cabeçalho em cada chunk", () => {
    const chunks = chunkMarkdown(SAMPLE, "teste.md", { maxChars: 1000 });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks.every((c) => c.source === "teste.md")).toBe(true);
    const headings = new Set(chunks.map((c) => c.heading));
    expect(headings.has("Título A")).toBe(true);
    expect(headings.has("Título B")).toBe(true);
  });

  it("agrupa parágrafos respeitando maxChars (quebra em chunks menores)", () => {
    const chunks = chunkMarkdown(SAMPLE, "teste.md", { maxChars: 60 });
    // com limite pequeno, a seção A deve gerar mais de um chunk
    const secA = chunks.filter((c) => c.heading === "Título A");
    expect(secA.length).toBeGreaterThanOrEqual(2);
  });

  it("não gera chunks vazios", () => {
    const chunks = chunkMarkdown(SAMPLE, "teste.md");
    expect(chunks.every((c) => c.content.trim().length > 0)).toBe(true);
  });

  it("texto sem cabeçalho vira chunk com heading vazio", () => {
    const chunks = chunkMarkdown("Só um parágrafo solto.", "x.md");
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.heading).toBe("");
    expect(chunks[0]!.content).toContain("parágrafo solto");
  });
});

describe("chunkPlain (páginas de livro)", () => {
  it("quebra um parágrafo grande em vários chunks", () => {
    const big = "Frase um. Frase dois. ".repeat(200);
    const chunks = chunkPlain(big, 500);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 700)).toBe(true);
    expect(chunks.every((c) => c.trim().length > 0)).toBe(true);
  });

  it("mantém texto pequeno em um único chunk", () => {
    const chunks = chunkPlain("Parágrafo A.\n\nParágrafo B.", 1000);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toContain("Parágrafo A");
    expect(chunks[0]).toContain("Parágrafo B");
  });

  it("isola verbetes em MAIÚSCULAS em chunks distintos (glossário)", () => {
    const text =
      "Texto introdutório qualquer aqui presente. " +
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
