"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { addEquipment, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  CatalogPicker,
  type CatalogOption,
} from "@/components/player/CatalogPicker";
import {
  KeywordChips,
  type KeywordRuleMap,
} from "@/components/rules/KeywordChips";

const EQUIPMENT_CATEGORIES = [
  "weapon",
  "wargear",
  "skill",
  "armour",
  "upgrade",
] as const;

export function AddEquipmentForm({
  fighterId,
  gangId,
  catalog = [],
  keywordRules = {},
}: {
  fighterId: string;
  gangId: string;
  catalog?: CatalogOption[];
  keywordRules?: KeywordRuleMap;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    addEquipment,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  /** Catalogue pick (issue #67) — "" means custom free-text item. */
  const [pick, setPick] = useState("");
  const picked = catalog.find((o) => o.id === pick);

  /**
   * Clear the catalogue pick when a submission succeeds — render-time
   * adjustment instead of a setState-in-effect
   * (https://react.dev/learn/you-might-not-need-an-effect).
   */
  const [lastSuccess, setLastSuccess] = useState<string | undefined>(undefined);
  if (state.success !== lastSuccess) {
    setLastSuccess(state.success);
    if (state.success) setPick("");
  }

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="fighterId" value={fighterId} />
      <input type="hidden" name="gangId" value={gangId} />
      <input type="hidden" name="catalogId" value={pick} />

      <CatalogPicker
        id={`eq-catalog-${fighterId}`}
        options={catalog}
        value={pick}
        onChange={setPick}
      />

      {picked ? (
        <>
          {/* Server snapshot comes from the catalogue row — these hidden
              values only keep the schema happy. */}
          <input type="hidden" name="name" value={picked.name} />
          <input type="hidden" name="category" value={picked.category} />
          <input type="hidden" name="cost" value={picked.cost} />
          <div className="rounded-sm border border-rivet/60 bg-elevated/40 px-3 py-2 text-sm text-muted">
            <span className="font-medium text-ink">{picked.name}</span>
            {" · "}
            {picked.category}
            {" · "}
            <span className="font-mono text-hazard">{picked.cost}c</span>
            {picked.traits && (
              <span className="mt-1 block">
                <KeywordChips traits={picked.traits} rules={keywordRules} />
              </span>
            )}
            {picked.effect && (
              <span className="mt-1 block text-xs">{picked.effect}</span>
            )}
            <span className="block text-xs">
              Official values applied server-side (snapshot at acquisition).
            </span>
          </div>
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor={`eq-name-${fighterId}`}>Name</Label>
            <Input
              id={`eq-name-${fighterId}`}
              name="name"
              placeholder="e.g.: Boltgun"
              required
            />
          </div>
          <div>
            <Label htmlFor={`eq-cat-${fighterId}`}>Category</Label>
            <Select
              id={`eq-cat-${fighterId}`}
              name="category"
              defaultValue="weapon"
            >
              {EQUIPMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`eq-cost-${fighterId}`}>Cost (c)</Label>
            <Input
              id={`eq-cost-${fighterId}`}
              name="cost"
              type="number"
              min={0}
              defaultValue={0}
              required
            />
          </div>
        </div>
      )}

      {state.error && (
        <p className="rounded-sm border border-blood/40 bg-blood/15 px-3 py-2 text-sm text-blood">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-sm border border-toxic/40 bg-toxic/10 px-3 py-2 text-sm text-toxic">
          {state.success}
        </p>
      )}

      <div>
        <Button type="submit" pending={pending} variant="outline">
          {pending ? "Adding..." : "Add equipment"}
        </Button>
      </div>
    </form>
  );
}
