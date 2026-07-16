import Link from "next/link";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";

type InternalCard = {
	href: string;
	kicker: string;
	title: string;
	text: string;
	cta: string;
	accent: "cyan" | "hazard";
};

type ExternalCard = { href: string; label: string; text: string };

/** Per-locale strings owned by this component. */
const STRINGS: Record<
	Locale,
	{
		kicker: string;
		heading: string;
		externalHeader: string;
		internal: InternalCard[];
		external: ExternalCard[];
	}
> = {
	en: {
		kicker: "YOU KNOW HOW TO PLAY. NOW PLAY.",
		heading: "Forge your gang",
		externalHeader: "EXTERNAL RESOURCES",
		internal: [
			{
				href: "/lore",
				kicker: "LORE & SETTING",
				title: "Know the world before you descend",
				text: "The Imperium, the hive city, the Underhive and the Clan Houses — the context for everything you will fight over at the table.",
				cta: "EXPLORE THE LORE →",
				accent: "cyan",
			},
			{
				href: "/player/assistant",
				kicker: "RULES ASSISTANT",
				title: "Rules question mid-battle?",
				text: "NecroForja's rules chat answers based on the Core Rulebook and the campaign documents. Requires a player login.",
				cta: "OPEN THE CHAT →",
				accent: "hazard",
			},
			{
				href: "/dashboard",
				kicker: "THE ARANTHIAN SUCCESSION",
				title: "Follow the campaign live",
				text: "Gang rankings, territories, challenges and triumphs — the public dashboard of the season in progress.",
				cta: "VIEW DASHBOARD →",
				accent: "cyan",
			},
		],
		external: [
			{
				href: "https://www.warhammer.com",
				label: "WARHAMMER.COM",
				text: "Official Necromunda miniatures, books and releases (Games Workshop).",
			},
			{
				href: "https://yaktribe.games",
				label: "YAKTRIBE.GAMES",
				text: "Community tools: gang manager, tables and references.",
			},
		],
	},
	"pt-BR": {
		kicker: "VOCÊ SABE COMO JOGAR. AGORA JOGUE.",
		heading: "Forje sua gangue",
		externalHeader: "RECURSOS EXTERNOS",
		internal: [
			{
				href: "/lore",
				kicker: "LORE & SETTING",
				title: "Conheça o mundo antes de descer",
				text: "O Império, a cidade colmeia, o Underhive e as Casas Clã — o contexto de tudo o que você vai disputar na mesa.",
				cta: "EXPLORAR O LORE →",
				accent: "cyan",
			},
			{
				href: "/player/assistant",
				kicker: "ASSISTENTE DE REGRAS",
				title: "Dúvida no meio da batalha?",
				text: "O chat de regras da NecroForja responde com base no Core Rulebook e nos documentos da campanha. Requer login de jogador.",
				cta: "ABRIR O CHAT →",
				accent: "hazard",
			},
			{
				href: "/dashboard",
				kicker: "THE ARANTHIAN SUCCESSION",
				title: "Acompanhe a campanha ao vivo",
				text: "Ranking das gangues, territórios, desafios e triunfos — o dashboard público da temporada em andamento.",
				cta: "VER DASHBOARD →",
				accent: "cyan",
			},
		],
		external: [
			{
				href: "https://www.warhammer.com",
				label: "WARHAMMER.COM",
				text: "Miniaturas, livros e lançamentos oficiais de Necromunda (Games Workshop).",
			},
			{
				href: "https://yaktribe.games",
				label: "YAKTRIBE.GAMES",
				text: "Ferramentas da comunidade: gang manager, tabelas e referências.",
			},
		],
	},
};

/**
 * CTA final do How to Play — recursos internos (lore, chat de regras,
 * dashboard) e externos (escopo da issue #7).
 */
export default function HtpCTA() {
	const locale = useLocale() as Locale;
	const s = STRINGS[locale];

	return (
		<section className="relative overflow-hidden border-t border-white/[0.06] py-[96px] bg-[radial-gradient(120%_140%_at_50%_120%,#1c0e18,#08070a_70%)]">
			<div className="absolute left-0 right-0 top-0 h-1.5 opacity-80 stripe-hazard-top" />

			<div className="ncf-wrap relative z-[2] mx-auto max-w-[1380px] px-[48px]">
				<div className="mb-[14px] text-center font-mono text-[13px] tracking-[5px] text-hazard">
					{s.kicker}
				</div>
				<h2 className="m-0 mb-[44px] text-center text-[clamp(34px,5vw,60px)] font-bold uppercase leading-[0.98] tracking-[2px]">
					{s.heading}
				</h2>

				<div className="grid gap-5 md:grid-cols-3">
					{s.internal.map((card) => {
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
								<div className={`mb-2 font-mono text-[11px] tracking-[2px] ${isHazard ? "text-hazard" : "text-cyan"}`}>
									{card.kicker}
								</div>
								<div className="mb-2 text-[21px] font-bold uppercase leading-[1.05] text-ink">
									{card.title}
								</div>
								<div className="mb-5 text-justify text-[13px] leading-[1.55] text-[rgba(245,245,250,.6)]">
									{card.text}
								</div>
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

				{/* Recursos externos */}
				<div className="mt-10 border-t border-white/[0.07] pt-8">
					<div className="mb-5 text-center font-mono text-[11px] tracking-[3px] text-[rgba(245,245,250,.45)]">
						{"// "}
						{s.externalHeader}
					</div>
					<div className="flex flex-wrap justify-center gap-4">
						{s.external.map((r) => (
							<a
								key={r.href}
								href={r.href}
								target="_blank"
								rel="noopener noreferrer"
								className="clip-chamfer-sm group block max-w-[360px] border border-white/[0.1] bg-[rgba(255,255,255,.02)] px-6 py-4 no-underline transition-colors hover:border-white/[0.3]"
							>
								<div className="mb-1 font-mono text-[12px] tracking-[2px] text-ink group-hover:text-cyan">
									{r.label} ↗
								</div>
								<div className="text-justify text-[12.5px] leading-[1.55] text-[rgba(245,245,250,.55)]">{r.text}</div>
							</a>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
