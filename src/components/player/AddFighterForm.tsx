"use client";

import { useActionState, useRef, useEffect } from "react";
import { addFighter, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

const CATEGORIES = [
  "leader",
  "champion",
  "prospect",
  "ganger",
  "juve",
  "crew",
  "hanger_on",
  "brute",
] as const;

export function AddFighterForm() {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    addFighter,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Input id="type" name="type" placeholder="e.g.: Gunner" required />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue="ganger">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="baseCost">Base cost (c)</Label>
          <Input
            id="baseCost"
            name="baseCost"
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
        <Button type="submit" pending={pending}>
          {pending ? "Recruiting..." : "Recruit fighter"}
        </Button>
      </div>
    </form>
  );
}
