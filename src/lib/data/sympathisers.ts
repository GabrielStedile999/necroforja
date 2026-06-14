import type { Sympathiser } from "@/types";

/**
 * Catálogo dos 26 Sympathisers da campanha Cinderak Burning.
 * São territórios disputáveis; o Arbitrator escolhe quais ficam ativos na
 * campanha (ver coluna `enabled` em `sympathiser`).
 */
export const SYMPATHISERS: Sympathiser[] = [
  { id: "promethium-guild", name: "Promethium Guild Sympathisers" },
  { id: "water-guild", name: "Water Guild Sympathisers" },
  { id: "slave-guild", name: "Slave Guild Sympathisers" },
  { id: "corpse-guild", name: "Corpse Guild Sympathisers" },
  { id: "guild-of-coin", name: "Guild of Coin Sympathisers" },
  { id: "iron-guild", name: "Iron Guild Sympathisers" },
  { id: "imperial-imposter", name: "Imperial Imposter Sympathisers" },
  { id: "cold-trader", name: "Cold Trader Sympathisers" },
  { id: "narco-lord", name: "Narco Lord Sympathisers" },
  { id: "rogue-factoria", name: "Rogue Factoria Sympathisers" },
  { id: "fallen-house", name: "Fallen House Sympathisers" },
  { id: "psi-syndica", name: "Psi-syndica Sympathisers" },
  { id: "house-catallus", name: "House Catallus Sympathisers" },
  { id: "house-ulanti", name: "House Ulanti Sympathisers" },
  { id: "house-greim", name: "House Greim Sympathisers" },
  { id: "house-koiron", name: "House Ko'iron Sympathisers" },
  { id: "house-ran-lo", name: "House Ran Lo Sympathisers" },
  { id: "house-ty", name: "House Ty Sympathisers" },
  { id: "electro-guild", name: "Electro Guild Sympathisers" },
  { id: "air-guild", name: "Air Guild Sympathisers" },
  { id: "venator", name: "Venator Sympathisers" },
  { id: "dregs-of-the-hive", name: "Dregs of the Hive Sympathisers" },
  { id: "wasteland-scrapper", name: "Wasteland Scrapper Sympathisers" },
  { id: "second-best-smuggler", name: "Second Best Smuggler Sympathisers" },
  { id: "heretek", name: "Heretek Sympathisers" },
  { id: "explorator", name: "Explorator Sympathisers" },
];

export function getSympathiser(id: string): Sympathiser | undefined {
  return SYMPATHISERS.find((s) => s.id === id);
}
