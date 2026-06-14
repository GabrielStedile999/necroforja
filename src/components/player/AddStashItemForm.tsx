"use client";

import { useActionState, useRef, useEffect } from "react";
import { addStashItem, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

const EQUIPMENT_CATEGORIES = [
  "weapon",
  "wargear",
  "skill",
  "armour",
  "upgrade",
] as const;

export function AddStashItemForm() {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    addStashItem,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Label htmlFor="stash-item-name">Nome</Label>
          <Input
            id="stash-item-name"
            name="name"
            placeholder="ex.: Lasgun"
            required
          />
        </div>
        <div>
          <Label htmlFor="stash-item-cat">Categoria</Label>
          <Select
            id="stash-item-cat"
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
          <Label htmlFor="stash-item-cost">Custo (c)</Label>
          <Input
            id="stash-item-cost"
            name="cost"
            type="number"
            min={0}
            defaultValue={0}
            required
          />
        </div>
        <div>
          <Label htmlFor="stash-item-qty">Qty</Label>
          <Input
            id="stash-item-qty"
            name="qty"
            type="number"
            min={1}
            max={99}
            defaultValue={1}
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
        <Button type="submit" disabled={pending} variant="outline">
          {pending ? "Adicionando..." : "Adicionar ao Stash"}
        </Button>
      </div>
    </form>
  );
}
