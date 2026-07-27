// Campaign Custom Rules (issue #41).
// Conteúdo em PT-BR, jargão de jogo em EN — mesmo padrão do skirmish/campaign.
// Regras da casa desta campanha, que substituem/complementam o rulebook
// oficial. A primeira ("Infiltrate & Hidden Deployment") veio do corpo da
// issue #41, fornecida pelo Gabriel. O FAQ vive na rota irmã /faq.

export type HrAccent = "hazard" | "cyan" | "violet" | "rust" | "toxic";

export type HrChapter = {
	id: string;
	num: string;
	title: string;
	accent: HrAccent;
};

export const HR_INTRO = {
	image: "criminal",
	kicker: "// CAMPAIGN TOOLS · CAMPAIGN CUSTOM RULES",
	lead: "As regras da casa. Preto no branco.",
	body:
		"Toda mesa de Necromunda acaba criando os próprios ajustes — esta página documenta os que valem nesta campanha, por cima do rulebook oficial. Combinadas entre os jogadores, arbitradas pelo Arbitrator, e escritas aqui para ninguém alegar surpresa no meio da batalha.",
	close: "AS REGRAS ABAIXO VALEM PARA ESTA CAMPANHA — NA DÚVIDA, O ARBITRATOR DECIDE",
};

/* ─────────────────────────────── REGRAS ────────────────────────────────── */

export type HouseRuleClause = {
	id: string;
	/** Rótulo curto tipo kicker (ex.: "LIMITE", "RESTRIÇÃO"). */
	label: string;
	text: string;
};

export type HouseRule = {
	id: string;
	num: string;
	accent: HrAccent;
	title: string;
	/** Contexto: por que a regra existe / o que ela substitui. */
	intro: string;
	clauses: HouseRuleClause[];
};

export const HOUSE_RULES: HouseRule[] = [
	{
		id: "infiltrate-hidden-deployment",
		num: "01",
		accent: "hazard",
		title: "Infiltrate & Hidden Deployment",
		intro:
			"Regra da casa para posicionamento fora da zona de deploy. Limita quantos lutadores podem usar Infiltrate, From the Shadows ou regras equivalentes — e define a skill custom Infiltrate (Advanced Assault) para os demais.",
		clauses: [
			{
				id: "limite",
				label: "LIMITE",
				text:
					"No máximo 2 lutadores por crew podem usar Infiltrate, From the Shadows ou regras equivalentes para serem posicionados fora da zona de deploy.",
			},
			{
				id: "advanced-assault",
				label: "SKILL CUSTOM",
				text:
					"Lutadores adicionais com essas regras usam a skill custom da campanha Infiltrate (Advanced Assault): são posicionados normalmente dentro da zona de controle/deploy, mas podem realizar até duas ações de Move após o deploy e antes do primeiro round.",
			},
			{
				id: "posicionamento",
				label: "POSICIONAMENTO",
				text:
					"Lutadores posicionados fora da zona de deploy por essas regras devem ficar fora de linha de visão e a mais de 6\" de inimigos; não podem ser posicionados a até 9\" de qualquer objetivo, loot marker, relíquia, cativo, terminal, alvo de cenário ou ponto de extração.",
			},
			{
				id: "objetivos",
				label: "OBJETIVOS",
				text:
					"Lutadores usando Infiltrate, From the Shadows ou equivalentes não podem controlar, contestar, pontuar ou interagir com objetivos durante o primeiro round nem no round em que entram em jogo.",
			},
			{
				id: "armas",
				label: "RESTRIÇÃO DE ARMAS",
				text:
					"Lutadores equipados com armas Template, Blast, Web, Gas ou Blaze não podem usar Infiltrate para posicionamento fora da zona — usam Advanced Assault no lugar.",
			},
		],
	},
];

/** Capítulos da página (um por regra) — alimentam a sub-navegação sticky. */
export const HR_CHAPTERS: HrChapter[] = HOUSE_RULES.map(({ id, num, title, accent }) => ({
	id,
	num,
	title,
	accent,
}));
