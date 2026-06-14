"use client";

import { useActionState } from "react";
import {
  assignSympathiser,
  type CampaignState,
} from "@/app/admin/campaign/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";

type GangOption = { id: string; name: string };

export function SympathiserAssignForm({
  sympathiserId,
  currentGangId,
  gangs,
}: {
  sympathiserId: string;
  /** ID of the gang currently in control, or null if free. */
  currentGangId: string | null;
  gangs: GangOption[];
}) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    assignSympathiser,
    {},
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="sympathiserId" value={sympathiserId} />
      <Select
        name="gangId"
        defaultValue={currentGangId ?? ""}
        className="h-8 flex-1 text-xs"
      >
        <option value="">— free —</option>
        {gangs.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </Select>
      <Button
        type="submit"
        variant="outline"
        disabled={pending}
        className="h-8 shrink-0 px-2 text-xs"
      >
        {pending ? "..." : "Assign"}
      </Button>
      {state.error && (
        <span className="text-xs text-blood">{state.error}</span>
      )}
      {state.success && (
        <span className="text-xs text-toxic">{state.success}</span>
      )}
    </form>
  );
}
