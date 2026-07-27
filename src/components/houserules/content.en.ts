// Campaign Custom Rules (issue #41) — English mirror of ./content.ts.
// All logic keys (ids, nums, accents) are identical — only display text differs.

import type { HouseRule, HrChapter } from "./content";

export const HR_INTRO = {
	image: "criminal",
	kicker: "// CAMPAIGN TOOLS · CAMPAIGN CUSTOM RULES",
	lead: "The house rules. In writing.",
	body:
		"Every Necromunda table ends up creating its own tweaks — this page documents the ones in force for this campaign, on top of the official rulebook. Agreed between the players, arbitrated by the Arbitrator, and written down here so nobody can claim surprise mid-battle.",
	close: "THE RULES BELOW APPLY TO THIS CAMPAIGN — WHEN IN DOUBT, THE ARBITRATOR DECIDES",
};

/* ─────────────────────────────── RULES ─────────────────────────────────── */

export const HOUSE_RULES: HouseRule[] = [
	{
		id: "infiltrate-hidden-deployment",
		num: "01",
		accent: "hazard",
		title: "Infiltrate & Hidden Deployment",
		intro:
			"House rule for out-of-zone placement. It caps how many fighters may use Infiltrate, From the Shadows or equivalent rules — and defines the custom skill Infiltrate (Advanced Assault) for the rest.",
		clauses: [
			{
				id: "limite",
				label: "LIMIT",
				text:
					"A maximum of 2 fighters per crew may use Infiltrate, From the Shadows or equivalent rules to be placed outside the deployment zone.",
			},
			{
				id: "advanced-assault",
				label: "CUSTOM SKILL",
				text:
					"Additional fighters with such rules use the campaign's custom skill Infiltrate (Advanced Assault) instead: they are placed normally within the control/deployment zone, but may perform up to two Move actions after deployment and before round one.",
			},
			{
				id: "posicionamento",
				label: "PLACEMENT",
				text:
					"Fighters placed outside the deployment zone via these rules must remain out of line of sight and more than 6\" away from enemies; they cannot be placed within 9\" of any objective, loot marker, relic, captive, terminal, scenario target or extraction point.",
			},
			{
				id: "objetivos",
				label: "OBJECTIVES",
				text:
					"Fighters using Infiltrate, From the Shadows or equivalents cannot control, contest, score or interact with objectives during round one or the round they enter play.",
			},
			{
				id: "armas",
				label: "WEAPON RESTRICTION",
				text:
					"Fighters equipped with Template, Blast, Web, Gas or Blaze weapons cannot use Infiltrate for out-of-zone placement — they use Advanced Assault instead.",
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
