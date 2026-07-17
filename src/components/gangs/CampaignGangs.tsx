import Link from "next/link";
import { IDENTITY_BY_SLUG, matchHouseSlug } from "./match";

/** Linha pública e leve da tabela `gang` (ver listGangsPublic em queries.ts). */
export type CampaignGangRow = {
	id: string;
	name: string;
	house: string;
	ratingCached: number;
	reputation: number;
};

type UiLabels = {
	campaignRating: string;
	campaignRep: string;
	campaignHouseLabel: string;
	campaignEmpty: string;
	campaignOffline: string;
	campaignCta: string;
};

/**
 * Seção "Na campanha" (issue #8) — integração com a tabela `gang`: as gangues
 * registradas na temporada ao vivo, com rating e reputação, ligadas à
 * identidade visual do catálogo acima. `gangs === null` indica falha de
 * leitura do banco (fallback gracioso).
 */
export default function CampaignGangs({
	gangs,
	ui,
}: {
	gangs: CampaignGangRow[] | null;
	ui: UiLabels;
}) {
	if (gangs === null || gangs.length === 0) {
		return (
			<div className="clip-chamfer-sm border border-white/[0.1] bg-[rgba(15,13,20,.82)] p-6">
				<p className="m-0 text-[14px] leading-[1.7] text-[rgba(245,245,250,.6)]">
					{gangs === null ? ui.campaignOffline : ui.campaignEmpty}
				</p>
				<Link
					href="/dashboard"
					className="mt-4 inline-block font-mono text-[12px] tracking-[2px] text-cyan no-underline hover:glow-cyan"
				>
					{ui.campaignCta}
				</Link>
			</div>
		);
	}

	return (
		<div>
			<div className="grid gap-4 md:grid-cols-2">
				{gangs.map((gang) => {
					const slug = matchHouseSlug(gang.house);
					const identity = (slug && IDENTITY_BY_SLUG[slug]) || {
						color: "#c9c9d4",
						shadow: "rgba(201,201,212,.4)",
					};
					const inner = (
						<>
							<span
								className="h-[42px] w-1 shrink-0"
								style={{ background: identity.color, boxShadow: `0 0 10px ${identity.shadow}` }}
							/>
							<div className="min-w-0 flex-1">
								<div className="truncate text-[17px] font-bold tracking-[0.5px]">{gang.name}</div>
								<div className="font-mono text-[11px] tracking-[1px] text-[rgba(245,245,250,.5)]">
									{ui.campaignHouseLabel}: <span style={{ color: identity.color }}>{gang.house.toUpperCase()}</span>
								</div>
							</div>
							<div className="flex shrink-0 gap-4 font-mono text-[11px] tracking-[1px] text-[rgba(245,245,250,.6)]">
								<span>
									{ui.campaignRating} <span className="text-ink">{gang.ratingCached}</span>
								</span>
								<span>
									{ui.campaignRep} <span className="text-ink">{gang.reputation}</span>
								</span>
							</div>
						</>
					);
					const className =
						"clip-chamfer-sm flex items-center gap-4 border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.008))] px-5 py-4 no-underline text-ink transition-colors hover:border-white/[0.25]";
					return slug ? (
						<a key={gang.id} href={`#${slug}`} className={className}>
							{inner}
						</a>
					) : (
						<div key={gang.id} className={className.replace(" hover:border-white/[0.25]", "")}>
							{inner}
						</div>
					);
				})}
			</div>

			<Link
				href="/dashboard"
				className="mt-6 inline-block font-mono text-[12px] tracking-[2px] text-cyan no-underline hover:glow-cyan"
			>
				{ui.campaignCta}
			</Link>
		</div>
	);
}
