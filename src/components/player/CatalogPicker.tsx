"use client";

/**
 * "From catalogue" select (issue #67) — shared by AddEquipmentForm and
 * AddStashItemForm. Picking an item submits its `catalogId`; the server
 * then uses the CATALOGUE row's name/category/cost (authoritative snapshot)
 * regardless of anything typed on the client. Leaving it on "custom item"
 * keeps the free-text fields.
 */

import { Label, Select } from "@/components/ui/input";

export interface CatalogOption {
  id: string;
  name: string;
  category: "weapon" | "wargear" | "skill" | "armour" | "upgrade";
  subcategory: string | null;
  cost: number;
  /** Comma-separated trait names as printed — for the keyword chips. */
  traits: string;
  /** Terse functional summary (armour saves, alternate profiles…). */
  effect: string;
}

/** Display order mirrors the book's chapters (/admin/catalog groups). */
const GROUPS: { key: string; label: string }[] = [
  { key: "weapon:basic", label: "Basic Weapons" },
  { key: "weapon:pistol", label: "Pistols" },
  { key: "weapon:special", label: "Special Weapons" },
  { key: "weapon:heavy", label: "Heavy Weapons" },
  { key: "weapon:close_combat", label: "Close Combat Weapons" },
  { key: "weapon:grenade", label: "Grenades" },
  { key: "weapon:", label: "Other Weapons" },
  { key: "armour", label: "Armour" },
  { key: "wargear", label: "Wargear" },
  { key: "upgrade", label: "Upgrades" },
  { key: "skill", label: "Skills" },
];

function groupKey(o: CatalogOption): string {
  return o.category === "weapon"
    ? `weapon:${o.subcategory ?? ""}`
    : o.category;
}

export function CatalogPicker({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: CatalogOption[];
  value: string;
  onChange: (catalogId: string) => void;
}) {
  if (options.length === 0) return null;

  const byGroup = new Map<string, CatalogOption[]>();
  for (const o of options) {
    const key = groupKey(o);
    const list = byGroup.get(key) ?? [];
    list.push(o);
    byGroup.set(key, list);
  }

  return (
    <div>
      <Label htmlFor={id}>From catalogue (optional)</Label>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— custom item (type below) —</option>
        {GROUPS.map(({ key, label }) => {
          const group = byGroup.get(key);
          if (!group || group.length === 0) return null;
          return (
            <optgroup key={key} label={label}>
              {group.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} — {o.cost}c
                </option>
              ))}
            </optgroup>
          );
        })}
      </Select>
    </div>
  );
}
