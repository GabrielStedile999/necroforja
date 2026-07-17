import Link from "next/link";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";

const STRINGS: Record<
	Locale,
	{
		kicker: string;
		title: string;
		playLabel: string;
		playTitle: string;
		playBody: string;
		playCta: string;
		loreLabel: string;
		loreTitle: string;
		loreBody: string;
		loreCta: string;
	}
> = {
	en: {
		kicker: "YOU'VE CHOSEN YOUR SIDE. NOW FIGHT.",
		title: "Forge your gang",
		playLabel: "HOW TO PLAY",
		playTitle: "Learn the flow of a battle",
		playBody:
			"From the pre-battle handshake to the final report: the complete flow of a Necromunda game in interactive checklists.",
		playCta: "START NOW →",
		loreLabel: "LORE & SETTING",
		loreTitle: "Know the world you fight over",
		loreBody:
			"The Imperium, the hive city, the Underhive and the Houses — the context for everything on the table.",
		loreCta: "EXPLORE THE LORE →",
	},
	"pt-BR": {
		kicker: "VOCÊ ESCOLHEU SEU LADO. AGORA LUTE.",
		title: "Forje sua gangue",
		playLabel: "HOW TO PLAY",
		playTitle: "Aprenda o fluxo de uma batalha",
		playBody:
			"Do aperto de mãos antes da batalha ao relatório final: o fluxo completo de um jogo de Necromunda em checklists interativos.",
		playCta: "COMEÇAR AGORA →",
		loreLabel: "LORE & SETTING",
		loreTitle: "Conheça o mundo em disputa",
		loreBody:
			"O Império, a cidade colmeia, o Underhive e as Casas — o contexto de tudo o que acontece na mesa.",
		loreCta: "EXPLORAR O LORE →",
	},
};

/**
 * CTA final da página de Gangues — pontes para o How to Play e o Lore
 * (escopo da issue #8, espelhando o padrão de LoreCTA/HtpCTA).
 */
export default function GangsCTA() {
	const t = STRINGS[useLocale() as Locale] ?? STRINGS.en;

	return (
		<section className="relative overflow-hidden border-t border-white/[0.06] py-[96px] bg-[radial-gradient(120%_140%_at_50%_120%,#1c0e18,#08070a_70%)]">
			<div className="absolute left-0 right-0 top-0 h-1.5 opacity-80 stripe-hazard-top" />

			<div className="ncf-wrap relative z-[2] mx-auto max-w-[1380px] px-[48px]">
				<div className="mb-[14px] text-center font-mono text-[13px] tracking-[5px] text-hazard">
					{t.kicker}
				</div>
				<h2 className="m-0 mb-[44px] text-center text-[clamp(34px,5vw,60px)] font-bold uppercase leading-[0.98] tracking-[2px]">
					{t.title}
				</h2>

				<div className="grid gap-5 md:grid-cols-2">
					<Link
						href="/how-to-play"
						className="clip-card-br-16 group relative block overflow-hidden border border-hazard/30 bg-[linear-gradient(150deg,#1a1020,#0a0810)] p-7 no-underline transition-colors hover:border-hazard"
					>
						<div className="mb-2 font-mono text-[11px] tracking-[2px] text-hazard">{t.playLabel}</div>
						<div className="mb-2 text-[24px] font-bold uppercase leading-[1.05] text-ink">
							{t.playTitle}
						</div>
						<div className="mb-5 max-w-[340px] text-[13px] leading-[1.55] text-[rgba(245,245,250,.6)]">
							{t.playBody}
						</div>
						<span className="font-mono text-[12px] tracking-[2px] text-hazard group-hover:glow-magenta">
							{t.playCta}
						</span>
					</Link>

					<Link
						href="/lore"
						className="clip-card-bl-16 group relative block overflow-hidden border border-cyan/[0.28] bg-[linear-gradient(150deg,#0a1418,#06090d)] p-7 no-underline transition-colors hover:border-cyan"
					>
						<div className="mb-2 font-mono text-[11px] tracking-[2px] text-cyan">{t.loreLabel}</div>
						<div className="mb-2 text-[24px] font-bold uppercase leading-[1.05] text-ink">
							{t.loreTitle}
						</div>
						<div className="mb-5 max-w-[340px] text-[13px] leading-[1.55] text-[rgba(245,245,250,.6)]">
							{t.loreBody}
						</div>
						<span className="font-mono text-[12px] tracking-[2px] text-cyan group-hover:glow-cyan">
							{t.loreCta}
						</span>
					</Link>
				</div>
			</div>
		</section>
	);
}
