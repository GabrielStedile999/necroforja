"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { locales, LOCALE_COOKIE, type Locale } from "@/i18n/config";

/**
 * Language switcher (issue #12) — the ONLY way the locale changes.
 *
 * - Two options: English (default) and Português (BR).
 * - Persists the choice in the NEXT_LOCALE cookie, then refreshes the
 *   current route so server components re-render in the new language.
 * - No browser detection anywhere: no cookie ⇒ English.
 */
const SHORT: Record<Locale, string> = { en: "EN", "pt-BR": "PT" };

/** Mini inline-SVG flags (16×11) — no emoji, renders the same everywhere. */
function FlagUS() {
	return (
		<svg width="16" height="11" viewBox="0 0 16 11" aria-hidden className="shrink-0">
			<rect width="16" height="11" fill="#b22234" />
			<g fill="#fff">
				<rect y="1.57" width="16" height="1.57" />
				<rect y="4.71" width="16" height="1.57" />
				<rect y="7.86" width="16" height="1.57" />
			</g>
			<rect width="7" height="5.5" fill="#3c3b6e" />
			<g fill="#fff">
				<circle cx="1.4" cy="1.4" r="0.45" />
				<circle cx="3.5" cy="1.4" r="0.45" />
				<circle cx="5.6" cy="1.4" r="0.45" />
				<circle cx="2.45" cy="2.75" r="0.45" />
				<circle cx="4.55" cy="2.75" r="0.45" />
				<circle cx="1.4" cy="4.1" r="0.45" />
				<circle cx="3.5" cy="4.1" r="0.45" />
				<circle cx="5.6" cy="4.1" r="0.45" />
			</g>
		</svg>
	);
}

function FlagBR() {
	return (
		<svg width="16" height="11" viewBox="0 0 16 11" aria-hidden className="shrink-0">
			<rect width="16" height="11" fill="#009c3b" />
			<path d="M8 1.2 14.6 5.5 8 9.8 1.4 5.5Z" fill="#ffdf00" />
			<circle cx="8" cy="5.5" r="2.35" fill="#002776" />
			<path d="M5.75 5.1c1.55-.5 3.1-.3 4.45.65l-.1.55c-1.35-.95-2.85-1.15-4.4-.6Z" fill="#fff" />
		</svg>
	);
}

const FLAG: Record<Locale, () => React.ReactElement> = {
	en: FlagUS,
	"pt-BR": FlagBR,
};

/**
 * Persists the chosen locale for 1 year, site-wide. The locale is a display
 * preference only — all data and logic remain in English underneath.
 */
function persistLocale(next: Locale) {
	document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
}

export default function LocaleSwitcher({
	align = "right",
}: {
	/** Dropdown alignment relative to the trigger. */
	align?: "left" | "right";
}) {
	const t = useTranslations("LocaleSwitcher");
	const locale = useLocale() as Locale;
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [, startTransition] = useTransition();
	const rootRef = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		const onDown = (e: MouseEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", onDown);
		return () => document.removeEventListener("mousedown", onDown);
	}, [open]);

	const select = (next: Locale) => {
		setOpen(false);
		if (next === locale) return;
		persistLocale(next);
		startTransition(() => router.refresh());
	};

	return (
		<div ref={rootRef} className="relative">
			<button
				type="button"
				aria-label={t("label")}
				aria-expanded={open}
				aria-haspopup="listbox"
				onClick={() => setOpen((v) => !v)}
				className="cursor-pointer appearance-none border-0 bg-transparent p-0 font-mono text-xs tracking-[1px] text-[rgba(245,245,250,.5)] transition-colors hover:text-ink"
			>
				{SHORT[locale]} ▾
			</button>

			{open && (
				<div
					role="listbox"
					aria-label={t("label")}
					className={`absolute top-[calc(100%+10px)] z-[130] min-w-[230px] border border-white/[0.12] bg-[rgba(9,8,11,.98)] py-1 shadow-mega backdrop-blur-[14px] ${
						align === "right" ? "right-0" : "left-0"
					}`}
				>
					{locales.map((l) => {
						const Flag = FLAG[l];
						return (
							<button
								key={l}
								type="button"
								role="option"
								aria-selected={l === locale}
								onClick={() => select(l)}
								className={`flex w-full cursor-pointer items-center gap-[10px] border-0 bg-transparent px-4 py-[9px] text-left font-mono text-xs tracking-[1px] transition-colors hover:bg-white/[0.06] ${
									l === locale ? "text-hazard" : "text-[rgba(245,245,250,.7)]"
								}`}
							>
								<Flag />
								<span className="flex-1 whitespace-nowrap">{t(l)}</span>
								<span className="text-[10px] opacity-60">{SHORT[l]}</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
