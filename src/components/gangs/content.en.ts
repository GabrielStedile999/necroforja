// Gangs page content (issue #8) — English mirror of ./content.ts.
// Every export matches the PT-BR module; ids, slugs, colors and other logic
// keys are identical between locales (issue #12).

import type { GangsChapter, GangGroup, HouseDossier } from "./content";

/** Page chapters — feed the sticky sub-navigation (LoreNav). */
export const GANGS_CHAPTERS: GangsChapter[] = [
	{ id: "grandes-casas", num: "00", title: "The Great Houses", accent: "hazard" },
	{ id: "independentes", num: "01", title: "Independents & Cults", accent: "cyan" },
	{ id: "ash-wastes", num: "02", title: "Ash Wastes", accent: "rust" },
	{ id: "hive-secundus", num: "03", title: "Hive Secundus", accent: "violet" },
	{ id: "na-campanha", num: "04", title: "In the campaign", accent: "toxic" },
];

/** Page hero. */
export const GANGS_INTRO = {
	image: "houses",
	kicker: "// THE GANGS",
	lead: "Every gang is a promise of violence. Choose yours.",
	body:
		"Seventeen factions fight over the Underhive — from the six Great Clan Houses to forbidden cults, from the nomads of the Ash Wastes to the horrors of Hive Secundus. Each forges a different style of play at the table: this dossier presents the identity, playstyle, strengths and weaknesses of every gang.",
	close: "BASED ON THE NECROMUNDA CORE RULEBOOK (2023) AND THE HOUSE OF… BOOKS",
};

/** UI labels used across cards and sections. */
export const GANGS_UI = {
	playstyleLabel: "PLAYSTYLE",
	strengthsLabel: "STRENGTHS",
	weaknessesLabel: "WEAKNESSES",
	gangCountSuffix: "GANGS",
	campaignRating: "RATING",
	campaignRep: "REP",
	campaignHouseLabel: "HOUSE",
	campaignEmpty:
		"No gangs registered in the campaign right now — the season may be between cycles.",
	campaignOffline:
		"Campaign data is unavailable right now. Check the public dashboard for the live state.",
	campaignCta: "VIEW FULL DASHBOARD →",
};

/* ───────────────────────── 00 · THE GREAT HOUSES ───────────────────────── */

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
		imageAlt: "House Cawdor fighters with improvised weapons and masks",
		tagline: "FAITH & FIRE",
		desc:
			"Fanatic devotees of the Cult of the Redemption, the Cawdor turn hive refuse into weapons and faith into ammunition. What they lack in equipment they make up in numbers — and in cleansing fire for the heretic.",
		playstyle:
			"A horde gang: masses of cheap fighters advancing together, polearms and improvised weapons up front, fire bombs and flame to clear positions. The Articles of Faith (House of Faith) reward relentless aggression and turn losses into fervour.",
		strengths: [
			"The cheapest fighters of the Houses — outnumber the enemy from battle one.",
			"Articles of Faith: miracles that swing the game when the gang is under pressure.",
			"Plentiful fire weapons (flame, fire bombs) — excellent against hordes and in dense terrain.",
			"Losses hurt less: cheap replacements keep the roster full through a campaign.",
		],
		weaknesses: [
			"Improvised equipment: poor ammo checks and little long-range accuracy.",
			"Weak armour — the horde melts under disciplined Van Saar or Enforcer fire.",
			"Mediocre individual fighters: without mass (or faith), the plan collapses.",
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
		imageAlt: "Hooded House Delaque agents in the shadows",
		tagline: "THE SHADOW HOUSE",
		desc:
			"Spies, blackmailers and silent assassins — the House that trades in secrets and (officially) serves Lord Helmawr. Beneath the long coats, Psychoteric powers bend entire minds.",
		playstyle:
			"Control and information: infiltrate fighters behind enemy lines, deny the enemy setup, remove isolated targets. The Psychoteric Wyrds (House of Shadow) add psychic manipulation — fear, confusion and control — to an arsenal of silenced weapons and gas.",
		strengths: [
			"Native Infiltrate and ambush tactics — dictate where and when the fight happens.",
			"Psychoteric Wyrds: debuffs and mind control unique among the Houses.",
			"Excellent in objective play: fast, sneaky and hard to pin down.",
			"Exotic weapons (web, gas, silenced) that bypass conventional armour.",
		],
		weaknesses: [
			"T3 and light armour: fighters drop fast when the ambush fails.",
			"High skill ceiling — rewards planning, punishes straightforward play.",
			"Power concentrated in a few expensive specialists; losing them loses games.",
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
		imageAlt: "House Escher fighters with coloured hair and blades",
		tagline: "BLADES & VENOM",
		desc:
			"Masters of chemistry and genetic craft, the Escher pair lethal speed with the most refined poisons on Necromunda. An entire gang of fast blades — and no patience for brutes.",
		playstyle:
			"Hit and run: use superior Movement and Initiative to pick your fights, apply toxins and chem-weapons to drop bigger targets, and leave before the reply. Chem-alchemy (House of Blades) lets you brew custom stimms and venoms for every battle.",
		strengths: [
			"The fastest and most agile of the Great Houses — they own vertical terrain and mobile scenarios.",
			"Toxin and Gas ignore raw Toughness: a threat even to Goliaths and brutes.",
			"Chem-alchemy: bespoke buffs and poisons every pre-battle.",
			"Elite melee champions (Death Maidens) with cheap aggressive skills.",
		],
		weaknesses: [
			"S3/T3: they lose drawn-out slugging matches — they cannot stand still.",
			"Low-Strength basic weapons lean on quality hits (and poison).",
			"Fragile juves and gangers: positioning mistakes cost dearly.",
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
		imageAlt: "House Goliath bruisers with bio-engineered muscle",
		tagline: "THE FORGE TYRANTS",
		desc:
			"Vat-born to work the foundries, the Goliath are bio-engineered muscle running on stimms and contempt. Nothing on Necromunda hits harder — or soaks up as much punishment.",
		playstyle:
			"The relentless advance: soak fire with T4+, close the distance and finish it in melee or with short-range weapons (combat shotguns, stub cannons). Gene-smithing (House of Chains) lets you sculpt each fighter's profile before the campaign.",
		strengths: [
			"Base S4/T4 — the greatest physical power of any House.",
			"Devastating in melee and at short range; brutal in Zone Mortalis.",
			"Gene-smithing: unique profile customisation (more T, more S, stimm-immune…).",
			"Hard to wound and hard to keep down: they demand dedicated weapons to drop.",
		],
		weaknesses: [
			"M4 and low Initiative: slow across open boards and poor at agility tests.",
			"Mediocre BS and little reach — they suffer against Van Saar in the open.",
			"Expensive fighters: every casualty weighs on the roster and the credits.",
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
		imageAlt: "House Orlock fighters, the House of Iron, in formation",
		tagline: "HOUSE OF IRON",
		desc:
			"Miners, bikers and smugglers — the House of Iron controls the ore roads and lives on them. No extremes: the Orlock do everything reasonably well, with dependable guns and attitude to spare.",
		playstyle:
			"The aggressive middle ground: solid profiles, good projectile weapons (autoguns, combat shotguns, harpoon launchers) and the flexibility to answer any opponent. Legendary Names (House of Iron) give the gang's veterans personality and bonuses.",
		strengths: [
			"The most balanced gang in the game — no structural weakness to exploit.",
			"A dependable, cost-effective projectile arsenal.",
			"Legendary Names: veterans pick up signature abilities early.",
			"Ideal for learning Necromunda without giving up competitiveness.",
		],
		weaknesses: [
			"Masters of none: every enemy specialist beats the Orlock at their own game.",
			"Few exotic tricks — predictable to experienced opponents.",
			"No stat spikes: they rely on tactics and positioning, not on profile.",
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
		imageAlt: "House Van Saar fighters in tech suits",
		tagline: "THE ARCHTEKS",
		desc:
			"Keepers of a dying STC, the Van Saar manufacture the finest technology on Necromunda — and pay for it with their own bodies, poisoned by the radiation of the very artefact that enriches them.",
		playstyle:
			"Fire superiority: elite BS, energy weapons (las, plasma, rad) and gadgets (grav-cutters, refractor fields) to win the battle before it reaches melee. Archeoteks and Cyberteks (House of Artifice) keep the arsenal sharp and the lines protected.",
		strengths: [
			"The best marksmanship in the Underhive — few miss as rarely as others hit.",
			"A superior energy arsenal: plasma, dependable lasguns and rad weapons.",
			"Exclusive tech: grav-cutters, rigs and force fields.",
			"Excellent on defence and on open boards with long sight lines.",
		],
		weaknesses: [
			"Very expensive equipment: small gangs and painful casualties.",
			"Weak in melee — a connecting Goliath or CGC charge is catastrophic.",
			"M4 and limited mobility; they struggle in claustrophobic Zone Mortalis.",
		],
	},
];

/* ─────────────── 01–03 · INDEPENDENTS, ASH WASTES, SECUNDUS ────────────── */

export const GANG_GROUPS: GangGroup[] = [
	{
		id: "independentes",
		num: "01",
		title: "Independents & Cults",
		accent: "cyan",
		intro:
			"Beyond the Great Houses, the Underhive belongs to whoever takes it: the paramilitary law of the Enforcers, the forbidden cults of dark gods, and the gangs that swear loyalty to no one.",
		gangs: [
			{
				slug: "corpse-grinder-cults",
				code: "IG-01",
				name: "CORPSE GRINDER CULTS",
				role: "MELEE",
				color: "#ff2d6f",
				shadow: "rgba(255,45,111,.4)",
				tagline: "THE BUTCHERS",
				desc:
					"Masked cultists of Khorne who emerge from the meat-processing plants with cleavers and saws — devoted to the most savage close combat in the game.",
				playstyle:
					"Run and carve: advance under fire behind heavy armour and frenzy rules, then settle everything in melee, where no gang is their equal.",
				strengths: [
					"The best melee in Necromunda — Butchers and Skinners dismantle any line.",
					"Armour and masks: surprisingly resilient on the advance.",
					"Fear and a terrifying presence break gangs with fragile nerve.",
				],
				weaknesses: [
					"Almost no ranged weapons — the advance is everything.",
					"They suffer on open boards against disciplined shooters.",
					"A narrow, thematic roster: little tactical flexibility.",
				],
			},
			{
				slug: "palanite-enforcers",
				code: "IG-02",
				name: "PALANITE ENFORCERS",
				role: "LAW",
				color: "#00e5ff",
				shadow: "rgba(0,229,255,.4)",
				tagline: "THE HIVE'S LAW",
				desc:
					"Necromunda's paramilitary police force: Palanite patrolmen and Subjugator squads armed to keep Lord Helmawr's order by any means.",
				playstyle:
					"Discipline and doctrine: cohesive squads, solid armour, concussion and shock weapons for crowd control — plus the weight of the law in a campaign (Outlaw hunting).",
				strengths: [
					"Excellent standard armour (layered flak) — a resilient front line.",
					"A versatile kit: shotguns, shield & maul, snipers and suppression grenades.",
					"Tactical cohesion: strong in objective and defence scenarios.",
				],
				weaknesses: [
					"No juves and restricted recruitment: a small, expensive roster.",
					"Less flexible campaign progression than the Houses.",
					"Few tricks — they win on fundamentals, not surprise.",
				],
			},
			{
				slug: "slave-ogryn",
				code: "IG-03",
				name: "SLAVE OGRYN GANGS",
				role: "BRUTE",
				color: "#ff8a3d",
				shadow: "rgba(255,138,61,.4)",
				tagline: "THE UNSHACKLED",
				desc:
					"Escaped ogryns risen in revolt against their former masters — few bodies, but each one a wall of muscle with a lifetime of stored-up rage.",
				playstyle:
					"Few and enormous: each Ogryn takes what a whole gang could take. Advance, crush, and use Toughness as a shield for the objectives.",
				strengths: [
					"Monstrous profiles: S, T and Wounds far beyond any ganger.",
					"Immune to intimidation — rock-solid nerve to the end.",
					"Devastating melee without expensive equipment.",
				],
				weaknesses: [
					"Very few models: every lost activation matters a lot.",
					"Nearly no shooting and low mobility.",
					"Casualties are ruinous to replace; long campaigns grind them down.",
				],
			},
			{
				slug: "helot-chaos",
				code: "IG-04",
				name: "HELOT CHAOS CULTS",
				role: "CHAOS",
				color: "#b07bff",
				shadow: "rgba(176,123,255,.4)",
				tagline: "THE CORRUPTED",
				desc:
					"Chaos cults that may devote themselves to any of the Dark Gods: a charismatic demagogue, a horde of expendable cultists and rituals that should not work — but do.",
				playstyle:
					"The heretic horde: masses of cheap cultists, Demagogue buffs and campaign rituals that call down profane blessings (and occasionally a daemon).",
				strengths: [
					"Very cheap cultists — constant numerical pressure.",
					"Rituals and Chaos boons: unpredictable, sometimes decisive power.",
					"Flexible theming: serves any Dark God.",
				],
				weaknesses: [
					"Individually dreadful cultists: they fall in droves.",
					"Dependent on ritual luck and on the Demagogue staying alive.",
					"Hunted in campaigns: always Outlaw, always wanted.",
				],
			},
			{
				slug: "genestealer-cults",
				code: "IG-05",
				name: "GENESTEALER CULTS",
				role: "XENOS",
				color: "#59e36b",
				shadow: "rgba(89,227,107,.4)",
				tagline: "THE HIDDEN BROOD",
				desc:
					"The silent infection beneath the hive: third-generation acolytes, aberrant hybrids and the patience of those who know the Day of Ascension will come.",
				playstyle:
					"A balanced cult: decent neophyte shooting, brutal Aberrants in melee and the Alpha's psychic powers — with ambush and infiltration to open the game.",
				strengths: [
					"A rare mix of cheap horde, brutes (Aberrants) and psykers.",
					"Native infiltrate/ambush: they start the battle ahead.",
					"Strong campaign progression with superb theming.",
				],
				weaknesses: [
					"Fragile neophytes; the elite is costly and irreplaceable.",
					"Several moving parts must align for the plan to work.",
					"Outlaw: they face the law and bounty hunters in campaigns.",
				],
			},
			{
				slug: "venators",
				code: "IG-06",
				name: "VENATOR GANGS",
				role: "HUNTER",
				color: "#ffc23d",
				shadow: "rgba(255,194,61,.4)",
				tagline: "BOUNTY HUNTERS",
				desc:
					"Fully customizable bounty-hunter bands — humans, Squats, Ogryns, Beastmen and Ratlings since the 2025 update. Build whatever band you want.",
				playstyle:
					"Do-it-yourself: pick profiles and perks freely and build the gang exactly for your plan — generalist, gunline or assault.",
				strengths: [
					"Total profile customisation: no other gang offers this much control.",
					"Perfect for one-of-a-kind hobby concepts and conversions.",
					"Extra campaign rewards from hunts (bounties).",
				],
				weaknesses: [
					"No House list, exclusive gear or signature tricks.",
					"Easy to build badly — demands real game knowledge.",
					"No strong mechanical identity: wins on the build, not the kit.",
				],
			},
			{
				slug: "underhive-outcasts",
				code: "IG-07",
				name: "UNDERHIVE OUTCASTS",
				role: "WILDCARD",
				color: "#c9c9d4",
				shadow: "rgba(201,201,212,.4)",
				tagline: "THE FORGOTTEN",
				desc:
					"The most open gang in the game: outlaws, mutants, wyrds, fallen guilders and disgraced nobles — almost any concept you can imagine fits an Outcasts band.",
				playstyle:
					"Improvisation and freedom: a leader from any origin, a band of cheap outcasts, and broad (if second-hand) access to the black market.",
				strengths: [
					"Total narrative freedom — any miniature becomes a gang.",
					"Cheap, expendable fighters in large numbers.",
					"Unique leaders: from wyrds to ex-guilders with their own retinue.",
				],
				weaknesses: [
					"Weak average equipment and profiles — they start behind.",
					"No House structure: little dedicated skill and gear support.",
					"They scale poorly against elite gangs late in a campaign.",
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
			"Beyond the hive walls, the ash desert belongs to those who survive it: nomads riding giant insects and Squat clans drilling the crust for ore.",
		gangs: [
			{
				slug: "ash-waste-nomads",
				code: "AW-01",
				name: "ASH WASTE NOMADS",
				role: "AMBUSH",
				color: "#59e36b",
				shadow: "rgba(89,227,107,.4)",
				tagline: "RIDERS OF THE WASTES",
				desc:
					"Native nomads of the wastelands riding helamites — giant war insects — with stealth, ambushes and total mastery of open terrain. Expanded through 2025.",
				playstyle:
					"A war of movement: fast dustback riders, ambush attacks out of the ash storm, and traditional weapons (charge lances, blast carbines) that punish slow columns.",
				strengths: [
					"Exceptional mobility with mounts and light vehicles.",
					"Native ambush and stealth — they control the engagement.",
					"Kings of the open board: in the Ash Wastes, nothing catches them.",
				],
				weaknesses: [
					"Light armour: they drop fast when cornered.",
					"Less effective in Zone Mortalis and tight corridors.",
					"They depend on terrain and scenario to shine.",
				],
			},
			{
				slug: "ironhead-squats",
				code: "AW-02",
				name: "IRONHEAD SQUAT PROSPECTORS",
				role: "DURABLE",
				color: "#ff8a3d",
				shadow: "rgba(255,138,61,.4)",
				tagline: "THE MINING CLANS",
				desc:
					"Hardy Squat miners with industrial firepower and the best technology outside House Van Saar — heavily expanded in Halls of the Ancients.",
				playstyle:
					"Rock that shoots: a T4 front line in solid armour advancing slowly behind mining tools converted into man-portable artillery.",
				strengths: [
					"T4 and good armour across the gang — very hard to remove.",
					"Quality industrial equipment: good ammo checks and firepower.",
					"Iron nerve: Squats do not run.",
				],
				weaknesses: [
					"Slow (M3/M4): late to mobile objectives.",
					"Expensive fighters — small gangs.",
					"Little answer to ultra-fast opponents who refuse the engagement.",
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
			"Beneath the dead hive of Secundus, the Underhells: noble hunting parties in war rigs, and the twisted brood infesting the irradiated ruins.",
		gangs: [
			{
				slug: "spyrers",
				code: "HS-01",
				name: "SPYRER HUNTING PARTY",
				role: "ELITE",
				color: "#00e5ff",
				shadow: "rgba(0,229,255,.4)",
				tagline: "THE NOBLE HUNT",
				desc:
					"Ultra-rich heirs of the Noble Houses in Hunting Rigs — lethal hunting exoskeletons. Very few models, extremely powerful, growing through their own Terror Level mechanic.",
				playstyle:
					"An elite hunt: 3–5 nearly untouchable rigs against whole gangs. Each rig hunts differently (Jakara, Malcadon, Orrus, Yeld…) and grows with every kill.",
				strengths: [
					"Elite profiles and saves: each Spyrer is worth half a gang.",
					"Specialised rigs cover melee, range and mobility.",
					"Terror Level: the hunt gets stronger as it goes.",
				],
				weaknesses: [
					"Minimal numbers: every casualty is a catastrophe.",
					"Scarce activations — easy to swamp with a horde.",
					"Little campaign flexibility outside the hunt.",
				],
			},
			{
				slug: "malstrain",
				code: "HS-02",
				name: "MALSTRAIN GANG",
				role: "HORDE",
				color: "#ff2d6f",
				shadow: "rgba(255,45,111,.4)",
				tagline: "THE TWISTED BROOD",
				desc:
					"The mutant Genestealers of Hive Secundus: hordes of expendable Brood Scum backed by terrifying gene-lab monsters — built for the Underhells.",
				playstyle:
					"A tide of flesh: drown the enemy in cheap Brood Scum while brood brothers, tyramites and Malstrain monsters dismantle whatever is left.",
				strengths: [
					"A massive horde: more activations than any opponent.",
					"Brutal support monsters that demand dedicated fire.",
					"Psychological terror — they break gangs with fragile nerve.",
				],
				weaknesses: [
					"Individually dreadful Brood Scum: easy targets.",
					"They depend on the monsters; without them the horde can't close games.",
					"A Secundus-themed kit — less versatile outside the Underhells.",
				],
			},
		],
	},
];

/* ─────────────────────── 04 · IN THE CAMPAIGN (DB) ─────────────────────── */

export const GREAT_HOUSES_SECTION = {
	id: "grandes-casas",
	num: "00",
	title: "The Great Houses",
	intro:
		"Six Clan Houses dominate the politics and the violence of Hive Primus. Each forges gangs in its own image — choose yours, and the Underhive will know what to expect from you.",
};

export const CAMPAIGN_SECTION = {
	id: "na-campanha",
	num: "04",
	title: "In the campaign",
	intro:
		"The gangs currently registered in The Aranthian Succession: Cinderak Burning — NecroForja's live season.",
};

/**
 * Case-insensitive keywords linking the free-text `gang.house` column to a
 * catalogue card. Logic keys — identical across locales.
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
