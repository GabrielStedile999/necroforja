import { describe, it, expect } from "vitest";
import {
  setStashCreditsSchema,
  addStashItemSchema,
  removeStashItemSchema,
  equipFromStashSchema,
} from "@/lib/validation";

const UUID_A = "123e4567-e89b-12d3-a456-426614174000";
const UUID_B = "987fcdeb-51a2-43d7-b012-0987654321ab";

describe("setStashCreditsSchema", () => {
  it("aceita um valor inteiro ≥ 0 e faz coerce de string", () => {
    const r = setStashCreditsSchema.safeParse({ credits: "250" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.credits).toBe(250);
  });

  it("aceita zero (stash vazio)", () => {
    expect(setStashCreditsSchema.safeParse({ credits: 0 }).success).toBe(true);
  });

  it("rejeita valor negativo", () => {
    expect(setStashCreditsSchema.safeParse({ credits: -1 }).success).toBe(false);
  });

  it("rejeita valor acima de 99999", () => {
    expect(
      setStashCreditsSchema.safeParse({ credits: 100000 }).success,
    ).toBe(false);
  });
});

describe("addStashItemSchema", () => {
  const valid = {
    name: "Lasgun",
    category: "weapon",
    cost: "15",
    qty: "2",
  };

  it("aceita dados válidos com coerce", () => {
    const r = addStashItemSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.cost).toBe(15);
      expect(r.data.qty).toBe(2);
    }
  });

  it("qty tem default 1 quando omitido", () => {
    const r = addStashItemSchema.safeParse({ ...valid, qty: undefined });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.qty).toBe(1);
  });

  it("rejeita qty zero", () => {
    expect(
      addStashItemSchema.safeParse({ ...valid, qty: "0" }).success,
    ).toBe(false);
  });

  it("rejeita categoria inválida", () => {
    expect(
      addStashItemSchema.safeParse({ ...valid, category: "magic" }).success,
    ).toBe(false);
  });

  it("rejeita nome vazio", () => {
    expect(
      addStashItemSchema.safeParse({ ...valid, name: "" }).success,
    ).toBe(false);
  });

  it("aceita todas as categorias de equipamento", () => {
    const cats = ["weapon", "wargear", "skill", "armour", "upgrade"] as const;
    for (const category of cats) {
      expect(
        addStashItemSchema.safeParse({ ...valid, category }).success,
      ).toBe(true);
    }
  });
});

describe("removeStashItemSchema", () => {
  it("aceita UUID válido", () => {
    expect(
      removeStashItemSchema.safeParse({ stashItemId: UUID_A }).success,
    ).toBe(true);
  });

  it("rejeita stashItemId não-UUID", () => {
    expect(
      removeStashItemSchema.safeParse({ stashItemId: "abc" }).success,
    ).toBe(false);
  });

  it("rejeita campo ausente", () => {
    expect(removeStashItemSchema.safeParse({}).success).toBe(false);
  });
});

describe("equipFromStashSchema", () => {
  const valid = { stashItemId: UUID_A, fighterId: UUID_B };

  it("aceita dois UUIDs válidos", () => {
    expect(equipFromStashSchema.safeParse(valid).success).toBe(true);
  });

  it("rejeita stashItemId não-UUID", () => {
    expect(
      equipFromStashSchema.safeParse({ ...valid, stashItemId: "x" }).success,
    ).toBe(false);
  });

  it("rejeita fighterId não-UUID", () => {
    expect(
      equipFromStashSchema.safeParse({ ...valid, fighterId: "y" }).success,
    ).toBe(false);
  });

  it("rejeita quando falta um dos campos", () => {
    expect(
      equipFromStashSchema.safeParse({ stashItemId: UUID_A }).success,
    ).toBe(false);
    expect(
      equipFromStashSchema.safeParse({ fighterId: UUID_B }).success,
    ).toBe(false);
  });
});
