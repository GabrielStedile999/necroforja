import type { Campaign, Gang } from "@/types";

/**
 * Dados-semente da campanha atual (Cinderak Burning) arbitrada por Gabriel.
 * Servem para renderizar a landing pública sem depender do banco ainda.
 * Quando o Supabase estiver conectado, estes valores migram para o seed.ts.
 *
 * Os rosters abaixo são exemplos mínimos só para os cálculos de Rating/Wealth
 * terem o que somar — os dados reais serão inseridos pelos jogadores no app.
 */

export const CAMPAIGN: Campaign = {
  id: "cinderak-burning",
  name: "Cinderak Burning — The Aranthian Succession",
  phase: "great_darkness",
  currentCycle: 2,
  totalCycles: 7,
  startDate: "2026-06-01",
  endDate: "2026-07-20",
};

export const GANGS: Gang[] = [
  {
    id: "red-harvest",
    name: "Red Harvest",
    house: "Corpse Grinder Cult",
    ownerName: "Davi",
    reputation: 3,
    stashCredits: 120,
    stash: [],
    fighters: [
      {
        id: "rh-1",
        name: "Butcher-Prime Vorr",
        type: "Slaughterborn (Leader)",
        category: "leader",
        baseCost: 130,
        xp: 4,
        status: "active",
        profile: { m: 5, ws: 3, bs: 4, s: 4, t: 3, w: 2, i: 4, a: 2, ld: 6, cl: 6, wil: 7, int: 8 },
        equipment: [
          { id: "e-cleaver", name: "Two-handed Cleaver", category: "weapon", cost: 55 },
          { id: "e-mesh", name: "Mesh Armour", category: "armour", cost: 15 },
        ],
      },
      {
        id: "rh-2",
        name: "Grinder Skayl",
        type: "Cutter (Champion)",
        category: "champion",
        baseCost: 95,
        xp: 2,
        status: "active",
        profile: { m: 5, ws: 3, bs: 4, s: 4, t: 3, w: 1, i: 4, a: 2, ld: 7, cl: 6, wil: 8, int: 9 },
        equipment: [
          { id: "e-cleaver2", name: "Heavy Cleaver", category: "weapon", cost: 45 },
        ],
      },
      {
        id: "rh-3",
        name: "Initiate Hask",
        type: "Initiate (Ganger)",
        category: "ganger",
        baseCost: 40,
        xp: 0,
        status: "active",
        profile: { m: 5, ws: 4, bs: 4, s: 3, t: 3, w: 1, i: 4, a: 1, ld: 8, cl: 7, wil: 8, int: 9 },
        equipment: [{ id: "e-knife", name: "Fighting Knife", category: "weapon", cost: 15 }],
      },
    ],
  },
  {
    id: "shadow-syndicate",
    name: "Shadow Syndicate",
    house: "Delaque",
    ownerName: "Gabriel",
    reputation: 4,
    stashCredits: 200,
    stash: [],
    fighters: [
      {
        id: "ss-1",
        name: "Master Nyx",
        type: "Master (Leader)",
        category: "leader",
        baseCost: 120,
        xp: 6,
        status: "active",
        profile: { m: 5, ws: 4, bs: 3, s: 3, t: 3, w: 2, i: 3, a: 2, ld: 5, cl: 4, wil: 6, int: 5 },
        equipment: [
          { id: "e-lasgun", name: "Plasma Pistol", category: "weapon", cost: 50 },
          { id: "e-flak", name: "Flak Armour", category: "armour", cost: 10 },
        ],
      },
      {
        id: "ss-2",
        name: "Nacht-Ghul Vex",
        type: "Nacht-Ghul (Champion)",
        category: "champion",
        baseCost: 100,
        xp: 3,
        status: "active",
        profile: { m: 5, ws: 3, bs: 3, s: 3, t: 3, w: 1, i: 3, a: 2, ld: 6, cl: 5, wil: 6, int: 6 },
        equipment: [{ id: "e-web", name: "Web Pistol", category: "weapon", cost: 50 }],
      },
      {
        id: "ss-3",
        name: "Operative Sahl",
        type: "Operative (Ganger)",
        category: "ganger",
        baseCost: 50,
        xp: 1,
        status: "active",
        profile: { m: 5, ws: 4, bs: 3, s: 3, t: 3, w: 1, i: 3, a: 1, ld: 7, cl: 6, wil: 7, int: 6 },
        equipment: [{ id: "e-auto", name: "Autopistol", category: "weapon", cost: 10 }],
      },
    ],
  },
  {
    id: "thick-boys",
    name: "Thick Boys",
    house: "Squat Prospectors",
    ownerName: "Jeferson",
    reputation: 2,
    stashCredits: 75,
    stash: [],
    fighters: [
      {
        id: "tb-1",
        name: "Grymn Oathkeeper",
        type: "Prospector (Leader)",
        category: "leader",
        baseCost: 140,
        xp: 3,
        status: "active",
        profile: { m: 3, ws: 3, bs: 3, s: 4, t: 4, w: 2, i: 3, a: 2, ld: 6, cl: 5, wil: 6, int: 6 },
        equipment: [
          { id: "e-boltgun", name: "Boltgun", category: "weapon", cost: 55 },
          { id: "e-mesh2", name: "Mesh Armour", category: "armour", cost: 15 },
        ],
      },
      {
        id: "tb-2",
        name: "Borin Stonefist",
        type: "Veteran (Champion)",
        category: "champion",
        baseCost: 110,
        xp: 2,
        status: "active",
        profile: { m: 3, ws: 3, bs: 3, s: 4, t: 4, w: 2, i: 3, a: 1, ld: 7, cl: 6, wil: 6, int: 7 },
        equipment: [{ id: "e-axe", name: "Hardhead Pick", category: "weapon", cost: 35 }],
      },
      {
        id: "tb-3",
        name: "Durn",
        type: "Digger (Ganger)",
        category: "ganger",
        baseCost: 60,
        xp: 0,
        status: "active",
        profile: { m: 3, ws: 4, bs: 4, s: 4, t: 4, w: 1, i: 4, a: 1, ld: 8, cl: 6, wil: 7, int: 7 },
        equipment: [{ id: "e-shotgun", name: "Shotgun", category: "weapon", cost: 30 }],
      },
    ],
  },
  {
    id: "cult-of-the-wyrm",
    name: "Cult of the Wyrm",
    house: "Corrupted Outcast",
    ownerName: "Heitor",
    reputation: 3,
    stashCredits: 90,
    stash: [],
    fighters: [
      {
        id: "cw-1",
        name: "Prophet Maddox",
        type: "Outcast Leader",
        category: "leader",
        baseCost: 115,
        xp: 5,
        status: "active",
        profile: { m: 5, ws: 3, bs: 3, s: 3, t: 3, w: 2, i: 3, a: 2, ld: 7, cl: 7, wil: 6, int: 7 },
        equipment: [
          { id: "e-stub", name: "Stub Gun", category: "weapon", cost: 5 },
          { id: "e-chain", name: "Chainsword", category: "weapon", cost: 25 },
        ],
      },
      {
        id: "cw-2",
        name: "Zealot Cray",
        type: "Outcast Champion",
        category: "champion",
        baseCost: 90,
        xp: 2,
        status: "active",
        profile: { m: 5, ws: 3, bs: 3, s: 3, t: 3, w: 1, i: 3, a: 2, ld: 7, cl: 7, wil: 6, int: 8 },
        equipment: [{ id: "e-las", name: "Lasgun", category: "weapon", cost: 15 }],
      },
      {
        id: "cw-3",
        name: "Acolyte Renn",
        type: "Outcast Ganger",
        category: "ganger",
        baseCost: 45,
        xp: 1,
        status: "active",
        profile: { m: 5, ws: 4, bs: 4, s: 3, t: 3, w: 1, i: 3, a: 1, ld: 8, cl: 7, wil: 7, int: 8 },
        equipment: [{ id: "e-auto2", name: "Autogun", category: "weapon", cost: 15 }],
      },
    ],
  },
];

/**
 * Controle de Sympathisers no início (Great Darkness). gangId -> sympathiserId[].
 * Cada gangue começa controlando os informados por você.
 */
export const SYMPATHISER_CONTROL: Record<string, string[]> = {
  "red-harvest": ["fallen-house"],
  "shadow-syndicate": ["house-koiron"],
  "thick-boys": ["house-greim"],
  "cult-of-the-wyrm": ["narco-lord"],
};

export function getGang(id: string): Gang | undefined {
  return GANGS.find((g) => g.id === id);
}

/** Retorna o id da gangue que controla um Sympathiser, ou null se livre. */
export function controllerOf(sympathiserId: string): string | null {
  for (const [gangId, ids] of Object.entries(SYMPATHISER_CONTROL)) {
    if (ids.includes(sympathiserId)) return gangId;
  }
  return null;
}
