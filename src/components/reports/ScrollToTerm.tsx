"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeForSearch } from "@/lib/search/pages";

/**
 * Scrolls to and highlights the first occurrence of `?q=` inside a
 * container (issue #15 follow-up) — journal posts have no internal anchors
 * to deep-link into like the static content pages, so a search result for a
 * post instead lands here and this walks the rendered markdown body to find
 * and jump to the matched term.
 *
 * Renders nothing; runs once on mount. Safe no-op when `q` is absent/blank
 * or no match is found in the DOM (e.g. the term is only in the excerpt,
 * not the body).
 */
export default function ScrollToTerm({ containerId }: { containerId: string }) {
	const searchParams = useSearchParams();
	const term = searchParams.get("q")?.trim() ?? "";

	useEffect(() => {
		if (!term) return;

		const container = document.getElementById(containerId);
		if (!container) return;

		// Guards against React StrictMode's dev-only double-invoke of effects:
		// without this, a second run would walk the now-already-marked DOM and
		// wrap the *next* occurrence too, leaving two highlights instead of one.
		if (container.dataset.scrollToTermDone === term) return;
		container.dataset.scrollToTermDone = term;

		const match = findFirstTextMatch(container, term);
		if (!match) return;

		const { node, index, length } = match;
		const range = document.createRange();
		range.setStart(node, index);
		range.setEnd(node, index + length);

		const mark = document.createElement("mark");
		mark.className = "bg-hazard/30 text-ink";
		try {
			range.surroundContents(mark);
		} catch {
			// Range spans multiple elements (shouldn't happen for a plain text
			// node match) — bail out rather than risk corrupting the DOM.
			return;
		}

		mark.scrollIntoView({ behavior: "smooth", block: "center" });
		// eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per mount/term; containerId is stable.
	}, [term]);

	return null;
}

type TextMatch = { node: Text; index: number; length: number };

/** Case/accent-insensitive first-match search across a container's text nodes. */
function findFirstTextMatch(container: HTMLElement, term: string): TextMatch | null {
	const normalizedTerm = normalizeForSearch(term);
	if (!normalizedTerm) return null;

	const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
	let node: Node | null;
	while ((node = walker.nextNode())) {
		const text = node.textContent ?? "";
		const normalizedText = normalizeForSearch(text);
		if (normalizedText.length !== text.length) continue; // see splitByMatch's same guard
		const idx = normalizedText.indexOf(normalizedTerm);
		if (idx !== -1) {
			return { node: node as Text, index: idx, length: normalizedTerm.length };
		}
	}
	return null;
}
