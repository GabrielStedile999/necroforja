// English translation of the campaign lore content.
// content.ts is the PT-BR source of truth — this file mirrors its structure
// exactly (same ids, nums, accents, colors and image srcs); only the
// human-readable text is translated.

import type { LoreChapter } from "./content";

/** Opening flavor text — rendered in the page hero. */
export const LORE_INTRO = {
	image: "intro",
	lead: "What nightmare are these hive worlds?",
	body: "In these places where man has been allowed to grow unchecked, billions teem and swarm, infesting the vast hive cities. Even here, the press of humanity is not strong enough to reverse the madness or turn aside the evil forces of Chaos, heresy and death. Life is cheap. The bullet and the grenade are kings. Neither day nor night touches the billions of souls trapped on this nightmare world. For them, there is only the ceaseless, septic half-light of ancient fluorescence. The putrid atmosphere of the underhive is stained with the dark patina of age. A brown haze fills air that has been recycled a million million times, granting the inhabitants only the barest measure of life possible without suffocating them.",
	close: "Beware the shadows of the hive, where only the strongest survive…",
};

export const LORE_CHAPTERS: LoreChapter[] = [
	{
		id: "imperio",
		num: "01",
		title: "Empire Among the Stars",
		accent: "hazard",
		sections: [
			{
				id: "imperio-nas-estrelas",
				title: "Empire Among the Stars",
				blocks: [
					{ type: "img", src: "imperium", alt: "The Imperium of Mankind — a million worlds under the God-Emperor" },
					{ type: "p", text: "The Imperium of Mankind stretches across the entire galaxy, encompassing more than a million inhabited worlds and countless billions of the Emperor's subjects. It is the largest and most populous empire in the history of humanity, and it is ruled, as it has been for the last ten thousand years, by the Divine Champion and Protector of the human race, the God-Emperor of Mankind." },
					{ type: "p", text: "The Emperor is the greatest of all human psykers; his mental energies are limitless and his powers incomprehensible to ordinary humans. It is his mind alone that projects the Astronomican across the galaxy, the psychic homing beacon that allows starships to navigate through the fabric of warp space. Without the Emperor, the Imperium would collapse and human unity would disintegrate, leaving the remaining pockets of civilisation isolated and vulnerable to the endless enemies of Mankind; creatures that seek to destroy or enslave the human race." },
					{ type: "p", text: "The Emperor long ago ceased to live in any normal sense. Ten thousand years ago, after his titanic battle against the rebel Warmaster Horus, Primarch and Arch-Champion of Chaos, his broken and near-dead body was installed within a sophisticated life-support machine known as the Golden Throne. The Emperor can no longer speak, and it is doubtful that he comprehends the events unfolding in the material universe, while his mighty mind keeps watch over that baleful region of pure energy known as the Realm of Chaos, holding the enemies of Mankind at bay. The actual administration of the Imperium is therefore carried out by a vast bureaucracy known as the Adeptus Terra — or Priesthood of Earth." },
					{ type: "img", src: "emperor", alt: "The God-Emperor of Mankind, warden upon the Golden Throne" },
				],
			},
			{
				id: "os-milhoes-de-mundos-da-humanidade",
				title: "The Million Worlds of Humanity",
				blocks: [
					{ type: "p", text: "Even the Adeptus Administratum, the administrative branch of the Adeptus Terra, does not know for certain the exact number of worlds within the Imperium. There are approximately a million, but the treacherous phenomena bound to space travel, such as the process of temporal distortion and the effects of warp storms, which can isolate worlds for centuries, make a precise count impossible. Moreover, the galaxy is a dangerous and warlike place, where worlds are constantly under threat from xenos invaders, internal rebellions and betrayal by their own rulers. New worlds are also constantly being added to the Imperium: virgin worlds ready for colonisation, or ancient human worlds rediscovered after long periods of isolation." },
					{ type: "p", text: "The worlds of the Imperium take many different forms. Some are sparsely populated agri-worlds whose sole purpose is to provide food for less productive, more populous planets. Other worlds are dedicated to specific functions, such as mineral-rich mining planets, barren research stations, military observation planets and so on. Most worlds of the Imperium have a reasonably mixed economy and are, in many respects, self-sufficient and self-governing. The Adeptus Terra has very little to do with such worlds, so long as their rulers continue to pay their tithes and enforce the Imperial laws that control and contain the emergence of psyker mutants." },
				],
			},
			{
				id: "mundos-colmeia",
				title: "Hive Worlds",
				blocks: [
					{ type: "img", src: "hive-worlds", alt: "A hive world — ceaseless industry and billions of workers" },
					{ type: "p", text: "Hive worlds are planets whose industrial output, though technologically far cruder than that of an Adeptus Mechanicus Forge World, feeds the Imperium's insatiable hunger for basic manufactured goods. They employ vast, towering cities of metal designed to maximise the exploitation of natural resources and labour; invariably, the surfaces of these worlds are polluted wastelands, grey plains rendered barren by generations of mining and used as dumping grounds for the toxic by-products of industry. Their populations are densely concentrated, and people's lives are short, miserable toil — unless they reject it altogether and join the numerous gangs and other outcasts that exist in the cracks of city and society." },
					{ type: "p", text: "A hive world has a population far beyond its capacity to feed or sustain itself, often exceeding hundreds of billions of people on a planet the size of Terra. This vast number of people places such pressure on the environment that few hive worlds can support life naturally. Each therefore sits at the apex of a web of supply, depending on billions of tonnes of imported bulk foodstuffs to feed its vast population. So dependent on these imports is the average hive world that, should the supply be cut off, billions of starving subjects would likely rise up against their masters and fall upon one another in a frenzy of cannibalistic insanity." },
					{ type: "p", text: "There are thousands of planets classified by the Administratum as hive worlds, with the names of Necromunda, Armageddon and Gehenna Prime known in every segmentum. Others become famous for a brief span as wars or dark fates cast them into the history books - Ichar IV, Paramar and Mordian being prime examples. Others remain unknown to the wider Imperium for centuries at a time, despite the billions who are born, toil and die for the Emperor within their cities: Tellus 15/01, Arcadia, Lavantia and Avellorn." },
				],
			},
			{
				id: "lorde-helmawr",
				title: "Lord Helmawr",
				blocks: [
					{ type: "img", src: "helmawr", alt: "Lord Gerontius Helmawr, planetary ruler of Necromunda" },
					{ type: "p", text: "The governor and sovereign of all Necromunda is the Imperial Commander Lord Gerontius Helmawr. His ancestors are known to have reigned over the world for the last seven thousand years, according to government records predating that period. It is a fact, however, that many other records vanished long ago, making the past uncertain at best. Even the archives of the Administratum, the galaxy-spanning bureaucracy of the Imperium of Mankind, are remarkably silent on the history of Necromunda during the early days of the Imperium." },
					{ type: "p", text: "Lord Helmawr sits at the top of Necromunda's feudal hierarchy. The society he rules is divided into many factions that continually compete and cooperate with one another, giving rise to endless shifts in the feudal hierarchy. Lord Helmawr does not concern himself with the activities of lesser intermediaries. He deals directly with the most powerful factions, offering them support in exchange for their loyalty. If a major player in the game of power proves weak or treacherous, it is a simple matter for Helmawr to withdraw his support. The mere rumour that he might be about to do so is often enough to encourage the enemies of a lesser hierarchy to turn on it and destroy it. The Adeptus Terra leaves Lord Helmawr to rule his domain as he sees fit, just as it leaves all Imperial Commanders free to administer their worlds. The Imperial Commander forms one link in the feudal chain that stretches across the galaxy to the heart of the Imperium on Terra. So long as Helmawr fulfils his feudal obligations to the Emperor, his position remains secure." },
					{ type: "p", text: "Helmawr's principal obligation to the Imperium is to provide a tithe, which takes the form of a percentage of all the goods Necromunda produces. As the world's entire production capacity is devoted to supplying manufactured goods for the endless demands of Mankind, the tithe is taken as a direct levy on the revenue earned. So long as Necromunda continues to meet these responsibilities, and so long as its production capacity remains sufficiently high, the Imperium remains well satisfied. Of course, should the hive world's economy begin to show signs of weakening, Lord Helmawr's position would be very different." },
					{ type: "p", text: "Hive worlds like Necromunda also provide the Imperium with another useful resource - their people. Necromunda has produced generations of hardy youths with a strong sense of self-reliance. They are highly prized as recruits for the Astra Militarum and even for some of the Space Marine Chapters. Providing recruits in great numbers is another of Lord Helmawr's feudal obligations. Recruitment brings officers of the Imperium to Necromunda to inspect and, in some cases, conduct recruiting drives among the fighting gangs. Helmawr himself is required to provide troops from his personal guard, usually an entire regiment at a time. Because the planet supplies so many troops to the Astra Militarum, the name of Necromunda is known across the galaxy, even by people who know nothing of the planet itself. Over the centuries, the regiments of Necromunda have fought with distinction in many war zones and earned a fearsome reputation on countless battlefronts." },
					{ type: "p", text: "Another important obligation is that Lord Helmawr successfully control the number of dangerous psychic mutants. These psykers, or witches, carry a mutation that is becoming ever more common throughout the Imperium. On most worlds they can be dealt with easily enough, but on a hive world like Necromunda, with its vast population, the matter is far more difficult. Psykers are very dangerous - probably more so than they themselves realise. Though some are able to control their powers and use them for the benefit of society, most are incapable of controlling themselves, with disastrous results. Some become hosts for daemonic powers born of the Warp, while others attract psychically attuned xenos, such as Enslavers, or psychic plagues that can infect the minds of ordinary people. If psykers were not controlled throughout the Imperium, human society would swiftly collapse." },
					{ type: "img", src: "psyker", alt: "A psyker — the psychic mutation that brings power and madness in equal measure" },
				],
			},
			{
				id: "necromunda",
				title: "Necromunda",
				blocks: [
					{ type: "p", text: "Founded long ago in the depths of the Dark Age of Technology, Necromunda was brought into the Emperor's Light by the Space Marines of the Imperial Fists Legion during the Great Crusade. It is said that the ash wastes from which the great hives rise are a by-product of the devastation wrought upon the world during its brief resistance to the coming of the Imperium, but the truth lies lost beneath the toxic plains." },
					{ type: "img", src: "necromunda-planet", alt: "Necromunda and its galleries" },
					{ type: "p", text: "Necromunda is a world of mines, factories, refineries and processing plants. The planet is a vast powerhouse of industry, manufacturing thousands upon thousands of different items for use in nearby planetary systems, and nothing that might contribute to the planet's output has been left untouched. From the peaks of the highest mountains to the depths of the oceans, Necromunda's wealth has been stripped away. Mountains have been reduced to rubble for the ore they contain; oceans have been turned into little more than chemical sludge. Human activity is, by design, concentrated into the smallest viable area, with the dual aim of exposing as much of the planet's surface as possible to open-cast mining and ensuring that the billions of workers needed to serve the industries are born, raised, work, sleep and even die within the cramped confines of the factory they spend their lives serving. These vast towering complexes are known as hive cities, or simply as hives, and their individual peaks or towers are called city spires, or spires. A closely grouped set of hives is known as a hive cluster." },
					{ type: "p", text: "Between the hives, industrial ash wastes cover the planet's surface with an unstable, corrosive skin. Above this desert lies a cloud layer of atmospheric pollution, so that the great spires of the hive cities rise out of a drifting mist of contaminated vapour as if they were islands in the sea. Despite having been reduced to such an infernal state, Necromunda is an extremely valuable world to the Imperium. Though few of Necromunda's original resources remain, the waste heaps of earlier generations have become a new source of riches. Necromunda lives off the accumulated refuse of its past: its people have learned to scavenge, reclaim and recycle everything to scrape a living from their exhausted world. Over the millennia, Necromunda's population has grown far beyond the planet's own capacity to sustain it. As a consequence, it is wholly dependent on reconstituted, synthetic and imported foodstuffs." },
					{ type: "p", text: "Each hive has its recycling plants, which convert used organic matter into nutrients catalogued in official manifests as 'corpse-starch'. Real food is imported from other worlds, but it is an expensive luxury only the wealthiest can afford. As each generation contributes to the building and rebuilding of the hives, new layers of habitation are created, forcing their spires ever upwards. These towering hives dominate the surrounding wasteland like clusters of impossibly gigantic termite mounds. Beneath the hives, and stretching out around them under the wasteland itself, lies a honeycomb of ancient disused factories and a labyrinth formed from the sewers and tunnels of an earlier age. The population of Necromunda has never been counted and likely never will be; its numbers are simply too great. An attempted census of Hive Trazior four thousand years ago revealed a population of one billion in the upper habitation levels alone - no further attempt has been made to count the population of Necromunda in Trazior or in any other of the planet's several thousand hives since." },
					{ type: "p", text: "Necromundan society is fairly typical of the larger hive worlds. No attempt is made to impose a central administration upon the entire population; indeed, such a thing would be impossible on a world where most people remain unregistered by any authority. Instead, a kind of feudal system has evolved whereby individuals owe loyalty to others, who in turn owe their loyalty to ever more powerful members of the hierarchy. Among the more stable elements of the population, these loyalties are owed along family lines, and closely related families support one another under the hegemony of the most powerful member of their family group. This form of urban feudalism tends to be self-regulating. Weaker clans naturally seek the protection of more powerful neighbours, whose power base then expands until it reaches the limit at which their numbers and resources are simply too few to allow them to expand any further." },
					{ type: "p", text: "Where rival clans meet, it is inevitable that their power be tested in combat; a clan's ability to exert its power being the only true measure of its influence. Rather than wholly wasteful war, these conflicts are settled by proxy. Each clan can call upon the services of the numerous gangs in which almost all of its people serve for a brief time, ensuring that the wheels of industry keep turning even as blood is spilled in the streets far below the roaring factories." },
					{ type: "img", src: "necromunda-hive", alt: "The eternal conflict between gangs stains the cold metal floors with blood and gunpowder" },
					{ type: "img", src: "necromunda-city", alt: "Cross-section of a hive city — from the Spire to the bottom" },
				],
			},
		],
	},
	{
		id: "anatomia",
		num: "02",
		title: "Anatomy of a Hive City",
		accent: "cyan",
		sections: [
			{
				id: "as-torres",
				title: "The Spires",
				blocks: [
					{ type: "p", text: "From afar, when the clouds part around a hive, its spires look like a cluster of tall, tapering termite mounds, often branching off from a high central core. They rise from a broad base of outlying structures into near-vertical towers. Their gigantic scale is such that it almost defies human involvement in their construction, and they seem to have sprouted from the ground of their own accord, like some great organic growth; few human structures can rival their awe-inspiring heights. Though no two spires are exactly alike, all share common features and are built in a similar fashion." },
					{ type: "p", text: "A section cut through a spire is not a full circle. A spire is divided into a series of segments, like wedges joined at the centre. Deep ravines or rifts in the spire, crossed by communication shafts, separate the segments. These ravines are meant to admit light and air into the spire, but their size makes this impractical. Each communication shaft also adds its shadow to the darkness of the interior. The areas near the core are far removed from the outside world. Their only illumination is provided by glow-globes and massive cables of fibre optic or flexi-glass, which run down to the hive's core from the sunlit pinnacles of the spires. These create faint beams of light that pierce the hive's dark catacombs and light it like the nave of some vast cathedral." },
					{ type: "p", text: "Fresh air enters the hive's inner recesses through great ducts from the upper layers. It is drawn in by enormous wind-intake fans and filtered through dozens of purification plants to remove the gases that accumulate as it descends the height of the spire. In the deepest parts of the hive, and especially in the old factories and lower layers, the air ducts no longer function. Here, gases and stale air accumulate, and personal respirators must be worn at all times." },
				],
			},
			{
				id: "a-casca",
				title: "The Shell",
				blocks: [
					{ type: "p", text: "A hive's outer shell is its skin and its defence. Though the shell of a spire appears to be quite solid, its surface is pierced with deep, vertical and angled shafts. These shafts are small compared to the volume of the spire, but they are important because they admit additional light and air into the hive's core. All are protected by a series of massive covers that can be moved into place when needed. The shell is where most of the tunnels and travel tubes between spires begin and end. Tunnel stations and gateway fortresses, convoy compounds and garrison blocks are all located in the shell, where they can contribute to the regulation and defence of traffic between and within the hives." },
					{ type: "p", text: "The shell is also the first line in a hive's active defences against planetary invasion. Giant defence lasers, each capable of striking a target in orbit, are mounted at many points on a hive's structure. They are used to defend the hive against human or xenos craft. Against the violent ash storms that sometimes ravage Necromunda, however, the surface of the shell forms its only true protection." },
					{ type: "p", text: "Being able to experience direct sunlight or feel a current of fresh duct air is a status symbol almost as important as a good diet, but a single ash storm can render such status symbols meaningless. A powerful storm is capable of tearing away the outer layers of the shell, including a spire's laser defences, travel installations and shell dwellers. The shells must be constantly rebuilt by work crews, or the next ash storm may easily penetrate the tunnels, shafts and catacombs of the main spire and destroy it." },
				],
			},
			{
				id: "os-portadores-do-destino",
				title: "The Bearers of Destiny",
				kind: "callout",
				blocks: [
					{ type: "img", src: "destiny-bearers", alt: "The Bearers of Destiny cross the Shell" },
					{ type: "quote", text: "Necromunda plays host to a strange breed of creature called the caryatid - a mischievous, blue, winged humanoid that seems to live deep within the air ducts of the cities. Many hive dwellers see caryatids as good-luck charms, for they sometimes attach themselves to powerful and successful individuals, or to those who will soon become powerful. Conversely, the departure of a \"pet\" caryatid is seen as an omen of doom - its former companion thereafter considering themselves a person awaiting death. Whether these creatures are some kind of mutant, vat-grown organic beings long since gone feral, xenos, or something else entirely inexplicable, no one knows…" },
				],
			},
			{
				id: "dissipadores-de-calor",
				title: "Heat Sinks",
				blocks: [
					{ type: "p", text: "At the heart of every spire lies a single vertical shaft known as a heat sink. From the spire's highest levels, the heat sink reaches far below the lowest levels of the hive, descending through the geological crust of the planet itself. A heat sink can be several kilometres in diameter. It is a vast, hollow, sealed tube of dense plasteel that draws heat from the planet's core and turns it into power for the spire. At intervals along the heat sink's length are generator stations that convert the raw heat into usable energy. The power is then transmitted to the factories and habitation layers around the core. There are no power plants in the lower levels. The heat sink passes through those levels and provides only a constant warmth. This, however, is infinitely preferable to the damp chill of the underhive." },
					{ type: "p", text: "As with all things on Necromunda, the power generation systems are controlled by the clans in whose territory they lie. These clans draw a considerable income from all who use their power, so possession of the heat sinks is one of the principal marks of a powerful inner-core clan. Other clans may control the territory between the power plants and their users, and often levy their own tolls on factories and power producers to protect the transmission lines. In this way, the feudal clans of Necromunda operate as producers, suppliers and consumers in a thriving economy. Only in the spire's upper habitation layers is there a regulated service. There, power is drawn from stations controlled by the government - in truth, by troops belonging to the Imperial House." },
				],
			},
			{
				id: "zonas-habitacionais",
				title: "Habitation Zones",
				blocks: [
					{ type: "p", text: "Most of a hive's population belongs to the indentured working class, whose members reside in the vast, crowded habitation zones. Here, the bulk of the hive's human inhabitants live in conditions of grim squalor, while their masters live in luxury in the spire's upper levels. Where a family lives within a spire reflects its social standing and importance, with the highest levels populated by the hive's elite families. This hive nobility lives in relative comfort, enjoying the luxury of natural light, fresh air and real food imported from nearby agri-worlds. Below lie the twilight levels, inhabited by the rest of the population. Conditions in the twilight habitation zones are considerably less pleasant than in the dwellings above. Natural daylight is faint, fresh air is unknown, and most food has been consumed and recycled many times before." },
					{ type: "p", text: "Below the twilight layers lies the darkness of the under-city. Here, the only light comes from artificial glow-globes. Everything, even the air, at these levels has been used before and reprocessed many times over. On Necromunda, everything that can be recycled is recycled, including the people themselves." },
				],
			},
			{
				id: "zonas-de-manufatura",
				title: "Manufactory Zones",
				blocks: [
					{ type: "p", text: "The industrial complexes built into the spires produce all manner of different items, which are traded with other planets in exchange for the food Necromunda so desperately needs to feed its billions of inhabitants. The factory levels stretch from below the lower habitation zones down to the surface of the ash waste and beyond. Over the millennia, the run-off exuded by the factories has solidified around the base of the hives, adding to the ever-growing layer of ash waste that covers the planet's surface. As the level of the ash waste rises, the lower factories find themselves buried beneath ground level. As long as effluent can still be pumped to the surface, these factories can continue to operate." },
					{ type: "p", text: "The levels of the working manufactories are a network of waste pipes, sewage ducts and gas drains that carry poisons and toxic refuse away from the work areas. These drains jut from the lower flanks of the hives, venting dangerous gas, belching smoke into the filthy air or dumping toxic liquids and solid waste onto the polluted ash below. In many cases the scale of these manufactories is utterly staggering, the human form reduced to an insignificant speck of dust against the decaying industrial grandeur rising above. In places, the interior resembles the inner workings of some gigantic engine, defying the imagination and denying the hand of Mankind in its design and construction." },
					{ type: "p", text: "Industrial output is controlled by the hives' many clans. Each producer fits into a pattern of feudal obligation — supplying other clans and obtaining raw materials, components and power from others. Large, powerful clans, in particular the six Clan Houses, act as distribution hubs for the goods and services provided by their inferiors. This industrial feudalism regulates supply and demand with brutal efficiency." },
					{ type: "p", text: "Clans often rise in power and importance over time, as smaller clans in related industries band together into unstable alliances. At times, conflicts of interest, territorial rights and rivalries between clans lead to internal disputes. This is one of the principal causes of gang warfare on Necromunda, as the clans employ their young to fight their many battles for them, ensuring that the business of industry continues uninterrupted.\\ \\ Workers generally live in habitation zones located close to the manufactories where they work, and are as much a resource as the machines they operate. In some cases, workers are surgically modified to perform specialised functions. These physical and mental enhancements can be very costly to fund, which makes such workers extremely valuable to those they work for." },
				],
			},
			{
				id: "manufaturas-em-ruinas",
				title: "Ruined Manufactories",
				blocks: [
					{ type: "p", text: "As the surface of the waste rises, it becomes increasingly difficult to maintain the manufactories on the buried levels. Gigantic vacuum pumps lift countless tonnes of refuse above surface level for venting outside the hive, but even these have their limits. There is a point in every city below which disposing of a manufactory's waste becomes impractical. When the cost of waste disposal ceases to be offset by the value of a manufactory's output, it is shut down and abandoned." },
					{ type: "p", text: "As the lower levels sink beneath the level of the ash waste and are abandoned to the dregs of society, the lower habitation zones are converted into new manufactories, and the upper habitation zones are extended upwards. In this way, the spires of the hive city are continually renewed." },
					{ type: "p", text: "Zones of ruined manufactories, littered with abandoned machinery, sometimes reach as far below ground as the spires stretch above. The lowest parts of these ancient zones are little more than rubble, having collapsed under the weight of the hive or been deliberately filled in to create foundations for later works. The abandoned manufactories and habitation levels are infested with scavvies — mutant gangs that roam the dead layers of the hive in search of anything they can use or trade." },
				],
			},
			{
				id: "a-sub-colmeia",
				title: "The Underhive",
				blocks: [
					{ type: "p", text: "Below the working levels of a hive lies a honeycomb of ancient domes, tunnels, ruins and structures from Necromunda's long-dead past. These ruins sit deep at the bottom of every city, below the clan-dominated manufactory zones and the ash waste: they are the under-cities, the oldest and deepest parts of the hives of Necromunda." },
					{ type: "p", text: "These under-city zones — called the \"underhive\" by most — often predate the construction of the hive above by many centuries, even millennia. They are remnants of the true cities of Necromunda, built before the planet's natural ecology was destroyed, when there was no encroaching ash waste, and it is entirely possible that the remains of the colony ships that first brought humanity to the planet still lie beneath some hives." },
					{ type: "p", text: "The inhabitants of the underhives are regarded by the dwellers of the hive above as little better than the vermin that are also found there. Life in the underhives is even more violent and harsh than life in the zones above. At the bottom of the hive, upward mobility is more than an abstract concept. The strong, the lucky and the ruthless can make it to the top, in terms of actual location within the hive as well as in status. The underhives are frequently the battlegrounds of the proxy wars waged on behalf of the Clan Houses, the gangs made up of the young serving their time before returning to the hive to serve their families, if they manage to survive…" },
					{ type: "img", src: "underhive", alt: "The underhive — ruins, forgotten domes and outlaw settlements" },
				],
			},
			{
				id: "o-fundo-da-colmeia",
				title: "The Hive Bottom",
				blocks: [
					{ type: "p", text: "At the base of the hive, the buildings become so structurally unsound that the region takes on a different and even more inhospitable character. This is the final, deepest zone, and it is known as the hive bottom." },
					{ type: "p", text: "These areas are so decayed and ruinous that the original domes and foundation piles collapsed long ago, forming a layer of near-solid rubble. Within the debris are enclosed pockets linked by holes and tunnels created by liquids leaking down from above. These pollutants and effluents, the discharge fluid of the entire hive, form a vast lake of radioactive putrefaction called the Sump." },
					{ type: "p", text: "Nothing can live in the hive bottom but the most monstrous mutants. Its inhabitants are the spawn of darkness and pollution. Some of these foul creatures find their way up into the underhive, or even into the lowest parts of the city above, but their natural domain is the darkness of the hive bottom." },
					{ type: "img", src: "hive-bottom", alt: "The hive bottom — the toxic abyss beneath the city" },
				],
			},
			{
				id: "mutacao-e-loucura",
				title: "Mutation and Madness",
				kind: "callout",
				blocks: [
					{ type: "quote", text: "A hive's endlessly recycled air, water and food have an inevitable effect on its inhabitants. Pollutants and toxins accumulate in the biosystem, causing genetic instability and mutation, and the effects of this are worst further down the hive, where the toxins are most concentrated. Because mutation is so common, minor deformities are tolerated to a degree, even in the upper hive. Conspicuous mutants, however, are rooted out and destroyed in accordance with the strict laws of the Houses and the hive. Only those who flee into the underhive can hope to escape and perhaps begin new lives, losing themselves among the underhive's ever-shifting population." },
					{ type: "quote", text: "The inhabitants of the underhive are more tolerant of mutants than other Necromundans. So long as mutants keep a low profile and are not obvious or grossly deformed, they can live peacefully even within a large settlement. Underhivers are not inclined to ask questions or look too closely at their neighbours, and are more sympathetic to mutants in general." },
					{ type: "quote", text: "Of course, not everyone is equally tolerant. House Cawdor, especially, is quick to turn on mutants. Other fanatical groups, such as the Redemptionists, hate all mutants, no matter how small their deformities, and their creed preaches the uncompromising destruction of all deviants." },
					{ type: "quote", text: "For those too mutated to live in a large settlement, the lawless expanse of the hive bottom offers ample opportunity to hide. Mutants of the most hideous varieties, tentacled abominations, many-limbed scaled monstrosities, will naturally gravitate towards the deepest parts of the hive and the hive bottom. Not all mutants are physically grotesque. Some appear normal but in fact possess psychic powers of one kind or another. These mutants are more readily accepted in the underhive than conspicuous deviants. Some are even welcomed and protected because their abilities are useful, such as psychic healers and precognitives who foresee the future." },
				],
			},
			{
				id: "as-favelas",
				title: "The Shanties",
				blocks: [
					{ type: "p", text: "Clustered at the outer edge of the spires' shells lie vast sprawls of decaying shanty towns. They are inhabited by all manner of dregs unfit for life within the hives. The spires at least offer limited protection against the poisonous rains and corrosive ash — the best shelter a shanty dweller can hope for is a layer or two of packing material or an abandoned vehicle. To make matters worse, much of the factories' toxic effluent pours directly onto the shanties." },
					{ type: "p", text: "If a shanty remains in existence for any length of time and somehow escapes being swept away by a storm or incinerated by the hive authorities, its inhabitants dig caves and cellars into the solidified sludge and compacted dust. These dwellings may be reinforced with sun-baked mud shaped into crude bricks. By retreating into these refuges, some shanty dwellers survive the ash storms that sweep away the flimsier parts of their homes. When the storm subsides, they dig their way up through the wind-blown dust to the surface and try to rebuild the shanty from the wreckage of the old one." },
					{ type: "p", text: "Conditions in the shanties are worse than anything in the hives, but for most shanty dwellers even their crude home is preferable to wandering the ash wastes, where they would fall prey to the creatures and nomads — that is, if the heat, the corrosive dust and the freakish storms did not take them first!" },
					{ type: "p", text: "Beyond the periodic population-control purges, no one from the hives troubles themselves much with the shanty dwellers — they are of too little worth to matter. Moreover, the sprawling settlements are a temporary home to vicious gangs of sump dwellers, scavvies and nomad bands who come to the shanties periodically to trade." },
				],
			},
		],
	},
	{
		id: "cidades",
		num: "03",
		title: "Hive Cities of Necromunda",
		accent: "violet",
		sections: [
			{
				id: "a-colmeia-palatina-colmeia-primus",
				title: "The Palatine Hive — Hive Primus",
				blocks: [
					{ type: "p", text: "The largest and oldest surviving hive on Necromunda is the dynastic home of Lord Helmawr, Imperial Commander of Necromunda, known across the planet as the Palatine, and the cluster to which it belongs as the Palatine Cluster. The summit of the Palatine Hive's tallest, central spire forms Lord Helmawr's palace." },
					{ type: "p", text: "The Palatine Hive boasts some of the grandest and most magnificent architecture on Necromunda, and also possesses the only shipyard and landing field large enough to receive orbital transports. It is therefore the planet's only spaceport, a physical expression of Helmawr's monopoly on off-world trade. A fortress-monastery of the Imperial Fists Adeptus Astartes and the Necromundan headquarters of the Adeptus Arbites are also located in the Palatine Hive. At the hive's edge stands a spire specifically reserved for abhumans and for the few sanctioned xenos granted access to Necromunda from time to time to trade. Both Squats and Eldar are among these visitors, and they are housed on separate levels of this spire. The Palatine, or at least its upper levels, is thus by far the most cosmopolitan of all the hives of Necromunda." },
					{ type: "p", text: "The balance of power in Hive Primus is rigorously maintained, and any attempt to destabilise it is crushed with brutal force. Thus the Imperial House rules with an iron fist, while the Noble Houses and the lesser Clan Houses each hold just enough power that no House dominates the others." },
				],
			},
			{
				id: "o-olho-de-selene",
				title: "The Eye of Selene",
				blocks: [
					{ type: "p", text: "Locked in geostationary orbit, one hundred kilometres directly above Hive Primus, is one of the busiest orbital trade depots in the Segmentum Solar — the Eye of Selene. The Eye serves as the sole transport nexus for the planet below, and it is the only means by which goods are permitted to be shipped to or from Necromunda, ensuring that the Imperial House always receives its due. Victuals are shipped down to Primus and then sent overland to the other hives in exchange for manufactured goods travelling the other way. Many visiting merchants and tithe administrators have remarked on the apparent inefficiency of this system, but none would question its effectiveness in maintaining the unchallenged power of House Helmawr." },
				],
			},
			{
				id: "colmeia-mortis",
				title: "Hive Mortis",
				blocks: [
					{ type: "p", text: "Like the great dynastic Houses that rule them, the hives of Necromunda can rise and fall in their fortunes. Hive Mortis is a victim of its own success. Once an industrial axis of the equatorial city clusters, it enjoyed great prestige among the planetary elite. Its high output of machinery brought wealth to its rulers and an enviable place in the tithe rankings. Millions of workers once filled its tunnels and domes with the ceaseless sound of their labour, while the Noble Houses fought over the fruits of their toil." },
					{ type: "p", text: "The first shadows of disaster were subtle in their coming — a sickness that slowly infected the lower classes and thinned their numbers. At first the deaths were lost amid the attrition of the labour clans, dismissed as seasonal spikes in mortality, but soon even the House Masters could not deny their significance. Plague had come to their hive." },
					{ type: "p", text: "When word reached Lord Helmawr, his reaction was swift, and Hive Mortis was sealed by Imperial decree. For years the plague ravaged the hive and, before long, the dead outnumbered the living. In the chaos, the Houses fought for power as they struggled bitterly over what remained. As the battle intensified, entire sections of the hive had to be sealed off — tunnels stacked floor to ceiling with corpses. Eventually the sickness abated, having burned itself out after devouring more than twenty million souls. In his benevolence, Lord Helmawr rescinded his decree and allowed the hive to open its gates once more." },
					{ type: "p", text: "Hive Mortis is a changed place that no longer thrives on the making of machines, but on the industry of death. With its enormous human resources gone, the ruling Houses turned to the one thing they had in abundance — the dead. Mortuary cults were founded and the factories turned to the harvesting and rendering of corpses. House Escher rose to dominance among its peers in Hive Mortis, extracting and fermenting drugs from bodies — though its gangs of \"death-maidens\" do not go unchallenged." },
					{ type: "p", text: "The Houses still fight as furiously as they did when Hive Mortis was at the height of its power, though the rhythm of the battle has changed. Small communities shelter in the empty vastness of domes and levels built to house millions, and their citizens still fear travellers and the return of the plague. Gangs roam this wilderness of hollow habitation blocks and abandoned sectors, fighting over vaults full of corpses or trying to force their way into sealed chambers to plunder the desiccated riches within." },
				],
			},
			{
				id: "agulha-de-gothrul",
				title: "Gothrul's Needle",
				blocks: [
					{ type: "p", text: "Hive Primus holds the monopoly on off-world trade and is Necromunda's gateway to the stars, its keys held firmly in the hands of Lord Helmawr. It was not always so. Gothrul's Needle, its spire rivalling the height of Hive Primus, was one of Necromunda's first spaceports, and its upper levels are still crowded with docking platforms and terminal stations for orbital craft. Yet it was not only because of its place as Hive Primus' commercial rival and the rise of the Palatine Cluster that Gothrul's fortune was taken. Gothrul's Needle is governed by the most dangerous and pernicious of all forms of rule: democracy. A council of elected representatives controls the hive's interests and regulates the activities of the Houses, ensuring the fair treatment of its citizens and the safety of all. Deemed as insidious as any xenos threat or cult infestation, the Houses of the other hives spent years trying to topple Gothrul's rulers. When they realised that cutting them off from orbital trade did not diminish their wealth and power, the Houses then began a long war in the shadows." },
					{ type: "p", text: "Gangs and gang wars are outlawed by the Council of Gothrul, and the Clan Houses are tolerated on the condition that they keep their populations in check. Even so, criminal elements proliferate in the hive's lower levels, and Gothrul's citizen protection officers — the hive's cadres of volunteer agents — are constantly tested. House Delaque is a principal actor in the destabilisation of Gothrul's Needle, its subservient gangs routinely committing acts of sabotage and assassination. From the sump-choked depths of the hive, Sych Guvros, the most powerful of the Delaque overlords, wages his war of terror. His gangers raid the upper levels, striking at habitation parks and exchange plazas, each attack a blow against the Council. Guvros has become a legend among his House, and dozens of Delaque gangs have come from other hives to join his fight." },
					{ type: "p", text: "Though Gothrul's democratic council may be the Houses' ultimate enemy, that does not stop them fighting among themselves — especially as, should the perceived fall of the hive's government draw near, all want to be ready to strike and claim as much power as possible. Some gangs even fight on Gothrul's side, hoping to turn the tide against their rivals should any of them seem too close to claiming final victory. And so the shadow war for Gothrul's Needle goes on, never finding resolution." },
				],
			},
			{
				id: "trazior",
				title: "Trazior",
				blocks: [
					{ type: "p", text: "Hive Trazior is also known as the Three Sisters in the local Necromundan dialect. It is so called because of its three enormous spires, which can be seen from a great distance by any traveller crossing the wastes from the south. Trazior lies on the edge of the Great Equatorial Wastes and is the southernmost \"frontier\" hive of the great Palatine Cluster." },
					{ type: "p", text: "Many important merchant clans are based in this hive, and it is the principal trade depot for convoys travelling to or arriving from the southern hive clusters. Drawn by the riches that can be found among them, the nomads who live in the wastes and raid the convoys are a constant source of vexation for its inhabitants." },
					{ type: "p", text: "Hive Trazior's manufacturing base is dominated by the sub-clans of House Orlock, but House Goliath has a substantial and growing presence in its furnace sectors. The upper spires are infamous for the many gangs known as \"brats\" - the restless offspring of the nobility who take cruel delight in waging gang wars against the \"commoners\" of the underhive. They are particularly known for the brightly painted, incredibly rare jet bikes they race along the transitways and transit tubes, causing mischief and mayhem wherever they go." },
				],
			},
			{
				id: "colmeia-acropole",
				title: "Hive Acropolis",
				blocks: [
					{ type: "p", text: "This is another ancient, ornate hive in the Palatine Cluster. It sits at a vital intersection of several great tunnel highways and has always been an important centre of trade on Necromunda. Hive Acropolis is the home territory of some of the most powerful merchant clans, whose wide trading network stretches across many of the hives of Necromunda. Desperate to share in that wealth, Hive Acropolis attracts a series of large, sprawling shanty towns that cluster around its base like an infected wound." },
					{ type: "p", text: "All the Noble Houses have a presence in Hive Acropolis, but each is generally content to support the status quo. House Delaque, however, is known to ply a rich trade in information and intrigue there, profiting immensely from the merchants' countless internecine wars." },
				],
			},
			{
				id: "o-temenos",
				title: "The Temenos",
				blocks: [
					{ type: "p", text: "This is another hive in the Palatine Cluster. One of its spires forms the seat of the Ecclesiarchy on Necromunda, while another forms the Cathedral of the Emperor Deified. Schools, libraries and chapels occupy parts of the other spires. A priory of the Adepta Sororitas is also located in one of the outer spires, and this spire is often called the Spire of the Sisters as a consequence." },
					{ type: "p", text: "The population of Hive Temenos is among the most pious and devout followers of the Imperial Cult on Necromunda. Many of the resident Clan Houses manufacture ritual items for the Ecclesiarchy, while others labour in the scriptorium, translating the wisdom of the priesthood into the many dialects of Necromunda. Hive Temenos is an important power base for House Cawdor, whose subservient gangs scour the lower levels for heretics cast down from above and make constant war on any rivals whose vision of the faith differs, even slightly, from their own." },
					{ type: "p", text: "Temenos is an architectural marvel — its interior is a labyrinth of naves, chapels and crypts, vaulted ceilings and pillared halls. Diffuse light is stained by refraction through crystal. Incense and the sound of chanting drift through its chambers. Here and there, statues and holograms of the Emperor reside in secluded shrines, and from its sanctified halls confessors and missionaries are sent out across all Necromunda and to frontier worlds in nearby systems." },
				],
			},
			{
				id: "aglomerado-quinspirus",
				title: "Quinspirus Cluster",
				blocks: [
					{ type: "p", text: "The Quinspirus Cluster sits on the edge of a sea of virtually solidified sludge called the World Sump Ocean. Long ago, when the sea was still navigable, the area included vast shipyards. These now lie buried deep in the under-city of the centrally located Hive Quinspirus. This hive has five great spires — hence the nickname, meaning \"five spires\" in the local dialect, which gives the whole cluster its name. The cavernous warehouses of the old waterfronts have been the stage for many savage gang wars, in particular between gangs subservient to Houses Orlock and Delaque." },
				],
			},
			{
				id: "a-caveira",
				title: "The Skull",
				blocks: [
					{ type: "p", text: "This abandoned hive is the largest of a cluster of three ruined hives in the remote wastes. It is pierced by great holes and, from a distance, resembles a huge skull lying in the wastes. It is a famous landmark and is rumoured to be worshipped by the local nomads. This cluster is all that remains of the hives that were captured and occupied for a time by Ork invaders. All contact with the cluster was lost for several years before the rest of Necromunda realised what had happened and a campaign was mounted to clear them out. This was the original reason for the dispatch of a contingent of Space Marines to Necromunda, which has since become a permanent establishment on the hive world." },
					{ type: "p", text: "The hives were besieged and destroyed during the campaign. Now their tops have collapsed, and they lie abandoned and choked with dust. No one knows what terrible things have made their home amid the ruins of the Skull, and even the nomads and scavvies fear to go near them." },
				],
			},
			{
				id: "colmeia-secundus",
				title: "Hive Secundus",
				blocks: [
					{ type: "p", text: "There was a time when Hive Secundus was, as its name suggests, the second largest hive city in all Necromunda. That would change little more than a century ago, however, when Secundus fell victim to a Genestealer infestation later discovered to be the result of unnatural experiments conducted by Techpriest Biologis Hermiatus of the Adeptus Mechanicus, whose research went so disastrously wrong that agents of the Inquisition were forced to intervene at a terrible cost. In the destruction that followed, Hive Secundus was subjected to such punishment at the hands of Necromunda's own planetary defence batteries that its central spire was toppled, falling to rest like a shattered fallen column across ten kilometres of the wastes." },
					{ type: "p", text: "Mighty as that response was, it failed to rid Necromunda of the Genestealer taint. Those ruins remain overrun by the xenos creatures and their infected human kin. With the planetary defence batteries dangerously depleted, a ring of trenches and redoubts was raised around the ruin, and it has grown ever denser with each passing year, patrolled by conscripts and penal troops from across the world." },
					{ type: "p", text: "It is said that nothing can escape this ring of steel, but it takes relentless, constant vigilance to ensure that nothing does. The xenos creatures continue to this day to breed within the shattered hive, locked in a constant war of survival with the descendants of the human survivors, who now exist as feral savages long abandoned by their fellow Necromundans." },
					{ type: "img", src: "hive-secundus", alt: "Hive Secundus, the quarantined Ghost City" },
				],
			},
		],
	},
	{
		id: "ermos",
		num: "04",
		title: "The Ash Wastes",
		accent: "rust",
		sections: [
			{
				id: "os-desertos-de-cinzas",
				title: "The Ash Wastes",
				blocks: [
					{ type: "img", src: "ash-wastes", alt: "The Ash Wastes that separate the hives" },
					{ type: "p", text: "Beyond Hive Trazior, the Great Equatorial Wastes stretch south as far as the eye can see — at least on a relatively clear day, when Necromunda's toxic yellow skies are not pressing down on the oily ash plains, or billowing mustard-coloured clouds are not advancing from the west or east in one of the planet's endless storm fronts. Here the hives grow smaller and sparser, the upper spires of Hive Trazior just a speck visible on the northern horizon, and vast regions of scorched dunes and hard, glassy terrain dominate the landscape." },
					{ type: "p", text: "Of course, the Equatorial Wastes are far from empty, and waste settlements, trade roads, tube-ways and scrap mines dot the expanse. It is a vital region for north/south commerce, with goods constantly travelling from hive to hive, and to and from Hive Primus to pass in and out of the Necromundan orbital sphere. Clan Houses, nobles and guilds compete for control of this region, seeking to exert their influence over the trade roads or to sponsor prospectors and mining settlements that might turn a profit. And with settlements, trading posts and mines come all the criminal and marginal elements that thrive wherever people and profit are to be found." },
					{ type: "p", text: "The Great Equatorial Wastes cover millions of square kilometres, bounded to the north by the Palatine Cluster, to the east by the Dust Wall and Hive Secundus, to the south by the Mynerva Cluster and to the west by the Irradium Ocean. It is a lawless place where the power of the Imperial House wanes, and the infrequent Enforcer patrols and badland Precinct-Fortresses can do little to keep the peace. Even the Clan Houses must rely on the most marginal elements of their subjects to carry out work in this infernal wasteland." },
				],
			},
			{
				id: "cratera-cinderak",
				title: "Cinderak Crater",
				blocks: [
					{ type: "p", text: "Central to the region — and the focus of all this trade, conflict and prospecting — is the Cinderak Crater, also known as the Great Crater or Gothrul's Tomb. A wound on the western edge of the Great Equatorial Wastes, it is all that remains of the once-great Hive Meridian. More than a hundred kilometres across, it was created during the Two-Faced War, when Gothrul Helmawr attempted to starve Hive Primus by sabotaging Hive Meridian's macro-plasma reactor — at the time, the hive was the breadbasket of Necromunda's western hemisphere. The resulting explosion obliterated the hive, scattering its remains for hundreds of kilometres and leaving a hole in the wastes nearly a kilometre deep. In the end, Gothrul was defeated by his sister Cinderak, though the terrible evidence of his crime remains. In the centuries that followed, it became a hub for north/south trade on the Palatine Plateau and a rich scavenging ground." },
					{ type: "p", text: "In the middle of the Great Crater, built upon the shattered remains of Hive Meridian, stands Cinderak City. A great settlement, sprawling for kilometres across the wastes, it is the hub for trade convoys from north, south, east and west, as well as for hundreds of smaller settlements in the Equatorial Wastes and beyond. Each of the Clan Houses holds a stake in Cinderak City, and it is a focus of conflict between them." },
				],
			},
			{
				id: "cidade-cinderak",
				title: "Cinderak City",
				blocks: [
					{ type: "p", text: "The largest settlement in the wastes, Cinderak City is a crossroads in the middle of the Great Equatorial Wastes. The main roads run out from the walled city to the edges of the Great Crater and beyond, linking up with the Bullet Road in the north and the Bone Road in the south, as well as the Great Ash Road that circles the planet. Cinderak City is a meeting place for hivers, wasters, off-worlders and everyone in between. Its macro-weapon towers (each salvaged from the defences of Hive Meridian) are a beacon to travellers for kilometres in every direction. Dust clans and scavengers come to Cinderak City to trade with delegations of the Mercator Gelt or Squat Prospectors from the nearby Spoil, while the great road trains hauling goods to and from Hive Primus pass through the settlement. Here its six Clan Lords levy taxes in the 'name' of their Clan Houses. For good or ill, Cinderak City serves as the heart of the Great Equatorial Wastes and represents the only real civilisation for nearly half a continent in every direction." },
				],
			},
			{
				id: "o-ermo-em-transformacao",
				title: "The Shifting Wastes",
				blocks: [
					{ type: "p", text: "One of the reasons Cinderak City has survived for so long, where other settlements have been buried or destroyed by ash storms, is the protection of the Great Crater. As the seasons change and toxic weather rolls across the Equatorial Wastes, the residents of the Crater are, to a degree, shielded from the worst their planet can throw at them. That is not to say there have not been times when great radstorms or other calamities have descended upon Cinderak City, but so far it has escaped serious harm. Cinderak City also profits greatly from the periodic storms, for though they bury some things, they uncover others, and in the wake of such mighty disturbances the scavengers spread out across the Crater in search of the wasteland's bounty." },
				],
			},
			{
				id: "agulhas-na-tempestade",
				title: "Needles in the Storm",
				blocks: [
					{ type: "p", text: "Necromunda is a world forever on the brink of complete environmental collapse. Its atmosphere, after millennia of abuse, is almost entirely toxic to biological life, and even the great hive cities struggle to protect their inhabitants. Worse still, the lack of potable water on Necromunda's surface has led to the release of enormous quantities of CO2 into the atmosphere and, left unchecked, it would render the world uninhabitable even for the few souls currently able to survive outside the hives. Though the Imperium cares little for the fate of Necromunda's biosphere, it demands that the world remain productive so that it can meet the Imperial Tithe." },
					{ type: "p", text: "To that end, soon after the world was claimed by the Imperium, skilled terraformers were brought to Necromunda. Many of them were itinerant Squat clans, whose engineering technology is particularly prized in this age when the Adeptus Mechanicus guards such things so jealously. The terraformers raised great thermal convergence towers at the planet's poles and around its equator. These Needles, as they came to be known, processed the CO2 and calmed the storms. Centuries later, many of the Needles still stand, doing their vital work of holding back the inevitable destruction of the biosphere, maintained by the same Squat clans whose ancestors raised them." },
				],
			},
			{
				id: "estacoes-e-tempestades",
				title: "Seasons and Storms",
				blocks: [
					{ type: "p", text: "Though Necromunda's atmosphere is toxic, it is not always and everywhere lethal. Knowing where and when a traveller may pass through a region of the world means understanding Necromunda's seasons and the different storms they bring. There are two principal seasons on the planet: Furia — the Season of Flame, and Noctia — the Season of Ash." },
					{ type: "p", text: "During Furia, temperatures soar and the chemical wastes react to the heat by bursting into flame, while toxic rivers are drawn to the surface by geological evaporation. During the Season of Flame, storms are less frequent and weaker, and travel in some regions is \"safer\"." },
					{ type: "p", text: "During Noctia, the great western winds blow hard, circling the planet without ever abating, and their storms wreak immense destruction upon lands and hives alike. Many places on Necromunda are impossible to reach during the Season of Ash, and travelling anywhere becomes more difficult." },
					{ type: "p", text: "Between these great seasons there are several lesser ones, such as Raythum, the cycle between the onset of Furia and the full heat of the Season of Flame. During Raythum, vast stretches of the thick shroud that smothers Necromunda's sky are dispersed, continent-sized gaps exposing its lands to the destructive radiation of the system's star, while creatures that spend years in deep slumber are awoken by the void that calls to them. Raythum is also known as the Smuggler's Season, for the holes it opens in the toxic clouds allow starships to make their way down to the planet's surface without having to pass through the Eye of Selene. In contrast, Tenaria, or the Shadow Time, comes in the wake of Noctia's great storms, when the planet's atmosphere is thick with ash. A permanent night falls upon parts of the world and, for endless cycles, not even the faint light of its star reaches the wastes." },
					{ type: "p", text: "Storms are a constant in the ash wastes, and there is rarely a moment when the endless howl of the wind does not blow. Clouds roll and churn ceaselessly across the skies, and the horizon is almost always obscured by a moving cliff-face of ash and sand. Daily visibility drops as the clouds descend, and travellers can only hope that the toxic winds bring nothing worse than the usual dangers of the wastes. When a true storm strikes the wastes, it can be strong enough to pluck people off the ground, or even tear vehicles from the road and send them tumbling into the sky. Vivid purple and red lightning may lash down from these clouds to set the ground ablaze, while the wind itself can carry deadly radiation, corrosive toxins or acid rain. The greatest storms can even threaten a hive city, battering its shell, burying its base in metres of ash and scouring away the shanty towns that cling to each one like limpets. More than one remote settlement has vanished in such a storm, wiped from the face of the planet by Necromunda's volatile weather." },
				],
			},
			{
				id: "os-ermos-profundos",
				title: "The Deep Wastes",
				blocks: [
					{ type: "img", src: "deep-wastes", alt: "The Deep Wastes — territory of nomads and mutant creatures" },
					{ type: "p", text: "The tallest hive on Necromunda is Hive Primus, whose upper spires pierce the toxic clouds and are barely visible from the ground. Many other hives approach that height, and even the smallest may be several kilometres tall. This means that the lights of the upper spires become visible to an observer over the horizon long before the body and base of the hive come into view. As Hive Primus is 16 kilometres tall, its upper spires are visible from more than 400 kilometres away, depending on cloud conditions." },
					{ type: "p", text: "From that lofty height, so say the masters of Necromunda, Lord Helmawr's gaze sees everything on the planet's surface, the spires of the many hives rising above the tortured face of the planet standing as beacons of his boundless authority. Yet this is not entirely true, for there are countless places his ever-watchful eyes do not penetrate, and the most dreadful of these are the Deep Wastes." },
					{ type: "p", text: "For the Ash Waste Nomads and others who, for whatever reason, prefer to exist far from the hives, the reach of the Imperial House's power is measured in a very practical sense. If a person standing in the wastes can see the distant, cloud-wreathed lights of a hive's upper spire, they are under the gaze of Lord Helmawr. If, however, they travel so deep into the wastes that no hive is visible in any direction, then they are in the Deep Wastes, and they themselves, not Lord Helmawr, are the masters." },
					{ type: "p", text: "What happens in the Deep Wastes is often known only by rumour, but they are certainly the refuge of the Ash Waste Nomads and of other beings more terrible still." },
				],
			},
			{
				id: "comercio-e-transporte",
				title: "Trade and Transport",
				blocks: [
					{ type: "p", text: "Despite the dangers of the wastes, the expanses between the hives remain vital to trade. All commerce flows to and from Hive Primus, and all roads on Necromunda lead to the Palatine Cluster. Long ago, Necromunda was ringed by great transport arteries, roads, rails and tunnels that stretched out in ever-widening circles from its cities. These transitways connected the planet's people and allowed goods to move swiftly from factory to city and out to the wider galaxy. The greatest of these roads, such as those that circled the entire world, were cut through mountains, oceans and every other natural obstacle by enormous fusion borers, making them run truly straight for thousands upon thousands of kilometres. War, environmental collapse and neglect have reduced these networks to a shadow of their former glory. Where once thousands of roads connected the cities, now only a handful of highways remain. This is compounded by the will of the Imperial House, which permits off-world travel only through the Eye of Selene and, by extension, Hive Primus. Many goods vital to the planet's astronomical production quotas reach Hive Primus through the surviving tube systems and their maglev trains, while compact luxury goods are usually carried between hives by stratoplanes, from cloud-piercing spire to spire, never descending below the cloud layer. The rest, however, must travel overland in enormous convoys — braving the wastes and the many dangers they hold." },
					{ type: "p", text: "It falls to the Mercator Gelt, or Coin Guild, to operate and maintain its convoys, often with the help of the Clan Houses, on whom they depend for protection. Some of the most valuable cargoes may even receive the protection of Lord Helmawr's Palanite Enforcers, though such is the volume of goods being moved that the Enforcers can only oversee a small percentage of it. Just as important as protecting the convoys and their cargo is keeping the trade routes open. Some stretches of the wastes can still be crossed using the old road systems, but there are significant gaps. Where a highway has sunk into the earth or been destroyed by constant storms, new routes must be found, and there is always good money for gangs who can chart them and protect the haulers who use them." },
					{ type: "img", src: "trade", alt: "Guilder caravans cross the wastes between the hives" },
				],
			},
		],
	},
	{
		id: "casas",
		num: "05",
		title: "The Houses of Necromunda",
		accent: "toxic",
		sections: [
			{
				id: "as-casas-de-necromunda",
				title: "The Houses of Necromunda",
				blocks: [
					{ type: "img", src: "houses", alt: "The Houses of Necromunda vie for power, tribute and territory" },
					{ type: "p", text: "Necromunda is ruled by a small number of factions of fabulously wealthy and powerful entities known as the Noble Houses. They are primarily investors, producing nothing and providing no service. Subordinate to them are the Clan Houses, which maintain Necromunda's vast manufacturing base. Each House has its own cultural traditions, distinct linguistic traits, codes of dress and behaviour, as well as unique concerns and aptitudes. Though distinct and often antagonistic towards one another, the Houses are also interdependent for the supply of specific and rare goods or services." },
				],
			},
			{
				id: "as-casas-nobres",
				title: "The Noble Houses",
				blocks: [
					{ type: "img", src: "noble-houses", alt: "The Noble Houses — the aristocracy of the Spire" },
					{ type: "p", text: "To the universe at large, Lord Helmawr is Necromunda, and the planet is his to rule as he sees fit. The patriarchs and merchant families of the Noble Houses compete for his attention and are eager to perform whatever favours are needed to secure landing and transport rights, trade licences and tithe concessions. Even as they court Lord Helmawr's favour, the Noble Houses conspire behind his back, hoping that one day House Helmawr will be toppled and a new Imperial House will inherit its domain. The seven Noble Houses of Necromunda are House Helmawr, House Catallus, House Ty, House Ulanti, House Greim, House Ran Lo and House Ko'iron. Between them, these Houses rule Necromunda and are wealthy enough to hold interests off-world. Indeed, while the Noble Houses derive their wealth from Necromundan trade, their most important and highest-ranking members spend as little time there as possible, preferring to pass their artificially extended lifespans beneath exotic trees on distant worlds, where the scum of the hive cities can never intrude." },
				],
			},
			{
				id: "executores-palanitas",
				title: "Palanite Enforcers",
				kind: "callout",
				blocks: [
					{ type: "img", src: "enforcers", alt: "Palanite Enforcers — the law of Lord Helmawr" },
					{ type: "quote", text: "The Palanite Enforcers are the iron fist of House Helmawr. Across the world of Necromunda, they maintain the Pax Helmawr, or Peace of Lord Helmawr, through intimidation and violence. Their Precinct-Fortresses can be found on every level of the Hive City, scattered across the upper reaches of the underhive and even out in the vast ash wastes. Equipped with the finest weapons and wargear the Lord of Necromunda can provide, the Enforcers are more than a match for most underhive gangs — the smart ones knowing that when you see the dark armoured shapes of the Palanites coming, you run the other way. And there is no shortage of criminals and recidivists for the Enforcers to hunt, for Necromunda is never more than a few bad cycles away from open rebellion or cannibal apocalypse." },
				],
			},
			{
				id: "as-casas-clas",
				title: "The Clan Houses",
				blocks: [
					{ type: "img", src: "clan-houses", alt: "The Clan Houses, masters of the hive cities" },
					{ type: "p", text: "Lower in the feudal order stand the Clan Houses. Many such Houses exist on Necromunda, the six most powerful almost rivalling the Noble Houses in wealth, though none has (or is permitted to have) off-world interests. Most of Necromunda's hive cities harbour at least a small presence of all six Clan Houses, but in some hives one or more of the six are entirely absent or, conversely, one dominates. Only in Hive Primus does a balance exist between the six, a deliberate policy enacted long ago by Lord Helmawr." },
					{ type: "p", text: "The Clan Houses lack the privileges and status of the Noble Houses. Their people are confined to the cramped main layers of the hive, where conditions are squalid and filthy. The hivers, as they are called, are accustomed to the dim light and fetid air. Knowing nothing better, most live contented lives of toil in the guild factories, workshops and other industries that form the hive's main business. The Houses are manufacturers of goods of every kind, from foodstuffs to armaments. These products are traded with one another and with the Noble Houses, and in this way the goods of Necromunda reach the wider universe. A complex but efficient trading relationship has grown up around the competition between the Clan Houses to produce goods and between the Noble Houses to buy them." },
					{ type: "p", text: "Despite the competition between the Houses, many depend on one or more of the others, bargaining for the supply of some vital product or service without which they might cease to exist. As with so many things on Necromunda, this is a deliberate strategy imposed from the highest levels of authority in order to maintain the Noble Houses' grip on Necromunda's vast wealth." },
					{ type: "p", text: "The people of the six Houses do not normally mix, and the borders between their domains are carefully guarded against intruders. Each House takes pride in its unique traditions and disdains the way of life of its rivals. Where the territories of two Houses border one another, it is common to find an intervening dead zone or belt of fortifications. Prolonged wars between Houses are rare but not unknown, matters of honour being settled by proxy through gang warfare rather than full-scale conflict between House forces. Violence can be sparked by anything from accidental trespass to deliberate invasion. The most common cause of animosity is contract fighting. This occurs when one House attempts to destroy vital factories or infrastructure in a neighbour's domain in order to make it impossible for them to fulfil a contract. Should that happen, the neighbour will incur heavy penalties and may lose a lucrative contract to a rival House. Open hostility is rare. For one thing, war between two Houses would simply advance the interests of the others and do neither antagonist any good. Moreover, the Noble Houses strongly disapprove of destructive conflicts because they damage trade and hinder the movement of goods, and they may threaten to take their business elsewhere rather than tolerate a hive war. Consequently, each hive city is largely orderly and industrious, and most of its people are content to work for their House and reap the meagre rewards on offer." },
					{ type: "p", text: "The six pre-eminent Clan Houses are House Cawdor, House Escher, House Goliath, House Van Saar, House Orlock and House Delaque. Many lesser clans exist in the hives of Necromunda, but none is as powerful as these six. Many are in fact feudal subjects of a House, while others may be outcasts or pilgrims. Each of the Clan Houses is master of countless subservient gangs, their fighters serving as expendable foot soldiers in the endless proxy wars waged in the darkness of the underhives, allowing the Clan Houses to conduct their business with one another with a veneer of civility in the spires above." },
					{ type: "img", src: "clan-houses-2", alt: "Clan House gangs at war over the Underhive" },
				],
			},
			{
				id: "casa-cawdor",
				title: "House Cawdor",
				color: "#ffc23d",
				blocks: [
					{ type: "img", src: "cawdor", alt: "House Cawdor — the fanatical faith of the Redemptionist Cult" },
					{ type: "p", text: "House Cawdor is the stronghold of the Cult of the Redemption, whose prophets foretell universal destruction. Though the cult has its adherents throughout Necromunda, in House Cawdor it has attained the status of official religion. For this reason, the House is also known as the House of Redemption." },
					{ type: "p", text: "Cawdor's attitude towards the other Clan Houses is heavily influenced by its beliefs. Among other things, these forbid them from showing their faces in public, so Cawdor can be recognised by their elaborate masks, whose designs are often quite bizarre or unsettling. The Redemption demands a strict code of conduct, and those who break the rules are cast out and become outcasts. Hivers who do not follow the Redemption are regarded as worthless unbelievers." },
					{ type: "p", text: "Needless to say, the relationship between House Cawdor and the other Houses is strained, and it is often assumed that those of Cawdor actively support the outlawed Redemptionists within the other Houses." },
					{ type: "p", text: "Cawdor is a poor House, though its masters exist in a state of paranoid luxury. It is by far the most populous, and its masses are kept in line through the harsh devotions imposed upon them by the House's preachers. The people of Cawdor are holy scavengers and reclaimers, venerating every scrap they claim as a relic and regarding the act of recycling as a miracle made manifest. As such, they provide a vital service to the other Houses, recycling enormous volumes of their unwanted waste in the eternal search for sacred objects." },
					{ type: "img", src: "cawdor-2", alt: "Cawdor warriors in makeshift garb and weapons" },
					{ type: "p", text: "House Cawdor is ruled by a court of senior nobles, one of whom — currently Lord Mormaer Cawdor — holds the ceremonial rank of Thane and is regarded as first among equals. The Thane considers himself not so much the senior noble of a Clan House as the foremost servant of the Emperor himself on Necromunda. This causes no small degree of tension with the Imperial House, for Lord Cawdor refuses to acknowledge Lord Helmawr as anything more than an equal, at least in private." },
				],
			},
			{
				id: "casa-delaque",
				title: "House Delaque",
				color: "#b07bff",
				blocks: [
					{ type: "img", src: "delaque", alt: "House Delaque — shadows, secrets and espionage" },
					{ type: "p", text: "House Delaque benefits from a special understanding with the Imperial House of Helmawr, supplying not only materials but also information to the rulers of Necromunda. Delaque spies are said to operate throughout the hive, observing the activities of the other Houses. It is rumoured that some members of the Houses' ruling families, and even some Noble Houses, are in the pay of the Delaque." },
					{ type: "p", text: "The other Houses are justifiably suspicious of House Delaque. Their appearance does little to contradict an ancient reputation for treachery and espionage. The Delaque traditionally wear long coats with inner pockets in which they can easily conceal weapons and other items. Most are very pale and hairless. Their whispering voices are thin and mysterious, while many wear implanted filter screens to protect their sensitive eyes — an intolerance of light being a common Delaque weakness — and it is said that some may even be able to see in spectra invisible to others. Though the hive interior is dark by normal standards, House Delaque territory is particularly dark and shadowed, as befits a people whose motives and methods are shrouded in mystery." },
					{ type: "p", text: "It is said of House Delaque that its agents use the rarest and most expensive elixirs of House Escher to create horrific \"forced\" psykers, allowing them to hear the thoughts of their enemies, though at a terrible cost to their eternal souls. In return, they supply a wealth of information to the other Houses, though the most valuable is always reserved for the Imperial House of Helmawr." },
					{ type: "img", src: "delaque-2", alt: "Delaque agents emerge from the darkness" },
					{ type: "p", text: "The means and mechanisms by which House Delaque is ordered and administered are far from clear, even to the House's own population. It is known that the House's most senior nobles meet in closed session, the place and the body itself known as the Star Chamber. This court appears to have no permanent seat, meaning that at any given moment one of the dozens of senior Delaque nobles may be serving as ruler of the House, the name and identity of the true ruler kept deliberately hidden." },
				],
			},
			{
				id: "casa-escher",
				title: "House Escher",
				color: "#ff2d6f",
				blocks: [
					{ type: "img", src: "escher", alt: "House Escher — blades, poisons and lethal speed" },
					{ type: "p", text: "House Escher is perhaps the most strikingly different of all the Clan Houses of Necromunda. Like all the Houses, it is controlled by a ruling family, and its political life and institutions are dominated by close kin or families in service. Unlike the other Houses, however, which have reasonably balanced populations, Escher's is made up almost entirely of women." },
					{ type: "p", text: "It produces an impressive range of exotic pharmaceuticals, from gene-enhancing elixirs to luxury drugs, and derives its wealth from supplying these to the other Houses, thereby maintaining the vital balance of power between them. It is House Escher that supplies the growth hormones that keep House Goliath's workers so big and strong, and it is their rad-purification equipment that feeds the life-support systems on which House Van Saar depends. In return, House Escher receives not only monetary wealth but also a wide range of raw biological material — xenos beasts and the like — from which they create unique and bizarre life forms as pets for themselves and for the nobles who dwell in the spires." },
					{ type: "p", text: "It is the many millennia of exposure to such potent alchemical processes that have altered the population of House Escher, their Y chromosome damaged beyond any repair. Almost without exception, the men of House Escher are sickly and short-lived, and reproduction is only possible through the most mysterious process of chemically induced parthenogenesis." },
					{ type: "p", text: "Escher society long ago evolved to cope with its singularly unbalanced population, so that it is no longer perceived as a disadvantage. The Escher have a reputation for arrogance, and it is said they despise and pity all men. They are particularly scornful of the Goliaths as simple-minded brutes, and the two Houses are therefore ancient enemies, with skirmishes along their borders a common occurrence." },
					{ type: "img", src: "escher-2", alt: "An Escher gang patrols its territory" },
					{ type: "p", text: "House Escher is ruled by a court of nobles, at the head of which stands the matriarch primus — currently Queen Adina Sabine. A young ruler who only recently came into her title, Adina was nonetheless raised for the position and groomed for it from the day of her birth. In the first days of her reign, Queen Adina had to contend with a major incursion into the House Escher industrial holdings that border those of House Goliath, the rival Clan House intent on destabilising her unproven rule. Adina proved a born leader, however, deftly lobbying the Imperial House for permission to launch a counter-raid into House Goliath territory and bringing the crisis to an end in short order." },
				],
			},
			{
				id: "a-casa-perdida",
				title: "The Lost House",
				kind: "callout",
				blocks: [
					{ type: "img", src: "lost-house", alt: "The Lost House — erased from the records of Necromunda" },
					{ type: "quote", text: "Nearly all the Clan Houses have myths and legends concerning their founding or their rise to dominance. Some claim to be the original inhabitants of Necromunda (and therefore the oldest House), while others share various myths of their arrival on the planet, their founding by some singularly powerful individual, or their emergence from other long-forgotten hierarchies. There is no doubt that Houses have arisen, risen and fallen over the centuries, though anyone who claims to know the true nature of such dynastic evolutions is either a liar or an overconfident fool." },
					{ type: "quote", text: "House Aranthus, for example, once ruled Necromunda, but vanished entirely several centuries ago when an unstoppable plague swept through its population and decimated its numbers. The survivors fought on, but soon found themselves so vulnerable to attacks of every kind and with so few resources that the spiral of debt led to the dissolution of all their territories and assets by Lord Helmawr himself. The few remaining Aranthus scattered across the hives or were absorbed into other Houses through marriage, sanctuary or servitude. In the centuries after its demise, House Aranthus passed into legend and became known as the Lost House." },
					{ type: "quote", text: "Since then, it has become fashionable for individuals to claim lineage from the House, many seeing it as a mark of uniqueness and distinction. The claim is particularly popular among bounty hunters and members of the Noble Houses, many of whom venture into the old strongholds of House Aranthus in search of legendary remnants of the past, looking for some means of restoring their long-lost status as a Clan House of Necromunda.\\" },
				],
			},
			{
				id: "casa-goliath",
				title: "House Goliath",
				color: "#ff8a3d",
				blocks: [
					{ type: "img", src: "goliath", alt: "House Goliath — brute strength forged in the vats" },
					{ type: "p", text: "House Goliath owns and operates many of Necromunda's great foundries, and its workers are the masters of furnace and metal, whose raw materials are traded from the mines of House Orlock. The House values nothing so highly as physical strength and, to that end, breeds its workers like prize cattle in an effort to create the strongest, toughest and most unthinkingly loyal furnace workers in the galaxy. The core of this workforce are enormous brutes — unbelievably strong and resilient, but often mentally unstable and extremely short-lived. House Goliath's furnace hands are frequently bigger than a Space Marine, and some consider them a classifiable strain of abhuman." },
					{ type: "p", text: "The subjects of House Goliath regard the hivers of the other Houses as weak and soft. In truth, all hivers are naturally hardy, being accustomed to the toxins and privations they accept without question as part of normal life. The Goliaths, however, take a stubborn pride in their gene-crafted ability to endure hardship. The other Houses see the Goliaths as barbarians, unsophisticated and unpredictable. Goliath institutions such as the fighting pits and the Feast of the Fallen do nothing to dispel the impression of a violent people hostile to their neighbours." },
					{ type: "p", text: "Size and strength are seen as the measure of a man among the Goliaths. Their style of dress emphasises a preoccupation with physique, featuring heavy chains and enormous spiked metal armbands, most of it derived from heavy industrial workwear. It is ironic, then, that the Goliath brutes are entirely dependent on growth stimulants supplied by their arch-rivals, the hated Escher, to achieve and maintain their prodigious frames." },
					{ type: "img", src: "goliath-2", alt: "A Goliath bruiser ready for the brawl" },
					{ type: "p", text: "Of all the Clan Houses of Necromunda, House Goliath can be taken most literally in its members' assertion that \"might makes right\". The position of head of House Goliath — called the \"Over-Tyrant\" — has been held by many thousands of individuals over the millennia, each winning their place in combat before eventually losing it in the same fashion. The current Over-Tyrant of House Goliath is Varran Gor, called \"Iron-Eye Gor\", who slew his predecessor in ritual combat during a great feast at which Lord Helmawr himself was present. It is said the Lord of Necromunda barely raised an eyebrow at the spectacle, accepting the exchange of power entirely as though nothing out of the ordinary had occurred." },
				],
			},
			{
				id: "casa-orlock",
				title: "House Orlock",
				color: "#59e36b",
				blocks: [
					{ type: "img", src: "orlock", alt: "House Orlock — the House of Iron, master of the roads" },
					{ type: "p", text: "House Orlock is known as the House of Iron because its foundations rest upon deep pits of ferrous slag scattered across Necromunda's ruined surface. From these pits the House extracts the detritus of ancient times, drawing enough pure metal from the waste to serve its industries. The prizes they haul from the irradiated crust are shipped across the surface in vast ore convoys for processing in the hives before being carried to the factories or even off-world. Orlock controls not only the mines but also the most vital transport lines and overland routes between them, and it is famed for its tough, fearless outriders who defend the convoys from Ash Waste Nomads and the agents of rival Houses. The gangers are the lucky ones, however, for most of the House's subjects are little more than serfs resigned to a life of toil in the mines and refineries." },
					{ type: "p", text: "Over the centuries, extensive slag mining has caused some areas to collapse. In the past this has led to ash quakes and hive tremors and to the destruction of several overlying hives. Throughout this time, the House has held the Ulanti Contract, a lucrative arrangement whereby one House supplies the basic requirements of the Noble House Ulanti. The contract was previously held by House Delaque, but the Orlocks usurped the position by bribing underhive gang raiders to destroy the fuel lines of a Delaque guild factory. The two Houses have seized every opportunity to discredit one another ever since. Five years ago, Lord Hagen Orlock was assassinated by the Delaque, and relations between the Houses have never been more strained." },
					{ type: "img", src: "orlock-2", alt: "Orlock riders on the ore roads" },
					{ type: "p", text: "House Orlock is controlled by a loose alliance of countless families bound by pact, bribery, marriage and murder, with each commanding as much of the House's resources as its size allows and dividing them among its own members as it sees fit. Lord Morrow Orlock remains the permanent head of the House, though in most respects House Orlock is bound to follow the will of its largest family. Remarkably, House Orlock remains one of the most united and disciplined Houses in the hive, its seemingly divided system of leadership experiencing strikingly few schisms." },
				],
			},
			{
				id: "casa-van-saar",
				title: "House Van Saar",
				color: "#00e5ff",
				blocks: [
					{ type: "img", src: "vansaar", alt: "House Van Saar — archaic technology and surgical precision" },
					{ type: "p", text: "The Van Saar have a reputation as a stern, humourless people with a deeply ingrained sense of order. House Van Saar produces basic technological components of almost mythical function, and it is from the supply of these that it has grown exceptionally rich. Yet House Van Saar guards a dark secret — its technology is derived from a hidden source that is slowly poisoning its subjects, a corrupted Standard Template Construct system whose fruits are bountiful but poisoned. The Van Saar are therefore forced to wear protective suits to ward off the effects of their own technologies, their irradiated blood continuously filtered by the mechanisms. Without their protective suits to sustain them, the Van Saar sicken rapidly, and it is the bitterest of jokes that, though they manufacture and carry the finest equipment, its source is slowly killing them. Despite this, they are utterly devoted to their House, determined that it should survive even if they themselves do not." },
					{ type: "p", text: "The Noble Houses pay a premium for Van Saar goods and, as a result, the House is probably the wealthiest in Hive Primus and in many other hives. As with all the Houses, they depend on others for goods and services they cannot originate themselves; in particular, House Escher, who supply the rad-purifiers that keep them alive in exchange for key elements of the parthenogenesis processes the Escher use to maintain their population. In addition, House Van Saar supplies highly advanced sensor and communications equipment to House Delaque, as well as navigation devices to House Orlock." },
					{ type: "img", src: "vansaar-2", alt: "Van Saar warriors and their advanced arsenal" },
					{ type: "p", text: "House Van Saar is organised according to a strictly defined system of feudal rank, with the oldest and most privileged families forming an inner circle with access to the most advanced — and therefore most dangerous — Standard Template Construct (STC) prints. The lower-ranked families have access only to the lesser products of the STC that sustains the House. As a result, the descendants of the inner-circle families are the sickest of the population, their bodies sustained by the continuous application of the rarest purifiers. The ruler of the House is Duke Otto Van Saar XXII, a man as pale as death and withered as a corpse, yet as dangerous as the most seasoned bounty hunter in the underhive." },
				],
			},
			{
				id: "a-guilda-dos-mercadores",
				title: "The Merchant Guild",
				blocks: [
					{ type: "p", text: "The Merchant Guild forms the slender threads that bind the Houses of Necromunda together. Within the hives and across the wastes, they are the connections along which all trade flows and all oaths of coin are sworn. Unlike the Clans and the Noble Houses, the Merchant Guild did not take its power by hereditary right or force of arms — in truth, they did not take power at all. Over the centuries, they laid claim to the spaces left between the Noble Houses and their vassals, brokering deals between clans that do not speak to one another or ensuring that trade flows smoothly even while gang war is tearing a hive apart. In time, as the Merchant Guild's power grew, Lord Helmawr recognised its importance to Necromunda and ratified its claims to power, granting charters to certain families. This authority to deal in the hive's vital resources does not extend to the ownership of land, and Merchant Guild families rarely hold permanent territories, instead travelling constantly between settlements as nomadic traders." },
					{ type: "p", text: "Though the inhabitants of Necromunda may occasionally refer to the Merchant Guild as a single entity, it is in fact composed of dozens of sub-factions, many of which are powerful entities in their own right. To the citizens of the hive, they are the Water Guild, the Corpse Farmers, or any of the many other names by which the individual arms of the Merchant Guild are known. Often these factions are simply called Guilders, a term synonymous with trade. Officially, each aspect of the Merchant Guild is known as a 'Mercator', the High Gothic word for a merchant conclave. This is combined with the High Gothic term for its area of dominion. For example, the Corpse Guild, which oversees the processing of Necromunda's dead and the making of corpse-starch, is officially known as 'Mercator Pallidus'." },
					{ type: "p", text: "The power of the individual Guilds varies from hive to hive, often depending on local resources. In the shadow of the Spoil, the Iron Guild regulates miners and prospectors. On the Sulphur Sea it is the Salt Guild, while in the choking depths of Magnoformus the Zephyrmen of the Air Guild ply their trade. In Hive Primus there are thousands of Guilder families and dozens of Guilds, though eight hold the greater part of the Merchant Guild's power. These are the Promethium Guild, the Water Guild, the Corpse Guild, the Slave Guild, the Coin Guild, the Electro Guild, the Iron Guild and the Air Guild. Collectively, they are known throughout the Palatine Cluster as the Great Guilds, and little business is done within the walls of Hive Primus without their knowledge." },
				],
			},
			{
				id: "redes-criminosas",
				title: "Criminal Networks",
				blocks: [
					{ type: "p", text: "In a world of savage gang leaders, rogue psykers and unsanctioned bounty hunters, only the most exceptional criminals stand out. Like the families of the Merchant Guild, crime lords lay claim to a region of the hive or one of its resources and, as far as the local inhabitants are concerned, they are little different from the sanctioned scum who nominally rule over them. Criminal networks vary depending on their location within the hive. In the rarefied heights of the spire, clandestine circles of nobles supply illegal vices to their wastrel peers. Some of these may style themselves crime lords, though when one has the power of the Noble Houses at one's disposal and few restraints upon one's actions, such titles are largely for show. The rank of crime lord becomes more meaningful further down, in the heart of the hive, where criminal enterprises hide within the structures of the Clan Houses. Gangs of thieves and killers, operating without Guild or Clan sanction, roam the streets of most domes. Gathered around an outcast or former ganger, they prey on hard-working citizens from the dome's maze of shadows. In larger sectors, these gangs may answer to a single individual, though such men and women take care not to draw too much attention, for the Enforcers are quick to crush any criminal enterprise that becomes too organised." },
					{ type: "p", text: "The underhive, by contrast, is a far more natural environment for the criminal element. Here, crime lords run entire settlements, the Merchant Guild accepting them as a necessary evil and dealing with them despite their lack of official status." },
					{ type: "p", text: "Countless criminal enterprises and networks operate in the shadows of Necromunda — though within the great hives of the Palatine Cluster some are more organised than others. The Cold Traders ensure a steady supply of contraband for anyone who can pay their price, and there is always a market for off-world goods, especially those proscribed by the Imperium. The Imperial Imposters are false nobles, well versed in the mechanisms of power that govern Necromunda. The aid of such an individual can raise a gang to unheard-of levels of \"opportunity\" — so long as they are not caught. The Rogue Factoria produces counterfeit weapons and wargear. These are profitable ventures for a criminal organisation, with the added benefit of keeping their allies well stocked with ammunition. The Narco Lords are the masters of illegal chemicals. These are a vital commodity on Necromunda and an extremely lucrative enterprise for criminal organisations, from the top of the spire to the depths of the underhive. Necromunda's long history is littered with disgraced nobles and Fallen Houses — declared outlaw by the Imperial House. Most have faded from memory, though some remain eager to reclaim their lost glory by any means. The Psi-Syndica trades in rogue psykers. There are few greater crimes on Necromunda than the harbouring or trafficking of psykers, though that does not stop them dealing in these powerful individuals." },
					{ type: "img", src: "criminal", alt: "The criminal networks that thrive in the cracks of the hive" },
				],
			},
			{
				id: "parias-forasteiros-e-cultos",
				title: "Outcasts, Outsiders and Cults",
				blocks: [
					{ type: "img", src: "outcasts", alt: "Outcasts, outsiders and cults on the fringes of hive society" },
					{ type: "quote", text: "Though the Noble and Clan Houses may hold the wealth and power on Necromunda, their members are but a small part of the hive world's vast population. Lost in the social cracks between these mighty institutions are the outcasts and the outsiders. Outcasts come in a bewildering variety of shapes and sizes, from exiled clan members and sump-born scum to strange gatherings and bands of mutants. The one thing they share is that they exist outside the official structures of Necromundan society — most simply trying to survive one more cycle in the lawless hell of the underhive or the merciless ash wastes." },
					{ type: "quote", text: "Far more insidious than the outcasts are the cults of Necromunda. These are souls who have devoted their lives to the service of a xenos master or dark power. The most common are the Genestealer and Helot Cults, following xenos overlords and warp-born horrors respectively. Nearly every hive on Necromunda has dealt with at least one of these threats — the former spawned from the ruins of Secundus, while the latter festers in the depths of the underhive, far from the light of the God-Emperor. Perhaps more terrifying than both are the Corpse Grinder Cults. Fermented in the hives' corpse-starch factories, they turn to the worship of the Lord of Skin and Sinew and to the cannibalisation of their fellow hivers. Left unchecked, a Corpse Grinder Cult uprising can spell the ruin of a hive, as the influence of Chaos infects its inhabitants and they turn upon one another in an orgy of violence." },
				],
			},
			{
				id: "nomades-dos-ermos-de-cinzas",
				title: "Ash Waste Nomads",
				blocks: [
					{ type: "img", src: "nomads", alt: "Ash Waste Nomads" },
					{ type: "p", text: "Few things in the wastes terrify travellers more than the prospect of encountering one of the Ash Waste Nomad tribes. To the people of Necromunda, they are as alien and unsettling as any known xenos species. In the eyes of a hiver they seem divorced from humanity and, though they may look like men, there is no doubt that their culture, and perhaps their very biology, diverged from humanity long ago. To those unfamiliar with the landscapes and peoples of Necromunda, it might seem, on hearing of these nomad tribes and their desert home, that they must be little different from the countless other wanderers, mutants, scavengers and slaves who have been forced to exist beyond the protective embrace of the hive cities. The difference between the two, however, is as stark as the difference between civilisation and barbarism." },
					{ type: "p", text: "The origins of the Ash Waste Nomads are mired in myth and legend. Ancient tales tell how, when the Iron Lords were overthrown by the Imperium, the last true citizens of the Araneus Continuity fled their oppressors into the wastes of their now-ruined world. Some say the nomads are the descendants of those first people, tormented and transformed by the desert into the creatures that stalk the wilds today, the hatred of the Imperium and its proxy Lord Helmawr still fresh in their hearts. Others claim that the Ash Waste Nomads existed even before the coming of the Imperium and were a slave class of the Iron Lords, forced to toil deep underground in infernal mines. Only when their masters were dethroned and Necromunda scoured by fire did they emerge to take their rightful place as rulers of the ash wastes." },
				],
			},
			{
				id: "prospectores-anoes-cabeca-de-ferro",
				title: "Ironhead Squat Prospectors",
				blocks: [
					{ type: "img", src: "squats", alt: "Ironhead Squat prospectors in the wastes" },
					{ type: "p", text: "Humans are not the only race to have made their home on the ruined world of Necromunda, and many subspecies, mutants and even true xenos dwell beneath its polluted skies, though few are perhaps as important to its existence as the Squats. Imperial records are vague on the origins of these hardy creatures, save perhaps that somewhere in humanity's dim and distant past they share a common ancestor with the humans of today. What is known, at least on Necromunda, is that the Squats came to this world some ten thousand years ago, not long after the Horus Heresy, when the scars of the galaxy-spanning civil war were still fresh upon the face of the world and much rebuilding needed to be done. For this task the Squats were unmatched in their skill, being a race of engineers, architects and artisans. Dozens of great Squat Clans came to Necromunda in this age, and it is in no small part thanks to their efforts that the world prospered as it did, though many within the hives fail to realise the debt they owe the Squats." },
					{ type: "p", text: "Centuries later, the Squats, or Ironhead Squats as they are known to the people of the wastes, live a semi-nomadic lifestyle aboard their great land trains, travelling from mining site to mining site, sucking up the wealth of Necromunda to sell to the Clan Houses. These vast mechanised mining platforms are like cities on tracks, and even when they cannot be seen, the sound of their thunderous passage carries for kilometres in every direction as they crawl from one mine to the next. When a land train arrives at a suitable dig site, it forms an encampment, or circle of great vehicles, and may remain for months or even years while it plunders the earth beneath its tracks. While the camp is in place, prospecting parties spread out in every direction, seeking new finds and protecting their clan — until the day the camp is struck and the land train moves on to new ground." },
				],
			},
		],
	},
];

/** Image dimensions are locale-independent — re-exported from the PT-BR source. */
export { LORE_IMG_DIMS } from "./content";
