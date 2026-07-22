import Link from "next/link";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";

type Card = { href: string; kicker: string; title: string; text: string; cta: string; accent: "cyan" | "hazard" };

const STRINGS: Record<Locale, { kicker: string; heading: string; cards: Card[] }> = {
	en: {
		kicker: "READY TO FOUND A DYNASTY?",
		heading: "Bring your gang to the table",
		cards: [
			{
				href: "/dashboard",
				kicker: "THE ARANTHIAN SUCCESSION",
				title: "Follow the live campaign",
				text: "Gang rankings, Sympathisers, challenges and Triumphs — the public dashboard of the season in progress.",
				cta: "OPEN DASHBOARD →",
				accent: "cyan",
			},
			{
				href: "/skirmish",
				kicker: "MODES OF PLAY · SKIRMISH",
				title: "Not ready to commit?",
				text: "Try a standalone battle first — same core rules, none of the long-term stakes.",
				cta: "READ SKIRMISH →",
				accent: "hazard",
			},
			{
				href: "/gangs",
				kicker: "THE GREAT HOUSES",
				title: "Choose who you'll fight for",
				text: "Compare all six Clan Houses and the independent gangs before founding your campaign roster.",
				cta: "COMPARE GANGS →",
				accent: "cyan",
			},
		],
	},
	"pt-BR": {
		kicker: "PRONTO PARA FUNDAR UMA DINASTIA?",
		heading: "Leve sua gangue para a mesa",
		cards: [
			{
				href: "/dashboard",
				kicker: "THE ARANTHIAN SUCCESSION",
				title: "Acompanhe a campanha ao vivo",
				text: "Ranking das gangues, Sympathisers, desafios e Triunfos — o dashboard público da temporada em andamento.",
				cta: "ABRIR DASHBOARD →",
				accent: "cyan",
			},
			{
				href: "/skirmish",
				kicker: "MODES OF PLAY · SKIRMISH",
				title: "Ainda não quer se comprometer?",
				text: "Experimente uma batalha avulsa primeiro — as mesmas regras de base, sem as apostas de longo prazo.",
				cta: "LER SOBRE SKIRMISH →",
				accent: "hazard",
			},
			{
				href: "/gangs",
				kicker: "AS GRANDES CASAS",
				title: "Escolha por quem vai lutar",
				text: "Compare as seis Casas Clã e as gangues independentes antes de fundar seu roster de campanha.",
				cta: "COMPARAR GANGUES →",
				accent: "cyan",
			},
		],
	},
};

export default function CpCTA() {
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
