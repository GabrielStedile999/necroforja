"use client";

import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";
import { splitByMatch } from "@/lib/search/highlight";
import type { SearchResponse, SearchResultItem } from "@/app/api/search/route";

export type SiteSearchHandle = { open: () => void };

const DEBOUNCE_MS = 250;

/** kind → i18n group-label key, in display order. */
const GROUP_ORDER: { kind: SearchResultItem["kind"]; labelKey: string }[] = [
	{ kind: "page", labelKey: "groupPages" },
	{ kind: "post", labelKey: "groupReports" },
	{ kind: "rule", labelKey: "groupRules" },
];

function Highlighted({ text, query }: { text: string; query: string }) {
	if (!text) return null;
	return (
		<>
			{splitByMatch(text, query).map((seg, i) =>
				seg.match ? (
					<mark key={i} className="bg-hazard/30 text-ink">
						{seg.text}
					</mark>
				) : (
					<span key={i}>{seg.text}</span>
				),
			)}
		</>
	);
}

/**
 * Command-palette site search (issue #15) — triggered by the (previously
 * inert) search buttons in SiteNav, Cmd/Ctrl+K, or "/" outside of inputs.
 *
 * Searches static pages, the campaign journal (issue #5) and the rules
 * corpus via a single call to /api/search; keyboard-navigable, highlights
 * the matched term, and suggests the Rules Assistant on an empty result.
 */
export const SiteSearch = forwardRef<SiteSearchHandle>(function SiteSearch(
	_props,
	ref,
) {
	const t = useTranslations("Search");
	const locale = useLocale() as Locale;
	const router = useRouter();

	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResultItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);

	const inputRef = useRef<HTMLInputElement>(null);
	const abortRef = useRef<AbortController | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const trimmedQuery = query.trim();
	// Queries under 2 chars never triggered a fetch (see the effect below) —
	// derive the empty list here instead of resetting `results` in an effect.
	const displayResults = trimmedQuery.length >= 2 ? results : [];

	const close = useCallback(() => {
		setIsOpen(false);
		setQuery("");
		setResults([]);
		setActiveIndex(0);
		abortRef.current?.abort();
		if (debounceRef.current) clearTimeout(debounceRef.current);
	}, []);

	const open = useCallback(() => {
		setIsOpen(true);
	}, []);

	useImperativeHandle(ref, () => ({ open }), [open]);

	// Autofocus the input once the dialog mounts.
	useEffect(() => {
		if (isOpen) {
			// Next tick — element needs to exist before focusing.
			const id = requestAnimationFrame(() => inputRef.current?.focus());
			return () => cancelAnimationFrame(id);
		}
	}, [isOpen]);

	// Global shortcuts: Cmd/Ctrl+K always; "/" only when not typing elsewhere.
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
			const target = e.target as HTMLElement | null;
			const isTypingElsewhere =
				!isOpen &&
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable);

			if (isCmdK) {
				e.preventDefault();
				setIsOpen((prev) => !prev);
				return;
			}
			if (!isOpen && e.key === "/" && !isTypingElsewhere) {
				e.preventDefault();
				open();
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isOpen, open]);

	// Debounced fetch whenever the query changes while open. Queries shorter
	// than 2 chars are handled in render (via `displayResults`) rather than by
	// resetting state here — avoids a setState-in-effect on every keystroke.
	useEffect(() => {
		if (!isOpen) return;
		if (debounceRef.current) clearTimeout(debounceRef.current);

		const trimmed = query.trim();
		if (trimmed.length < 2) return;

		debounceRef.current = setTimeout(() => {
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;
			setLoading(true);

			fetch(
				`/api/search?q=${encodeURIComponent(trimmed)}&locale=${encodeURIComponent(locale)}`,
				{ signal: controller.signal },
			)
				.then((res) => (res.ok ? (res.json() as Promise<SearchResponse>) : null))
				.then((data) => {
					setResults(data?.results ?? []);
					setActiveIndex(0);
				})
				.catch((error: unknown) => {
					if ((error as { name?: string }).name !== "AbortError") {
						setResults([]);
					}
				})
				.finally(() => setLoading(false));
		}, DEBOUNCE_MS);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only on query/isOpen; locale rarely changes mid-search.
	}, [query, isOpen]);

	const navigateTo = useCallback(
		(href: string) => {
			close();
			router.push(href);
		},
		[close, router],
	);

	function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Escape") {
			e.preventDefault();
			close();
			return;
		}
		if (!displayResults.length) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((i) => (i + 1) % displayResults.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((i) => (i - 1 + displayResults.length) % displayResults.length);
		} else if (e.key === "Enter") {
			e.preventDefault();
			const item = displayResults[activeIndex];
			if (item) navigateTo(item.href);
		}
	}

	if (!isOpen) return null;

	const showEmptyState =
		trimmedQuery.length >= 2 && !loading && displayResults.length === 0;

	return (
		<div
			className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
			onClick={close}
			role="presentation"
		>
			<div
				className="w-full max-w-[600px] border border-white/[0.12] bg-[#0b0a0d] shadow-2xl"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-label={t("ariaLabel")}
			>
				<div className="flex items-center gap-3 border-b border-white/[0.1] px-4 py-3">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className="shrink-0 text-muted"
					>
						<circle cx="11" cy="11" r="7" />
						<line x1="21" y1="21" x2="16.5" y2="16.5" />
					</svg>
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={onInputKeyDown}
						placeholder={t("placeholder")}
						className="w-full bg-transparent font-mono text-sm text-ink placeholder:text-muted focus:outline-none"
						aria-label={t("ariaLabel")}
						autoComplete="off"
						spellCheck={false}
					/>
					<button
						onClick={close}
						aria-label={t("close")}
						className="shrink-0 font-mono text-[11px] tracking-[1px] text-muted hover:text-ink"
					>
						ESC
					</button>
				</div>

				<div className="max-h-[55vh] overflow-y-auto">
					{showEmptyState && (
						<div className="px-4 py-6 text-center">
							<p className="mb-3 text-sm text-muted">
								{t("noResults", { query: trimmedQuery })}
							</p>
							<a
								href="/player/assistant"
								onClick={close}
								className="font-mono text-[12px] tracking-[1px] text-cyan underline decoration-cyan/40 underline-offset-4 hover:decoration-cyan"
							>
								{t("tryAssistant")}
							</a>
						</div>
					)}

					{!showEmptyState && trimmedQuery.length < 2 && (
						<p className="px-4 py-6 text-center text-sm text-muted">{t("hint")}</p>
					)}

					{trimmedQuery.length >= 2 && loading && displayResults.length === 0 && (
						<p className="px-4 py-6 text-center font-mono text-[12px] tracking-[1px] text-muted">
							{t("searching")}
						</p>
					)}

					{GROUP_ORDER.map(({ kind, labelKey }) => {
						const group = displayResults.filter((r) => r.kind === kind);
						if (!group.length) return null;
						return (
							<div key={kind} className="py-2">
								<div className="px-4 pb-1 font-mono text-[11px] tracking-[3px] text-cyan">
									{t(labelKey)}
								</div>
								{group.map((item) => {
									const globalIndex = displayResults.indexOf(item);
									const active = globalIndex === activeIndex;
									return (
										<button
											key={`${item.kind}-${item.id}`}
											onClick={() => navigateTo(item.href)}
											onMouseEnter={() => setActiveIndex(globalIndex)}
											className={`block w-full px-4 py-2 text-left transition-colors ${
												active ? "bg-white/[0.06]" : ""
											}`}
										>
											<div className="text-[14px] text-ink">
												<Highlighted text={item.title} query={trimmedQuery} />
											</div>
											{item.subtitle && (
												<div className="mt-0.5 line-clamp-1 text-[12px] text-muted">
													<Highlighted text={item.subtitle} query={trimmedQuery} />
												</div>
											)}
										</button>
									);
								})}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
});
