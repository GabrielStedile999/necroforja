import { describe, it, expect } from "vitest";
import {
  fighterTotalCost,
  gangRating,
  gangWealth,
  creditsRemaining,
  SUCCESSION_FOUNDING_BUDGET,
} from "@/lib/scoring";
import { GANGS } from "@/lib/data/campaign";
import { SYMPATHISERS } from "@/lib/data/sympathisers";
import type { Fighter, Gang } from "@/types";

const profile = {
  m: 5, ws: 3, bs: 3, s: 3, t: 3, w: 1, i: 3, a: 1, ld: 7, cl: 7, wil: 7, int: 7,
};

function mkFighter(over: Partial<Fighter>): Fighter {
  return {
    id: "x",
    name: "Test",
    type: "Ganger",
    category: "ganger",
    baseCost: 50,
    profile,
    equipment: [],
    xp: 0,
    status: "active",
    ...over,
  };
}

describe("fighterTotalCost", () => {
  it("soma custo base + equipamento", () => {
    const f = mkFighter({
      baseCost: 100,
      equipment: [
        { id: "a", name: "Boltgun", category: "weapon", cost: 55 },
        { id: "b", name: "Mesh", category: "armour", cost: 15 },
      ],
    });
    expect(fighterTotalCost(f)).toBe(170);
  });

  it("sem equipamento retorna só o custo base", () => {
    expect(fighterTotalCost(mkFighter({ baseCost: 40 }))).toBe(40);
  });
});

describe("gangRating", () => {
  const base: Gang = {
    id: "g",
    name: "G",
    house: "H",
    ownerName: "O",
    reputation: 1,
    stashCredits: 0,
    stash: [],
    fighters: [],
  };

  it("soma o custo total de todos os fighters", () => {
    const g: Gang = {
      ...base,
      fighters: [
        mkFighter({ baseCost: 100, equipment: [{ id: "a", name: "w", category: "weapon", cost: 50 }] }),
        mkFighter({ baseCost: 40 }),
      ],
    };
    expect(gangRating(g)).toBe(190);
  });

  it("ignora fighters mortos", () => {
    const g: Gang = {
      ...base,
      fighters: [
        mkFighter({ baseCost: 100 }),
        mkFighter({ baseCost: 80, status: "dead" }),
      ],
    };
    expect(gangRating(g)).toBe(100);
  });
});

describe("gangWealth", () => {
  it("Wealth = Rating + créditos + equipamento no Stash", () => {
    const g: Gang = {
      id: "g", name: "G", house: "H", ownerName: "O", reputation: 1,
      stashCredits: 120,
      stash: [{ id: "si-1", equipment: { id: "s", name: "Lasgun", category: "weapon", cost: 15 }, qty: 2 }],
      fighters: [mkFighter({ baseCost: 100 })],
    };
    // 100 (rating) + 120 (créditos) + 30 (2x15) = 250
    expect(gangWealth(g)).toBe(250);
  });
});

describe("creditsRemaining", () => {
  it("usa o orçamento de fundação da Succession (2000) por padrão", () => {
    expect(SUCCESSION_FOUNDING_BUDGET).toBe(2000);
    const g: Gang = {
      id: "g", name: "G", house: "H", ownerName: "O", reputation: 1,
      stashCredits: 0, stash: [],
      fighters: [mkFighter({ baseCost: 500 })],
    };
    expect(creditsRemaining(g)).toBe(1500);
  });
});

describe("integridade do seed", () => {
  it("tem exatamente 26 Sympathisers no catálogo", () => {
    expect(SYMPATHISERS).toHaveLength(26);
  });

  it("ids de Sympathiser são únicos", () => {
    const ids = new Set(SYMPATHISERS.map((s) => s.id));
    expect(ids.size).toBe(SYMPATHISERS.length);
  });

  it("tem 4 gangues semeadas", () => {
    expect(GANGS).toHaveLength(4);
  });

  it("toda gangue tem pelo menos 1 fighter e Rating > 0", () => {
    for (const g of GANGS) {
      expect(g.fighters.length).toBeGreaterThan(0);
      expect(gangRating(g)).toBeGreaterThan(0);
    }
  });
});
