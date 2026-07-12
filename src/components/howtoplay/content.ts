// Estruturado a partir do documento "Necromunda — Fluxo Completo de um Jogo"
// (Necromunda_Jogo_Completo.docx). Conteúdo em PT-BR, jargão de jogo em EN —
// mesmo padrão do lore. Referências: Necromunda Core Rulebook (2023).

export type HtpAccent = "hazard" | "cyan" | "violet" | "rust" | "toxic";

export type HtpChapter = {
	id: string;
	num: string;
	title: string;
	accent: HtpAccent;
};

/** Capítulos da página — alimentam a sub-navegação sticky (LoreNav). */
export const HTP_CHAPTERS: HtpChapter[] = [
	{ id: "comece-aqui", num: "00", title: "Comece aqui", accent: "cyan" },
	{ id: "o-loop", num: "01", title: "O loop do jogo", accent: "hazard" },
	{ id: "pre-battle", num: "02", title: "Pre-battle", accent: "violet" },
	{ id: "battle-round", num: "03", title: "Battle round", accent: "rust" },
	{ id: "combate", num: "04", title: "Combate", accent: "hazard" },
	{ id: "post-battle", num: "05", title: "Post-battle", accent: "toxic" },
	{ id: "referencia", num: "06", title: "Ref. rápida", accent: "cyan" },
];

export const HTP_INTRO = {
	image: "criminal",
	kicker: "// HOW TO PLAY",
	lead: "Toda batalha em Necromunda segue o mesmo ritual.",
	body:
		"Necromunda é um jogo de escaramuça: duas gangues de miniaturas, um tabuleiro denso de terreno, dados e decisões brutais. Este guia percorre o fluxo completo de uma partida — do aperto de mãos antes da batalha até o relatório ao Arbitrator — em checklists que você pode marcar direto da mesa.",
	close: "BASEADO NO NECROMUNDA CORE RULEBOOK (2023) · PÁGINAS CITADAS EM CADA PASSO",
};

/** Legenda "como ler este guia" (caixa do documento original). */
export const HOW_TO_READ = [
	{ icon: "checklist", title: "Checklists", text: "Passos práticos que você marca conforme executa — o progresso fica salvo enquanto a página está aberta." },
	{ icon: "ref", title: "Referências", text: "Cada passo aponta a página do Core Rulebook (2023) onde a regra completa está: (pg. XX)." },
];

/* ────────────────────────────── 00 · COMECE AQUI ───────────────────────── */

export type KitItem = {
	id: string;
	title: string;
	text: string;
	tag: string;
	icon: "gang" | "book" | "dice" | "tape" | "cards" | "terrain";
};

export const START_KIT: KitItem[] = [
	{
		id: "gangue",
		icon: "gang",
		tag: "ESSENCIAL",
		title: "Uma gangue de miniaturas",
		text: "Cerca de 10 fighters de uma das Casas Clã (Escher, Goliath, Orlock, Van Saar, Delaque ou Cawdor). Uma caixa de gangue da sua Casa é o ponto de partida clássico.",
	},
	{
		id: "livro",
		icon: "book",
		tag: "ESSENCIAL",
		title: "Core Rulebook + livro da sua gangue",
		text: "O livro de regras central. Todas as referências de página deste guia apontam para ele. Já o livro da sua gangue (House of Blades, Chains, Iron…) traz as regras, fighters e equipamentos específicos da Casa que você escolheu.",
	},
	{
		id: "dados",
		icon: "dice",
		tag: "ESSENCIAL",
		title: "Dados de Necromunda",
		text: "Vários D6 comuns, mais os dados especiais: Firepower dice (munição), Injury dice (ferimentos) e um par de D6 de cores diferentes para rolar D66 nas tabelas.",
	},
	{
		id: "medidas",
		icon: "tape",
		tag: "ESSENCIAL",
		title: "Fita métrica & templates",
		text: "Distâncias em polegadas. Os templates de Blast (3\"/5\") e Flame resolvem armas de área — e Necromunda usa visão real de modelo, então agache e mire.",
	},
	{
		id: "fichas",
		icon: "cards",
		tag: "NA NECROFORJA",
		title: "Fighter cards & roster",
		text: "Cada fighter tem uma ficha com perfil, armas e skills. Na NecroForja o roster da sua gangue é digital: créditos, XP, stash e advancements ficam registrados entre as batalhas.",
	},
	{
		id: "terreno",
		icon: "terrain",
		tag: "RECOMENDADO",
		title: "Terreno — muito terreno",
		text: "O Underhive é vertical e claustrofóbico. Passarelas, torres, contêineres e ruínas: quanto mais denso o tabuleiro, melhor o jogo. Zone Mortalis (corredores), Sector Mechanicus (plataformas) — ou, nos Ash Wastes, rodovias e ruínas abertas.",
	},
];

/* ─────────────────────────────── 01 · O LOOP ───────────────────────────── */

export type FlowPhase = {
	id: string;
	target: string;
	num: string;
	title: string;
	sub: string;
	text: string;
	accent: HtpAccent;
	loop?: boolean;
};

export const FLOW_PHASES: FlowPhase[] = [
	{
		id: "flow-pre",
		target: "pre-battle",
		num: "1",
		title: "Pre-battle sequence",
		sub: "8 PASSOS · ANTES DO TABULEIRO",
		text: "Challenge, hired guns, cenário, terreno, crew, boons, gang tactics e deployment. Tudo com os dois jogadores presentes.",
		accent: "violet",
	},
	{
		id: "flow-round",
		target: "battle-round",
		num: "2",
		title: "Battle rounds",
		sub: "LOOP · PRIORITY → ACTION → END",
		text: "A batalha em si. Cada round repete as 3 sub-fases até alguém vencer, todo mundo dar bottle out, ou o cenário terminar.",
		accent: "rust",
		loop: true,
	},
	{
		id: "flow-post",
		target: "post-battle",
		num: "3",
		title: "Post-battle sequence",
		sub: "7 PASSOS · DEPOIS DO ÚLTIMO ROUND",
		text: "Wrap-up, território, rewards, income, post-battle actions, atualização de roster e relatório ao Arbitrator.",
		accent: "toxic",
	},
];

/* ───────────────────────── 02 e 05 · CHECKLISTS DE FASE ────────────────── */

export type HtpNote = { tone: "info" | "key"; title: string; lines: string[] };

export type HtpStep = {
	id: string;
	num: string;
	title: string;
	ref: string;
	items: string[];
	note?: HtpNote;
};

export const PRE_BATTLE_STEPS: HtpStep[] = [
	{
		id: "pre-1",
		num: "1.1",
		title: "Make a Challenge & Stake Territory",
		ref: "pg. 97",
		items: [
			"Em campanha: o desafiante e o desafiado já foram definidos antes desta sessão; confirme.",
			"Sympathiser/Território em stake: identifique qual será o “prêmio” desta batalha (regras específicas por campanha).",
			"Em skirmish: os dois jogadores apenas decidem jogar uma partida; sem stake.",
		],
		note: {
			tone: "key",
			title: "Rescue Mission (campanha)",
			lines: [
				"Se um fighter seu foi Capturado por outra gangue, você pode emitir uma Rescue Mission. Se a outra gangue recusa, perde o cativo automaticamente. Se aceita, a Rescue Mission substitui o cenário normal — nada é staked, o cativo É o prêmio.",
			],
		},
	},
	{
		id: "pre-2",
		num: "1.2",
		title: "Recruit Hired Guns",
		ref: "pg. 97",
		items: [
			"Cada jogador pode gastar créditos do Stash para contratar Hired Guns (Bounty Hunters, Hive Scum, etc.).",
			"Se ambos quiserem contratar, a gangue com menor Gang Rating contrata primeiro.",
			"Em campanha, certos House Favours ou Boons de Sympathiser podem dar Hired Guns extras.",
		],
	},
	{
		id: "pre-3",
		num: "1.3",
		title: "Determine Scenario",
		ref: "pg. 98",
		items: [
			"Em skirmish: jogadores escolhem; em desempate, role off.",
			"Em campanha (Succession Campaign): utilize Scenario Selection Table ou instruções do árbitro.",
			"Defina Atacante/Defensor: desafiante = atacante em campanha; em skirmish, D6 maior escolhe quem é o quê.",
			"Home Turf Advantage: verifique se o cenário concede ao defensor (afeta Bottle).",
		],
	},
	{
		id: "pre-4",
		num: "1.4",
		title: "Set up the Battlefield",
		ref: "pg. 98",
		items: [
			"Use o método de set up indicado pelo cenário, ou o padrão (Battlefield Set-up & Scenarios, pg. 185).",
			"Lembre de portas, terminais e marcadores especiais que o cenário pede.",
		],
	},
	{
		id: "pre-5",
		num: "1.5",
		title: "Choose Crews",
		ref: "pg. 98",
		items: [
			"Use o método indicado pelo cenário: Random Selection (N), Custom Selection (N), All In, etc. (pg. 190).",
			"Preencha as Fighter/Vehicle Cards e separe os modelos da crew. Modelos fora da crew ficam reservados como Reinforcement deck quando aplicável.",
		],
	},
	{
		id: "pre-6",
		num: "1.6",
		title: "Announce Territory Boons",
		ref: "pg. 98",
		items: [
			"Anuncie agora todos os Boons de Sympathisers/Territórios que terão efeito na batalha.",
			"Boon não anunciado nesta etapa não pode ser usado.",
			"Em skirmish, este passo é ignorado.",
		],
	},
	{
		id: "pre-7",
		num: "1.7",
		title: "Gang Tactics",
		ref: "pg. 98",
		items: [
			"Cada cenário define quantas Gang Tactics cada gangue recebe e como (escolhidas vs aleatórias, do deck de baralho ou rolando na tabela da gangue).",
			"Anote-as separadas para uso na batalha.",
		],
	},
	{
		id: "pre-8",
		num: "1.8",
		title: "Deployment",
		ref: "pg. 98",
		items: [
			"Use as zonas de deployment definidas pelo cenário, ou as regras padrão se o cenário não especificar (pg. 191).",
			"Verifique se algum fighter precisa começar Prone, Hidden, com Mounted condition, etc.",
			"Atribua o Priority marker pela primeira vez (ou deixe sem dono — será resolvido no primeiro round, na Priority Phase).",
		],
	},
];

export const POST_BATTLE_STEPS: HtpStep[] = [
	{
		id: "post-1",
		num: "3.1",
		title: "Wrap-up",
		ref: "pg. 142",
		items: [
			"Succumb to injuries: para cada fighter Prone & Seriously Injured restante no campo (ou que fugiu assim), role 1D6. 1–2 = succumb (OOA, role Lasting Injury). 3+ = sobrevive.",
			"Being Captured: para cada fighter com resultado 55–56 (Captured) na Lasting Injury, role 1D6 + modificadores (-1 empate, -2 perdeu, -2 estava Webbed). 4+ = escapa para Convalescence. Falhou = fica Captive.",
			"Claiming Scrap: se só uma gangue sobrou no campo, ela ganha D3×10 créditos para cada veículo inimigo Wrecked no campo.",
			"Limpar In Recovery: fighters que estavam In Recovery são considerados recuperados — limpe a caixa.",
		],
	},
	{
		id: "post-2",
		num: "3.2",
		title: "Assign/Reassign Territory",
		ref: "pg. 144",
		items: [
			"Vencedor pega o território/Sympathiser staked.",
			"Empate sobre território livre: ninguém ganha (volta ao pool).",
			"Empate sobre território controlado (Takeover): não muda de mãos.",
		],
	},
	{
		id: "post-3",
		num: "3.3",
		title: "Receive Rewards",
		ref: "pg. 144",
		items: [
			"Aplique as Rewards do cenário: créditos (vencedor X cr, perdedor Y cr), XP especial, Reputation.",
			"Ganhos e perdas de Reputation: aplique TODOS os ganhos antes de aplicar perdas.",
			"Itens ganhos vão ao Stash, para serem distribuídos no passo 3.6.",
		],
	},
	{
		id: "post-4",
		num: "3.4",
		title: "Collect Income",
		ref: "pg. 144",
		items: [
			"Para cada Sympathiser/Território que gera income, role o income conforme a ficha. Some ao Stash.",
			"Boons de aliança (ex.: Deep Pockets — +D6×10 ao gerar income de Sympathisers) entram aqui.",
		],
	},
	{
		id: "post-5",
		num: "3.5",
		title: "Post-battle Actions",
		ref: "pg. 144",
		items: [
			"Trade: visita o Trading Post — habilita itens raros e ilegais para a gangue inteira no passo 3.6.",
			"Sell to the Guilders: vende cativos por metade do credit value (o cativo deve ter tido chance de resgate).",
			"Claim Bounties: gangue Law-Abiding cobra bounty integral de cativo Outlaw.",
			"Dispose of Captives: gangue Outlaw pode “descartar” cativos inimigos.",
			"Medical Escort: 2D6×10 cr para salvar um fighter com Critical Injury (D6: 1 morre, 2–5 estabiliza/Lasting, 6 recupera total).",
			"Negotiate Repairs: leva veículo com Lasting Damage ao Chop Shop; D6 define o custo.",
		],
		note: {
			tone: "info",
			title: "Quem age aqui",
			lines: [
				"Cada fighter com Gang Hierarchy (X) — Leaders e Champions — faz UMA post-battle action, em ordem livre. Fighters In Recovery ou Captives não podem fazer. Territórios e skills podem habilitar ações extras.",
			],
		},
	},
	{
		id: "post-6",
		num: "3.6",
		title: "Update Roster",
		ref: "pg. 146",
		items: [
			"A · Clean House: apague mortos, decida retiradas por Lasting Injury, mande equipamento ao Stash.",
			"B · Visit the Trading Post: contrate fighters/veículos/Hangers-on, venda itens (valor − D6×10, mín. 5 cr), compre equipamento; Rare & Illegal só se alguém fez Trade no 3.5 (2D6 + Leader +2, Champion +1, +1 por 10 Rep).",
			"C · Gain Boons: reclame Boons de território que dão recruta, Hanger-on ou equipamento.",
			"D · Distribute Equipment: do Stash para os fighters (limites: 3 armas a pé / 2 Mounted; * = 2 slots; † não combina).",
			"E · Purchase Advancements: gaste XP em skills e +stats — o custo sobe com o nº de Advancements já comprados.",
			"F · Update Gang Rating: recalcule SOMENTE agora. Referências a Gang Rating nos passos anteriores usam o valor pré-batalha.",
		],
	},
	{
		id: "post-7",
		num: "3.7",
		title: "Report Results",
		ref: "pg. 147",
		items: [
			"Reporte ao Arbitrator: gangues envolvidas, quem ganhou, qual território foi tomado, quantos inimigos cada um derrubou OOA, e Gang Rating + Wealth finais.",
			"Na NecroForja, o dashboard da campanha é atualizado com esses resultados.",
		],
	},
];

/* ─────────────────────────── 03 · BATTLE ROUND ─────────────────────────── */

export type RoundPhase = {
	id: string;
	letter: string;
	title: string;
	ref: string;
	tagline: string;
	items: string[];
};

export const ROUND_PHASES: RoundPhase[] = [
	{
		id: "round-priority",
		letter: "A",
		title: "Priority Phase",
		ref: "pg. 100",
		tagline: "“Quem age primeiro este round, e quem está pronto para agir.”",
		items: [
			"Roll for Priority: ambos rolam 1D6. Maior vence e fica com o Priority marker. Empate: quem tinha a Prioridade no round anterior passa ao oponente. No 1º round, em empate, ambos re-rolam.",
			"Ready Gang: cada jogador coloca um marcador Ready em cada modelo seu no campo. Modelos com certas Conditions/Statuses podem não ganhar Ready.",
		],
	},
	{
		id: "round-action",
		letter: "B",
		title: "Action Phase",
		ref: "pg. 101",
		tagline: "“A maior parte do jogo. Jogadores ativam modelos em turnos alternados.”",
		items: [
			"Ativação alternada: começando por quem tem a Prioridade, jogadores alternam, escolhendo UM modelo Ready por vez para ativar.",
			"Cada modelo realiza até 2 ações por ativação. Conditions (Broken) e Status (Prone & Seriously Injured) podem limitar.",
			"Group Activation (X): Leaders e Champions com essa regra podem ativar X aliados Ready a 3″ junto, resolvendo cada um por vez.",
			"Remova o Ready ao terminar a ativação. Modelo sem Ready não pode ser ativado de novo no round.",
			"Quando um jogador fica sem modelos Ready, o outro ativa todos os seus restantes na ordem que escolher. A Action Phase termina quando todos foram ativados.",
		],
	},
	{
		id: "round-end",
		letter: "C",
		title: "End Phase",
		ref: "pg. 139",
		tagline: "“Limpar a mesa, fazer testes de moral, recuperar feridos.”",
		items: [
			"Bottle Checks: se um jogador tem ≥1 fighter Prone & SI / OOA ou ≥1 veículo Wrecked, role 1D6 + (nº de baixas). Se passar do tamanho da starting crew, a gangue “bottled out”.",
			"Fleeing the Battlefield: gangue bottled out rola Cool test (2D6 ≥ Cool) para CADA modelo. Falhou = foge. Prone & SI que foge é removido e testa no Wrap-up.",
			"Recover & Restart: Prone & SI rolam 1 Injury dice (OOA sai; Serious Injury segue no chão com +1 Flesh Wound; Flesh Wound = levanta Prone & Pinned). Aliado a 1″ assiste: 2 dados, escolha 1. Veículos parados testam Restart.",
			"Rally Tests: cada modelo Broken rola Cool (2D6 ≥ Cool), +1 por aliado não-Broken a 3″. Passou = volta ao normal.",
		],
	},
];

/** Fluxo de uma ativação individual (B.1). */
export const ACTIVATION_FLOW = [
	{ title: "Verificar Status", text: "Standing & Active / Engaged, Prone & Pinned / Seriously Injured, Broken — isso define as ações disponíveis." },
	{ title: "Verificar Conditions", text: "Broken, Webbed, Blind, Insane… — algumas impõem ação obrigatória ou penalidades." },
	{ title: "Mudar facing (opcional)", text: "Se Standing, antes de declarar ações." },
	{ title: "1ª ação", text: "Declare e resolva." },
	{ title: "2ª ação", text: "Se a primeira não foi Double." },
	{ title: "Aplicar mudanças de Status", text: "Ex.: Take Cover deixou o fighter Prone & Pinned." },
	{ title: "Remover Ready", text: "A ativação terminou — o modelo não age de novo neste round." },
];

/** Guia de ações do jogo — tipo: S = Simple, B = Basic, D = Double. */
export type GameAction = { name: string; type: "S" | "B" | "D"; effect: string };

export const GAME_ACTIONS: GameAction[] = [
	{ name: "Aim", type: "B", effect: "+1 no hit ao próximo Shoot desta ativação." },
	{ name: "Blind Fire", type: "D", effect: "Prone: atira em 360°, -2 ao acerto." },
	{ name: "Charge", type: "D", effect: "Move M + D3″; se terminar engaged → Fight free." },
	{ name: "Coup de Grace", type: "S", effect: "Finaliza inimigo Prone & SI a ≤1″ (Out of Action)." },
	{ name: "Crawl", type: "D", effect: "Prone: move ½M (única ação se Prone & SI)." },
	{ name: "Fight", type: "B", effect: "Ataques de corpo a corpo (engaged)." },
	{ name: "Move", type: "S", effect: "Move até M; pode escalar, cruzar vãos e pular." },
	{ name: "Reload", type: "S", effect: "Teste de Ammo p/ remover Out of Ammo." },
	{ name: "Retreat", type: "B", effect: "Teste de Initiative; passou = Move D6″ (inimigos podem reagir)." },
	{ name: "Running for Cover", type: "D", effect: "Broken: Standing 2D6″M / Prone ½M, rumo a cobertura." },
	{ name: "Shoot", type: "B", effect: "Ataque à distância." },
	{ name: "Stand Up", type: "B", effect: "De Prone & Pinned volta a Standing & Active." },
	{ name: "Take Cover", type: "B", effect: "Move ½M e fica Prone & Pinned." },
];

export const ACTION_TYPE_COLOR: Record<GameAction["type"], { color: string; label: string }> = {
	S: { color: "#59e36b", label: "Simple" },
	B: { color: "#00e5ff", label: "Basic" },
	D: { color: "#ff8a3d", label: "Double" },
};

export const ACTION_TYPES = [
	{ name: "Simple", desc: "Pode repetir na mesma ativação.", color: "#59e36b" },
	{ name: "Basic", desc: "Uma vez por ativação.", color: "#00e5ff" },
	{ name: "Double", desc: "Usa as DUAS ações da ativação.", color: "#ff8a3d" },
	{ name: "Free", desc: "Não gasta ação; 1× por ativação; não pode ter o mesmo nome de um Basic feito nesta ativação.", color: "#b07bff" },
];

/* ────────────────────────────── 04 · COMBATE ───────────────────────────── */

export type CombatStep = { title: string; text: string };

export const SHOOT_STEPS: CombatStep[] = [
	{ title: "Prioridade de alvo", text: "Mire o inimigo elegível MAIS PRÓXIMO. Para outro alvo, teste Cool (2D6 ≥ Cool). Exceções: alvo Prone & SI ou mais difícil de acertar pode ser ignorado." },
	{ title: "Declarar o tiro", text: "Escolha a arma e o alvo." },
	{ title: "Medir alcance", text: "Confirme long or short range da arma" },
	{ title: "Hit roll", text: "Teste de BS (1D6 ≥ BS) com modificadores: cobertura parcial -1, total -2; Accuracy ±; alvo Engaged -1; alvo Prone a Long -1; ponto no terreno -2. Natural 1 = falha." },
	{ title: "Resolver hits", text: "Siga a sequência de resolução (wound → save → damage). Modelo Standing & Active atingido por tiro fica Prone & Pinned." },
	{ title: "Firepower dice", text: "Se sair o símbolo de Ammo, faça teste de Ammo. Falhou = arma Out of Ammo (precisa de Reload)." },
];

export const FIGHT_STEPS: CombatStep[] = [
	{ title: "Virar para encarar", text: "Se necessário — -1 ao acerto se precisar virar." },
	{ title: "Escolher armas", text: "Até 2 armas com Melee/Sidearm; apenas 1 se Unwieldy." },
	{ title: "Dados de ataque", text: "Attacks (A) +1 se duas armas +1 se charging." },
	{ title: "Declarar alvos", text: "Pode dividir os ataques entre múltiplos inimigos engaged." },
	{ title: "Hit rolls", text: "Teste de WS por dado; +1 por aliado em assist, -1 por inimigo em interference." },
	{ title: "Resolver hits", text: "Wound → save → damage, para cada hit." },
	{ title: "Ataques de reação", text: "Inimigos ainda engaged fazem seus próprios Fight (passos 1–6) como reação." },
	{ title: "Consolidar", text: "Mova 2″ ou aplique Coup de Grace se todos os inimigos foram OOA/Wrecked/SI." },
];

export const HIT_STEPS: CombatStep[] = [
	{ title: "Wound roll", text: "D6 contra a tabela Strength × Toughness (use a calculadora ao lado). S ≥ 2T = 2+ · S > T = 3+ · S = T = 4+ · S < T = 5+ · S ≤ T/2 = 6+." },
	{ title: "Save roll", text: "Save da armadura menos o AP do atacante. Bônus de cobertura só vale contra Blast/Template. Natural 1 = falha. Field saves não recebem bônus de cobertura." },
	{ title: "Inflict Damage", text: "Cada ponto de Damage remove 1 Wound. A 0 W, role 1 Injury dice. Cada Damage extra após zerar W = +1 Injury dice." },
];

export const INJURY_DICE = [
	{ name: "Out of Action", short: "OOA", color: "#ff2d6f", text: "Sai da partida. Em campanha, role na tabela de Lasting Injury (D66)." },
	{ name: "Serious Injury", short: "SI", color: "#ff8a3d", text: "Fica Prone & Seriously Injured (resultado extra vira Flesh Wound)." },
	{ name: "Flesh Wound", short: "FW", color: "#ffc23d", text: "-1 Toughness. Se a Toughness chegar a 0, o fighter está Out of Action." },
];

export const HIT_MODIFIERS = [
	{ label: "Cobertura parcial", mod: "-1" },
	{ label: "Cobertura total", mod: "-2" },
	{ label: "Accuracy (faixa de alcance da arma)", mod: "±" },
	{ label: "Alvo Engaged", mod: "-1" },
	{ label: "Alvo Prone (só a Long range)", mod: "-1" },
	{ label: "Alvo é ponto no terreno", mod: "-2" },
	{ label: "Natural 1", mod: "ERRA" },
];

/** Regra To Wound: retorna o alvo do D6 para S vs T. */
export function woundTarget(s: number, t: number): string {
	if (s >= 2 * t) return "2+";
	if (s > t) return "3+";
	if (s === t) return "4+";
	if (s * 2 <= t) return "6+";
	return "5+";
}

/* ──────────────────────────── 06 · REFERÊNCIA ──────────────────────────── */

export type StatusEntry = {
	id: string;
	name: string;
	kind: "status" | "condition";
	color: string;
	text: string;
};

export const STATUSES: StatusEntry[] = [
	{ id: "active", name: "Standing & Active", kind: "status", color: "#59e36b", text: "O padrão. Em pé, sem inimigo engaged. Pode fazer qualquer ação." },
	{ id: "engaged", name: "Standing & Engaged", kind: "status", color: "#ff8a3d", text: "Em pé, base a base com inimigo (ou ≤1″ de veículo). Só pode Fight ou Retreat." },
	{ id: "pinned", name: "Prone & Pinned", kind: "status", color: "#00e5ff", text: "Deitado de costas (atingido por tiro). Precisa gastar ação em Stand Up." },
	{ id: "si", name: "Prone & Seriously Injured", kind: "status", color: "#ff2d6f", text: "Deitado de bruços (Serious Injury). Só pode Crawl. Vulnerável a Coup de Grace." },
	{ id: "ooa", name: "Out of Action", kind: "status", color: "#7d7a95", text: "Removido da partida. Em campanha, rola Lasting Injury (D66)." },
	{ id: "broken", name: "Broken", kind: "condition", color: "#b07bff", text: "Só Running for Cover; em combate, apenas Reaction com -2. Rallia na End Phase." },
	{ id: "flesh", name: "Flesh Wound", kind: "condition", color: "#ffc23d", text: "-1 Toughness por ferimento. Se a Toughness chegar a 0 = Out of Action." },
	{ id: "ammo", name: "Out of Ammo", kind: "condition", color: "#e84040", text: "Condition na arma: não pode ser usada até uma ação de Reload." },
	{ id: "ready", name: "Ready", kind: "condition", color: "#f5f5fa", text: "Pode ativar neste round; o marcador é removido ao ativar." },
];

export const CHAR_TESTS = [
	{ stat: "WS / BS / Initiative", roll: "1D6 ≥ alvo", note: "ex.: perfil 4+ passa com 4, 5 ou 6" },
	{ stat: "Ld / Cool / Will / Int", roll: "2D6 ≥ alvo", note: "testes de moral e mente" },
	{ stat: "Strength / Toughness", roll: "1D6 ≤ valor", note: "quanto menor a rolagem, melhor" },
];

export const XP_TABLE = [
	{ xp: "1 XP", text: "Causar Serious Injury em inimigo (1× por inimigo por ativação)." },
	{ xp: "2 XP", text: "Causar Out of Action em inimigo (1× por inimigo por ativação). +1 XP extra se a vítima for Leader/Champion." },
	{ xp: "2 XP", text: "Causar Wreck em veículo inimigo." },
	{ xp: "1 XP", text: "Participar da batalha (se o cenário não der XP por participar)." },
	{ xp: "1 XP", text: "Estar Broken e ralliar com sucesso." },
	{ xp: "1 XP", text: "Dar Assistance a Recovery test que terminou em Prone & Pinned." },
];

export const END_CONDITIONS = [
	{
		title: "Bottle out completo",
		text: "Uma gangue declarou fuga no início de uma Action Phase. Todos os Standing fogem (Initiative test para Engaged); a batalha termina quando só restam Prone & SI dessa gangue.",
	},
	{
		title: "Cenário cumprido",
		text: "Cada cenário tem sua condição de fim: rounds máximos, objetivo destruído, todos os atacantes derrotados, etc.",
	},
	{
		title: "Vitória / Derrota / Empate",
		text: "Definida pelo cenário (e pelas regras específicas da campanha).",
	},
];

export const FALL_TABLE = [
	{ range: "3″–5″", s: "S3", ap: "AP -", d: "D1" },
	{ range: "6″–7″", s: "S5", ap: "AP -1", d: "D1" },
	{ range: "8″–9″", s: "S7", ap: "AP -2", d: "D2" },
	{ range: "10″+", s: "S9", ap: "AP -3", d: "D3" },
];
