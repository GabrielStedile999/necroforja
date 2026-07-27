// Página do criador (issue #39 follow-up).
// Conteúdo em PT-BR — fonte da verdade. content.en.ts espelha cada export
// com a tradução; as chaves de lógica (ids) são idênticas entre os dois.

export type CreatorFact = {
	id: string;
	label: string;
	value: string;
};

export const CREATOR_INTRO = {
	kicker: "// O CRIADOR",
	name: "Gabriel Stedile",
	role: "Biólogo · Desenvolvedor de software · Pintor de miniaturas",
	photoAlt: "Retrato de Gabriel Stedile, criador da NecroForja",
};

/** Parágrafos da bio — texto corrido, indexável. */
export const CREATOR_PARAGRAPHS: { id: string; text: string }[] = [
	{
		id: "origem",
		text: "Gabriel Stedile é formado em Biologia e em Sistemas de Informação e trabalha com desenvolvimento de software há mais de 11 anos. Começou a pintar miniaturas durante a pandemia de COVID-19 e, desde então, se apaixonou pelo hobby — o que nasceu como passatempo de quarentena virou tintas espalhadas pela casa, uma coleção em crescimento constante e noites inteiras dedicadas a highlights que ninguém vai notar a um metro de distância.",
	},
	{
		id: "colecao",
		text: "Amante de wargames e boardgames, coleciona e joga uma gama (preocupantemente) ampla de sistemas: Warhammer 40k (Necrons), Age of Sigmar (Stormcast Eternals e Tzeentch), The Old World (Grand Cathay e Legions of Chaos), Warcry, Warcrow (Northern Tribes) e Warmachine (Khador e Cryx).",
	},
	{
		id: "necromunda",
		text: "Mas, de todos os universos e sistemas, sua maior paixão é Necromunda. Hoje desce à sub-colmeia com Delaque, Goliath e Van Saar — e sua pilha da vergonha abarca quase todas as facções do jogo, esperando pacientemente por uma demão de tinta.",
	},
	{
		id: "necroforja",
		text: "A NecroForja nasceu do encontro entre as duas metades: o desenvolvedor e o jogador. Ele projetou e construiu o site para acompanhar as campanhas da própria mesa — e o mantém como projeto independente e de portfólio, com o código público no GitHub.",
	},
];

/** Chips de "ficha técnica" — mesmo visual dos contadores do FaqHero. */
export const CREATOR_FACTS: CreatorFact[] = [
	{ id: "gangs", label: "GANGUES NA MESA", value: "Delaque · Goliath · Van Saar" },
	{ id: "since", label: "PINTANDO DESDE", value: "2020" },
	{ id: "systems", label: "SISTEMAS JOGADOS", value: "7+" },
	{ id: "pile", label: "PILHA DA VERGONHA", value: "∞" },
];

/** Rótulos dos links externos (destinos vêm de @/lib/seo/json-ld). */
export const CREATOR_LINKS = {
	linkedin: "LINKEDIN →",
	github: "VER O CÓDIGO NO GITHUB →",
};
