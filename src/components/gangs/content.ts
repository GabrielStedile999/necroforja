// Página de Gangues (issue #8) — PT-BR é a fonte da verdade; content.en.ts
// espelha cada export em inglês. Jargão de jogo permanece em EN (issue #12:
// ids, cores, slugs e demais chaves de lógica são idênticos entre locales).
//
// Fontes: Necromunda Core Rulebook (2023) e livros House of… (Games Workshop).

export type GangsAccent = "hazard" | "cyan" | "violet" | "rust" | "toxic";

export type GangsChapter = {
	id: string;
	num: string;
	title: string;
	accent: GangsAccent;
};

/** Capítulos da página — alimentam a sub-navegação sticky (LoreNav). */
export const GANGS_CHAPTERS: GangsChapter[] = [
	{ id: "grandes-casas", num: "00", title: "As Grandes Casas", accent: "hazard" },
	{ id: "independentes", num: "01", title: "Independentes & Cultos", accent: "cyan" },
	{ id: "ash-wastes", num: "02", title: "Ash Wastes", accent: "rust" },
	{ id: "hive-secundus", num: "03", title: "Hive Secundus", accent: "violet" },
	{ id: "na-campanha", num: "04", title: "Na campanha", accent: "toxic" },
];

/** Hero da página. */
export const GANGS_INTRO = {
	image: "houses",
	kicker: "// AS GANGUES",
	lead: "Toda gangue é uma promessa de violência. Escolha a sua.",
	body:
		"Dezessete facções disputam o Underhive — das seis Grandes Casas Clã aos cultos proibidos, dos nômades dos Ash Wastes aos horrores de Hive Secundus. Cada uma forja um estilo de jogo diferente na mesa: este dossiê apresenta identidade, estilo e os pontos fortes e fracos de cada gangue.",
	close: "BASEADO NO NECROMUNDA CORE RULEBOOK (2023) E NOS LIVROS HOUSE OF…",
};

/** Rótulos de interface usados nos cards e seções. */
export const GANGS_UI = {
	playstyleLabel: "ESTILO DE JOGO",
	strengthsLabel: "PONTOS FORTES",
	weaknessesLabel: "PONTOS FRACOS",
	gangCountSuffix: "GANGUES",
	campaignRating: "RATING",
	campaignRep: "REP",
	campaignHouseLabel: "CASA",
	campaignEmpty:
		"Nenhuma gangue registrada na campanha no momento — a temporada pode estar entre ciclos.",
	campaignOffline:
		"Dados da campanha indisponíveis no momento. Veja o dashboard público para o estado ao vivo.",
	campaignCta: "VER DASHBOARD COMPLETO →",
};

/* ───────────────────────── 00 · AS GRANDES CASAS ───────────────────────── */

export type HouseDossier = {
	/** Âncora estável da seção (ex.: "house-escher"). Idêntica entre locales. */
	slug: string;
	code: string;
	name: string;
	role: string;
	color: string;
	shadow: string;
	image: string;
	imgW: number;
	imgH: number;
	imageAlt: string;
	tagline: string;
	desc: string;
	playstyle: string;
	strengths: string[];
	weaknesses: string[];
};

export const HOUSE_DOSSIERS: HouseDossier[] = [
	{
		slug: "house-cawdor",
		code: "GH-01",
		name: "HOUSE CAWDOR",
		role: "ZEALOT",
		color: "#ffc23d",
		shadow: "rgba(255,194,61,.4)",
		image: "cawdor",
		imgW: 528,
		imgH: 659,
		imageAlt: "Fighters da House Cawdor com armas improvisadas e máscaras",
		tagline: "FÉ & FOGO",
		desc:
			"Devotos fanáticos do Culto da Redenção, os Cawdor transformam o lixo da colmeia em armas e a fé em munição. O que falta em equipamento sobra em número — e em fogo purificador para os hereges.",
		playstyle:
			"Gangue de horda: muitos fighters baratos avançando juntos, polearms e armas improvisadas na linha de frente, fire bombs e flame para limpar posições. Os Articles of Faith (House of Faith) recompensam agressão constante e transformam perdas em fervor.",
		strengths: [
			"Fighters mais baratos entre as Casas — supera o inimigo em número desde a primeira batalha.",
			"Articles of Faith: milagres de fé que viram o jogo quando a gangue está pressionada.",
			"Armas de fogo (flame, fire bombs) abundantes — excelentes contra hordas e em terreno denso.",
			"Perdas doem menos: reposição barata mantém o roster cheio ao longo da campanha.",
		],
		weaknesses: [
			"Equipamento improvisado: ammo checks ruins e pouca precisão a longo alcance.",
			"Armadura fraca — a horda derrete sob fogo disciplinado de Van Saar ou Enforcers.",
			"Fighters individuais medíocres: sem a massa (ou a fé), o plano desaba.",
		],
	},
	{
		slug: "house-delaque",
		code: "GH-02",
		name: "HOUSE DELAQUE",
		role: "INFILTRATE",
		color: "#b07bff",
		shadow: "rgba(176,123,255,.4)",
		image: "delaque",
		imgW: 568,
		imgH: 699,
		imageAlt: "Agentes encapuzados da House Delaque nas sombras",
		tagline: "A CASA DAS SOMBRAS",
		desc:
			"Espiões, chantagistas e assassinos silenciosos — a Casa que negocia segredos e serve (oficialmente) ao Lord Helmawr. Sob os casacos compridos, poderes Psychoteric dobram mentes inteiras.",
		playstyle:
			"Controle e informação: infiltre fighters atrás das linhas, negue o setup inimigo, elimine alvos isolados. Os Psychoteric Wyrds (House of Shadow) adicionam manipulação psíquica — medo, confusão e controle — a um arsenal de armas silenciadas e gás.",
		strengths: [
			"Infiltrate e táticas de emboscada nativas — dita onde e quando a luta acontece.",
			"Psychoteric Wyrds: debuffs e controle mental únicos entre as Casas.",
			"Excelentes em cenários com objetivos: velozes, sorrateiros e difíceis de fixar.",
			"Armas exóticas (web, gás, silenciadas) que ignoram armadura convencional.",
		],
		weaknesses: [
			"T3 e armadura leve: fighters caem rápido quando a emboscada falha.",
			"Curva de aprendizado alta — recompensa planejamento, pune jogo direto.",
			"Poder concentrado em poucos especialistas caros; perdê-los custa a partida.",
		],
	},
	{
		slug: "house-escher",
		code: "GH-03",
		name: "HOUSE ESCHER",
		role: "TOXIN",
		color: "#ff2d6f",
		shadow: "rgba(255,45,111,.4)",
		image: "escher",
		imgW: 1184,
		imgH: 1278,
		imageAlt: "Fighters da House Escher com cabelos coloridos e lâminas",
		tagline: "LÂMINAS & VENENO",
		desc:
			"Mestras da química e da engenharia genética, as Escher combinam velocidade letal com os venenos mais refinados de Necromunda. Uma gangue inteira de lâminas rápidas — e nenhuma paciência para brutamontes.",
		playstyle:
			"Golpe e fuga: use Movement e Initiative superiores para escolher os combates, aplique toxinas e chem-weapons para derrubar alvos maiores e saia antes da resposta. Chem-alchemy (House of Blades) permite customizar stimms e venenos para cada batalha.",
		strengths: [
			"As mais rápidas e ágeis das Grandes Casas — dominam terreno vertical e cenários móveis.",
			"Toxin e Gas ignoram Toughness bruta: ameaçam até Goliaths e brutes.",
			"Chem-alchemy: buffs e venenos personalizados a cada pre-battle.",
			"Champions de melee de elite (Death Maidens) com skills agressivas baratas.",
		],
		weaknesses: [
			"S3/T3: perdem trocas prolongadas de pancada — não podem permanecer paradas no lugar.",
			"Armas básicas de baixo Strength dependem de acertos de qualidade (e de veneno).",
			"Juves e gangers frágeis: erros de posicionamento cobram caro.",
		],
	},
	{
		slug: "house-goliath",
		code: "GH-04",
		name: "HOUSE GOLIATH",
		role: "BRAWN",
		color: "#ff8a3d",
		shadow: "rgba(255,138,61,.4)",
		image: "goliath",
		imgW: 640,
		imgH: 610,
		imageAlt: "Brutamontes da House Goliath com músculos de bioengenharia",
		tagline: "OS TIRANOS DA FORJA",
		desc:
			"Nascidos em tanques de crescimento para trabalhar as fundições, os Goliath são músculo bioengenheirado movido a stimms e desprezo. Nada em Necromunda bate mais forte — nem aguenta apanhar tanto.",
		playstyle:
			"Avanço implacável: absorva o fogo com T4+, feche a distância e resolva no corpo a corpo ou com armas de curto alcance (combat shotguns, stub cannons). Gene-smithing (House of Chains) permite esculpir o perfil de cada fighter antes da campanha.",
		strengths: [
			"S4/T4 de base — o maior poder físico entre todas as Casas.",
			"Devastadores em melee e em short range; brutal em Zone Mortalis.",
			"Gene-smithing: customização de perfil única (mais T, mais S, imune a stimms…).",
			"Difíceis de ferir e de manter no chão: exigem armas dedicadas para caírem.",
		],
		weaknesses: [
			"M4 e Initiative baixa: lentos para cruzar tabuleiros abertos e ruins em testes de agilidade.",
			"BS medíocre e pouco alcance — sofrem contra Van Saar em campo aberto.",
			"Fighters caros: cada baixa pesa no roster e nos créditos.",
		],
	},
	{
		slug: "house-orlock",
		code: "GH-05",
		name: "HOUSE ORLOCK",
		role: "VERSATILE",
		color: "#59e36b",
		shadow: "rgba(89,227,107,.4)",
		image: "orlock",
		imgW: 597,
		imgH: 663,
		imageAlt: "Fighters da House Orlock, a Casa de Ferro, em formação",
		tagline: "A CASA DE FERRO",
		desc:
			"Mineradores, motoqueiros e contrabandistas — a Casa de Ferro controla as rotas de minério e vive na estrada. Sem extremos: os Orlock fazem tudo razoavelmente bem, com armas confiáveis e atitude de sobra.",
		playstyle:
			"O meio-termo agressivo: perfis sólidos, boas armas de projétil (autoguns, combat shotguns, harpoon launchers) e a flexibilidade de responder a qualquer oponente. Legendary Names (House of Iron) dão personalidade e bônus aos veteranos da gangue.",
		strengths: [
			"A gangue mais equilibrada do jogo — sem fraqueza estrutural para o oponente explorar.",
			"Arsenal confiável de projéteis com bom custo-benefício.",
			"Legendary Names: veteranos ganham habilidades marcantes cedo.",
			"Ideal para aprender Necromunda sem abrir mão de competitividade.",
		],
		weaknesses: [
			"Mestres de nada: cada especialista inimigo vence os Orlock no próprio jogo.",
			"Poucos truques exóticos — previsíveis para oponentes experientes.",
			"Sem picos de perfil: dependem de tática e posicionamento, não de estatística.",
		],
	},
	{
		slug: "house-van-saar",
		code: "GH-06",
		name: "HOUSE VAN SAAR",
		role: "TECH",
		color: "#00e5ff",
		shadow: "rgba(0,229,255,.4)",
		image: "vansaar",
		imgW: 651,
		imgH: 587,
		imageAlt: "Fighters da House Van Saar em trajes tecnológicos",
		tagline: "OS ARCHTEKS",
		desc:
			"Guardiões de um STC agonizante, os Van Saar fabricam a melhor tecnologia de Necromunda — e pagam por ela com os próprios corpos, envenenados pela radiação do artefato que os enriquece.",
		playstyle:
			"Superioridade de fogo: BS de elite, armas de energia (las, plasma, rad) e gadgets (grav-cutters, campos refratores) para vencer a batalha antes do corpo a corpo. Archeoteks e Cyberteks (House of Artifice) mantêm o arsenal afiado e as linhas protegidas.",
		strengths: [
			"A melhor pontaria do Underhive — poucos erram tanto quanto os outros acertam.",
			"Arsenal de energia superior: plasma, lasguns confiáveis e rad weapons.",
			"Tecnologia exclusiva: grav-cutters, rigs e campos de força.",
			"Excelentes em defesa e em tabuleiros abertos com linhas de visão longas.",
		],
		weaknesses: [
			"Equipamento caríssimo: gangues pequenas e baixas dolorosas.",
			"Fracos em melee — uma carga Goliath ou CGC que conecta é catastrófica.",
			"M4 e mobilidade limitada; sofrem em Zone Mortalis claustrofóbica.",
		],
	},
];

/* ─────────────── 01–03 · INDEPENDENTES, ASH WASTES, SECUNDUS ───────────── */

export type GangCardData = {
	/** Âncora estável do card. Idêntica entre locales. */
	slug: string;
	code: string;
	name: string;
	role: string;
	color: string;
	shadow: string;
	tagline: string;
	desc: string;
	playstyle: string;
	strengths: string[];
	weaknesses: string[];
};

export type GangGroup = {
	/** Âncora da seção — igual ao id do capítulo correspondente. */
	id: string;
	num: string;
	title: string;
	accent: GangsAccent;
	intro: string;
	gangs: GangCardData[];
};

export const GANG_GROUPS: GangGroup[] = [
	{
		id: "independentes",
		num: "01",
		title: "Independentes & Cultos",
		accent: "cyan",
		intro:
			"Fora das Grandes Casas, o Underhive pertence a quem o tomar: a lei paramilitar dos Enforcers, os cultos proibidos de deuses sombrios e as gangues que não juram lealdade a ninguém.",
		gangs: [
			{
				slug: "corpse-grinder-cults",
				code: "IG-01",
				name: "CORPSE GRINDER CULTS",
				role: "MELEE",
				color: "#ff2d6f",
				shadow: "rgba(255,45,111,.4)",
				tagline: "OS AÇOUGUEIROS",
				desc:
					"Cultistas de Khorne mascarados que emergem das plantas de processamento de carne com cutelos e serras — devotados ao combate corpo a corpo mais selvagem do jogo.",
				playstyle:
					"Corra e retalhe: avance sob fogo usando armadura pesada e regras de frenesi, e resolva tudo em melee, onde nenhuma gangue os iguala.",
				strengths: [
					"O melhor melee de Necromunda — Butchers e Skinners desmontam qualquer linha.",
					"Armadura e máscaras: surpreendentemente resistentes no avanço.",
					"Fear e presença aterrorizante quebram gangues de moral frágil.",
				],
				weaknesses: [
					"Praticamente sem armas de fogo — o avanço é tudo.",
					"Sofrem em tabuleiros abertos contra atiradores disciplinados.",
					"Roster limitado e temático: pouca flexibilidade tática.",
				],
			},
			{
				slug: "palanite-enforcers",
				code: "IG-02",
				name: "PALANITE ENFORCERS",
				role: "LAW",
				color: "#00e5ff",
				shadow: "rgba(0,229,255,.4)",
				tagline: "A LEI DA COLMEIA",
				desc:
					"A força policial paramilitar de Necromunda: patrulheiros Palanite e esquadrões Subjugator armados para manter a ordem de Lord Helmawr por quaisquer meios.",
				playstyle:
					"Disciplina e doutrina: esquadrões coesos, armaduras sólidas, concussion e shock weapons para controlar multidões — e o peso da lei na campanha (Outlaw hunting).",
				strengths: [
					"Armadura padrão excelente (layered flak) — linha de frente resistente.",
					"Kit versátil: shotguns, shield & maul, snipers e granadas de supressão.",
					"Coesão tática: fortes em cenários de objetivo e defesa.",
				],
				weaknesses: [
					"Sem juves e com recrutamento restrito: roster caro e pequeno.",
					"Progressão de campanha menos flexível que a das Casas.",
					"Poucos truques — ganham no fundamento, não na surpresa.",
				],
			},
			{
				slug: "slave-ogryn",
				code: "IG-03",
				name: "SLAVE OGRYN GANGS",
				role: "BRUTE",
				color: "#ff8a3d",
				shadow: "rgba(255,138,61,.4)",
				tagline: "OS LIBERTOS",
				desc:
					"Ogryns fugitivos erguidos em revolta contra os antigos mestres — poucos corpos, mas cada um é uma muralha de músculo com raiva acumulada.",
				playstyle:
					"Poucos e enormes: cada Ogryn aguenta o que uma gangue inteira aguentaria. Avance, esmague e use a Toughness como escudo para os objetivos.",
				strengths: [
					"Perfis monstruosos: S, T e Wounds muito acima de qualquer ganger.",
					"Imunes a intimidação — moral sólida até o fim.",
					"Melee devastador sem depender de equipamento caro.",
				],
				weaknesses: [
					"Pouquíssimos modelos: cada ativação perdida pesa muito.",
					"Shooting quase inexistente e mobilidade baixa.",
					"Baixas são caríssimas de repor; campanhas longas os desgastam.",
				],
			},
			{
				slug: "helot-chaos",
				code: "IG-04",
				name: "HELOT CHAOS CULTS",
				role: "CHAOS",
				color: "#b07bff",
				shadow: "rgba(176,123,255,.4)",
				tagline: "OS CORROMPIDOS",
				desc:
					"Cultos do Caos que podem devotar-se a qualquer um dos Deuses Sombrios: um demagogo carismático, uma horda de cultistas descartáveis e rituais que não deveriam funcionar — mas funcionam.",
				playstyle:
					"Horda herética: cultistas baratos em massa, buffs do Demagogue e rituais de campanha que invocam bênçãos profanas (e ocasionalmente um demônio).",
				strengths: [
					"Cultistas muito baratos — pressão numérica constante.",
					"Rituais e dádivas do Caos: poder imprevisível e às vezes decisivo.",
					"Temática flexível: serve a qualquer Deus Sombrio.",
				],
				weaknesses: [
					"Cultistas individualmente péssimos: caem aos montes.",
					"Dependentes da sorte dos rituais e do Demagogue vivo.",
					"Perseguidos na campanha: sempre Outlaw, sempre caçados.",
				],
			},
			{
				slug: "genestealer-cults",
				code: "IG-05",
				name: "GENESTEALER CULTS",
				role: "XENOS",
				color: "#59e36b",
				shadow: "rgba(89,227,107,.4)",
				tagline: "A NINHADA OCULTA",
				desc:
					"A infecção silenciosa sob a colmeia: acólitos de terceira geração, híbridos aberrantes e a paciência de quem sabe que o Dia da Ascensão vai chegar.",
				playstyle:
					"Culto equilibrado: shooting decente de neófitos, aberrants brutais em melee e poderes psíquicos do Alpha — com emboscadas e infiltração para abrir o jogo.",
				strengths: [
					"Mistura rara de horda barata, brutes (Aberrants) e psykers.",
					"Infiltrate/ambush nativos: começam a batalha em vantagem.",
					"Boa progressão de campanha com temática fortíssima.",
				],
				weaknesses: [
					"Neófitos frágeis; a elite é cara e insubstituível.",
					"Precisam coordenar várias peças para o plano funcionar.",
					"Outlaw: enfrentam a lei e caçadores de recompensa na campanha.",
				],
			},
			{
				slug: "venators",
				code: "IG-06",
				name: "VENATOR GANGS",
				role: "HUNTER",
				color: "#ffc23d",
				shadow: "rgba(255,194,61,.4)",
				tagline: "CAÇADORES DE RECOMPENSA",
				desc:
					"Bandos de caçadores de recompensa totalmente customizáveis — humanos, Squats, Ogryns, Beastmen e Ratlings desde a atualização de 2025. Você monta o bando que quiser.",
				playstyle:
					"Faça-você-mesmo: escolha perfis e perks livremente e construa a gangue exatamente para o seu plano — generalista, atiradora ou de assalto.",
				strengths: [
					"Customização total de perfis: nenhuma outra gangue oferece tanto controle.",
					"Ótima para conceitos e conversões únicas de hobby.",
					"Recompensas extras por caçadas na campanha (bounties).",
				],
				weaknesses: [
					"Sem lista de Casa, sem equipamento exclusivo ou tricks próprios.",
					"Fácil de montar errado — exige conhecer bem o jogo.",
					"Sem identidade mecânica forte: ganha na construção, não no kit.",
				],
			},
			{
				slug: "underhive-outcasts",
				code: "IG-07",
				name: "UNDERHIVE OUTCASTS",
				role: "WILDCARD",
				color: "#c9c9d4",
				shadow: "rgba(201,201,212,.4)",
				tagline: "OS ESQUECIDOS",
				desc:
					"A gangue mais aberta do jogo: foras da lei, mutantes, wyrds, guilders caídos e nobres decaídos — quase qualquer conceito que você imaginar cabe num bando de Outcasts.",
				playstyle:
					"Improviso e liberdade: um líder de qualquer origem, um bando de párias baratos e acesso amplo (mas de segunda mão) ao mercado negro.",
				strengths: [
					"Liberdade narrativa total — qualquer miniatura vira gangue.",
					"Fighters baratos e descartáveis em grande número.",
					"Líderes únicos: de wyrds a ex-guilders com séquito próprio.",
				],
				weaknesses: [
					"Equipamento e perfis fracos na média — começam atrás.",
					"Sem estrutura de Casa: pouco suporte de skills e gear dedicados.",
					"Escalam mal contra gangues de elite no fim da campanha.",
				],
			},
		],
	},
	{
		id: "ash-wastes",
		num: "02",
		title: "Ash Wastes",
		accent: "rust",
		intro:
			"Fora das muralhas da colmeia, o deserto de cinzas pertence a quem sobrevive nele: nômades sobre insetos gigantes e clãs Squat que perfuram a crosta atrás de minério.",
		gangs: [
			{
				slug: "ash-waste-nomads",
				code: "AW-01",
				name: "ASH WASTE NOMADS",
				role: "AMBUSH",
				color: "#59e36b",
				shadow: "rgba(89,227,107,.4)",
				tagline: "CAVALEIROS DOS DESERTOS",
				desc:
					"Nômades nativos dos ermos montados em helamites — insetos gigantes de guerra — com furtividade, emboscadas e domínio total do terreno aberto. Expandidos ao longo de 2025.",
				playstyle:
					"Guerra de movimento: duneriders velozes, ataques de emboscada saindo da tempestade de cinzas e armas tradicionais (charge lances, blast carbines) que punem colunas lentas.",
				strengths: [
					"Mobilidade excepcional com montarias e veículos leves.",
					"Emboscada e furtividade nativas — controlam o engajamento.",
					"Reis do tabuleiro aberto: nos Ash Wastes, ninguém os alcança.",
				],
				weaknesses: [
					"Armadura leve: caem rápido quando encurralados.",
					"Menos eficazes em Zone Mortalis e corredores fechados.",
					"Dependem de terreno e cenário para brilhar.",
				],
			},
			{
				slug: "ironhead-squats",
				code: "AW-02",
				name: "IRONHEAD SQUAT PROSPECTORS",
				role: "DURABLE",
				color: "#ff8a3d",
				shadow: "rgba(255,138,61,.4)",
				tagline: "OS CLÃS MINERADORES",
				desc:
					"Mineradores Squat resistentes com poder de fogo industrial e a melhor tecnologia fora de House Van Saar — muito expandidos em Halls of the Ancients.",
				playstyle:
					"Rocha que atira: linha de frente T4 com armadura sólida avançando devagar atrás de armas de mineração convertidas em artilharia portátil.",
				strengths: [
					"T4 e boa armadura em toda a gangue — duríssimos de remover.",
					"Equipamento industrial de qualidade: bons ammo checks e firepower.",
					"Moral de ferro: Squats não correm.",
				],
				weaknesses: [
					"Lentos (M3/M4): chegam atrasados a objetivos móveis.",
					"Fighters caros — gangues pequenas.",
					"Pouca resposta a oponentes ultra-rápidos que negam o engajamento.",
				],
			},
		],
	},
	{
		id: "hive-secundus",
		num: "03",
		title: "Hive Secundus",
		accent: "violet",
		intro:
			"Sob a colmeia morta de Secundus, os Underhells: caçadas nobres em rigs de guerra e a ninhada distorcida que infesta as ruínas irradiadas.",
		gangs: [
			{
				slug: "spyrers",
				code: "HS-01",
				name: "SPYRER HUNTING PARTY",
				role: "ELITE",
				color: "#00e5ff",
				shadow: "rgba(0,229,255,.4)",
				tagline: "A CAÇADA NOBRE",
				desc:
					"Herdeiros ultrarricos das Casas Nobres em Hunting Rigs — exoesqueletos de caça letais. Pouquíssimas miniaturas, extremamente poderosas, evoluindo pela própria mecânica de Terror Level.",
				playstyle:
					"Caçada de elite: 3–5 rigs quase intocáveis contra gangues inteiras. Cada rig caça de um jeito (Jakara, Malcadon, Orrus, Yeld…) e cresce a cada abate.",
				strengths: [
					"Perfis e saves de elite: cada Spyrer vale meia gangue.",
					"Rigs especializados cobrem melee, alcance e mobilidade.",
					"Terror Level: a caçada fica mais forte conforme avança.",
				],
				weaknesses: [
					"Números mínimos: cada baixa é uma catástrofe.",
					"Ativações escassas — fácil de sobrecarregar com horda.",
					"Pouca flexibilidade de campanha fora da caçada.",
				],
			},
			{
				slug: "malstrain",
				code: "HS-02",
				name: "MALSTRAIN GANG",
				role: "HORDE",
				color: "#ff2d6f",
				shadow: "rgba(255,45,111,.4)",
				tagline: "A NINHADA DISTORCIDA",
				desc:
					"Os Genestealers mutantes de Hive Secundus: hordas de Brood Scum descartáveis apoiadas por monstros aterrorizantes de laboratório genético — feitos para os Underhells.",
				playstyle:
					"Maré de carne: afogue o inimigo em Brood Scum baratos enquanto brood brothers, tyramites e monstros Malstrain desmontam o que sobrar.",
				strengths: [
					"Horda massiva: mais ativações que qualquer oponente.",
					"Monstros de apoio brutais que exigem fogo dedicado.",
					"Terror psicológico — quebram gangues de moral frágil.",
				],
				weaknesses: [
					"Brood Scum individualmente péssimos: mira fácil.",
					"Dependem dos monstros; sem eles a horda não fecha jogos.",
					"Kit temático de Secundus — menos versátil fora dos Underhells.",
				],
			},
		],
	},
];

/* ───────────────────────── 04 · NA CAMPANHA (DB) ───────────────────────── */

export const GREAT_HOUSES_SECTION = {
	id: "grandes-casas",
	num: "00",
	title: "As Grandes Casas",
	intro:
		"Seis Casas Clã dominam a política e a violência de Hive Primus. Cada uma forja gangues à própria imagem — escolha a sua e o Underhive saberá o que esperar de você.",
};

export const CAMPAIGN_SECTION = {
	id: "na-campanha",
	num: "04",
	title: "Na campanha",
	intro:
		"As gangues registradas agora em The Aranthian Succession: Cinderak Burning — a temporada ao vivo da NecroForja.",
};

/**
 * Palavras-chave (case-insensitive) que ligam o texto livre `gang.house` do
 * banco a um card do catálogo. Chaves de lógica — idênticas entre locales.
 */
export const HOUSE_MATCHERS: Record<string, string[]> = {
	"house-cawdor": ["cawdor", "redempt"],
	"house-delaque": ["delaque"],
	"house-escher": ["escher"],
	"house-goliath": ["goliath"],
	"house-orlock": ["orlock"],
	"house-van-saar": ["van saar", "vansaar"],
	"corpse-grinder-cults": ["corpse grinder"],
	"palanite-enforcers": ["enforcer", "palanite", "badzone"],
	"slave-ogryn": ["ogryn"],
	"helot-chaos": ["helot", "chaos cult"],
	"genestealer-cults": ["genestealer"],
	venators: ["venator", "bounty"],
	"underhive-outcasts": ["outcast"],
	"ash-waste-nomads": ["nomad"],
	"ironhead-squats": ["squat", "ironhead"],
	spyrers: ["spyre"],
	malstrain: ["malstrain"],
};
