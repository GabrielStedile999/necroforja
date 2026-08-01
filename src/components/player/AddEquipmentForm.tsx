"use client";

import { useActionState, useRef, useEffect } from "react";
import { addEquipment, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

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
}: {
  fighterId: string;
  gangId: string;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    addEquipment,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="fighterId" value={fighterId} />
      <input type="hidden" name="gangId" value={gangId} />

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
