// FAQ (issue #41) — English mirror of ./content.ts.
// All logic keys (ids, nums, accents) are identical — only display text differs.

import type { FaqChapter, FaqGroup } from "./content";

/** Capítulos da página (um por grupo de perguntas) — alimentam o LoreNav. */
export const FAQ_CHAPTERS: FaqChapter[] = [
	{ id: "geral", num: "01", title: "General", accent: "cyan" },
	{ id: "campanha", num: "02", title: "Campaign", accent: "hazard" },
	{ id: "site-conta", num: "03", title: "Site & account", accent: "violet" },
];

export const FAQ_INTRO = {
	image: "underhive",
	kicker: "// CAMPAIGN TOOLS · FAQ",
	lead: "Frequent questions. Straight answers.",
	body:
		"Everything people ask about NecroForja and the campaign in one place — what the site is, how the campaign works and what you can do without an account. The table's house rules live on the Campaign Custom Rules page; rules questions not covered there go to the Arbitrator.",
	close: "DIDN'T FIND YOUR ANSWER? ASK AT THE TABLE — OR ASK THE ARBITRATOR",
};

/* ─────────────────────────── QUESTION GROUPS ───────────────────────────── */

export const FAQ_GROUPS: FaqGroup[] = [
	{
		id: "geral",
		title: "General",
		items: [
			{
				id: "o-que-e",
				question: "What is NecroForja?",
				answer:
					"NecroForja is a free web app — a digital campaign manager for the tabletop game Necromunda (Games Workshop). It tracks our The Aranthian Succession: Cinderak Burning campaign in real time: gang rankings, Sympathisers, battle reports and gallery. It is also Gabriel Stedile's portfolio project, with the code open on GitHub.",
			},
			{
				id: "loja",
				question: "Does NecroForja sell miniatures?",
				answer:
					"No. NecroForja is not a store and does not produce or sell miniatures, resin or 3D prints. It is just a website that manages a tabletop campaign. There is a similarly named German brand (NecroForge) that sells miniatures — we are not related to it.",
			},
			{
				id: "necromunda",
				question: "What is Necromunda?",
				answer:
					"Necromunda is a Games Workshop skirmish game set in the Warhammer 40,000 universe: rival gangs fight over the Underhive of a hive world in battles of miniatures, dice and a healthy dose of betrayal. The How to Play page covers the basics and the Lore page introduces the setting.",
			},
			{
				id: "idiomas",
				question: "Which languages does the site support?",
				answer:
					"English and Brazilian Portuguese. Use the language switcher at the top of the page — the preference is saved in your browser. Game terms (skills, weapons, rules) stay in English, as in the official books.",
			},
		],
	},
	{
		id: "campanha",
		title: "Campaign",
		items: [
			{
				id: "qual-campanha",
				question: "Which campaign are you playing?",
				answer:
					"The Aranthian Succession: Cinderak Burning — an official Games Workshop narrative campaign. The table's progress (rankings, territories, Triumphs and Sympathisers) is tracked here on the site, on the Campaign page and the public Dashboard.",
			},
			{
				id: "ranking",
				question: "How does the gang ranking work?",
				answer:
					"Every reported battle updates the ranking automatically: wins, territories and Sympathisers all score points toward the overall standings. The public Dashboard shows the live standings — no account needed.",
			},
			{
				id: "sympathisers",
				question: "What are Sympathisers?",
				answer:
					"Sympathisers are the Underhive's population taking sides in the war: an influence map showing which factions back each gang as the campaign unfolds. The map lives on the Dashboard and is updated by the Arbitrator as the campaign progresses.",
			},
			{
				id: "regras-da-casa",
				question: "Does the campaign use house rules?",
				answer:
					"Yes — tweaks the table agreed on top of the official rulebook, such as the Infiltrate & Hidden Deployment rule. They are all documented on the Campaign Custom Rules page, under the Campaign Tools menu.",
			},
			{
				id: "participar",
				question: "Can I join the campaign?",
				answer:
					"The current campaign is a closed table of friends, but the site is public — follow the rankings, read the battle reports and browse the gallery as much as you like. If a season opens seats, recruitment shows up in the ticker and the campaign journal.",
			},
			{
				id: "relatorios",
				question: "Where do I read the battle reports?",
				answer:
					"In the Reports section (the campaign journal): each post covers a battle or a season event, with photos from the table. The photos also live in the Gallery, organised by category.",
			},
		],
	},
	{
		id: "site-conta",
		title: "Site & account",
		items: [
			{
				id: "preciso-conta",
				question: "Do I need an account to use the site?",
				answer:
					"Not for most of it: the landing, Dashboard, Reports, Gallery and the rules pages are public. Accounts exist only for campaign players (to manage their own gang) and for the Arbitrator (administration).",
			},
			{
				id: "celular",
				question: "Does it work on mobile?",
				answer:
					"Yes — the site is responsive and is a PWA: you can install it on your phone's home screen and parts of it work offline. On iPhone, use \"Add to Home Screen\" in Safari.",
			},
		],
	},
];
