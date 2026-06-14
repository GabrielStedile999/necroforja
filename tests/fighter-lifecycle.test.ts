import { describe, it, expect } from "vitest";
import {
  updateFighterStatusSchema,
  addFighterXpSchema,
} from "@/lib/validation";

const UUID_A = "123e4567-e89b-12d3-a456-426614174000";
const UUID_B = "987fcdeb-51a2-43d7-b012-0987654321ab";

describe("updateFighterStatusSchema", () => {
  it("accepts all valid statuses", () => {
    const statuses = [
      "active",
      "in_recovery",
      "injured",
      "captured",
      "dead",
    ] as const;
    for (const status of statuses) {
      const r = updateFighterStatusSchema.safeParse({
        fighterId: UUID_A,
        status,
      });
      expect(r.success).toBe(true);
    }
  });

  it("accepts optional capturedByGangId when status = captured", () => {
    const r = updateFighterStatusSchema.safeParse({
      fighterId: UUID_A,
      status: "captured",
      capturedByGangId: UUID_B,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.capturedByGangId).toBe(UUID_B);
  });

  it("treats empty capturedByGangId as undefined", () => {
    const r = updateFighterStatusSchema.safeParse({
      fighterId: UUID_A,
      status: "captured",
      capturedByGangId: "",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.capturedByGangId).toBeUndefined();
  });

  it("accepts status without capturedByGangId", () => {
    const r = updateFighterStatusSchema.safeParse({
      fighterId: UUID_A,
      status: "dead",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.capturedByGangId).toBeUndefined();
  });

  it("rejects invalid status", () => {
    expect(
      updateFighterStatusSchema.safeParse({
        fighterId: UUID_A,
        status: "wounded",
      }).success,
    ).toBe(false);
  });

  it("rejects non-UUID fighterId", () => {
    expect(
      updateFighterStatusSchema.safeParse({
        fighterId: "abc",
        status: "active",
      }).success,
    ).toBe(false);
  });

  it("rejects non-UUID capturedByGangId when filled", () => {
    expect(
      updateFighterStatusSchema.safeParse({
        fighterId: UUID_A,
        status: "captured",
        capturedByGangId: "not-a-uuid",
      }).success,
    ).toBe(false);
  });
});

describe("addFighterXpSchema", () => {
  it("accepts positive xpDelta with string coerce", () => {
    const r = addFighterXpSchema.safeParse({
      fighterId: UUID_A,
      xpDelta: "5",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.xpDelta).toBe(5);
  });

  it("accepts xpDelta = 1 (minimum)", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: UUID_A, xpDelta: 1 }).success,
    ).toBe(true);
  });

  it("accepts xpDelta = 100 (maximum)", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: UUID_A, xpDelta: 100 }).success,
    ).toBe(true);
  });

  it("rejects xpDelta = 0", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: UUID_A, xpDelta: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative xpDelta", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: UUID_A, xpDelta: -1 }).success,
    ).toBe(false);
  });

  it("rejects xpDelta > 100", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: UUID_A, xpDelta: 101 }).success,
    ).toBe(false);
  });

  it("rejects non-UUID fighterId", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: "bad", xpDelta: 5 }).success,
    ).toBe(false);
  });
});
