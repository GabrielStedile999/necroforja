// Modes of Play — Skirmish (issue #35). English mirror of ./content.ts.
// All logic keys (ids, nums, refs) are identical between the two modules —
// only human-readable text differs.

import type { SkChapter, CompareRow, SkillTier, RepOption, SeqDiff, TipCard } from "./content";

export const SK_CHAPTERS: SkChapter[] = [
	{ id: "o-que-e", num: "00", title: "What it is", accent: "cyan" },
	{ id: "comparativo", num: "01", title: "Skirmish vs Campaign", accent: "hazard" },
	{ id: "monte-a-gangue", num: "02", title: "Build your gang", accent: "violet" },
	{ id: "o-que-muda", num: "03", title: "What changes", accent: "rust" },
	{ id: "quando-jogar", num: "04", title: "When to play it", accent: "toxic" },
];

export const SK_INTRO = {
	image: "underhive",
	kicker: "// MODES OF PLAY · SKIRMISH",
	lead: "One battle. No strings attached. No spreadsheet.",
	body:
		"Skirmish is Necromunda at its most direct: two gangs, one table, one scenario — and when the final round ends, the story ends with it. No Territories in play, no Stash to accumulate, no XP to manage between battles. It's the perfect mode to try out a new House, teach someone to play, or simply settle a score on the table in a single night.",
	close: "BASED ON THE NECROMUNDA CORE RULEBOOK (2023) · PAGES CITED IN EACH SECTION",
};

export const COMPARE_ROWS: CompareRow[] = [
	{
		id: "duracao",
		label: "Duration",
		skirmish: "A single battle. It ends at the end of the final round.",
		campaign: "A series of linked battles played over weeks or months.",
	},
	{
		id: "budget",
		label: "Gang budget",
		skirmish: "Freely agreed between players — 1,250 to 2,000 credits recommended (pg. 90).",
		campaign: "A fixed 1,000 credits (+400 for vehicles) — the Arbitrator may adjust this (pg. 81).",
	},
	{
		id: "sobra",
		label: "Unspent credits",
		skirmish: "Simply lost when the gang is founded.",
		campaign: "Added to the gang's Stash and available later.",
	},
	{
		id: "xp",
		label: "Experience & Advancements",
		skirmish: "Fighters don't gain XP. Instead, the gang gets extra skills and characteristic increases at creation (pg. 91).",
		campaign: "Fighters accrue XP in every battle and purchase Advancements during the post-battle sequence (pg. 148-150).",
	},
	{
		id: "reputation",
		label: "Reputation & Gang Rating",
		skirmish: "Reputation is chosen (5, 10 or 15) and Gang Rating never changes afterwards — it's fixed (pg. 91).",
		campaign: "Reputation starts at 1 and grows; Gang Rating is recalculated every post-battle sequence.",
	},
	{
		id: "territorio",
		label: "Territory / Sympathisers",
		skirmish: "Doesn't exist — no battle has territory at stake.",
		campaign: "Every battle is fought over a Territory (or Sympathiser) that changes hands.",
	},
	{
		id: "capturados",
		label: "Fighters Out of Action",
		skirmish: "No lasting consequences — the fighter returns whole for the next game.",
		campaign: "Real risk of Lasting Injury, capture by a rival gang, or permanent death.",
	},
	{
		id: "arbitrator",
		label: "Arbitrator",
		skirmish: "Optional — usually it's just the two players deciding together.",
		campaign: "Recommended to have a dedicated Arbitrator managing territory, schedule and disputes.",
	},
];

export const BUDGET_NOTE = {
	title: "Recommended budget",
	range: "1,250 – 2,000 credits",
	text:
		"It's only a guideline, not a hard rule — larger gangs are possible, but smaller budgets force hard choices, which usually makes for a more interesting game. A good reference point: 10 to 20 fighters, and 1 to 4 vehicles.",
};

export const SKILL_TIERS: SkillTier[] = [
	{ id: "t1", range: "Up to 1,300 credits", skills: "5 extra Primary skills" },
	{ id: "t2", range: "1,301 to 1,500 credits", skills: "6 extra Primary skills" },
	{ id: "t3", range: "1,501 credits or above", skills: "5 Primary + 1 Secondary skill" },
];

export const SKILL_ALLOCATION = [
	"Leader: one free starting skill plus up to two extra skills.",
	"Champions: one free starting skill plus up to one extra skill.",
	"Prospects, Juves and Specialists: one extra skill each.",
	"Extra characteristic increases: half the number of extra skills, rounded down (two or three, typically) — no model gets more than one increase.",
];

export const REPUTATION_OPTIONS: RepOption[] = [
	{ rep: "5", hangers: "up to 2 Hangers-on/Brutes" },
	{ rep: "10", hangers: "up to 3 Hangers-on/Brutes" },
	{ rep: "15", hangers: "up to 4 Hangers-on/Brutes" },
];

export const GANG_SETUP_NOTES = [
	"Equipment: besides the gang's own list, players may agree to unlock Rare/Illegal items from the Trading Post up to a combined level before the game (e.g. up to Rare (10)).",
	"Hired Guns, Hangers-on and Brutes don't count towards any minimum fighter requirement, but they do count towards the maximum.",
	"A gang can only include Hangers-on, Brutes or Hired Guns once it has at least 10 models in its main list.",
];

export const PRE_BATTLE_DIFFS: SeqDiff[] = [
	{
		id: "pre-1",
		step: "1 · Make a Challenge & Stake Territory",
		ref: "pg. 97",
		text: "No territory at stake — the challenge is simply \"let's play a battle\". Nothing is staked.",
	},
	{
		id: "pre-2",
		step: "2 · Recruit Hired Guns",
		ref: "pg. 97",
		text: "Uses whatever credits were left over from founding the gang (instead of the campaign Stash).",
	},
	{
		id: "pre-3",
		step: "3 · Determine Scenario",
		ref: "pg. 98",
		text: "Players simply choose the scenario together; a roll-off breaks any deadlock.",
	},
	{
		id: "pre-6",
		step: "6 · Announce Territory Boons",
		ref: "pg. 98",
		text: "The whole step is skipped — there are no Territory Boons to announce.",
	},
];

export const POST_BATTLE_DIFFS: SeqDiff[] = [
	{
		id: "post-2",
		step: "2 · Assign/Reassign Territory",
		ref: "pg. 144",
		text: "Skipped — there's no territory to assign.",
	},
	{
		id: "post-4",
		step: "4 · Collect Income",
		ref: "pg. 144",
		text: "Skipped — with no territory, there's no income to collect.",
	},
	{
		id: "post-6e",
		step: "6.E · Purchase Advancements",
		ref: "pg. 148",
		text: "Skipped — Skirmish fighters don't accrue XP, so there are no Advancements to buy.",
	},
	{
		id: "post-6f",
		step: "6.F · Update Gang Rating",
		ref: "pg. 147",
		text: "Skipped — a Skirmish gang's Gang Rating is fixed from the moment it's founded.",
	},
	{
		id: "post-7",
		step: "7 · Report Results",
		ref: "pg. 147",
		text: "Optional — only worth doing if the battle is part of something bigger (e.g. a tournament).",
	},
];

export const SKIRMISH_TIPS: TipCard[] = [
	{
		id: "novos",
		icon: "spark",
		title: "Try out a new House",
		text: "Curious about House Van Saar before committing an entire campaign to it? Build a Skirmish gang, play a few battles, and decide with the models actually on the table.",
	},
	{
		id: "demo",
		icon: "target",
		title: "Teach someone to play",
		text: "No Advancements, no Stash, no history — it's the simplest entry point for a first-time player. Pair it with the How to Play guide for that first battle.",
	},
	{
		id: "torneio",
		icon: "scale",
		title: "Tournaments and events",
		text: "Equal budgets and a fixed Gang Rating make Skirmish the natural format for competitive events — everyone starts on the same footing.",
	},
	{
		id: "avulsa",
		icon: "clock",
		title: "One night, one story",
		text: "No commitment to continuity: perfect for when the gaming group changes every session, or when there's only time for a single battle.",
	},
];
