// Modes of Play — Campaign (issue #35). English mirror of ./content.ts.
// All logic keys (ids, nums, cards, houses) are identical between the two
// modules — only human-readable text differs.

import type {
	CpChapter,
	CampaignPhase,
	Territory,
	Triumph,
	SuccessionPhase,
	Allegiance,
} from "./content";

export const CP_CHAPTERS: CpChapter[] = [
	{ id: "o-que-e", num: "00", title: "What it is", accent: "cyan" },
	{ id: "ciclo", num: "01", title: "The campaign cycle", accent: "hazard" },
	{ id: "territorios", num: "02", title: "Territories & Boons", accent: "violet" },
	{ id: "triunfos", num: "03", title: "Triumphs", accent: "rust" },
	{ id: "aranthian-succession", num: "04", title: "Aranthian Succession", accent: "toxic" },
];

export const CP_INTRO = {
	image: "clan-houses",
	kicker: "// MODES OF PLAY · CAMPAIGN",
	lead: "One gang. Many battles. A story that sticks.",
	body:
		"Campaign is the mode Necromunda was built to be played in: a series of linked battles where every game reshapes the map, and the same gang carries scars, veterans and territory from one night to the next. This is where Reputation becomes legend, Territories generate income between battles, and losing a fighter actually hurts.",
	close: "BASED ON THE NECROMUNDA CORE RULEBOOK (2023) AND THE ARANTHIAN SUCCESSION: CINDERAK BURNING",
};

export const CAMPAIGN_PHASES: CampaignPhase[] = [
	{
		id: "occupation",
		num: "1",
		title: "Occupation phase",
		length: "3 cycles",
		text: "Gangs fight to grab as much Territory as they can and grow their influence.",
		bullets: [
			"Only unclaimed Territories can be claimed as a reward — unless there are none left.",
			"Challenges follow an order: random in cycle 1, then lowest to highest Gang Rating afterwards.",
			"The challenger picks which unclaimed Territory is at stake in the battle.",
		],
		accent: "hazard",
	},
	{
		id: "downtime",
		title: "Downtime",
		num: "2",
		length: "1 cycle",
		text: "A breather: fighters recover, captives come home, and gangs restock before the final confrontation.",
		bullets: [
			"Fighters In Recovery are cleared and Captives are returned (the capturing gang gets half their credit value).",
			"Juves and Prospects with 3+ Advancements can be promoted.",
			"Every gang gets 250 extra credits to spend right away on equipment or recruits.",
			"Restless players can fight side battles — fun, but with no effect on the campaign.",
		],
		accent: "cyan",
	},
	{
		id: "takeover",
		title: "Takeover phase",
		num: "3",
		length: "3 cycles",
		text: "Gangs defend what they've won and try to seize Territory from their rivals.",
		bullets: [
			"Only already-controlled Territories can be fought over and claimed.",
			"A draw leaves the Territory with whoever controlled it before.",
			"This is the decisive phase — the campaign's final map starts taking shape here.",
		],
		accent: "toxic",
	},
];

export const ARBITRATOR_ROLE = {
	title: "The Arbitrator",
	text:
		"Every campaign needs someone in this role: organising the list of gangs, keeping everyone informed on progress and Territory control, and deciding when each phase — and the whole campaign — begins and ends. It can be one dedicated player or a rotating job within the group — what matters is having a single reference point for rules questions and tie-breaks.",
};

/**
 * A single example (Generatorium) covering the full structure of a
 * Territory: flavor, Territory Boon (a Special one, here) and Enhanced Boon
 * (a Reputation one, exclusive to a House). The full Territory list lives in
 * the Core Rulebook (pg. 173-181).
 */
export const TERRITORIES: Territory[] = [
	{
		id: "generatorium",
		name: "Generatorium",
		card: "Jack of Spades",
		house: "Van Saar",
		flavor:
			"Much of the light and power in the underhive relies on taps into energy conduits or barely functioning generators. Those that control the source of such power can let it flow… or cut it off at a whim.",
		boonLabel: "Special",
		boonText:
			"If your gang controls this Territory, you may choose to stall the generators, temporarily cutting the power to the area in which a battle is taking place and plunging it into darkness. You may declare you will do this at the beginning of any Priority phase, before the roll for Priority. For the remainder of the battle, the Pitch Black rules (pg. 193) are in effect. However, at the start of each End phase, before making any Bottle checks, the player that controls this Territory rolls a D6: on a 5 or more, the generators restart and Pitch Black immediately ceases to be in effect; on a 1-4, the generators stay silent.",
		enhancedBoonLabel: "Reputation",
		enhancedBoonText: "Whilst it controls this Territory, a Van Saar gang adds +1 to its Reputation.",
	},
];

export const TERRITORY_MECHANICS = [
	"The number of Territories in a campaign depends on the player count: 9 for 3 players, up to 24 for 8 (pg. 167).",
	"Territories are drawn from a deck — half of a standard playing card deck represents the full list (pg. 167).",
	"Losing a Territory takes its Boon with it — a gang only benefits from it while it's under control.",
	"Enhanced Boons: many Territories have an even better version of one of their Boons (or an extra Boon) for gangs of a specific House — in the example above, it's House Van Saar that gets the Reputation bonus.",
];

export const DOMINION_TRIUMPHS: Triumph[] = [
	{ id: "dominator", name: "Dominator", criteria: "Most Territories at the end of the campaign." },
	{ id: "slaughterer", name: "Slaughterer", criteria: "Most enemy fighters taken Out of Action and vehicles Wrecked across the whole campaign." },
	{ id: "creditor", name: "Creditor", criteria: "Largest Wealth at the end of the campaign." },
	{ id: "warmonger", name: "Warmonger", criteria: "Most battles fought across the whole campaign." },
	{ id: "powerbroker", name: "Powerbroker", criteria: "Highest Reputation at the end of the campaign." },
];

export const SUCCESSION_INTRO = {
	text:
		"The Territory framework above comes straight from the Core Rulebook (the Dominion Campaign) — but the campaign actually running on NecroForja is a different one: The Aranthian Succession, from the Cinderak Burning book. Same backbone (cycles, Arbitrator, income, Triumphs), with a narrative twist: Necromunda has plunged into the Great Darkness, and gangs pick a side in the civil war that follows.",
};

export const SUCCESSION_PHASES: SuccessionPhase[] = [
	{
		id: "great-darkness",
		title: "Great Darkness",
		length: "3 cycles",
		text: "Cut off from their Houses, gangs fight to survive and consolidate power. No recruiting from the House Equipment List, a pricier and more restricted Trading Post, and Sector Mechanicus/Zone Mortalis battles fought in Pitch Black.",
	},
	{
		id: "downtime-succession",
		title: "Downtime",
		length: "1 cycle",
		text: "On top of the usual Downtime effects, this is when every gang must Declare Allegiance — the Imperial House, Lady Credo's Rebellion, or stay Unaligned a little longer.",
	},
	{
		id: "spark-of-rebellion",
		title: "Spark of Rebellion",
		length: "3 cycles",
		text: "The civil war heats up: gangs defend their Sympathisers and try to seize their rivals'. The Trading Post returns to normal and Pitch Black is no longer automatic.",
	},
];

export const ALLEGIANCES: Allegiance[] = [
	{
		id: "imperial-house",
		name: "Imperial House",
		tagline: "Defend Lord Helmawr's order",
		benefits: [
			"Emissaries of House Helmawr: a chance to recruit a free Dramatis Personae during the pre-battle sequence.",
			"Deep Pockets: an extra D6x10 credits when collecting Income from Sympathisers.",
		],
		accent: "cyan",
	},
	{
		id: "ladys-rebellion",
		name: "Lady Credo's Rebellion",
		tagline: "Fight for the revolution",
		benefits: [
			"Emissaries of the Rebellion: a chance to recruit a free Dramatis Personae during the pre-battle sequence.",
			"Stars in the Ascendency: +1 extra Reputation for every battle won.",
		],
		accent: "hazard",
	},
	{
		id: "unaligned",
		name: "Unaligned",
		tagline: "No side yet — for now",
		benefits: [
			"Look Out for our Own: a chance to recruit a free Dramatis Personae during the pre-battle sequence.",
			"We Stand for Ourselves: an extra D3 XP for taking down the enemy Leader.",
			"Take a Side: can declare an allegiance in any post-battle sequence — but no gang can sit on the sidelines forever.",
		],
		accent: "toxic",
	},
];

export const SUCCESSION_TRIUMPHS: Triumph[] = [
	{ id: "champion-helmawr", name: "Champion of House Helmawr", criteria: "Most scenarios won for the Imperial House." },
	{ id: "champion-rebellion", name: "Champion of the Rebellion", criteria: "Most scenarios won for Lady Credo's Rebellion." },
	{ id: "survivor", name: "Survivor", criteria: "Fewest deaths among their fighters during the Great Darkness phase." },
	{ id: "hoarder-of-coin", name: "Hoarder of Coin", criteria: "Highest Wealth at the end of the campaign." },
	{ id: "leader-of-men", name: "Leader of Men", criteria: "Most Territories/Sympathisers controlled at the end of the campaign." },
	{ id: "legendary-status", name: "Legendary Status", criteria: "Highest Reputation at the end of the campaign." },
];

export const SUCCESSION_CTA = {
	text: "The season currently running on NecroForja follows exactly this framework — Sympathisers, allegiances and all.",
};
