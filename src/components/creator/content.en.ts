// Creator page (issue #39 follow-up) — English mirror of ./content.ts.
// Logic keys (ids) are identical between the two modules; only the
// human-readable text differs.

import type { CreatorFact } from "./content";

export type { CreatorFact };

export const CREATOR_INTRO = {
	kicker: "// THE CREATOR",
	name: "Gabriel Stedile",
	role: "Biologist · Software developer · Miniature painter",
	photoAlt: "Portrait of Gabriel Stedile, creator of NecroForja",
};

/** Bio paragraphs — plain, indexable text. */
export const CREATOR_PARAGRAPHS: { id: string; text: string }[] = [
	{
		id: "origem",
		text: "Gabriel Stedile holds degrees in Biology and in Information Systems, and has been working in software development for over 11 years. He started painting miniatures during the COVID-19 pandemic and has been in love with the hobby ever since — what began as a quarantine pastime turned into paints scattered around the house, an ever-growing collection and whole nights spent on highlights nobody will notice from a metre away.",
	},
	{
		id: "colecao",
		text: "A lover of wargames and board games, he collects and plays a (worryingly) wide range of systems: Warhammer 40k (Necrons), Age of Sigmar (Stormcast Eternals and Tzeentch), The Old World (Grand Cathay and Legions of Chaos), Warcry, Warcrow (Northern Tribes) and Warmachine (Khador and Cryx).",
	},
	{
		id: "necromunda",
		text: "But of all those universes and systems, his greatest passion is Necromunda. These days he descends into the underhive with Delaque, Goliath and Van Saar — and his pile of shame covers almost every faction in the game, patiently waiting for a coat of paint.",
	},
	{
		id: "necroforja",
		text: "NecroForja was born where the two halves meet: the developer and the player. He designed and built the site to track his own table's campaigns — and maintains it as an independent portfolio project, with the code public on GitHub.",
	},
];

/** "Spec sheet" chips — same visual language as the FaqHero counters. */
export const CREATOR_FACTS: CreatorFact[] = [
	{ id: "gangs", label: "GANGS ON THE TABLE", value: "Delaque · Goliath · Van Saar" },
	{ id: "since", label: "PAINTING SINCE", value: "2020" },
	{ id: "systems", label: "SYSTEMS PLAYED", value: "7+" },
	{ id: "pile", label: "PILE OF SHAME", value: "∞" },
];

/** External link labels (destinations come from @/lib/seo/json-ld). */
export const CREATOR_LINKS = {
	linkedin: "LINKEDIN →",
	github: "VIEW THE CODE ON GITHUB →",
};
