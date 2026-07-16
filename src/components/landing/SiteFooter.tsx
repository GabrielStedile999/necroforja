import Link from "next/link";
import { useTranslations } from "next-intl";

/**
 * Site footer — Tailwind-only, no inline styles.
 *
 * i18n: hrefs/keys stay in English here; labels come from
 * messages/<locale>.json (Footer namespace).
 */
const LINK_GROUPS = [
	{
		headingKey: "game",
		links: [
			{ key: "overview", href: "/" },
			{ key: "factions", href: "#factions" },
			{ key: "roadmap", href: "/" },
			{ key: "dashboard", href: "/dashboard" },
		],
	},
	{
		headingKey: "community",
		links: [
			{ key: "discord", href: "/" },
			{ key: "news", href: "/" },
			{ key: "creators", href: "/" },
			{ key: "forums", href: "/" },
		],
	},
	{
		headingKey: "support",
		links: [
			{ key: "help", href: "/" },
			{ key: "status", href: "/" },
			{ key: "contact", href: "/" },
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

				{/* Bottom bar */}
				<div className="flex flex-wrap items-center justify-between gap-[14px] border-t border-white/[0.07] pt-[26px] font-mono text-[11px] tracking-[1px] text-[rgba(245,245,250,.35)]">
					<span>{t("copyright")}</span>
					<div className="flex gap-[18px]">
						<span className="cursor-pointer">{t("privacy")}</span>
						<span className="cursor-pointer">{t("terms")}</span>
						<span>◈ ◇ ◆</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
