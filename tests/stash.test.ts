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
  it("accepts an integer ≥ 0 and coerces from string", () => {
    const r = setStashCreditsSchema.safeParse({ credits: "250" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.credits).toBe(250);
  });

  it("accepts zero (empty stash)", () => {
    expect(setStashCreditsSchema.safeParse({ credits: 0 }).success).toBe(true);
  });

  it("rejects negative value", () => {
    expect(setStashCreditsSchema.safeParse({ credits: -1 }).success).toBe(false);
  });

  it("rejects value above 99999", () => {
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

  it("accepts valid data with coerce", () => {
    const r = addStashItemSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.cost).toBe(15);
      expect(r.data.qty).toBe(2);
    }
  });

  it("qty defaults to 1 when omitted", () => {
    const r = addStashItemSchema.safeParse({ ...valid, qty: undefined });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.qty).toBe(1);
  });

  it("rejects qty zero", () => {
    expect(
      addStashItemSchema.safeParse({ ...valid, qty: "0" }).success,
    ).toBe(false);
  });

  it("rejects invalid category", () => {
    expect(
      addStashItemSchema.safeParse({ ...valid, category: "magic" }).success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      addStashItemSchema.safeParse({ ...valid, name: "" }).success,
    ).toBe(false);
  });

  it("accepts all equipment categories", () => {
    const cats = ["weapon", "wargear", "skill", "armour", "upgrade"] as const;
    for (const category of cats) {
      expect(
        addStashItemSchema.safeParse({ ...valid, category }).success,
      ).toBe(true);
    }
  });
});

describe("removeStashItemSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      removeStashItemSchema.safeParse({ stashItemId: UUID_A }).success,
    ).toBe(true);
  });

  it("rejects non-UUID stashItemId", () => {
    expect(
      removeStashItemSchema.safeParse({ stashItemId: "abc" }).success,
    ).toBe(false);
  });

  it("rejects missing field", () => {
    expect(removeStashItemSchema.safeParse({}).success).toBe(false);
  });
});

describe("equipFromStashSchema", () => {
  const valid = { stashItemId: UUID_A, fighterId: UUID_B };

  it("accepts two valid UUIDs", () => {
    expect(equipFromStashSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects non-UUID stashItemId", () => {
    expect(
      equipFromStashSchema.safeParse({ ...valid, stashItemId: "x" }).success,
    ).toBe(false);
  });

  it("rejects non-UUID fighterId", () => {
    expect(
      equipFromStashSchema.safeParse({ ...valid, fighterId: "y" }).success,
    ).toBe(false);
  });

  it("rejects when one of the fields is missing", () => {
    expect(
      equipFromStashSchema.safeParse({ stashItemId: UUID_A }).success,
    ).toBe(false);
    expect(
      equipFromStashSchema.safeParse({ fighterId: UUID_B }).success,
    ).toBe(false);
  });
});
