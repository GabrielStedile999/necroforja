/**
 * Official equipment catalogue seed (issue #67) — Trading Post, Necromunda
 * Core Rulebook 2023, p.263–274 (weapons/grenades) and p.272–291
 * (armour/wargear). Transcribed from the book with layout-preserving
 * extraction and visually verified against the printed tables (e.g. the
 * Maul's unusual AP "+1" is exactly as printed on p.270).
 *
 * IP note (public repository): this file carries FUNCTIONAL DATA ONLY —
 * names, credit costs, numeric weapon profiles and trait names. No rule
 * text from the books is reproduced; `effect` holds a terse numeric
 * summary or an alternate-profile note, never book prose. Longer effect
 * descriptions can be typed by the Arbitrator in /admin/catalog (they live
 * in the private database, not in the repo).
 *
 * Multi-profile weapons are seeded with their DEFAULT profile; alternate
 * ammo/settings are summarised in `effect` (numbers only). Exotic/xenos
 * one-offs are intentionally left out — add them via /admin/catalog.
 */

export type CatalogSubcategory =
  | "basic"
  | "pistol"
  | "special"
  | "heavy"
  | "close_combat"
  | "grenade";

export interface CatalogSeedItem {
  name: string;
  category: "weapon" | "wargear" | "armour" | "upgrade";
  subcategory?: CatalogSubcategory;
  cost: number;
  rangeShort?: string;
  rangeLong?: string;
  accShort?: string;
  accLong?: string;
  strength?: string;
  ap?: string;
  damage?: string;
  ammo?: string;
  traits?: string;
  effect?: string;
}

const W = (
  name: string,
  subcategory: CatalogSubcategory,
  cost: number,
  profile: [string, string, string, string, string, string, string, string],
  traits: string,
  effect = "",
): CatalogSeedItem => ({
  name,
  category: "weapon",
  subcategory,
  cost,
  rangeShort: profile[0],
  rangeLong: profile[1],
  accShort: profile[2],
  accLong: profile[3],
  strength: profile[4],
  ap: profile[5],
  damage: profile[6],
  ammo: profile[7],
  traits,
  effect,
});

export const EQUIPMENT_CATALOG_SEED: CatalogSeedItem[] = [
  /* ------------------------- Basic weapons (p.263) ------------------------- */
  W("Arc rifle", "basic", 100, ['9"', '24"', "+2", "-1", "5", "-", "1", "6+"], "Blaze, Rapid Fire (1), Shock"),
  W("Autogun", "basic", 15, ['8"', '24"', "+1", "-", "3", "-", "1", "4+"], "Rapid Fire (1)"),
  W("Reclaimed autogun", "basic", 10, ['8"', '24"', "+1", "-", "3", "-", "1", "5+"], "Rapid Fire (1)"),
  W("Boltgun", "basic", 55, ['12"', '24"', "+1", "-", "4", "-1", "2", "6+"], "Rapid Fire (1)"),
  W("Combat shotgun", "basic", 70, ['4"', '12"', "+1", "-", "4", "-", "2", "4+"], "Knockback, Rapid Fire (1)",
    'Salvo ammo (default). Shredder: -/T, -/-, S2 AP- D1 Am4+, Scattershot, Template'),
  W("Lasgun", "basic", 15, ['18"', '24"', "+1", "-", "3", "-", "1", "2+"], "Plentiful"),
  W("Sawn-off shotgun", "basic", 15, ['4"', '8"', "+2", "-", "3", "-", "1", "6+"], "Plentiful, Scattershot",
    'Scatter ammo (default). Solid (+5c): 4"/8", -/-2, S4 AP- D2 Am6+, Knockback, Plentiful'),
  W("Shotgun", "basic", 30, ['8"', '16"', "+1", "-", "4", "-", "2", "4+"], "Knockback",
    'Solid ammo (default). Scatter: 4"/8", +2/-, S2 AP- D1 Am4+, Scattershot'),
  W("Throwing knives", "basic", 10, ["Sx2", "Sx4", "-", "-1", "-", "-1", "-", "5+"], "Scarce, Silent, Toxin"),

  /* --------------------------- Pistols (p.264) ----------------------------- */
  W("Autopistol", "pistol", 10, ['4"', '12"', "+1", "-", "3", "-", "1", "4+"], "Rapid Fire (1), Sidearm"),
  W("Reclaimed autopistol", "pistol", 5, ['4"', '12"', "+1", "-", "3", "-", "1", "5+"], "Rapid Fire (1), Sidearm"),
  W("Bolt pistol", "pistol", 45, ['6"', '12"', "+1", "-", "4", "-1", "2", "6+"], "Sidearm"),
  W("Grav pistol", "pistol", 70, ['6"', '12"', "+1", "-", "*", "-1", "2", "5+"], 'Blast (3"), Concussion, Graviton Pulse'),
  W("Hand flamer", "pistol", 75, ["-", "T", "-", "-", "3", "-", "1", "5+"], "Blaze, Template"),
  W("Inferno pistol", "pistol", 145, ['6"', '9"', "-", "-", "8", "-3", "2", "6+"], "Melta, Scarce, Sidearm"),
  W("Laspistol", "pistol", 10, ['8"', '12"', "+1", "-", "3", "-", "1", "2+"], "Plentiful, Sidearm"),
  W("Needle pistol", "pistol", 30, ['4"', '9"', "+2", "-", "-", "-1", "-", "6+"], "Scarce, Sidearm, Silent, Toxin"),
  W("Plasma pistol", "pistol", 50, ['6"', '12"', "+2", "-", "5", "-1", "2", "5+"], "Scarce, Sidearm",
    'Low power (default). Maximal: 6"/12", +1/-, S7 AP-2 D3 Am5+, Scarce, Sidearm, Unstable'),
  W("Stub gun", "pistol", 5, ['6"', '12"', "+2", "-", "3", "-", "1", "4+"], "Plentiful, Sidearm",
    'Dumdum rounds (+5c): 5"/10", +1/-, S4 AP- D1 Am4+, Limited, Sidearm'),
  W("Web pistol", "pistol", 90, ["-", "T", "-", "-", "4", "-", "-", "6+"], "Silent, Template, Web"),

  /* ------------------------ Special weapons (p.266) ------------------------ */
  W("Flamer", "special", 140, ["-", "T", "-", "-", "4", "-1", "1", "5+"], "Blaze, Template"),
  W("Grav gun", "special", 120, ['9"', '18"', "+1", "-", "*", "-1", "2", "5+"], 'Blast (3"), Concussion, Graviton Pulse'),
  W("Grenade launcher", "special", 65, ['6"', '24"', "-1", "-", "3", "-", "1", "6+"], 'Blast (3"), Knockback',
    'Frag grenades (default). Krak: 6"/24", -1/-, S6 AP-2 D2 Am6+'),
  W("Long las", "special", 20, ['18"', '36"', "-", "+1", "4", "-", "1", "2+"], "Plentiful"),
  W("Long rifle", "special", 30, ['24"', '48"', "-", "+1", "4", "-1", "1", "4+"], "Knockback"),
  W("Meltagun", "special", 135, ['6"', '12"', "+1", "-", "8", "-4", "3", "4+"], "Melta, Scarce"),
  W("Needle rifle", "special", 40, ['9"', '18"', "+2", "-", "-", "-2", "-", "6+"], "Scarce, Silent, Toxin"),
  W("Plasma gun", "special", 100, ['12"', '24"', "+2", "-", "5", "-1", "2", "5+"], "Rapid Fire (1), Scarce",
    'Low power (default). Maximal: 12"/24", +1/-, S7 AP-2 D3 Am5+, Scarce, Unstable'),
  W("Storm bolter", "special", 95, ['12"', '24"', "+1", "-", "4", "-1", "2", "6+"], "Rapid Fire (2), Scarce"),
  W("Web gun", "special", 125, ["-", "T", "-", "-", "5", "-", "-", "5+"], "Silent, Template, Web"),

  /* ------------------------- Heavy weapons (p.268) ------------------------- */
  W("Autocannon", "heavy", 160, ['24"', '48"', "-", "-", "7", "-2", "2", "4+"], "Knockback, Rapid Fire (1), Unwieldy"),
  W("Grav cannon", "heavy", 140, ['20"', '80"', "-1", "+1", "*", "-1", "2", "5+"], 'Blast (5"), Concussion, Graviton Pulse, Unwieldy'),
  W("Harpoon launcher", "heavy", 110, ['6"', '18"', "+2", "-", "5", "-3", "1", "5+"], "Drag, Impale, Scarce"),
  W("Heavy bolter", "heavy", 160, ['18"', '36"', "+1", "-", "5", "-2", "2", "6+"], "Rapid Fire (2), Unwieldy"),
  W("Heavy flamer", "heavy", 195, ["-", "T", "-", "-", "5", "-2", "1", "5+"], "Blaze, Template, Unwieldy"),
  W("Heavy stubber", "heavy", 130, ['20"', '40"', "-", "-1", "4", "-1", "1", "4+"], "Rapid Fire (2), Unwieldy"),
  W("Lascannon", "heavy", 155, ['24"', '48"', "-", "+1", "10", "-3", "3", "4+"], "Knockback, Unwieldy"),
  W("Mining laser", "heavy", 125, ['18"', '24"', "-", "-1", "9", "-3", "3", "3+"], "Unwieldy"),
  W("Missile launcher", "heavy", 165, ['24"', '48"', "+1", "-", "4", "-1", "1", "6+"], 'Blast (5"), Knockback, Unwieldy',
    'Frag missiles (default). Krak: 24"/48", +1/-, S6 AP-2 D3 Am6+, Unwieldy'),
  W("Mole launcher", "heavy", 100, ['20"', '60"', "-1", "-", "6", "-2", "1", "5+"], 'Blast (3"), Burrowing, Concussion, Unwieldy'),
  W("Multi-melta", "heavy", 180, ['12"', '24"', "+1", "-", "8", "-4", "3", "4+"], 'Blast (3"), Melta, Scarce, Unwieldy'),
  W("Plasma cannon", "heavy", 130, ['18"', '36"', "+1", "-", "6", "-1", "2", "5+"], "Rapid Fire (1), Scarce, Unwieldy",
    'Low power (default). Maximal: 18"/36", +1/-, S8 AP-2 D3 Am5+, Blast (3"), Scarce, Unstable, Unwieldy'),
  W("Seismic cannon", "heavy", 140, ['12"', '24"', "-", "-1", "6", "-1", "2", "5+"], "Knockback, Rapid Fire (1), Seismic, Unwieldy",
    'Short wave (default). Long wave: 12"/24", -1/-, S3 AP- D1 Am5+, Knockback, Rapid Fire (2), Seismic, Unwieldy'),

  /* --------------------------- Grenades (p.269) ---------------------------- */
  W("Blasting charge", "grenade", 35, ["-", "Sx2", "-", "-", "5", "-1", "2", "5+"], 'Blast (5"), Grenade, Knockback'),
  W("Choke gas grenade", "grenade", 50, ["-", "Sx3", "-", "-", "-", "-", "-", "5+"], 'Blast (3"), Gas, Grenade'),
  W("Demo charge", "grenade", 50, ["-", "Sx2", "-", "-", "6", "-3", "3", "*"], 'Blast (5"), Grenade, Single Shot'),
  W("Flares", "grenade", 20, ["-", "Sx3", "-", "-", "-", "-", "-", "4+"], 'Blast (5"), Flare, Grenade'),
  W("Frag grenade", "grenade", 30, ["-", "Sx3", "-", "-", "3", "-", "1", "4+"], 'Blast (3"), Grenade, Knockback'),
  W("Incendiary charge", "grenade", 40, ["-", "Sx3", "-", "-", "3", "-", "1", "5+"], 'Blast (5"), Blaze, Grenade'),
  W("Krak grenade", "grenade", 45, ["-", "Sx3", "-", "-1", "6", "-2", "2", "4+"], "Demolitions, Grenade"),
  W("Melta bomb", "grenade", 60, ["-", "Sx3", "-", "-1", "8", "-4", "3", "6+"], "Demolitions, Grenade, Melta"),
  W("Phosphor canister", "grenade", 40, ["-", "Sx3", "-", "-1", "4", "-3", "2", "5+"], 'Blaze, Blast (3"), Grenade'),
  W("Photon flash grenade", "grenade", 15, ["-", "Sx3", "-", "-", "-", "-", "-", "5+"], 'Blast (5"), Flash, Grenade'),
  W("Plasma grenades", "grenade", 90, ["-", "Sx3", "-", "-", "5", "-1", "2", "4+"], 'Blast (3"), Grenade, Unstable'),
  W("Scare gas grenade", "grenade", 45, ["-", "Sx3", "-", "-", "-", "-", "-", "6+"], 'Blast (3"), Fear, Gas, Grenade'),
  W("Smoke grenade", "grenade", 15, ["-", "Sx3", "-", "-", "-", "-", "-", "4+"], "Blast (*), Grenade, Smoke"),
  W("Stun grenade", "grenade", 15, ["-", "Sx3", "-", "-", "2", "-1", "1", "4+"], 'Blast (3"), Concussion, Grenade'),

  /* ---------------------- Close combat weapons (p.270) --------------------- */
  W("Fighting knife", "close_combat", 15, ["-", "E", "-", "-", "S", "-1", "1", "-"], "Backstab, Melee"),
  W("Power knife", "close_combat", 25, ["-", "E", "-", "-", "S+1", "-2", "1", "-"], "Backstab, Melee, Power"),
  W("Stiletto knife", "close_combat", 20, ["-", "E", "-", "-", "-", "-", "-", "-"], "Melee, Toxin"),
  W("Axe", "close_combat", 10, ["-", "E", "-", "-", "S+1", "-", "1", "-"], "Disarm, Melee"),
  W("Chainaxe", "close_combat", 30, ["-", "E", "-", "+1", "S+1", "-1", "1", "-"], "Disarm, Melee, Parry, Rending"),
  W("Cleaver", "close_combat", 20, ["-", "E", "-", "-", "S+1", "-1", "1", "-"], "Disarm, Melee"),
  W("Chainsword", "close_combat", 25, ["-", "E", "-", "+1", "S", "-1", "1", "-"], "Melee, Parry, Rending"),
  W("Digi laser", "close_combat", 25, ["E", '3"', "-", "-", "1", "-", "1", "6+"], "Digi, Melee, Versatile"),
  W("Flail", "close_combat", 20, ["-", "E", "-", "+1", "S+1", "-", "1", "-"], "Entangle, Melee"),
  W("Heavy club", "close_combat", 15, ["-", "E", "-", "-", "S", "-", "2", "-"], "Concussion, Melee"),
  // AP "+1" is exactly as printed on p.270 of the 2023 Core Rulebook.
  W("Maul (club)", "close_combat", 10, ["-", "E", "-", "-", "S", "+1", "2", "-"], "Melee"),
  W("Servo claw", "close_combat", 35, ["-", "E", "-", "-", "S+2", "-", "2", "-"], "Melee"),
  W("Stiletto sword", "close_combat", 35, ["-", "E", "-", "-", "-", "-1", "-", "-"], "Melee, Parry, Toxin"),
  W("Sword", "close_combat", 20, ["-", "E", "-", "+1", "S", "-1", "1", "-"], "Melee, Parry"),
  W("Whip", "close_combat", 15, ["E", '3"', "-1", "-", "S", "-", "1", "-"], "Entangle, Melee, Versatile"),
  W("Las cutter", "close_combat", 85, ["E", '2"', "+1", "-", "9", "-3", "2", "6+"], "Melee, Scarce, Versatile"),
  W("Lightning claw", "close_combat", 70, ["-", "E", "-", "+1", "S+1", "-2", "1", "-"], "Melee, Parry, Power, Rending"),
  W("Power axe", "close_combat", 35, ["-", "E", "-", "-", "S+2", "-2", "1", "-"], "Disarm, Melee, Power"),
  W("Power claw", "close_combat", 55, ["-", "E", "-", "-", "S", "-1", "2", "-"], "Melee, Power, Pulverise"),
  W("Power fist", "close_combat", 100, ["-", "E", "-", "-", "S+3", "-3", "3", "-"], "Melee, Power, Pulverise, Unwieldy"),
  W("Power hammer", "close_combat", 45, ["-", "E", "-", "-", "S+1", "-1", "2", "-"], "Melee, Power"),
  W("Power maul", "close_combat", 30, ["-", "E", "-", "-", "S+2", "-1", "1", "-"], "Melee, Power"),
  W("Power pick", "close_combat", 40, ["-", "E", "-", "-", "S+1", "-3", "1", "-"], "Melee, Power, Pulverise"),
  W("Power sword", "close_combat", 50, ["-", "E", "-", "-", "S+1", "-2", "1", "-"], "Melee, Parry, Power"),
  W("Shock baton", "close_combat", 30, ["-", "E", "-", "-", "S", "-", "1", "-"], "Melee, Parry, Shock"),
  W("Shock stave", "close_combat", 25, ["E", '2"', "-", "-", "S+1", "-", "1", "-"], "Melee, Shock, Versatile"),
  W("Thunder hammer", "close_combat", 70, ["-", "E", "-", "-", "S+1", "-1", "3", "-"], "Melee, Power, Shock"),
  W("Chain glaive", "close_combat", 60, ["E", '2"', "-1", "-", "S+2", "-2", "2", "-"], "Melee, Unwieldy, Versatile"),
  W("Greatsword", "close_combat", 40, ["E", '1"', "-", "+1", "S+1", "-1", "1", "-"], "Melee, Sever, Unwieldy, Versatile"),
  W("Heavy rock cutter", "close_combat", 135, ["-", "E", "-", "-", "S+4", "-4", "3", "-"], "Melee, Unwieldy"),
  W("Heavy rock drill", "close_combat", 90, ["-", "E", "-", "-", "S+2", "-3", "2", "-"], "Melee, Pulverise, Unwieldy"),
  W("Heavy rock saw", "close_combat", 120, ["-", "E", "-", "+1", "S+3", "-3", "2", "-"], "Melee, Rending, Unwieldy"),
  W("Polearm", "close_combat", 30, ["E", '2"', "-1", "-", "S+1", "-", "1", "-"], "Melee, Unwieldy, Versatile"),
  W("Two-handed axe", "close_combat", 25, ["-", "E", "-", "-1", "S+2", "-", "2", "-"], "Melee, Unwieldy"),
  W("Two-handed hammer", "close_combat", 35, ["-", "E", "-", "-1", "S+1", "-", "3", "-"], "Knockback, Melee, Unwieldy"),

  /* -------------------------- Armour (p.272–274) --------------------------- */
  { name: "Ablative overlay", category: "armour", cost: 20, effect: "First save 2 better, next 1 better, then spent for the battle; stacks with armour" },
  { name: "Armourweave", category: "armour", cost: 20, effect: "5+ save; AP cannot worsen it below 6+" },
  { name: "Carapace armour (light)", category: "armour", cost: 80, effect: "4+ save" },
  { name: "Carapace armour (heavy)", category: "armour", cost: 100, effect: '4+ save (3+ vs front vision arc); -1 Initiative, -1" on Charge' },
  { name: "Ceramite shield", category: "armour", cost: 40, effect: "+2 save vs attacks in LoS while Standing; Move becomes (Basic); ignores Melta in LoS; carries one fewer weapon" },
  { name: "Flak armour", category: "armour", cost: 10, effect: "6+ save; 5+ vs Blast/Template" },
  { name: "Gutterforged cloak", category: "armour", cost: 15, effect: "6+ save; 5+ vs environmental damage" },
  { name: "Hazard suit", category: "armour", cost: 10, effect: "6+ save; with respirator +3 T vs Gas; immune to Blaze and Rad-phage" },
  { name: "Mesh armour", category: "armour", cost: 15, effect: "5+ save" },
  { name: "Reflec shroud", category: "armour", cost: 30, effect: "5+ save; las/plasma/melta AP counts as -" },
  { name: "Scrap shield", category: "armour", cost: 15, effect: "+1 save vs Reaction attacks while Standing and Engaged; stacks with armour" },

  /* --------------------- Personal equipment (p.280–293) -------------------- */
  { name: "Armoured undersuit", category: "wargear", cost: 25, effect: "Save improved by 1 (stacks with armour); 6+ if no armour; not with armoured bodyglove" },
  { name: "Bio-booster", category: "wargear", cost: 35, effect: "First Injury roll each battle: one fewer Injury dice" },
  { name: "Bio-scanner", category: "wargear", cost: 30, effect: "Sentry: may spot attackers outside the normal detection rules (see Core Rulebook)" },
  { name: "Cameleoline cloak", category: "wargear", cost: 35, effect: "If the wearer did not move: ranged attacks at -2 to hit until their next activation" },
  { name: "Chem-synth", category: "wargear", cost: 15, effect: "Boosts Gas/Toxin attacks (see Core Rulebook)" },
  { name: "Drop rig", category: "wargear", cost: 10, effect: "Descend (Basic) action down level edges" },
  { name: "Filter plugs", category: "wargear", cost: 10, effect: "+1 Toughness vs Gas; one use per battle" },
  { name: "Frenzon collar", category: "wargear", cost: 30, effect: "Permanently under Frenzon; joins the master motivator's group activation from anywhere" },
  { name: "Grapnel launcher", category: "wargear", cost: 25, effect: "Grapnel action: move between levels/gaps" },
  { name: "Grav-chute", category: "wargear", cost: 50, effect: "No damage from falling or jumping down" },
  { name: "Industrial respirator", category: "wargear", cost: 30, effect: "+3 Toughness vs Gas (+4 with hazard suit); once per battle: own air supply for a round" },
  { name: "Lho sticks", category: "wargear", cost: 5, effect: "Nearby low-Intelligence friends gain a small morale perk (see Core Rulebook)" },
  { name: "Lock-punch", category: "wargear", cost: 10, effect: "Force locked doors open (see Core Rulebook)" },
  { name: "Magnacles", category: "wargear", cost: 20, effect: "Attack (Basic): target tests Initiative or is locked in place (Break Bonds 2D6 <= S to escape)" },
  { name: "Medicae kit", category: "wargear", cost: 30, effect: "Assisted Recovery test: roll an extra Injury dice, discard one" },
  { name: "Photo-goggles", category: "wargear", cost: 35, effect: "Attack through smoke; better visibility in darkness" },
  { name: "Respirator", category: "wargear", cost: 15, effect: "+2 Toughness vs Gas" },
  { name: "Second Best", category: "wargear", cost: 15, effect: "Cheap booze — Intoxication table (see Core Rulebook)" },
  { name: "Skinblade", category: "wargear", cost: 10, effect: "+2 on the escape roll if Captured; one use" },
  { name: "Stimm-slug stash", category: "wargear", cost: 30, effect: "Once per battle: combat stimms at activation (see Core Rulebook)" },
  { name: "Strip kit", category: "wargear", cost: 15, effect: "+2 on Intelligence tests to open door terminals and loot caskets" },
  { name: "Suspensor harness", category: "wargear", cost: 40, effect: "Carries 4 weapons instead of 3" },
  { name: "Web solvent", category: "wargear", cost: 25, effect: "Recovery check vs Webbed: roll an extra Injury dice, discard one" },
  { name: "Wild Snake", category: "wargear", cost: 30, effect: "Booze — Intoxication table (see Core Rulebook)" },
];
