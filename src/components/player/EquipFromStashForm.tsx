"use client";

import { useActionState } from "react";
import { equipFromStash, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";

interface FighterOption {
  id: string;
  name: string;
}

export function EquipFromStashForm({
  stashItemId,
  fighters,
}: {
  stashItemId: string;
  fighters: FighterOption[];
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    equipFromStash,
    {},
  );

  if (fighters.length === 0) {
    return (
      <p className="text-xs text-muted">
        Recrute fighters para poder equipar itens.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="stashItemId" value={stashItemId} />

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor={`equip-fighter-${stashItemId}`}>Equipar em</Label>
          <Select
            id={`equip-fighter-${stashItemId}`}
            name="fighterId"
          >
            {fighters.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" disabled={pending} variant="outline">
          {pending ? "Equipando..." : "Equipar"}
        </Button>
      </div>

      {state.error && (
        <p className="text-xs text-blood">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-toxic">{state.success}</p>
      )}
    </form>
  );
}
