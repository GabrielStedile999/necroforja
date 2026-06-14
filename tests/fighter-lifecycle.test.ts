import { describe, it, expect } from "vitest";
import {
  updateFighterStatusSchema,
  addFighterXpSchema,
} from "@/lib/validation";

const UUID_A = "123e4567-e89b-12d3-a456-426614174000";
const UUID_B = "987fcdeb-51a2-43d7-b012-0987654321ab";

describe("updateFighterStatusSchema", () => {
  it("aceita todos os status válidos", () => {
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

  it("aceita capturedByGangId opcional quando status = captured", () => {
    const r = updateFighterStatusSchema.safeParse({
      fighterId: UUID_A,
      status: "captured",
      capturedByGangId: UUID_B,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.capturedByGangId).toBe(UUID_B);
  });

  it("trata capturedByGangId vazio como undefined", () => {
    const r = updateFighterStatusSchema.safeParse({
      fighterId: UUID_A,
      status: "captured",
      capturedByGangId: "",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.capturedByGangId).toBeUndefined();
  });

  it("aceita status sem capturedByGangId", () => {
    const r = updateFighterStatusSchema.safeParse({
      fighterId: UUID_A,
      status: "dead",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.capturedByGangId).toBeUndefined();
  });

  it("rejeita status inválido", () => {
    expect(
      updateFighterStatusSchema.safeParse({
        fighterId: UUID_A,
        status: "wounded",
      }).success,
    ).toBe(false);
  });

  it("rejeita fighterId não-UUID", () => {
    expect(
      updateFighterStatusSchema.safeParse({
        fighterId: "abc",
        status: "active",
      }).success,
    ).toBe(false);
  });

  it("rejeita capturedByGangId não-UUID quando preenchido", () => {
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
  it("aceita xpDelta positivo com coerce de string", () => {
    const r = addFighterXpSchema.safeParse({
      fighterId: UUID_A,
      xpDelta: "5",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.xpDelta).toBe(5);
  });

  it("aceita xpDelta = 1 (mínimo)", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: UUID_A, xpDelta: 1 }).success,
    ).toBe(true);
  });

  it("aceita xpDelta = 100 (máximo)", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: UUID_A, xpDelta: 100 }).success,
    ).toBe(true);
  });

  it("rejeita xpDelta = 0", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: UUID_A, xpDelta: 0 }).success,
    ).toBe(false);
  });

  it("rejeita xpDelta negativo", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: UUID_A, xpDelta: -1 }).success,
    ).toBe(false);
  });

  it("rejeita xpDelta > 100", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: UUID_A, xpDelta: 101 }).success,
    ).toBe(false);
  });

  it("rejeita fighterId não-UUID", () => {
    expect(
      addFighterXpSchema.safeParse({ fighterId: "bad", xpDelta: 5 }).success,
    ).toBe(false);
  });
});
