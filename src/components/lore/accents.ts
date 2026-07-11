import type { LoreChapter } from "./content";

/** Hex values for the chapter accent tokens (mirrors globals.css @theme). */
export const ACCENT_HEX: Record<LoreChapter["accent"], string> = {
  hazard: "#ff2d6f",
  cyan: "#00e5ff",
  violet: "#b07bff",
  rust: "#ff8a3d",
  toxic: "#59e36b",
};
