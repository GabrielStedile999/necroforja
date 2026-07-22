// Modos de Jogo — Skirmish (issue #35).
// Conteúdo em PT-BR, jargão de jogo em EN — mesmo padrão do how-to-play/lore.
// Fontes: Necromunda Core Rulebook (2023), pg. 80-92 (Gang Creation),
// pg. 97-98 e 142-147 (pre/post-battle sequence), pg. 90-91 (Creating a Skirmish Gang).

export type SkAccent = "hazard" | "cyan" | "violet" | "rust" | "toxic";

export type SkChapter = {
	id: string;
	num: string;
	title: string;
	accent: SkAccent;
};

/** Capítulos da página — alimentam a sub-navegação sticky (LoreNav). */
export const SK_CHAPTERS: SkChapter[] = [
	{ id: "o-que-e", num: "00", title: "O que é", accent: "cyan" },
	{ id: "comparativo", num: "01", title: "Skirmish x Campaign", accent: "hazard" },
	{ id: "monte-a-gangue", num: "02", title: "Monte sua gangue", accent: "violet" },
	{ id: "o-que-muda", num: "03", title: "O que muda no jogo", accent: "rust" },
	{ id: "quando-jogar", num: "04", title: "Quando jogar", accent: "toxic" },
];

export const SK_INTRO = {
	image: "underhive",
	kicker: "// MODES OF PLAY · SKIRMISH",
	lead: "Uma batalha. Sem amarras. Sem planilha.",
	body:
		"Skirmish é o Necromunda mais direto que existe: duas gangues, uma mesa, um cenário — e quando o último round termina, a história acaba ali. Nada de Territórios em disputa, Stash acumulado ou XP para gerenciar entre partidas. É o modo perfeito para experimentar uma Casa nova, ensinar alguém a jogar ou simplesmente resolver uma pendência na mesa em uma única noite.",
	close: "BASEADO NO NECROMUNDA CORE RULEBOOK (2023) · PÁGINAS CITADAS EM CADA SEÇÃO",
};

/* ─────────────────────────── 01 · COMPARATIVO ──────────────────────────── */

export type CompareRow = {
	id: string;
	label: string;
	skirmish: string;
	campaign: string;
};

export const COMPARE_ROWS: CompareRow[] = [
	{
		id: "duracao",
		label: "Duração",
		skirmish: "Uma única batalha. Termina no fim do round final.",
		campaign: "Uma série de batalhas encadeadas ao longo de semanas ou meses.",
	},
	{
		id: "budget",
		label: "Budget da gangue",
		skirmish: "Livre acordo entre os jogadores — recomendado 1.250 a 2.000 créditos (pg. 90).",
		campaign: "1.000 créditos fixos (+400 se usar veículos) — o Arbitrator pode ajustar (pg. 81).",
	},
	{
		id: "sobra",
		label: "Créditos não gastos",
		skirmish: "São simplesmente perdidos ao fundar a gangue.",
		campaign: "Vão para o Stash da gangue e ficam disponíveis depois.",
	},
	{
		id: "xp",
		label: "Experience & Advancements",
		skirmish: "Fighters não ganham XP. Em vez disso, a gangue recebe skills e characteristic increases extras já na criação (pg. 91).",
		campaign: "Fighters acumulam XP em cada batalha e compram Advancements no post-battle (pg. 148-150).",
	},
	{
		id: "reputation",
		label: "Reputation & Gang Rating",
		skirmish: "Reputation é escolhida (5, 10 ou 15) e o Gang Rating não muda depois — é fixo (pg. 91).",
		campaign: "Reputation começa em 1 e evolui; Gang Rating é recalculado a cada post-battle sequence.",
	},
	{
		id: "territorio",
		label: "Território / Sympathisers",
		skirmish: "Não existe — nenhuma batalha tem território em jogo.",
		campaign: "Cada batalha é disputada por um Território (ou Sympathiser) que muda de mãos.",
	},
	{
		id: "capturados",
		label: "Fighters Out of Action",
		skirmish: "Sem Lasting Injury permanente — o fighter volta inteiro na próxima partida.",
		campaign: "Risco real de Lasting Injury, captura por outra gangue ou até morte definitiva.",
	},
	{
		id: "arbitrator",
		label: "Arbitrator",
		skirmish: "Opcional — normalmente só os dois jogadores, decidindo juntos.",
		campaign: "Recomendado ter um Arbitrator dedicado para administrar território, cronograma e disputas.",
	},
];

/* ──────────────────────── 02 · MONTE SUA GANGUE ────────────────────────── */

export const BUDGET_NOTE = {
	title: "Budget recomendado",
	range: "1.250 – 2.000 créditos",
	text:
		"É apenas uma recomendação, não uma regra fixa — gangues maiores são possíveis, mas budgets menores forçam escolhas difíceis, o que costuma tornar a partida mais interessante. Uma boa referência: entre 10 e 20 fighters, e de 1 a 4 veículos.",
};

export type SkillTier = { id: string; range: string; skills: string };

export const SKILL_TIERS: SkillTier[] = [
	{ id: "t1", range: "Até 1.300 créditos", skills: "5 skills Primary extras" },
	{ id: "t2", range: "1.301 a 1.500 créditos", skills: "6 skills Primary extras" },
	{ id: "t3", range: "1.501 créditos ou mais", skills: "5 skills Primary + 1 Secondary" },
];

export const SKILL_ALLOCATION = [
	"Leader: 1 skill inicial gratuita + até 2 skills extras.",
	"Champions: 1 skill inicial gratuita + até 1 skill extra.",
	"Prospects, Juves e Specialists: 1 skill extra cada.",
	"Characteristic increases extras: metade do nº de skills extras, arredondado para baixo (2 ou 3, no geral) — nenhum modelo recebe mais de um aumento.",
];

export type RepOption = { rep: string; hangers: string };

export const REPUTATION_OPTIONS: RepOption[] = [
	{ rep: "5", hangers: "até 2 Hangers-on/Brutes" },
	{ rep: "10", hangers: "até 3 Hangers-on/Brutes" },
	{ rep: "15", hangers: "até 4 Hangers-on/Brutes" },
];

export const GANG_SETUP_NOTES = [
	"Equipamento: além da lista da própria gangue, os jogadores podem liberar itens Rare/Illegal da Trading Post até um nível combinado antes da partida (ex.: até Rare (10)).",
	"Hired Guns, Hangers-on e Brutes não contam para o mínimo de fighters exigido (se houver), mas contam para o máximo.",
	"Uma gangue só pode incluir Hangers-on, Brutes ou Hired Guns depois de ter pelo menos 10 modelos na lista principal.",
];

/* ───────────────────────── 03 · O QUE MUDA NO JOGO ─────────────────────── */

export type SeqDiff = { id: string; step: string; ref: string; text: string };

export const PRE_BATTLE_DIFFS: SeqDiff[] = [
	{
		id: "pre-1",
		step: "1 · Make a Challenge & Stake Territory",
		ref: "pg. 97",
		text: "Sem território em jogo — o desafio é só \"vamos jogar uma partida\". Nada é staked.",
	},
	{
		id: "pre-2",
		step: "2 · Recruit Hired Guns",
		ref: "pg. 97",
		text: "Usa os créditos que sobraram da criação da gangue (em vez do Stash de campanha).",
	},
	{
		id: "pre-3",
		step: "3 · Determine Scenario",
		ref: "pg. 98",
		text: "Os jogadores escolhem juntos o cenário; em caso de impasse, um roll-off decide.",
	},
	{
		id: "pre-6",
		step: "6 · Announce Territory Boons",
		ref: "pg. 98",
		text: "Passo inteiro é ignorado — não existem Boons de território para anunciar.",
	},
];

export const POST_BATTLE_DIFFS: SeqDiff[] = [
	{
		id: "post-2",
		step: "2 · Assign/Reassign Territory",
		ref: "pg. 144",
		text: "Ignorado — não há território para atribuir.",
	},
	{
		id: "post-4",
		step: "4 · Collect Income",
		ref: "pg. 144",
		text: "Ignorado — sem território, não há income para coletar.",
	},
	{
		id: "post-6e",
		step: "6.E · Purchase Advancements",
		ref: "pg. 148",
		text: "Ignorado — fighters de Skirmish não acumulam XP, então não há Advancements para comprar.",
	},
	{
		id: "post-6f",
		step: "6.F · Update Gang Rating",
		ref: "pg. 147",
		text: "Ignorado — o Gang Rating de uma gangue de Skirmish é fixo desde a criação.",
	},
	{
		id: "post-7",
		step: "7 · Report Results",
		ref: "pg. 147",
		text: "Opcional — só faz sentido reportar a um Arbitrator se a partida fizer parte de algo maior (ex.: um torneio).",
	},
];

/* ────────────────────────────── 04 · DICAS ─────────────────────────────── */

export type TipCard = { id: string; title: string; text: string; icon: "spark" | "scale" | "clock" | "target" };

export const SKIRMISH_TIPS: TipCard[] = [
	{
		id: "novos",
		icon: "spark",
		title: "Testar uma Casa nova",
		text: "Quer experimentar House Van Saar antes de comprometer uma campanha inteira com ela? Monte uma gangue de Skirmish, jogue algumas partidas e decida com o time de miniaturas na mão.",
	},
	{
		id: "demo",
		icon: "target",
		title: "Ensinar alguém a jogar",
		text: "Sem Advancements, sem Stash, sem histórico — é a porta de entrada mais simples para quem nunca jogou. Combine com o guia How to Play para a primeira partida.",
	},
	{
		id: "torneio",
		icon: "scale",
		title: "Torneios e eventos",
		text: "Budgets iguais e Gang Rating fixo tornam o Skirmish o formato natural para eventos competitivos — todo mundo começa no mesmo patamar.",
	},
	{
		id: "avulsa",
		icon: "clock",
		title: "Uma noite, uma história",
		text: "Sem compromisso de continuidade: perfeito para quando o grupo de jogo muda a cada sessão ou quando só dá tempo para uma partida.",
	},
];
