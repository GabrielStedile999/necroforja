import { describe, it, expect } from "vitest";
import {
  loginSchema,
  createPlayerSchema,
  fighterSchema,
  addEquipmentSchema,
} from "@/lib/validation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("validation (Zod)", () => {
  it("loginSchema rejects invalid e-mail", () => {
    expect(loginSchema.safeParse({ email: "x", password: "a" }).success).toBe(
      false,
    );
  });

  it("loginSchema accepts valid credentials", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "x" }).success,
    ).toBe(true);
  });

  it("createPlayerSchema requires a password of 8+ characters", () => {
    const base = {
      displayName: "Davi",
      email: "davi@x.com",
      gangName: "Red Harvest",
      house: "Corpse Grinders",
    };
    expect(
      createPlayerSchema.safeParse({ ...base, password: "1234567" }).success,
    ).toBe(false);
    expect(
      createPlayerSchema.safeParse({ ...base, password: "12345678" }).success,
    ).toBe(true);
  });

  it("fighterSchema coerces form strings to numbers", () => {
    const r = fighterSchema.safeParse({
      name: "Vorr",
      type: "Leader",
      category: "leader",
      baseCost: "130",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.baseCost).toBe(130);
  });

  it("fighterSchema rejects invalid category", () => {
    const r = fighterSchema.safeParse({
      name: "X",
      type: "Y",
      category: "wizard",
      baseCost: "10",
    });
    expect(r.success).toBe(false);
  });

  it("addEquipmentSchema requires fighterId uuid", () => {
    expect(
      addEquipmentSchema.safeParse({
        fighterId: "not-a-uuid",
        name: "Boltgun",
        category: "weapon",
        cost: "55",
      }).success,
    ).toBe(false);
  });
});

describe("password hashing (Argon2id)", () => {
  it("verifies the correct password and rejects the wrong one", async () => {
    const hash = await hashPassword("s3cret-test-pw");
    expect(hash).not.toBe("s3cret-test-pw");
    expect(await verifyPassword(hash, "s3cret-test-pw")).toBe(true);
    expect(await verifyPassword(hash, "wrongpassword")).toBe(false);
  });
});
