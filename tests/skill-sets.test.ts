/**
 * Universal Skill Sets catalogue (issue #89) — Core Rulebook 2023,
 * p.256–261. Names + D6 indexes only (rule text lives in the private DB);
 * the picker feeds buyAdvancement's skillName with canonical names, and
 * the chip lookup reuses the keyword_rule machinery (#67).
 */
import { describe, expect, it } from "vitest";
import {
  SKILL_SETS,
  getSkillSet,
  allSkillNames,
} from "@/lib/data/skills";
import { keywordKey, keywordRuleMap } from "@/lib/keywords";

describe("universal skill sets catalogue", () => {
  it("carries the nine universal sets, six skills each, indexed 1–6", () => {
    expect(SKILL_SETS.map((s) => s.name)).toEqual([
      "Agility",
      "Brawn",
      "Combat",
      "Cunning",
      "Driving",
      "Ferocity",
      "Leadership",
      "Savant",
      "Shooting",
    ]);
    for (const set of SKILL_SETS) {
      expect(set.skills, set.key).toHaveLength(6);
      // the D6 order as printed: exactly 1..6, in order
      expect(set.skills.map((sk) => sk.index)).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  it("skill names are globally unique (canonical storage never collides)", () => {
    const names = allSkillNames();
    expect(names).toHaveLength(54);
    expect(new Set(names).size).toBe(54);
    // and unique per keywordKey too — the chip lookup key
    expect(new Set(names.map((n) => keywordKey(n))).size).toBe(54);
  });

  it("getSkillSet resolves keys and leaves room for future house sets", () => {
    expect(getSkillSet("ferocity")?.skills[3]?.name).toBe("Nerves of Steel");
    expect(getSkillSet("goliath-muscle")).toBeUndefined(); // future-safe
  });

  it("a skill imported as a keyword rule is found by the chip lookup", () => {
    // the card renders KeywordChips(traits: skillName, rules: keywordRuleMap)
    const map = keywordRuleMap([
      {
        keyword: "Nerves of Steel",
        summary: "rewritten summary lives in the private DB",
        book: null,
        page: null,
      },
    ]);
    expect(map[keywordKey("Nerves of Steel")]?.summary).toContain("private DB");
    // unknown names degrade to a plain chip (no entry, no crash)
    expect(map[keywordKey("Some House Skill")]).toBeUndefined();
  });
});
