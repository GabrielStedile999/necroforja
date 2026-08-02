"use client";

import { useActionState } from "react";
import {
  setCampaignCycle,
  type CampaignState,
} from "@/app/admin/campaign/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

/**
 * Jumps the campaign to a specific cycle (issue #66 follow-up) — the regret
 * button for a mis-clicked "Advance cycle". Backwards jumps do NOT restore
 * fighters already reset by Downtime (lossy); the hint below says so.
 */
export function SetCycleForm({
  campaignId,
  currentCycle,
  totalCycles,
}: {
  campaignId: string;
  currentCycle: number;
  totalCycles: number;
}) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    setCampaignCycle,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="campaignId" value={campaignId} />
      <div className="flex items-end gap-2">
        <div>
          <Label htmlFor="set-cycle">Set cycle</Label>
          <Input
            id="set-cycle"
            name="cycle"
            type="number"
            min={1}
            max={totalCycles}
            defaultValue={currentCycle}
            className="w-24"
            onKeyDown={(e) => {
              if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                e.preventDefault();
              }
            }}
            required
          />
        </div>
        <Button type="submit" variant="outline" pending={pending}>
          {pending ? "Moving..." : "Set"}
        </Button>
      </div>
      <p className="text-xs text-muted">
        Jump forwards or backwards (phase re-derives). Rewinding does not
        restore fighters already reset by Downtime.
      </p>
      {state.error && (
        <p className="text-xs text-blood">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-toxic">{state.success}</p>
      )}
    </form>
  );
}
