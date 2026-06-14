/**
 * Domain types for the Necromunda campaign (Cinderak Burning).
 * Reflect Appendix A of PLANO-TECNICO.md.
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

/** Fighter characteristic profile (Fighter Card, p.78 of the Core Rulebook). */
export interface FighterProfile {
  /** Movement */ m: number;
  /** Weapon Skill */ ws: number;
  /** Ballistic Skill */ bs: number;
  /** Strength */ s: number;
  /** Toughness */ t: number;
  /** Wounds */ w: number;
  /** Initiative */ i: number;
  /** Attacks */ a: number;
  /** Leadership (psychological) */ ld: number;
  /** Cool (psychological) */ cl: number;
  /** Willpower (psychological) */ wil: number;
  /** Intelligence (psychological) */ int: number;
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
  /** Equipped items (already counted towards the Rating). */
  equipment: EquipmentItem[];
  xp: number;
  status: FighterStatus;
}

export interface StashItem {
  /** id of the stash_item row (required for removal and equipping). */
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
  /** Credits held in the Stash. */
  stashCredits: number;
  /** Equipment stored in the Stash (counts towards Wealth, not Rating). */
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
  /** "active" | "finished" */
  status: string;
}

export interface Triumph {
  id: string;
  gangId: string | null;
  gangName: string | null;
  title: string;
  awardedAt: string;
}

/* ---- Aggregated public view (consumed by the landing) ---- */

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
  triumphs: Triumph[];
  source: "db" | "seed";
}
