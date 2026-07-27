/**
 * Helpers determinísticos do avatar por iniciais (issue #40).
 *
 * Sem upload de foto por enquanto — o avatar é derivado do nome: iniciais
 * + cor estável escolhida por hash entre os accents das seis Grandes Casas
 * (mesma paleta do mega-panel do SiteNav). Puro/sem DOM de propósito: roda
 * igual no server e no client e é testável no vitest (environment: node).
 */

export type AvatarAccent = {
  /** Cor do texto/iniciais. */
  color: string;
  /** Fundo translúcido do disco. */
  bg: string;
  /** Borda do disco. */
  border: string;
  /** Glow suave (box-shadow). */
  shadow: string;
};

// Accents das seis Grandes Casas (ver GREAT_HOUSES no SiteNav).
const PALETTE: readonly AvatarAccent[] = [
  { color: "#ffc23d", bg: "rgba(255,194,61,.14)", border: "rgba(255,194,61,.45)", shadow: "rgba(255,194,61,.35)" },
  { color: "#b07bff", bg: "rgba(176,123,255,.14)", border: "rgba(176,123,255,.45)", shadow: "rgba(176,123,255,.35)" },
  { color: "#ff2d6f", bg: "rgba(255,45,111,.14)", border: "rgba(255,45,111,.45)", shadow: "rgba(255,45,111,.35)" },
  { color: "#ff8a3d", bg: "rgba(255,138,61,.14)", border: "rgba(255,138,61,.45)", shadow: "rgba(255,138,61,.35)" },
  { color: "#59e36b", bg: "rgba(89,227,107,.14)", border: "rgba(89,227,107,.45)", shadow: "rgba(89,227,107,.35)" },
  { color: "#00e5ff", bg: "rgba(0,229,255,.14)", border: "rgba(0,229,255,.45)", shadow: "rgba(0,229,255,.35)" },
] as const;

/**
 * Iniciais para o disco do avatar: primeira letra do primeiro e do último
 * nome ("Gabriel Stedile" → "GS"); nome único usa as duas primeiras letras
 * ("Kal" → "KA"); vazio vira "?". `Array.from` evita quebrar surrogate
 * pairs (emoji/ideogramas no display name).
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const firstWord = words[0];
  const lastWord = words[words.length - 1];
  if (!firstWord) return "?";
  if (words.length === 1 || !lastWord) {
    return Array.from(firstWord).slice(0, 2).join("").toUpperCase();
  }
  const first = Array.from(firstWord)[0] ?? "";
  const last = Array.from(lastWord)[0] ?? "";
  return (first + last).toUpperCase();
}

/**
 * Accent estável por hash djb2-xor do seed (nome do usuário) — mesma
 * entrada, mesma cor, em qualquer render/dispositivo.
 */
export function avatarAccent(seed: string): AvatarAccent {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h * 33) ^ seed.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(h) % PALETTE.length] as AvatarAccent;
}
