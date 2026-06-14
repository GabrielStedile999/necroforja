/**
 * Tipos de domínio da campanha Necromunda (Cinderak Burning).
 * Refletem o Apêndice A do PLANO-TECNICO.md.
 */

export type CampaignPhase =
  | "great_darkness"
  | "downtime"
  | "spark_of_rebellion";

export type FighterCategory =
  | "leader"
  | "champion"
  | "prospect"
  | "ganger"
  | "juve"
  | "crew"
  | "hanger_on"
  | "brute";

export type FighterStatus =
  | "active"
  | "in_recovery"
  | "injured"
  | "captured"
  | "dead";

export type EquipmentCategory =
  | "weapon"
  | "wargear"
  | "skill"
  | "armour"
  | "upgrade";

/** Perfil de características do fighter (Fighter Card, p.78 do Core Rulebook). */
export interface FighterProfile {
  /** Movement */ m: number;
  /** Weapon Skill */ ws: number;
  /** Ballistic Skill */ bs: number;
  /** Strength */ s: number;
  /** Toughness */ t: number;
  /** Wounds */ w: number;
  /** Initiative */ i: number;
  /** Attacks */ a: number;
  /** Leadership (psicológico) */ ld: number;
  /** Cool (psicológico) */ cl: number;
  /** Willpower (psicológico) */ wil: number;
  /** Intelligence (psicológico) */ int: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  cost: number;
}

export interface Fighter {
  id: string;
  name: string;
  type: string;
  category: FighterCategory;
  baseCost: number;
  profile: FighterProfile;
  /** Itens equipados (já contam para o Rating). */
  equipment: EquipmentItem[];
  xp: number;
  status: FighterStatus;
}

export interface StashItem {
  /** id da linha stash_item (necessário para remoção e equipar). */
  id: string;
  equipment: EquipmentItem;
  qty: number;
}

export interface Gang {
  id: string;
  name: string;
  house: string;
  ownerName: string;
  fighters: Fighter[];
  /** Créditos parados no Stash. */
  stashCredits: number;
  /** Equipamento guardado no Stash (conta para Wealth, não para Rating). */
  stash: StashItem[];
  reputation: number;
}

export interface Sympathiser {
  id: string;
  name: string;
}

export interface Campaign {
  id: string;
  name: string;
  phase: CampaignPhase;
  currentCycle: number;
  totalCycles: number;
  startDate: string;
  endDate: string;
}

/* ---- View pública agregada (consumida pela landing) ---- */

export interface GangRankRow {
  id: string;
  name: string;
  house: string;
  ownerName: string;
  rating: number;
  wealth: number;
  sympathiserCount: number;
}

export interface SympathiserView {
  id: string;
  name: string;
  controllerGangId: string | null;
  controllerName: string | null;
}

export interface ChallengeView {
  id: string;
  cycle: number;
  challengerName: string;
  challengedName: string | null;
  sympathiserName: string | null;
  scenario: string | null;
  outcome: string | null;
  resolved: boolean;
}

export interface PublicView {
  campaign: Campaign;
  gangs: GangRankRow[];
  sympathisers: SympathiserView[];
  recentChallenges: ChallengeView[];
  source: "db" | "seed";
}
