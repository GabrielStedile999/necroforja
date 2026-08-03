"use client";

/**
 * Clickable trait/keyword chips (issue #67 follow-up).
 *
 * Renders a traits string ("Rapid Fire (1), Knockback") as chips. Keywords
 * that have a glossary entry (keyword_rule table) highlight on hover and
 * open an in-app modal with the rewritten rule summary on click — no
 * browser dialogs. Keywords without an entry render as plain text.
 *
 * The summaries come from the DATABASE (never the public repo): the map is
 * built server-side with keywordRuleMap(listKeywordRules()) and passed down.
 */

import { useEffect, useState } from "react";
import {
  splitTraits,
  keywordKey,
  type KeywordRuleEntry,
} from "@/lib/keywords";

export type KeywordRuleMap = Record<string, KeywordRuleEntry>;

function KeywordModal({
  rule,
  trait,
  onClose,
}: {
  rule: KeywordRuleEntry;
  trait: string;
  onClose: () => void;
}) {
  // ESC closes the modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Rule: ${rule.keyword}`}
    >
      <div
        className="w-full max-w-md border border-hazard/50 bg-panel p-5 shadow-xl clip-chamfer-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="stencil text-lg font-bold text-hazard">{trait}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 border border-rivet px-2 py-0.5 font-mono text-xs uppercase text-muted transition-colors hover:border-hazard hover:text-hazard"
          >
            ✕
          </button>
        </div>
        <p className="text-sm leading-relaxed text-ink">{rule.summary}</p>
        {(rule.book || rule.page) && (
          <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted">
            {rule.book}
            {rule.page ? ` · p.${rule.page}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export function KeywordChips({
  traits,
  rules,
  className = "",
}: {
  /** Comma-separated traits exactly as printed ("Rapid Fire (1), Knockback"). */
  traits: string;
  /** keywordKey → rule entry (built server-side from the database). */
  rules: KeywordRuleMap;
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);

  const list = splitTraits(traits);
  if (list.length === 0) return null;

  const openTrait = open ? list.find((t) => t === open) : null;
  const openRule = openTrait ? rules[keywordKey(openTrait)] : null;

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {list.map((trait) => {
        const rule = rules[keywordKey(trait)];
        return rule ? (
          <button
            key={trait}
            type="button"
            onClick={() => setOpen(trait)}
            title="Click to read the rule"
            className="cursor-pointer rounded-sm border border-rivet/60 bg-elevated/50 px-1.5 py-0.5 text-xs text-ink underline decoration-dotted underline-offset-2 transition-colors hover:border-hazard hover:text-hazard"
          >
            {trait}
          </button>
        ) : (
          <span
            key={trait}
            className="rounded-sm border border-rivet/40 px-1.5 py-0.5 text-xs text-muted"
          >
            {trait}
          </span>
        );
      })}
      {openTrait && openRule && (
        <KeywordModal
          rule={openRule}
          trait={openTrait}
          onClose={() => setOpen(null)}
        />
      )}
    </span>
  );
}
