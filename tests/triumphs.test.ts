import { describe, it, expect } from "vitest";
import { awardTriumphSchema } from "@/lib/validation";

describe("awardTriumphSchema", () => {
  it("accepts a title with a valid gang UUID", () => {
    const result = awardTriumphSchema.safeParse({
      title: "Warlord of the Underhive",
      gangId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Warlord of the Underhive");
      expect(result.data.gangId).toBe("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    }
  });

  it("accepts a title with an empty gangId (campaign-wide triumph)", () => {
    const result = awardTriumphSchema.safeParse({
      title: "Last Gang Standing",
      gangId: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // empty string transforms to undefined
      expect(result.data.gangId).toBeUndefined();
    }
  });

  it("accepts a title without gangId at all", () => {
    const result = awardTriumphSchema.safeParse({
      title: "Survivor",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gangId).toBeUndefined();
    }
  });

  it("rejects an empty title", () => {
    const result = awardTriumphSchema.safeParse({ title: "", gangId: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Please enter a title.");
    }
  });

  it("rejects a missing title", () => {
    const result = awardTriumphSchema.safeParse({ gangId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid gang UUID", () => {
    const result = awardTriumphSchema.safeParse({
      title: "Iron Fist",
      gangId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Invalid gang ID.");
    }
  });

  it("rejects a title that exceeds 100 characters", () => {
    const result = awardTriumphSchema.safeParse({
      title: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("accepts a title of exactly 100 characters", () => {
    const result = awardTriumphSchema.safeParse({
      title: "A".repeat(100),
    });
    expect(result.success).toBe(true);
  });
});
