import Link from "next/link";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";

type Card = { href: string; kicker: string; title: string; text: string; cta: string; accent: "cyan" | "hazard" };

const STRINGS: Record<Locale, { kicker: string; heading: string; cards: Card[] }> = {
	en: {
		kicker: "READY FOR THE LONG GAME?",
		heading: "Go beyond one battle",
		cards: [
			{
				href: "/campaign",
				kicker: "MODES OF PLAY · CAMPAIGN",
				title: "See how a campaign works",
				text: "Territories, Boons, Triumphs and the Arbitrator's role — how a Skirmish gang graduates into a persistent story.",
				cta: "READ CAMPAIGN →",
				accent: "cyan",
			},
			{
				href: "/how-to-play",
				kicker: "HOW TO PLAY",
				title: "Learn the full battle flow",
				text: "Pre-battle, battle round, combat and post-battle — the complete sequence of a Necromunda game, step by step.",
				cta: "OPEN THE GUIDE →",
				accent: "hazard",
			},
			{
				href: "/gangs",
				kicker: "THE GREAT HOUSES",
				title: "Pick a House to try",
				text: "Compare all six Clan Houses and the independent gangs before building your Skirmish roster.",
				cta: "COMPARE GANGS →",
				accent: "cyan",
			},
		],
	},
	"pt-BR": {
		kicker: "PRONTO PARA O JOGO LONGO?",
		heading: "Vá além de uma batalha",
		cards: [
			{
				href: "/campaign",
				kicker: "MODES OF PLAY · CAMPAIGN",
				title: "Veja como funciona uma campanha",
				text: "Territórios, Boons, Triunfos e o papel do Arbitrator — como uma gangue de Skirmish vira uma história persistente.",
				cta: "LER SOBRE CAMPAIGN →",
				accent: "cyan",
			},
			{
				href: "/how-to-play",
				kicker: "HOW TO PLAY",
				title: "Aprenda o fluxo completo",
				text: "Pre-battle, battle round, combate e post-battle — a sequência completa de um jogo de Necromunda, passo a passo.",
				cta: "ABRIR O GUIA →",
				accent: "hazard",
			},
			{
				href: "/gangs",
				kicker: "AS GRANDES CASAS",
				title: "Escolha uma Casa para testar",
				text: "Compare as seis Casas Clã e as gangues independentes antes de montar seu roster de Skirmish.",
				cta: "COMPARAR GANGUES →",
				accent: "cyan",
			},
		],
	},
};

export default function SkCTA() {
	const locale = useLocale() as Locale;
	const s = STRINGS[locale];

	return (
		<section className="relative overflow-hidden border-t border-white/[0.06] py-[96px] bg-[radial-gradient(120%_140%_at_50%_120%,#1c0e18,#08070a_70%)]">
			<div className="absolute left-0 right-0 top-0 h-1.5 opacity-80 stripe-hazard-top" />

			<div className="ncf-wrap relative z-[2] mx-auto max-w-[1380px] px-[48px]">
				<div className="mb-[14px] text-center font-mono text-[13px] tracking-[5px] text-hazard">{s.kicker}</div>
				<h2 className="m-0 mb-[44px] text-center text-[clamp(34px,5vw,60px)] font-bold uppercase leading-[0.98] tracking-[2px]">
					{s.heading}
				</h2>

				<div className="grid gap-5 md:grid-cols-3">
					{s.cards.map((card) => {
						const isHazard = card.accent === "hazard";
						return (
							<Link
								key={card.href}
								href={card.href}
								className={`group relative block overflow-hidden border p-6 no-underline transition-colors ${
									isHazard
										? "clip-card-br-16 border-hazard/30 bg-[linear-gradient(150deg,#1a1020,#0a0810)] hover:border-hazard"
										: "clip-card-bl-16 border-cyan/[0.28] bg-[linear-gradient(150deg,#0a1418,#06090d)] hover:border-cyan"
								}`}
							>
								<div className={`mb-2 font-mono text-[11px] tracking-[2px] ${isHazard ? "text-hazard" : "text-cyan"}`}>{card.kicker}</div>
								<div className="mb-2 text-[21px] font-bold uppercase leading-[1.05] text-ink">{card.title}</div>
								<div className="mb-5 text-justify text-[13px] leading-[1.55] text-[rgba(245,245,250,.6)]">{card.text}</div>
								<span
									className={`font-mono text-[12px] tracking-[2px] ${
										isHazard ? "text-hazard group-hover:glow-magenta" : "text-cyan group-hover:glow-cyan"
									}`}
								>
									{card.cta}
								</span>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
