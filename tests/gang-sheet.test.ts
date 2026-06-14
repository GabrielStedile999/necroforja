import { describe, it, expect } from "vitest";
import { buildGangSheetData } from "@/lib/pdf/gangSheet";
import type { Gang, FighterProfile } from "@/types";

const profile: FighterProfile = {
  m: 5, ws: 3, bs: 3, s: 3, t: 3, w: 1, i: 3, a: 1, ld: 7, cl: 7, wil: 7, int: 7,
};

const BASE_GANG: Gang = {
  id: "g1",
  name: "Goliath Crew",
  house: "House Goliath",
  ownerName: "John Doe",
  reputation: 2,
  stashCredits: 100,
  stash: [],
  fighters: [],
};

describe("buildGangSheetData — header fields", () => {
  it("maps gang name, house, owner, reputation", () => {
    const d = buildGangSheetData(BASE_GANG);
    expect(d.gangName).toBe("Goliath Crew");
    expect(d.house).toBe("House Goliath");
    expect(d.ownerName).toBe("John Doe");
    expect(d.reputation).toBe(2);
    expect(d.stashCredits).toBe(100);
  });

  it("provides a non-empty generatedAt string", () => {
    const d = buildGangSheetData(BASE_GANG);
    expect(typeof d.generatedAt).toBe("string");
    expect(d.generatedAt.length).toBeGreaterThan(0);
  });
});

describe("buildGangSheetData — rating and wealth", () => {
  it("rating is 0 for an empty gang", () => {
    const d = buildGangSheetData(BASE_GANG);
    expect(d.rating).toBe(0);
  });

  it("rating sums fighter base costs + equipment", () => {
    const gang: Gang = {
      ...BASE_GANG,
      fighters: [
        {
          id: "f1",
          name: "Boss",
          type: "Leader",
          category: "leader",
          baseCost: 150,
          profile,
          equipment: [{ id: "e1", name: "Bolter", category: "weapon", cost: 55 }],
          xp: 0,
          status: "active",
        },
        {
          id: "f2",
          name: "Ganger",
          type: "Ganger",
          category: "ganger",
          baseCost: 55,
          profile,
          equipment: [],
          xp: 0,
          status: "active",
        },
      ],
    };
    // (150 + 55) + 55 = 260
    expect(buildGangSheetData(gang).rating).toBe(260);
  });

  it("wealth = rating + stash credits + stash equipment value", () => {
    const gang: Gang = {
      ...BASE_GANG,
      stashCredits: 200,
      stash: [
        {
          id: "si1",
          equipment: { id: "eq1", name: "Lasgun", category: "weapon", cost: 15 },
          qty: 2,
        },
      ],
      fighters: [
        {
          id: "f1",
          name: "Boss",
          type: "Leader",
          category: "leader",
          baseCost: 150,
          profile,
          equipment: [],
          xp: 0,
          status: "active",
        },
      ],
    };
    // Rating = 150; Wealth = 150 + 200 + (15*2) = 380
    const d = buildGangSheetData(gang);
    expect(d.rating).toBe(150);
    expect(d.wealth).toBe(380);
  });
});

describe("buildGangSheetData — fighters", () => {
  it("dead fighters appear in the roster with isAlive=false", () => {
    const gang: Gang = {
      ...BASE_GANG,
      fighters: [
        {
          id: "f1", name: "Active", type: "Ganger", category: "ganger",
          baseCost: 60, profile, equipment: [], xp: 0, status: "active",
        },
        {
          id: "f2", name: "Fallen", type: "Ganger", category: "ganger",
          baseCost: 60, profile, equipment: [], xp: 0, status: "dead",
        },
      ],
    };
    const d = buildGangSheetData(gang);
    expect(d.fighters).toHaveLength(2);
    expect(d.fighters[0]!.isAlive).toBe(true);
    expect(d.fighters[1]!.isAlive).toBe(false);
  });

  it("dead fighters do not contribute to rating", () => {
    const gang: Gang = {
      ...BASE_GANG,
      fighters: [
        {
          id: "f1", name: "Active", type: "Leader", category: "leader",
          baseCost: 150, profile, equipment: [], xp: 0, status: "active",
        },
        {
          id: "f2", name: "Dead", type: "Ganger", category: "ganger",
          baseCost: 80, profile, equipment: [], xp: 0, status: "dead",
        },
      ],
    };
    // Only active fighter counts
    expect(buildGangSheetData(gang).rating).toBe(150);
  });

  it("maps fighter total cost including equipment", () => {
    const gang: Gang = {
      ...BASE_GANG,
      fighters: [
        {
          id: "f1", name: "Fighter", type: "Ganger", category: "ganger",
          baseCost: 60, profile,
          equipment: [
            { id: "e1", name: "Laspistol", category: "weapon", cost: 10 },
            { id: "e2", name: "Mesh Armour", category: "armour", cost: 15 },
          ],
          xp: 3, status: "active",
        },
      ],
    };
    const f = buildGangSheetData(gang).fighters[0]!;
    expect(f.totalCost).toBe(85); // 60 + 10 + 15
    expect(f.xp).toBe(3);
    expect(f.equipment).toHaveLength(2);
    expect(f.equipment[0]!.name).toBe("Laspistol");
  });

  it("in_recovery status is preserved (not normalised)", () => {
    const gang: Gang = {
      ...BASE_GANG,
      fighters: [
        {
          id: "f1", name: "Hurt", type: "Ganger", category: "ganger",
          baseCost: 50, profile, equipment: [], xp: 0, status: "in_recovery",
        },
      ],
    };
    const f = buildGangSheetData(gang).fighters[0]!;
    expect(f.status).toBe("in_recovery");
    expect(f.isAlive).toBe(true); // in_recovery is NOT dead
  });
});

describe("buildGangSheetData — stash", () => {
  it("maps stash items with name, category, cost, qty", () => {
    const gang: Gang = {
      ...BASE_GANG,
      stash: [
        {
          id: "si1",
          equipment: { id: "e1", name: "Autogun", category: "weapon", cost: 20 },
          qty: 3,
        },
      ],
    };
    const d = buildGangSheetData(gang);
    expect(d.stashItems).toHaveLength(1);
    const item = d.stashItems[0]!;
    expect(item.name).toBe("Autogun");
    expect(item.category).toBe("weapon");
    expect(item.cost).toBe(20);
    expect(item.qty).toBe(3);
  });

  it("returns empty stashItems array when stash is empty", () => {
    expect(buildGangSheetData(BASE_GANG).stashItems).toHaveLength(0);
  });
});
