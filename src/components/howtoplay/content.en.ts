// English translation of ./content.ts (the PT-BR source of truth), translated
// from the original "Necromunda — Fluxo Completo de um Jogo" document.
// Mirrors every export and structure: same ids, refs, numbers and srcs —
// only human-readable text differs. References: Necromunda Core Rulebook (2023).

import type {
	HtpChapter,
	KitItem,
	FlowPhase,
	HtpStep,
	RoundPhase,
	GameAction,
	CombatStep,
	StatusEntry,
} from "./content";

/** Page chapters — feed the sticky sub-navigation (LoreNav). */
export const HTP_CHAPTERS: HtpChapter[] = [
	{ id: "comece-aqui", num: "00", title: "Start here", accent: "cyan" },
	{ id: "o-loop", num: "01", title: "The game loop", accent: "hazard" },
	{ id: "pre-battle", num: "02", title: "Pre-battle", accent: "violet" },
	{ id: "battle-round", num: "03", title: "Battle round", accent: "rust" },
	{ id: "combate", num: "04", title: "Combat", accent: "hazard" },
	{ id: "post-battle", num: "05", title: "Post-battle", accent: "toxic" },
	{ id: "referencia", num: "06", title: "Quick ref", accent: "cyan" },
];

export const HTP_INTRO = {
	image: "criminal",
	kicker: "// HOW TO PLAY",
	lead: "Every battle in Necromunda follows the same ritual.",
	body:
		"Necromunda is a skirmish game: two gangs of miniatures, a table dense with terrain, dice and brutal decisions. This guide walks through the complete flow of a game — from the pre-battle handshake to the report to the Arbitrator — in checklists you can tick right at the table.",
	close: "BASED ON THE NECROMUNDA CORE RULEBOOK (2023) · PAGES CITED AT EVERY STEP",
};

/** "How to read this guide" legend (box from the original document). */
export const HOW_TO_READ = [
	{ icon: "checklist", title: "Checklists", text: "Practical steps you tick off as you go — progress is saved while the page stays open." },
	{ icon: "ref", title: "References", text: "Each step points to the Core Rulebook (2023) page where the full rule lives: (pg. XX)." },
];

/* ────────────────────────────── 00 · START HERE ────────────────────────── */

export const START_KIT: KitItem[] = [
	{
		id: "gangue",
		icon: "gang",
		tag: "ESSENTIAL",
		title: "A gang of miniatures",
		text: "Around 10 fighters from one of the Clan Houses (Escher, Goliath, Orlock, Van Saar, Delaque or Cawdor). A gang box from your House is the classic starting point.",
	},
	{
		id: "livro",
		icon: "book",
		tag: "ESSENTIAL",
		title: "Core Rulebook + your gang's book",
		text: "The central rulebook. Every page reference in this guide points to it. Your gang's book (House of Blades, Chains, Iron…) adds the rules, fighters and equipment specific to the House you chose.",
	},
	{
		id: "dados",
		icon: "dice",
		tag: "ESSENTIAL",
		title: "Necromunda dice",
		text: "Several regular D6, plus the special dice: Firepower dice (ammo), Injury dice (injuries) and a pair of differently coloured D6 for rolling D66 on the tables.",
	},
	{
		id: "medidas",
		icon: "tape",
		tag: "ESSENTIAL",
		title: "Tape measure & templates",
		text: "Distances are in inches. The Blast (3\"/5\") and Flame templates resolve area weapons — and Necromunda uses true model line of sight, so crouch down and take aim.",
	},
	{
		id: "fichas",
		icon: "cards",
		tag: "ON NECROFORJA",
		title: "Fighter cards & roster",
		text: "Each fighter has a card with profile, weapons and skills. On NecroForja your gang's roster is digital: credits, XP, stash and advancements are tracked between battles.",
	},
	{
		id: "terreno",
		icon: "terrain",
		tag: "RECOMMENDED",
		title: "Terrain — lots of terrain",
		text: "The Underhive is vertical and claustrophobic. Walkways, towers, containers and ruins: the denser the table, the better the game. Zone Mortalis (corridors), Sector Mechanicus (platforms) — or, in the Ash Wastes, highways and open ruins.",
	},
];

/* ─────────────────────────────── 01 · THE LOOP ─────────────────────────── */

export const FLOW_PHASES: FlowPhase[] = [
	{
		id: "flow-pre",
		target: "pre-battle",
		num: "1",
		title: "Pre-battle sequence",
		sub: "8 STEPS · BEFORE THE BATTLEFIELD",
		text: "Challenge, hired guns, scenario, terrain, crew, boons, gang tactics and deployment. All with both players present.",
		accent: "violet",
	},
	{
		id: "flow-round",
		target: "battle-round",
		num: "2",
		title: "Battle rounds",
		sub: "LOOP · PRIORITY → ACTION → END",
		text: "The battle itself. Each round repeats the 3 sub-phases until someone wins, everyone bottles out, or the scenario ends.",
		accent: "rust",
		loop: true,
	},
	{
		id: "flow-post",
		target: "post-battle",
		num: "3",
		title: "Post-battle sequence",
		sub: "7 STEPS · AFTER THE FINAL ROUND",
		text: "Wrap-up, territory, rewards, income, post-battle actions, roster update and the report to the Arbitrator.",
		accent: "toxic",
	},
];

/* ───────────────────────── 02 & 05 · PHASE CHECKLISTS ──────────────────── */

export const PRE_BATTLE_STEPS: HtpStep[] = [
	{
		id: "pre-1",
		num: "1.1",
		title: "Make a Challenge & Stake Territory",
		ref: "pg. 97",
		items: [
			"In a campaign: the challenger and the challenged were already decided before this session; confirm it.",
			"Sympathiser/Territory at stake: identify what the “prize” of this battle will be (campaign-specific rules).",
			"In a skirmish: both players simply agree to play a game; nothing is staked.",
		],
		note: {
			tone: "key",
			title: "Rescue Mission (campaign)",
			lines: [
				"If one of your fighters has been Captured by another gang, you may issue a Rescue Mission. If the other gang refuses, it automatically loses the captive. If it accepts, the Rescue Mission replaces the normal scenario — nothing is staked, the captive IS the prize.",
			],
		},
	},
	{
		id: "pre-2",
		num: "1.2",
		title: "Recruit Hired Guns",
		ref: "pg. 97",
		items: [
			"Each player may spend credits from their Stash to hire Hired Guns (Bounty Hunters, Hive Scum, etc.).",
			"If both want to hire, the gang with the lower Gang Rating hires first.",
			"In a campaign, certain House Favours or Sympathiser Boons can grant extra Hired Guns.",
		],
	},
	{
		id: "pre-3",
		num: "1.3",
		title: "Determine Scenario",
		ref: "pg. 98",
		items: [
			"In a skirmish: players choose; to break a tie, roll off.",
			"In a campaign (Succession Campaign): use the Scenario Selection Table or the Arbitrator's instructions.",
			"Determine Attacker/Defender: challenger = attacker in a campaign; in a skirmish, the higher D6 picks who is which.",
			"Home Turf Advantage: check whether the scenario grants it to the defender (affects Bottle checks).",
		],
	},
	{
		id: "pre-4",
		num: "1.4",
		title: "Set up the Battlefield",
		ref: "pg. 98",
		items: [
			"Use the set-up method the scenario specifies, or the standard one (Battlefield Set-up & Scenarios, pg. 185).",
			"Remember doors, terminals and any special markers the scenario calls for.",
		],
	},
	{
		id: "pre-5",
		num: "1.5",
		title: "Choose Crews",
		ref: "pg. 98",
		items: [
			"Use the method the scenario specifies: Random Selection (N), Custom Selection (N), All In, etc. (pg. 190).",
			"Fill in the Fighter/Vehicle Cards and set the crew's models aside. Models outside the crew are held as a Reinforcement deck when applicable.",
		],
	},
	{
		id: "pre-6",
		num: "1.6",
		title: "Announce Territory Boons",
		ref: "pg. 98",
		items: [
			"Announce now every Sympathiser/Territory Boon that will have an effect on the battle.",
			"A Boon not announced at this step cannot be used.",
			"In a skirmish, this step is skipped.",
		],
	},
	{
		id: "pre-7",
		num: "1.7",
		title: "Gang Tactics",
		ref: "pg. 98",
		items: [
			"Each scenario defines how many Gang Tactics each gang receives and how (chosen vs random, from the card deck or by rolling on the gang's table).",
			"Note them down separately for use during the battle.",
		],
	},
	{
		id: "pre-8",
		num: "1.8",
		title: "Deployment",
		ref: "pg. 98",
		items: [
			"Use the deployment zones defined by the scenario, or the standard rules if the scenario does not specify (pg. 191).",
			"Check whether any fighter must start Prone, Hidden, with the Mounted condition, etc.",
			"Assign the Priority marker for the first time (or leave it unowned — it will be resolved in the first round, in the Priority Phase).",
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
			"Succumb to injuries: for each fighter still Prone & Seriously Injured on the battlefield (or who fled in that state), roll 1D6. 1–2 = succumbs (OOA, roll a Lasting Injury). 3+ = survives.",
			"Being Captured: for each fighter with a 55–56 (Captured) result on the Lasting Injury table, roll 1D6 + modifiers (-1 draw, -2 lost, -2 was Webbed). 4+ = escapes into Convalescence. Failed = becomes a Captive.",
			"Claiming Scrap: if only one gang is left on the battlefield, it gains D3×10 credits for each enemy vehicle Wrecked on the field.",
			"Clear In Recovery: fighters who were In Recovery are considered recovered — clear the box.",
		],
	},
	{
		id: "post-2",
		num: "3.2",
		title: "Assign/Reassign Territory",
		ref: "pg. 144",
		items: [
			"The winner takes the staked territory/Sympathiser.",
			"Draw over an unclaimed territory: nobody gains it (it returns to the pool).",
			"Draw over a controlled territory (Takeover): it does not change hands.",
		],
	},
	{
		id: "post-3",
		num: "3.3",
		title: "Receive Rewards",
		ref: "pg. 144",
		items: [
			"Apply the scenario's Rewards: credits (winner X cr, loser Y cr), special XP, Reputation.",
			"Reputation gains and losses: apply ALL gains before applying losses.",
			"Items gained go to the Stash, to be distributed in step 3.6.",
		],
	},
	{
		id: "post-4",
		num: "3.4",
		title: "Collect Income",
		ref: "pg. 144",
		items: [
			"For each Sympathiser/Territory that generates income, roll the income as per its card. Add it to the Stash.",
			"Alliance Boons (e.g. Deep Pockets — +D6×10 when generating income from Sympathisers) apply here.",
		],
	},
	{
		id: "post-5",
		num: "3.5",
		title: "Post-battle Actions",
		ref: "pg. 144",
		items: [
			"Trade: visit the Trading Post — unlocks rare and illegal items for the whole gang in step 3.6.",
			"Sell to the Guilders: sell captives for half their credit value (the captive must have had a chance of rescue).",
			"Claim Bounties: a Law-Abiding gang collects the full bounty for an Outlaw captive.",
			"Dispose of Captives: an Outlaw gang may “dispose of” enemy captives.",
			"Medical Escort: 2D6×10 cr to save a fighter with a Critical Injury (D6: 1 dies, 2–5 stabilises/Lasting, 6 full recovery).",
			"Negotiate Repairs: take a vehicle with Lasting Damage to the Chop Shop; a D6 sets the cost.",
		],
		note: {
			tone: "info",
			title: "Who acts here",
			lines: [
				"Each fighter with Gang Hierarchy (X) — Leaders and Champions — performs ONE post-battle action, in any order. Fighters In Recovery or Captives cannot act. Territories and skills can unlock extra actions.",
			],
		},
	},
	{
		id: "post-6",
		num: "3.6",
		title: "Update Roster",
		ref: "pg. 146",
		items: [
			"A · Clean House: erase the dead, decide retirements from Lasting Injuries, send equipment to the Stash.",
			"B · Visit the Trading Post: hire fighters/vehicles/Hangers-on, sell items (value − D6×10, min. 5 cr), buy equipment; Rare & Illegal only if someone did Trade in 3.5 (2D6 + Leader +2, Champion +1, +1 per 10 Rep).",
			"C · Gain Boons: claim territory Boons that grant a recruit, a Hanger-on or equipment.",
			"D · Distribute Equipment: from the Stash to the fighters (limits: 3 weapons on foot / 2 Mounted; * = 2 slots; † cannot be combined).",
			"E · Purchase Advancements: spend XP on skills and +stats — the cost rises with the number of Advancements already bought.",
			"F · Update Gang Rating: recalculate ONLY now. References to Gang Rating in earlier steps use the pre-battle value.",
		],
	},
	{
		id: "post-7",
		num: "3.7",
		title: "Report Results",
		ref: "pg. 147",
		items: [
			"Report to the Arbitrator: the gangs involved, who won, which territory was taken, how many enemies each side took OOA, and final Gang Rating + Wealth.",
			"On NecroForja, the campaign dashboard is updated with these results.",
		],
	},
];

/* ─────────────────────────── 03 · BATTLE ROUND ─────────────────────────── */

export const ROUND_PHASES: RoundPhase[] = [
	{
		id: "round-priority",
		letter: "A",
		title: "Priority Phase",
		ref: "pg. 100",
		tagline: "“Who acts first this round, and who is ready to act.”",
		items: [
			"Roll for Priority: both players roll 1D6. Highest wins and takes the Priority marker. Tie: whoever had Priority last round passes it to the opponent. In the 1st round, on a tie, both re-roll.",
			"Ready Gang: each player places a Ready marker on each of their models on the battlefield. Models with certain Conditions/Statuses may not gain Ready.",
		],
	},
	{
		id: "round-action",
		letter: "B",
		title: "Action Phase",
		ref: "pg. 101",
		tagline: "“Most of the game. Players activate models in alternating turns.”",
		items: [
			"Alternating activation: starting with whoever has Priority, players alternate, choosing ONE Ready model at a time to activate.",
			"Each model performs up to 2 actions per activation. Conditions (Broken) and Status (Prone & Seriously Injured) can limit this.",
			"Group Activation (X): Leaders and Champions with this rule can activate X Ready allies within 3″ along with them, resolving each one at a time.",
			"Remove the Ready marker when the activation ends. A model without Ready cannot be activated again this round.",
			"When one player runs out of Ready models, the other activates all of their remaining ones in any order they choose. The Action Phase ends when everyone has been activated.",
		],
	},
	{
		id: "round-end",
		letter: "C",
		title: "End Phase",
		ref: "pg. 139",
		tagline: "“Clean up the table, take morale tests, recover the wounded.”",
		items: [
			"Bottle Checks: if a player has ≥1 fighter Prone & SI / OOA or ≥1 Wrecked vehicle, roll 1D6 + (number of casualties). If it exceeds the starting crew size, the gang has “bottled out”.",
			"Fleeing the Battlefield: a bottled-out gang rolls a Cool test (2D6 ≥ Cool) for EACH model. Failed = flees. A Prone & SI model that flees is removed and tests in the Wrap-up.",
			"Recover & Restart: Prone & SI models roll 1 Injury dice (OOA leaves; Serious Injury stays down with +1 Flesh Wound; Flesh Wound = gets up Prone & Pinned). An ally within 1″ assists: 2 dice, pick 1. Stationary vehicles test to Restart.",
			"Rally Tests: each Broken model rolls Cool (2D6 ≥ Cool), +1 per non-Broken ally within 3″. Passed = back to normal.",
		],
	},
];

/** Flow of an individual activation (B.1). */
export const ACTIVATION_FLOW = [
	{ title: "Check Status", text: "Standing & Active / Engaged, Prone & Pinned / Seriously Injured, Broken — this defines the available actions." },
	{ title: "Check Conditions", text: "Broken, Webbed, Blind, Insane… — some impose a mandatory action or penalties." },
	{ title: "Change facing (optional)", text: "If Standing, before declaring actions." },
	{ title: "1st action", text: "Declare and resolve it." },
	{ title: "2nd action", text: "If the first was not a Double." },
	{ title: "Apply Status changes", text: "E.g.: Take Cover left the fighter Prone & Pinned." },
	{ title: "Remove Ready", text: "The activation is over — the model does not act again this round." },
];

/** Game actions guide — type: S = Simple, B = Basic, D = Double. */
export const GAME_ACTIONS: GameAction[] = [
	{ name: "Aim", type: "B", effect: "+1 to hit on the next Shoot this activation." },
	{ name: "Blind Fire", type: "D", effect: "Prone: shoots in 360°, -2 to hit." },
	{ name: "Charge", type: "D", effect: "Move M + D3″; if it ends engaged → free Fight." },
	{ name: "Coup de Grace", type: "S", effect: "Finishes off a Prone & SI enemy within 1″ (Out of Action)." },
	{ name: "Crawl", type: "D", effect: "Prone: move ½M (only action if Prone & SI)." },
	{ name: "Fight", type: "B", effect: "Close combat attacks (engaged)." },
	{ name: "Move", type: "S", effect: "Move up to M; can climb, cross gaps and jump." },
	{ name: "Reload", type: "S", effect: "Ammo test to remove Out of Ammo." },
	{ name: "Retreat", type: "B", effect: "Initiative test; passed = Move D6″ (enemies may react)." },
	{ name: "Running for Cover", type: "D", effect: "Broken: Standing 2D6″M / Prone ½M, towards cover." },
	{ name: "Shoot", type: "B", effect: "Ranged attack." },
	{ name: "Stand Up", type: "B", effect: "From Prone & Pinned back to Standing & Active." },
	{ name: "Take Cover", type: "B", effect: "Move ½M and become Prone & Pinned." },
];

export const ACTION_TYPE_COLOR: Record<GameAction["type"], { color: string; label: string }> = {
	S: { color: "#59e36b", label: "Simple" },
	B: { color: "#00e5ff", label: "Basic" },
	D: { color: "#ff8a3d", label: "Double" },
};

export const ACTION_TYPES = [
	{ name: "Simple", desc: "Can be repeated in the same activation.", color: "#59e36b" },
	{ name: "Basic", desc: "Once per activation.", color: "#00e5ff" },
	{ name: "Double", desc: "Uses BOTH of the activation's actions.", color: "#ff8a3d" },
	{ name: "Free", desc: "Costs no action; 1× per activation; cannot share a name with a Basic action made this activation.", color: "#b07bff" },
];

/* ────────────────────────────── 04 · COMBAT ────────────────────────────── */

export const SHOOT_STEPS: CombatStep[] = [
	{ title: "Target priority", text: "Target the CLOSEST eligible enemy. To pick another target, test Cool (2D6 ≥ Cool). Exceptions: a Prone & SI target or one harder to hit may be ignored." },
	{ title: "Declare the shot", text: "Choose the weapon and the target." },
	{ title: "Measure range", text: "Confirm the weapon's long or short range" },
	{ title: "Hit roll", text: "BS test (1D6 ≥ BS) with modifiers: partial cover -1, full cover -2; Accuracy ±; target Engaged -1; target Prone at Long -1; point on terrain -2. Natural 1 = miss." },
	{ title: "Resolve hits", text: "Follow the resolution sequence (wound → save → damage). A Standing & Active model hit by a shot becomes Prone & Pinned." },
	{ title: "Firepower dice", text: "If the Ammo symbol comes up, take an Ammo test. Failed = weapon Out of Ammo (needs a Reload)." },
];

export const FIGHT_STEPS: CombatStep[] = [
	{ title: "Turn to face", text: "If needed — -1 to hit if you have to turn." },
	{ title: "Choose weapons", text: "Up to 2 weapons with Melee/Sidearm; only 1 if Unwieldy." },
	{ title: "Attack dice", text: "Attacks (A) +1 if two weapons +1 if charging." },
	{ title: "Declare targets", text: "Attacks can be split between multiple engaged enemies." },
	{ title: "Hit rolls", text: "WS test per die; +1 per ally assisting, -1 per enemy interfering." },
	{ title: "Resolve hits", text: "Wound → save → damage, for each hit." },
	{ title: "Reaction attacks", text: "Enemies still engaged make their own Fight (steps 1–6) as a reaction." },
	{ title: "Consolidate", text: "Move 2″ or apply a Coup de Grace if all enemies went OOA/Wrecked/SI." },
];

export const HIT_STEPS: CombatStep[] = [
	{ title: "Wound roll", text: "D6 against the Strength × Toughness table (use the calculator alongside). S ≥ 2T = 2+ · S > T = 3+ · S = T = 4+ · S < T = 5+ · S ≤ T/2 = 6+." },
	{ title: "Save roll", text: "Armour save minus the attacker's AP. Cover bonus only applies against Blast/Template. Natural 1 = failure. Field saves get no cover bonus." },
	{ title: "Inflict Damage", text: "Each point of Damage removes 1 Wound. At 0 W, roll 1 Injury dice. Each extra Damage after reaching 0 W = +1 Injury dice." },
];

export const INJURY_DICE = [
	{ name: "Out of Action", short: "OOA", color: "#ff2d6f", text: "Leaves the game. In a campaign, roll on the Lasting Injury table (D66)." },
	{ name: "Serious Injury", short: "SI", color: "#ff8a3d", text: "Becomes Prone & Seriously Injured (an extra result becomes a Flesh Wound)." },
	{ name: "Flesh Wound", short: "FW", color: "#ffc23d", text: "-1 Toughness. If Toughness reaches 0, the fighter is Out of Action." },
];

export const HIT_MODIFIERS = [
	{ label: "Partial cover", mod: "-1" },
	{ label: "Full cover", mod: "-2" },
	{ label: "Accuracy (weapon range band)", mod: "±" },
	{ label: "Target Engaged", mod: "-1" },
	{ label: "Target Prone (Long range only)", mod: "-1" },
	{ label: "Target is a point on terrain", mod: "-2" },
	{ label: "Natural 1", mod: "MISS" },
];

/** To Wound rule: returns the D6 target for S vs T (pure logic, shared). */
export { woundTarget } from "./content";

/* ──────────────────────────── 06 · QUICK REF ───────────────────────────── */

export const STATUSES: StatusEntry[] = [
	{ id: "active", name: "Standing & Active", kind: "status", color: "#59e36b", text: "The default. On their feet, no engaged enemy. Can take any action." },
	{ id: "engaged", name: "Standing & Engaged", kind: "status", color: "#ff8a3d", text: "On their feet, base to base with an enemy (or within 1″ of a vehicle). Can only Fight or Retreat." },
	{ id: "pinned", name: "Prone & Pinned", kind: "status", color: "#00e5ff", text: "Lying on their back (hit by shooting). Must spend an action on Stand Up." },
	{ id: "si", name: "Prone & Seriously Injured", kind: "status", color: "#ff2d6f", text: "Lying face down (Serious Injury). Can only Crawl. Vulnerable to a Coup de Grace." },
	{ id: "ooa", name: "Out of Action", kind: "status", color: "#7d7a95", text: "Removed from the game. In a campaign, rolls a Lasting Injury (D66)." },
	{ id: "broken", name: "Broken", kind: "condition", color: "#b07bff", text: "Only Running for Cover; in combat, only Reaction attacks at -2. Rallies in the End Phase." },
	{ id: "flesh", name: "Flesh Wound", kind: "condition", color: "#ffc23d", text: "-1 Toughness per wound. If Toughness reaches 0 = Out of Action." },
	{ id: "ammo", name: "Out of Ammo", kind: "condition", color: "#e84040", text: "Condition on the weapon: it cannot be used until a Reload action." },
	{ id: "ready", name: "Ready", kind: "condition", color: "#f5f5fa", text: "Can activate this round; the marker is removed on activation." },
];

export const CHAR_TESTS = [
	{ stat: "WS / BS / Initiative", roll: "1D6 ≥ target", note: "e.g.: a 4+ profile passes on a 4, 5 or 6" },
	{ stat: "Ld / Cool / Will / Int", roll: "2D6 ≥ target", note: "morale and mind tests" },
	{ stat: "Strength / Toughness", roll: "1D6 ≤ value", note: "the lower the roll, the better" },
];

export const XP_TABLE = [
	{ xp: "1 XP", text: "Cause a Serious Injury on an enemy (1× per enemy per activation)." },
	{ xp: "2 XP", text: "Take an enemy Out of Action (1× per enemy per activation). +1 extra XP if the victim is a Leader/Champion." },
	{ xp: "2 XP", text: "Wreck an enemy vehicle." },
	{ xp: "1 XP", text: "Take part in the battle (if the scenario does not grant XP for participating)." },
	{ xp: "1 XP", text: "Be Broken and rally successfully." },
	{ xp: "1 XP", text: "Give Assistance to a Recovery test that ended in Prone & Pinned." },
];

export const END_CONDITIONS = [
	{
		title: "Full bottle out",
		text: "A gang declared flight at the start of an Action Phase. All Standing models flee (Initiative test for Engaged); the battle ends when only that gang's Prone & SI models remain.",
	},
	{
		title: "Scenario complete",
		text: "Each scenario has its own end condition: maximum rounds, objective destroyed, all attackers defeated, etc.",
	},
	{
		title: "Victory / Defeat / Draw",
		text: "Defined by the scenario (and by campaign-specific rules).",
	},
];

export const FALL_TABLE = [
	{ range: "3″–5″", s: "S3", ap: "AP -", d: "D1" },
	{ range: "6″–7″", s: "S5", ap: "AP -1", d: "D1" },
	{ range: "8″–9″", s: "S7", ap: "AP -2", d: "D2" },
	{ range: "10″+", s: "S9", ap: "AP -3", d: "D3" },
];
