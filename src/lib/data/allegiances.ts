/**
 * Allegiance display config (issue #82) — the three sides of the
 * Succession Campaign's civil war (Cinderak Burning p.61–63). Labels are
 * functional names; any benefit descriptions on the site are rewritten
 * summaries (IP strategy), never book prose.
 */
import type { GangAllegiance } from "@/types";

export const ALLEGIANCE_OPTIONS: {
  key: GangAllegiance;
  label: string;
  badge: "muted" | "cyan" | "hazard";
}[] = [
  { key: "unaligned", label: "Unaligned", badge: "muted" },
  { key: "imperial_house", label: "Imperial House", badge: "cyan" },
  { key: "rebellion", label: "Rebellion", badge: "hazard" },
];

export const ALLEGIANCE_LABEL: Record<GangAllegiance, string> = {
  unaligned: "Unaligned",
  imperial_house: "Imperial House",
  rebellion: "Rebellion",
};

export const ALLEGIANCE_BADGE: Record<
  GangAllegiance,
  "muted" | "cyan" | "hazard"
> = {
  unaligned: "muted",
  imperial_house: "cyan",
  rebellion: "hazard",
};
