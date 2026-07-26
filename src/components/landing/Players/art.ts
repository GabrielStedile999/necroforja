import type { StaticImageData } from "next/image";
import davi from "./davi.webp";
import gabriel from "./gabriel.webp";
import heitor from "./heitor.webp";
import jeferson from "./jeferson.webp";

/**
 * Retratos dos jogadores da campanha (issue #18) — assets estáticos do site
 * (decisão do Gabriel: sem upload de avatar por enquanto), mapeados pelo
 * `displayName` do `app_user` normalizado pra minúsculas. Import estático =
 * dimensões conhecidas + otimização automática do next/image.
 */
const PLAYER_ART: Record<string, StaticImageData> = {
	davi,
	gabriel,
	heitor,
	jeferson,
};

/** Retrato do jogador, ou null para cair no placeholder temático. */
export function playerArt(displayName: string): StaticImageData | null {
	return PLAYER_ART[displayName.trim().toLowerCase()] ?? null;
}
