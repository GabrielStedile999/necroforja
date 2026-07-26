import type { StaticImageData } from "next/image";
import houseCawdor from "./symbols/house-cawdor.webp";
import houseDelaque from "./symbols/house-delaque.webp";
import houseEscher from "./symbols/house-escher.webp";
import houseGoliath from "./symbols/house-goliath.webp";
import houseOrlock from "./symbols/house-orlock.webp";
import houseVanSaar from "./symbols/house-van-saar.webp";
import ashWasteNomads from "./symbols/ash-waste-nomads.webp";
import corpseGrinderCults from "./symbols/corpse-grinder-cults.webp";
import genestealerCults from "./symbols/genestealer-cults.webp";
import helotChaos from "./symbols/helot-chaos.webp";
import ironheadSquats from "./symbols/ironhead-squats.webp";
import malstrain from "./symbols/malstrain.webp";
import palaniteEnforcers from "./symbols/palanite-enforcers.webp";
import slaveOgryn from "./symbols/slave-ogryn.webp";
import spyrers from "./symbols/spyrers.webp";
import underhiveOutcasts from "./symbols/underhive-outcasts.webp";
import venators from "./symbols/venators.webp";

/**
 * Símbolos das gangues (issue #19) — arte própria estilizada (stencil
 * spray-paint sobre concreto, fornecida pelo Gabriel), evitando arte
 * oficial da Games Workshop (ver issue #17). Assets WebP 640px com import
 * estático do next/image, chaveados pelo slug do catálogo
 * (`src/components/gangs/content.ts`) para reuso futuro (nav mega-panel,
 * página /gangs, carrossel de jogadores). Cobertura completa: 17/17.
 */
const GANG_SYMBOLS: Record<string, StaticImageData> = {
	"house-cawdor": houseCawdor,
	"house-delaque": houseDelaque,
	"house-escher": houseEscher,
	"house-goliath": houseGoliath,
	"house-orlock": houseOrlock,
	"house-van-saar": houseVanSaar,
	"ash-waste-nomads": ashWasteNomads,
	"corpse-grinder-cults": corpseGrinderCults,
	"genestealer-cults": genestealerCults,
	"helot-chaos": helotChaos,
	"ironhead-squats": ironheadSquats,
	"malstrain": malstrain,
	"palanite-enforcers": palaniteEnforcers,
	"slave-ogryn": slaveOgryn,
	"spyrers": spyrers,
	"underhive-outcasts": underhiveOutcasts,
	"venators": venators,
};

/** Símbolo da gangue, ou null para cair no fallback de marca. */
export function gangSymbol(slug: string): StaticImageData | null {
	return GANG_SYMBOLS[slug] ?? null;
}

/**
 * Fallback defensivo para gangues sem símbolo no mapa acima (hoje nenhuma —
 * cobertura 17/17; fica pra quando uma gangue nova entrar no catálogo antes
 * da arte existir): uma das logos de marca (`public/brand/logo-light.png` /
 * `logo-dark.png`, 1254×1254), escolhida por hash DETERMINÍSTICO do slug —
 * `Math.random()` sortearia um logo diferente no servidor e no cliente a
 * cada render, causando hydration mismatch.
 */
export const BRAND_LOGO_SIZE = 1254;

export function fallbackBrandLogo(slug: string): string {
	let hash = 0;
	for (const ch of slug) hash = (hash + ch.charCodeAt(0)) % 2;
	return hash === 0 ? "/brand/logo-light.png" : "/brand/logo-dark.png";
}
