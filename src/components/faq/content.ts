// FAQ (issue #41).
// Conteúdo em PT-BR, jargão de jogo em EN — mesmo padrão do skirmish/campaign.
// As Campaign Custom Rules vivem na rota irmã /house-rules
// (src/components/houserules/). O FAQ cobre site, campanha e a confusão de
// marca tratada na issue #47 (NecroForja x NecroForge).

export type FaqAccent = "hazard" | "cyan" | "violet" | "rust" | "toxic";

export type FaqChapter = {
	id: string;
	num: string;
	title: string;
	accent: FaqAccent;
};

/** Capítulos da página (um por grupo de perguntas) — alimentam o LoreNav. */
export const FAQ_CHAPTERS: FaqChapter[] = [
	{ id: "geral", num: "01", title: "Geral", accent: "cyan" },
	{ id: "campanha", num: "02", title: "Campanha", accent: "hazard" },
	{ id: "site-conta", num: "03", title: "Site & conta", accent: "violet" },
];

export const FAQ_INTRO = {
	image: "underhive",
	kicker: "// CAMPAIGN TOOLS · FAQ",
	lead: "Perguntas frequentes. Respostas diretas.",
	body:
		"Tudo o que perguntam sobre a NecroForja e sobre a campanha em um lugar só — o que o site é, como a campanha funciona e o que dá para fazer sem conta. As regras da casa da mesa ficam na página Campaign Custom Rules; dúvidas de regra que não estiverem lá, o Arbitrator resolve.",
	close: "NÃO ACHOU A RESPOSTA? PERGUNTE NA MESA — OU AO ARBITRATOR",
};

/* ─────────────────────────── GRUPOS DE PERGUNTAS ───────────────────────── */

export type FaqGroup = {
	id: string;
	title: string;
	items: FaqItem[];
};

export type FaqItem = {
	id: string;
	question: string;
	answer: string;
};

export const FAQ_GROUPS: FaqGroup[] = [
	{
		id: "geral",
		title: "Geral",
		items: [
			{
				id: "o-que-e",
				question: "O que é a NecroForja?",
				answer:
					"A NecroForja é um web app gratuito — um gerenciador digital de campanha para o jogo de mesa Necromunda (Games Workshop). Ela acompanha em tempo real a nossa campanha The Aranthian Succession: Cinderak Burning: ranking das gangues, Sympathisers, relatórios de batalha e galeria. Também é o projeto de portfólio do Gabriel Stedile, com o código aberto no GitHub.",
			},
			{
				id: "loja",
				question: "A NecroForja vende miniaturas?",
				answer:
					"Não. A NecroForja não é uma loja e não produz nem vende miniaturas, resina ou impressão 3D. É apenas um site que gerencia uma campanha de mesa. Existe uma marca alemã de nome parecido (NecroForge) que vende miniaturas — não temos relação com ela.",
			},
			{
				id: "necromunda",
				question: "O que é Necromunda?",
				answer:
					"Necromunda é um skirmish game da Games Workshop ambientado no universo de Warhammer 40.000: gangues rivais disputam o Underhive de um mundo-colmeia em batalhas com miniaturas, dados e uma boa dose de traição. A página How to Play explica o básico e a página Lore apresenta o cenário.",
			},
			{
				id: "idiomas",
				question: "O site está em qual idioma?",
				answer:
					"Inglês e Português (BR). Use o seletor de idioma no topo da página para trocar — a preferência fica salva no navegador. Os termos de jogo (skills, armas, regras) permanecem em inglês, como nos livros oficiais.",
			},
		],
	},
	{
		id: "campanha",
		title: "Campanha",
		items: [
			{
				id: "qual-campanha",
				question: "Qual campanha vocês estão jogando?",
				answer:
					"The Aranthian Succession: Cinderak Burning — uma campanha narrativa oficial da Games Workshop. O progresso da mesa (ranking, territórios, Triumphs e Sympathisers) é registrado aqui no site, na página Campaign e no Dashboard público.",
			},
			{
				id: "ranking",
				question: "Como funciona o ranking das gangues?",
				answer:
					"Cada batalha reportada atualiza o ranking automaticamente: vitórias, territórios e Sympathisers valem pontos para a classificação geral. O Dashboard público mostra a classificação ao vivo, sem precisar de conta.",
			},
			{
				id: "sympathisers",
				question: "O que são Sympathisers?",
				answer:
					"Sympathisers são a população do Underhive tomando lado na guerra: um mapa de influência que mostra quais facções apoiam cada gangue ao longo da campanha. O mapa vive no Dashboard e é atualizado pelo Arbitrator conforme a campanha avança.",
			},
			{
				id: "regras-da-casa",
				question: "A campanha usa regras da casa?",
				answer:
					"Sim — ajustes que a mesa combinou por cima do rulebook oficial, como a regra de Infiltrate & Hidden Deployment. Todas estão documentadas na página Campaign Custom Rules, no menu Campaign Tools.",
			},
			{
				id: "participar",
				question: "Posso participar da campanha?",
				answer:
					"A campanha atual é de uma mesa fechada de amigos, mas o site é público — acompanhe o ranking, leia os relatórios de batalha e explore a galeria à vontade. Se a temporada abrir vagas, o recrutamento aparece no ticker e no jornal de campanha.",
			},
			{
				id: "relatorios",
				question: "Onde leio os relatórios de batalha?",
				answer:
					"Na seção Reports (o jornal de campanha): cada post cobre uma batalha ou um evento da temporada, com fotos da mesa. As fotos também ficam na Gallery, organizadas por categoria.",
			},
		],
	},
	{
		id: "site-conta",
		title: "Site & conta",
		items: [
			{
				id: "preciso-conta",
				question: "Preciso de conta para usar o site?",
				answer:
					"Não para a maior parte: landing, Dashboard, Reports, Gallery e as páginas de regras são públicos. Contas existem só para os jogadores da campanha (gerenciar a própria gangue) e para o Arbitrator (administração).",
			},
			{
				id: "celular",
				question: "Funciona no celular?",
				answer:
					"Sim — o site é responsivo e é um PWA: dá para instalar na tela inicial do celular e algumas partes funcionam offline. No iPhone, use \"Adicionar à Tela de Início\" no Safari.",
			},
		],
	},
];
