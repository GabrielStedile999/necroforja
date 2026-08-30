/**
 * Domain types for the Necromunda campaign (Cinderak Burning).
 * Reflect Appendix A of PLANO-TECNICO.md.
 */

export type CampaignPhase =
  | "great_darkness"
  | "downtime"
  | "spark_of_rebellion";

/** Declared side in the Succession Campaign's civil war (issue #82). */
export type GangAllegiance = "unaligned" | "imperial_house" | "rebellion";

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

/**
 * Fighter characteristic profile (Fighter Card, p.78 of the Core Rulebook).
 * `null` = never set. Target-roll stats (WS/BS/I/Ld/Cl/Wil/Int) are D6
 * rolls, strictly 1–6 (issue #63).
 */
export interface FighterProfile {
  /** Movement */ m: number | null;
  /** Weapon Skill */ ws: number | null;
  /** Ballistic Skill */ bs: number | null;
  /** Strength */ s: number | null;
  /** Toughness */ t: number | null;
  /** Wounds */ w: number | null;
  /** Initiative */ i: number | null;
  /** Attacks */ a: number | null;
  /** Leadership (psychological) */ ld: number | null;
  /** Cool (psychological) */ cl: number | null;
  /** Willpower (psychological) */ wil: number | null;
  /** Intelligence (psychological) */ int: number | null;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  cost: number;
}

/** An advancement bought with XP (issue #71): stat bump, recorded skill or
 *  a promotion (issue #84 — the label lives in skillName). */
export interface FighterAdvancement {
  id: string;
  kind: "stat_increase" | "skill" | "promotion";
  statKey: string | null;
  skillName: string | null;
  xpCost: number;
  /** Credits added to the fighter's cost (joins the Rating). */
  creditIncrease: number;
}

/** A lasting injury recorded on the Fighter card (issue #71). */
export interface FighterInjury {
  id: string;
  name: string;
  statKey: string | null;
  /** Stored-value delta actually applied (post-clamp); null = no effect. */
  statDelta: number | null;
  notes: string;
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
  /** Portrait object path in the gallery bucket (issue #63); null = crest fallback. */
  avatarPath?: string | null;
  /**
   * Advancements & injuries (issue #71). Optional so seed fixtures and
   * legacy call sites stay valid — scoring treats absence as none, which
   * also guarantees pre-#71 Ratings are byte-identical.
   */
  advancements?: FighterAdvancement[];
  injuries?: FighterInjury[];
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
  /** Declared civil-war side (issue #82); absent = unaligned (seed data). */
  allegiance?: GangAllegiance;
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
  /** Declared civil-war side (issue #82); absent = unaligned (seed data). */
  allegiance?: GangAllegiance;
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
