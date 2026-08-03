/**
 * Trait/keyword string helpers (issue #67 follow-up).
 *
 * Catalogue traits are stored as a comma-separated string exactly as printed
 * ("Rapid Fire (1), Knockback"). Glossary entries (keyword_rule table) are
 * keyed by the BASE keyword without parameters ("Rapid Fire"), so lookups
 * strip any parenthesised suffix and compare case-insensitively.
 */

/** "Rapid Fire (1), Knockback" → ["Rapid Fire (1)", "Knockback"]. */
export function splitTraits(traits: string): string[] {
  return traits
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/**
 * Normalised lookup key of one trait: strips a parenthesised parameter and
 * lowercases. 'Rapid Fire (1)' → "rapid fire"; 'Blast (3")' → "blast".
 */
export function keywordKey(trait: string): string {
  return trait
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim()
    .toLowerCase();
}

export interface KeywordRuleEntry {
  keyword: string;
  summary: string;
  book?: string | null;
  page?: number | null;
}

/** Builds the lookup map used by the KeywordChips component. */
export function keywordRuleMap(
  rules: KeywordRuleEntry[],
): Record<string, KeywordRuleEntry> {
  const map: Record<string, KeywordRuleEntry> = {};
  for (const rule of rules) map[keywordKey(rule.keyword)] = rule;
  return map;
}
