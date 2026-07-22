// Modos de Jogo — Campaign (issue #35).
// Conteúdo em PT-BR, jargão de jogo em EN — mesmo padrão do how-to-play/lore.
// Fontes: Necromunda Core Rulebook (2023), pg. 164-181 (The Dominion Campaign)
// e Necromunda: The Aranthian Succession — Cinderak Burning, pg. 55-67
// (The Succession Campaign — a campanha narrativa em curso na NecroForja).

export type CpAccent = "hazard" | "cyan" | "violet" | "rust" | "toxic";

export type CpChapter = {
	id: string;
	num: string;
	title: string;
	accent: CpAccent;
};

/** Capítulos da página — alimentam a sub-navegação sticky (LoreNav). */
export const CP_CHAPTERS: CpChapter[] = [
	{ id: "o-que-e", num: "00", title: "O que é", accent: "cyan" },
	{ id: "ciclo", num: "01", title: "O ciclo da campanha", accent: "hazard" },
	{ id: "territorios", num: "02", title: "Territórios & Boons", accent: "violet" },
	{ id: "triunfos", num: "03", title: "Triunfos", accent: "rust" },
	{ id: "aranthian-succession", num: "04", title: "Aranthian Succession", accent: "toxic" },
];

export const CP_INTRO = {
	image: "clan-houses",
	kicker: "// MODES OF PLAY · CAMPAIGN",
	lead: "Uma gangue. Muitas batalhas. Uma história que fica.",
	body:
		"Campaign é o modo que Necromunda foi desenhado para se jogar: uma série de batalhas encadeadas em que cada partida muda o mapa e a mesma gangue carrega cicatrizes, veteranos e território de uma noite para a outra. É aqui que Reputation vira lenda, Territórios geram renda entre batalhas e um fighter perdido dói de verdade.",
	close: "BASEADO NO NECROMUNDA CORE RULEBOOK (2023) E EM THE ARANTHIAN SUCCESSION: CINDERAK BURNING",
};

/* ─────────────────────────────── 01 · CICLO ────────────────────────────── */

export type CampaignPhase = {
	id: string;
	num: string;
	title: string;
	length: string;
	text: string;
	bullets: string[];
	accent: CpAccent;
};

export const CAMPAIGN_PHASES: CampaignPhase[] = [
	{
		id: "occupation",
		num: "1",
		title: "Occupation phase",
		length: "3 ciclos",
		text: "As gangues brigam para conquistar o máximo de Território possível e crescer sua influência.",
		bullets: [
			"Só Territórios ainda não conquistados podem ser reivindicados como recompensa — a menos que não sobre nenhum livre.",
			"Desafios seguem uma ordem: no 1º ciclo, aleatória; nos seguintes, do menor para o maior Gang Rating.",
			"O desafiante escolhe qual Território livre está em jogo na batalha.",
		],
		accent: "hazard",
	},
	{
		id: "downtime",
		num: "2",
		title: "Downtime",
		length: "1 ciclo",
		text: "Uma pausa para respirar: fighters se recuperam, cativos voltam e a gangue se reabastece antes do confronto final.",
		bullets: [
			"Fighters In Recovery são liberados e Captives retornam (a gangue captora recebe metade do valor em créditos).",
			"Juves e Prospects com 3+ Advancements podem ser promovidos.",
			"Todas as gangues recebem 250 créditos extras para gastar imediatamente em equipamento ou recrutas.",
			"Jogadores mais ansiosos podem disputar side battles — divertidas, mas sem efeito na campanha.",
		],
		accent: "cyan",
	},
	{
		id: "takeover",
		num: "3",
		title: "Takeover phase",
		length: "3 ciclos",
		text: "As gangues defendem o que conquistaram e tentam tomar Território de rivais.",
		bullets: [
			"Só Territórios já controlados por alguém podem ser disputados e reivindicados.",
			"Um empate mantém o Território com quem já o controlava.",
			"É a fase decisiva — o mapa final da campanha começa a se definir aqui.",
		],
		accent: "toxic",
	},
];

export const ARBITRATOR_ROLE = {
	title: "O Arbitrator",
	text:
		"Toda campanha precisa de alguém nesse papel: organiza a lista de gangues, mantém todo mundo informado sobre o progresso e o controle de Territórios, e decide quando cada fase e a campanha inteira começam e terminam. Pode ser um jogador dedicado ou alguém rotativo do grupo — o importante é ter uma referência única para dúvidas de regra e desempates.",
};

/* ──────────────────────── 02 · TERRITÓRIOS & BOONS ─────────────────────── */

export type Territory = {
	id: string;
	name: string;
	card: string;
	house: string;
	flavor: string;
	boonLabel: string;
	boonText: string;
	enhancedBoonLabel: string;
	enhancedBoonText: string;
};

/**
 * Um único exemplo (Generatorium) cobrindo toda a estrutura de um Território:
 * flavor, Territory Boon (aqui do tipo Special) e Enhanced Boon (aqui do tipo
 * Reputation, exclusivo de uma House). A lista completa de Territórios está
 * no Core Rulebook (pg. 173-181).
 */
export const TERRITORIES: Territory[] = [
	{
		id: "generatorium",
		name: "Generatorium",
		card: "Valete de Espadas",
		house: "Van Saar",
		flavor:
			"Boa parte da luz e da energia do underhive depende de derivações em condutos de energia ou de geradores mal conservados. Quem controla a fonte dessa energia pode deixá-la fluir… ou cortá-la à vontade.",
		boonLabel: "Special",
		boonText:
			"Se sua gangue controla este Território, você pode escolher travar os geradores, cortando temporariamente a energia da área onde a batalha acontece e mergulhando-a na escuridão. Você pode declarar que fará isso no início de qualquer Priority phase, antes da rolagem de Priority. Pelo restante da batalha, as regras de Pitch Black (pg. 193) entram em vigor. No entanto, no início de cada End phase, antes de qualquer Bottle check, o jogador que controla este Território rola 1D6: em um resultado de 5+, os geradores reiniciam e o Pitch Black cessa imediatamente; em um resultado de 1-4, os geradores continuam silenciosos.",
		enhancedBoonLabel: "Reputation",
		enhancedBoonText: "Enquanto controla este Território, uma gangue de House Van Saar adiciona +1 à sua Reputation.",
	},
];

export const TERRITORY_MECHANICS = [
	"O número de Territórios em uma campanha depende da quantidade de jogadores: 9 para 3 jogadores, até 24 para 8 (pg. 167).",
	"Territórios são sorteados de um baralho — metade das cartas de um baralho comum representa a lista completa (pg. 167).",
	"Um Território perdido tira o Boon junto — a gangue só se beneficia dele enquanto o controla.",
	"Enhanced Boons: muitos Territórios têm uma versão ainda melhor de um dos Boons (ou um Boon extra) para gangues de uma House específica — no exemplo acima, é a House Van Saar que ganha o bônus de Reputation.",
];

/* ──────────────────────────────── 03 · TRIUNFOS ────────────────────────── */

export type Triumph = { id: string; name: string; criteria: string };

export const DOMINION_TRIUMPHS: Triumph[] = [
	{ id: "dominator", name: "Dominator", criteria: "Mais Territórios ao fim da campanha." },
	{ id: "slaughterer", name: "Slaughterer", criteria: "Mais fighters inimigos Out of Action e veículos Wrecked na campanha inteira." },
	{ id: "creditor", name: "Creditor", criteria: "Maior Wealth ao fim da campanha." },
	{ id: "warmonger", name: "Warmonger", criteria: "Mais batalhas disputadas na campanha inteira." },
	{ id: "powerbroker", name: "Powerbroker", criteria: "Maior Reputation ao fim da campanha." },
];

/* ─────────────────── 04 · THE ARANTHIAN SUCCESSION ─────────────────────── */

export const SUCCESSION_INTRO = {
	text:
		"O framework de Territórios acima vem direto do Core Rulebook (a Dominion Campaign) — mas a campanha que roda de verdade na NecroForja é outra: The Aranthian Succession, do livro Cinderak Burning. Mesma espinha dorsal (ciclos, Arbitrator, income, Triunfos), com uma virada narrativa: Necromunda mergulhou na Great Darkness, e as gangues escolhem um lado na guerra civil que se seguiu.",
};

export type SuccessionPhase = {
	id: string;
	title: string;
	length: string;
	text: string;
};

export const SUCCESSION_PHASES: SuccessionPhase[] = [
	{
		id: "great-darkness",
		title: "Great Darkness",
		length: "3 ciclos",
		text: "Cortadas de suas Houses, as gangues lutam para sobreviver e consolidar poder. Sem recrutar do House Equipment List, Trading Post mais caro e restrito, e batalhas Sector Mechanicus/Zone Mortalis em Pitch Black.",
	},
	{
		id: "downtime-succession",
		title: "Downtime",
		length: "1 ciclo",
		text: "Além dos efeitos normais de Downtime, é aqui que cada gangue precisa Declare Allegiance — Imperial House, Lady Credo's Rebellion, ou seguir Unaligned por mais um tempo.",
	},
	{
		id: "spark-of-rebellion",
		title: "Spark of Rebellion",
		length: "3 ciclos",
		text: "A guerra civil se acirra: gangues defendem seus Sympathisers e tentam conquistar os dos rivais. Trading Post volta ao normal e Pitch Black deixa de ser automático.",
	},
];

export type Allegiance = {
	id: string;
	name: string;
	tagline: string;
	benefits: string[];
	accent: CpAccent;
};

export const ALLEGIANCES: Allegiance[] = [
	{
		id: "imperial-house",
		name: "Imperial House",
		tagline: "Defender a ordem de Lord Helmawr",
		benefits: [
			"Emissaries of House Helmawr: chance de recrutar uma Dramatis Personae de graça no pre-battle.",
			"Deep Pockets: +D6×10 créditos extras ao coletar Income de Sympathisers.",
		],
		accent: "cyan",
	},
	{
		id: "ladys-rebellion",
		name: "Lady Credo's Rebellion",
		tagline: "Lutar pela revolução",
		benefits: [
			"Emissaries of the Rebellion: chance de recrutar uma Dramatis Personae de graça no pre-battle.",
			"Stars in the Ascendency: +1 Reputation extra a cada batalha vencida.",
		],
		accent: "hazard",
	},
	{
		id: "unaligned",
		name: "Unaligned",
		tagline: "Ainda sem lado — por enquanto",
		benefits: [
			"Look Out for our Own: chance de recrutar uma Dramatis Personae de graça no pre-battle.",
			"We Stand for Ourselves: D3 XP extra ao derrubar o Leader inimigo.",
			"Take a Side: pode declarar aliança a qualquer post-battle sequence — mas não dá para ficar de fora para sempre.",
		],
		accent: "toxic",
	},
];

export const SUCCESSION_TRIUMPHS: Triumph[] = [
	{ id: "champion-helmawr", name: "Champion of House Helmawr", criteria: "Mais cenários vencidos pelo Imperial House." },
	{ id: "champion-rebellion", name: "Champion of the Rebellion", criteria: "Mais cenários vencidos por Lady Credo's Rebellion." },
	{ id: "survivor", name: "Survivor", criteria: "Menos mortes entre os fighters durante a Great Darkness phase." },
	{ id: "hoarder-of-coin", name: "Hoarder of Coin", criteria: "Maior Wealth ao fim da campanha." },
	{ id: "leader-of-men", name: "Leader of Men", criteria: "Mais Territórios/Sympathisers controlados ao fim da campanha." },
	{ id: "legendary-status", name: "Legendary Status", criteria: "Maior Reputation ao fim da campanha." },
];

export const SUCCESSION_CTA = {
	text: "A temporada em curso na NecroForja segue exatamente esse framework — Sympathisers, allegiances e tudo mais.",
};
