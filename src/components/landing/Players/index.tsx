import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IDENTITY_BY_SLUG, matchHouseSlug } from "@/components/gangs/match";
import { playerArt } from "./art";

/**
 * 03 // THE PLAYERS (issue #18) — marquee infinito com os jogadores ativos
 * da campanha, entre as seções Gangs e Reports. Mesma técnica do Ticker:
 * lista duplicada + keyframe `ncf-ticker` (translateX até -50%), com pausa
 * no hover via CSS (`.ncf-players-marquee`, globals.css) — zero JS no client.
 *
 * Retratos são assets estáticos mapeados pelo nome do jogador (ver art.ts);
 * jogador sem retrato cai num placeholder temático com a cor da casa.
 */
export type PlayerCardData = {
	id: string;
	playerName: string;
	gangName: string;
	house: string;
};

/** Cards mínimos por metade do loop, pra faixa não ficar rala em telas largas. */
const MIN_CARDS = 8;

function PlayerCard({ player }: { player: PlayerCardData }) {
	const slug = matchHouseSlug(player.house);
	const identity = (slug && IDENTITY_BY_SLUG[slug]) || {
		color: "#c9c9d4",
		shadow: "rgba(201,201,212,.4)",
	};
	const art = playerArt(player.playerName);

	return (
		<figure className="relative m-0 w-[230px] shrink-0 overflow-hidden border border-white/[0.1] bg-[#0f0d14]">
			{/* Filete superior na cor da casa */}
			<span
				className="absolute left-0 top-0 z-[2] h-[3px] w-full"
				style={{ background: identity.color, boxShadow: `0 0 10px ${identity.shadow}` }}
			/>

			<div className="relative aspect-[4/5]">
				{art ? (
					// alt="" proposital: nome/gangue/casa estão em texto logo abaixo —
					// alt repetido viraria leitura duplicada no leitor de tela.
					<Image
						src={art}
						alt=""
						sizes="230px"
						className="h-full w-full object-cover opacity-95"
					/>
				) : (
					<div
						className="flex h-full w-full items-center justify-center"
						style={{
							background: `linear-gradient(150deg, ${identity.color}26, #0a080d 70%)`,
						}}
					>
						<span
							className="text-[64px] font-bold leading-none"
							style={{ color: identity.color, textShadow: `0 0 18px ${identity.shadow}` }}
						>
							{player.playerName.charAt(0).toUpperCase()}
						</span>
					</div>
				)}

				{/* Gradiente de legibilidade + identificação */}
				<figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(7,6,9,.96)_30%,rgba(7,6,9,0))] px-4 pb-3 pt-12">
					<div className="text-[17px] font-bold tracking-[1px] text-ink">
						{player.playerName.toUpperCase()}
					</div>
					<div
						className="truncate font-mono text-[11px] tracking-[1px]"
						style={{ color: identity.color }}
					>
						{player.gangName.toUpperCase()}
					</div>
					<div className="mt-[2px] font-mono text-[10px] tracking-[1px] text-[rgba(245,245,250,.55)]">
						{player.house.toUpperCase()}
					</div>
				</figcaption>
			</div>
		</figure>
	);
}

export default function Players({ players }: { players: PlayerCardData[] }) {
	const t = useTranslations("Players");

	// Sem jogadores (ou banco offline) a seção simplesmente não renderiza —
	// a landing continua íntegra sem um bloco vazio.
	if (players.length === 0) return null;

	// Repete a lista até ter MIN_CARDS por metade; o loop -50% exige duas
	// metades idênticas pra emenda ser invisível.
	const repeats = Math.max(1, Math.ceil(MIN_CARDS / players.length));
	const half = Array.from({ length: repeats }, () => players).flat();

	return (
		<section className="ncf-section border-t border-white/[0.06] bg-[#0a090c] py-[96px]">
			<div className="ncf-wrap mx-auto mb-[44px] max-w-[1380px] px-[48px]">
				<div className="ncf-houses-head flex items-end justify-between gap-4">
					<h2 className="m-0 font-mono text-[13px] font-normal tracking-[4px] text-cyan">
						{t("sectionLabel")}
					</h2>
					<Link
						href="/dashboard"
						className="ncf-util-link font-mono text-[13px] tracking-[2px] text-[rgba(245,245,250,.7)] no-underline"
					>
						{t("standings")}
					</Link>
				</div>
			</div>

			{/* Marquee full-bleed — hover pausa a animação (globals.css) */}
			<div className="ncf-players-marquee overflow-hidden">
				<div className="flex w-max gap-6 pl-6 animate-players">
					<div className="flex shrink-0 gap-6">
						{half.map((p, i) => (
							<PlayerCard key={`${p.id}-${i}`} player={p} />
						))}
					</div>
					{/* Segunda metade: só pro loop visual — escondida de leitores de tela */}
					<div aria-hidden="true" className="flex shrink-0 gap-6">
						{half.map((p, i) => (
							<PlayerCard key={`dup-${p.id}-${i}`} player={p} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
