import Link from "next/link";
import { useTranslations } from "next-intl";

/**
 * Site footer — Tailwind-only, no inline styles.
 *
 * i18n: hrefs/keys stay in English here; labels come from
 * messages/<locale>.json (Footer namespace).
 */
/**
 * Every entry points at a real, existing route (issue #39) — the old
 * placeholder links (roadmap, discord, forums, help, status…) are gone.
 */
const LINK_GROUPS = [
	{
		headingKey: "game",
		links: [
			{ key: "overview", href: "/" },
			{ key: "howToPlay", href: "/how-to-play" },
			{ key: "lore", href: "/lore" },
			{ key: "factions", href: "/gangs" },
			{ key: "skirmish", href: "/skirmish" },
			{ key: "campaignMode", href: "/campaign" },
		],
	},
	{
		headingKey: "campaign",
		links: [
			{ key: "dashboard", href: "/dashboard" },
			{ key: "reports", href: "/reports" },
			{ key: "gallery", href: "/gallery" },
			{ key: "houseRules", href: "/house-rules" },
		],
	},
	{
		headingKey: "support",
		links: [
			{ key: "faq", href: "/faq" },
			{ key: "creator", href: "/creator" },
			{ key: "contact", href: "/contact" },
			{ key: "account", href: "/login" },
		],
	},
] as const;

export default function SiteFooter() {
	const t = useTranslations("Footer");

	return (
		<footer className="ncf-section border-t border-white/[0.08] bg-[#070609] pt-[72px] pb-[44px]">
			<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
				{/* Main columns */}
				<div className="mb-[52px] flex flex-wrap justify-between gap-[40px]">
					{/* Brand */}
					<div className="basis-[320px] shrink-0">
						<div className="mb-4 flex items-center gap-[10px]">
							<span className="text-hazard text-[20px]">◣</span>
							<span className="font-bold tracking-[5px] text-[17px]">NECROFORJA</span>
						</div>
						<p className="m-0 max-w-[260px] text-[13px] leading-[1.6] text-[rgba(245,245,250,.45)]">
							{t("blurb")}
						</p>
					</div>

					{/* Link groups */}
					<div className="ncf-footer-links flex flex-wrap gap-[72px] font-mono">
						{LINK_GROUPS.map((group) => (
							<div key={group.headingKey}>
								<div className="mb-4 text-xs tracking-[2px] text-[rgba(245,245,250,.4)]">
									{t(`headings.${group.headingKey}`)}
								</div>
								<div className="flex flex-col gap-[11px] text-[13px] text-[rgba(245,245,250,.65)]">
									{group.links.map((l) => (
										<Link
											key={l.key}
											href={l.href}
											className="ncf-util-link no-underline text-[rgba(245,245,250,.65)]"
										>
											{t(`links.${l.key}`)}
										</Link>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Games Workshop IP disclaimer (issue #17) — unofficial fan project,
				    wording aligned with GW's fan-site guidelines. */}
				<p className="m-0 mb-[22px] max-w-[980px] text-[11px] leading-[1.7] text-[rgba(245,245,250,.35)]">
					{t("gwDisclaimer")}
				</p>

				{/* Bottom bar */}
				<div className="flex flex-wrap items-center justify-between gap-[14px] border-t border-white/[0.07] pt-[26px] font-mono text-[11px] tracking-[1px] text-[rgba(245,245,250,.35)]">
					<div className="flex flex-col gap-[6px]">
						<span>{t("copyright")}</span>
						{/* Créditos do criador (issue #49) */}
						<span className="text-[rgba(245,245,250,.45)]">
							{t.rich("credit", {
								link: (chunks) => (
									<a
										href="https://www.linkedin.com/in/gabriel-stedile/"
										target="_blank"
										rel="noopener noreferrer"
										className="ncf-util-link text-[rgba(245,245,250,.65)] underline underline-offset-2"
									>
										{chunks}
									</a>
								),
							})}
						</span>
					</div>
					<div className="flex gap-[18px]">
						<Link
							href="/privacy"
							className="ncf-util-link no-underline text-[rgba(245,245,250,.35)]"
						>
							{t("privacy")}
						</Link>
						<Link
							href="/terms"
							className="ncf-util-link no-underline text-[rgba(245,245,250,.35)]"
						>
							{t("terms")}
						</Link>
						<span>◈ ◇ ◆</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
