import { describe, it, expect } from "vitest";
import { assignSympathiserSchema } from "@/lib/validation";
import { SYMPATHISERS, getSympathiser } from "@/lib/data/sympathisers";

describe("assignSympathiserSchema", () => {
  it("aceita gangId UUID válido", () => {
    const result = assignSympathiserSchema.safeParse({
      sympathiserId: "fallen-house",
      gangId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
    expect(result.success).toBe(true);
  });

  it("aceita gangId vazio (liberar)", () => {
    const result = assignSympathiserSchema.safeParse({
      sympathiserId: "water-guild",
      gangId: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gangId).toBe("");
    }
  });

  it("rejeita sympathiserId vazio", () => {
    const result = assignSympathiserSchema.safeParse({
      sympathiserId: "",
      gangId: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Selecione o Sympathiser.");
    }
  });

  it("rejeita ausência de sympathiserId", () => {
    const result = assignSympathiserSchema.safeParse({ gangId: "" });
    expect(result.success).toBe(false);
  });
});

describe("catálogo SYMPATHISERS", () => {
  it("contém exatamente 26 entradas", () => {
    expect(SYMPATHISERS).toHaveLength(26);
  });

  it("todos os IDs são únicos", () => {
    const ids = SYMPATHISERS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getSympathiser retorna o item correto por ID", () => {
    const s = getSympathiser("fallen-house");
    expect(s).toBeDefined();
    expect(s?.name).toBe("Fallen House Sympathisers");
  });

  it("getSympathiser retorna undefined para ID inexistente", () => {
    expect(getSympathiser("nao-existe")).toBeUndefined();
  });

  it("todos os nomes terminam com 'Sympathisers'", () => {
    for (const s of SYMPATHISERS) {
      expect(s.name).toMatch(/Sympathisers$/);
    }
  });
});
