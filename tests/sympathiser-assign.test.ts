import { describe, it, expect } from "vitest";
import { assignSympathiserSchema } from "@/lib/validation";
import { SYMPATHISERS, getSympathiser } from "@/lib/data/sympathisers";

describe("assignSympathiserSchema", () => {
  it("accepts valid UUID gangId", () => {
    const result = assignSympathiserSchema.safeParse({
      sympathiserId: "fallen-house",
      gangId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty gangId (release)", () => {
    const result = assignSympathiserSchema.safeParse({
      sympathiserId: "water-guild",
      gangId: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gangId).toBe("");
    }
  });

  it("rejects empty sympathiserId", () => {
    const result = assignSympathiserSchema.safeParse({
      sympathiserId: "",
      gangId: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Select the Sympathiser.");
    }
  });

  it("rejects missing sympathiserId", () => {
    const result = assignSympathiserSchema.safeParse({ gangId: "" });
    expect(result.success).toBe(false);
  });
});

describe("SYMPATHISERS catalogue", () => {
  it("contains exactly 26 entries", () => {
    expect(SYMPATHISERS).toHaveLength(26);
  });

  it("all IDs are unique", () => {
    const ids = SYMPATHISERS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getSympathiser returns the correct item by ID", () => {
    const s = getSympathiser("fallen-house");
    expect(s).toBeDefined();
    expect(s?.name).toBe("Fallen House Sympathisers");
  });

  it("getSympathiser returns undefined for non-existent ID", () => {
    expect(getSympathiser("does-not-exist")).toBeUndefined();
  });

  it("all names end with 'Sympathisers'", () => {
    for (const s of SYMPATHISERS) {
      expect(s.name).toMatch(/Sympathisers$/);
    }
  });
});
