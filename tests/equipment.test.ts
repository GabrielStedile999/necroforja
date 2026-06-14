import { describe, it, expect } from "vitest";
import {
  addEquipmentSchema,
  removeEquipmentSchema,
} from "@/lib/validation";

const VALID_UUID_A = "123e4567-e89b-12d3-a456-426614174000";
const VALID_UUID_B = "987fcdeb-51a2-43d7-b012-0987654321ab";

describe("addEquipmentSchema", () => {
  it("aceita dados válidos e faz coerce do custo", () => {
    const result = addEquipmentSchema.safeParse({
      fighterId: VALID_UUID_A,
      name: "Boltgun",
      category: "weapon",
      cost: "55",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cost).toBe(55);
      expect(result.data.category).toBe("weapon");
    }
  });

  it("aceita todas as categorias de equipamento", () => {
    const categories = ["weapon", "wargear", "skill", "armour", "upgrade"] as const;
    for (const category of categories) {
      const r = addEquipmentSchema.safeParse({
        fighterId: VALID_UUID_A,
        name: "Item",
        category,
        cost: "0",
      });
      expect(r.success).toBe(true);
    }
  });

  it("rejeita custo negativo", () => {
    const result = addEquipmentSchema.safeParse({
      fighterId: VALID_UUID_A,
      name: "Boltgun",
      category: "weapon",
      cost: "-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita custo acima de 2000", () => {
    const result = addEquipmentSchema.safeParse({
      fighterId: VALID_UUID_A,
      name: "Item",
      category: "weapon",
      cost: "2001",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita categoria inválida", () => {
    const result = addEquipmentSchema.safeParse({
      fighterId: VALID_UUID_A,
      name: "Item",
      category: "magic",
      cost: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita fighterId não-UUID", () => {
    const result = addEquipmentSchema.safeParse({
      fighterId: "nao-e-uuid",
      name: "Item",
      category: "weapon",
      cost: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita nome vazio", () => {
    const result = addEquipmentSchema.safeParse({
      fighterId: VALID_UUID_A,
      name: "",
      category: "weapon",
      cost: "0",
    });
    expect(result.success).toBe(false);
  });
});

describe("removeEquipmentSchema", () => {
  const validData = {
    fighterId: VALID_UUID_A,
    equipmentId: VALID_UUID_B,
  };

  it("aceita dois UUIDs válidos", () => {
    expect(removeEquipmentSchema.safeParse(validData).success).toBe(true);
  });

  it("rejeita fighterId não-UUID", () => {
    expect(
      removeEquipmentSchema.safeParse({ ...validData, fighterId: "abc" }).success,
    ).toBe(false);
  });

  it("rejeita equipmentId não-UUID", () => {
    expect(
      removeEquipmentSchema.safeParse({ ...validData, equipmentId: "123" }).success,
    ).toBe(false);
  });

  it("rejeita campos ausentes", () => {
    expect(
      removeEquipmentSchema.safeParse({ fighterId: VALID_UUID_A }).success,
    ).toBe(false);
    expect(
      removeEquipmentSchema.safeParse({ equipmentId: VALID_UUID_B }).success,
    ).toBe(false);
  });
});
