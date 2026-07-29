"use client";

import { useActionState } from "react";
import { awardTriumph, type CampaignState } from "@/app/admin/campaign/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

type GangOption = { id: string; name: string };

export function AwardTriumphForm({ gangs }: { gangs: GangOption[] }) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    awardTriumph,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Triumph title</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Warlord of the Underhive"
            required
          />
        </div>
        <div>
          <Label htmlFor="gangId">Awarded to (optional)</Label>
          <Select id="gangId" name="gangId">
            <option value="">— Campaign-wide —</option>
            {gangs.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
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
          {pending ? "Awarding…" : "Award Triumph"}
        </Button>
      </div>
    </form>
  );
}
