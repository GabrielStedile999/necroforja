"use client";

import { useActionState } from "react";
import {
  createCampaign,
  updateCampaign,
  type CampaignState,
} from "@/app/admin/campaign/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function Feedback({ state }: { state: CampaignState }) {
  if (state.error) {
    return (
      <p className="rounded-sm border border-blood/40 bg-blood/15 px-3 py-2 text-sm text-blood">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-sm border border-toxic/40 bg-toxic/10 px-3 py-2 text-sm text-toxic">
        {state.success}
      </p>
    );
  }
  return null;
}

function CampaignFields({
  idPrefix,
  defaults,
}: {
  idPrefix: string;
  defaults?: {
    name?: string;
    totalCycles?: number;
    startDate?: string | null;
    endDate?: string | null;
  };
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-name`}>Campaign name</Label>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          defaultValue={defaults?.name}
          placeholder="e.g.: Cinderak Burning II"
          required
        />
      </div>
      <div>
        <Label
          htmlFor={`${idPrefix}-cycles`}
          title="3 to 14 — the single Downtime cycle sits in the middle (7 cycles = the official 3/1/3 shape)"
        >
          Total cycles
        </Label>
        <Input
          id={`${idPrefix}-cycles`}
          name="totalCycles"
          type="number"
          min={3}
          max={14}
          defaultValue={defaults?.totalCycles ?? 7}
          onKeyDown={(e) => {
            if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
              e.preventDefault();
            }
          }}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-start`}>Start date</Label>
        <Input
          id={`${idPrefix}-start`}
          name="startDate"
          type="date"
          defaultValue={defaults?.startDate ?? ""}
        />
      </div>
      <div className="sm:col-start-4">
        <Label htmlFor={`${idPrefix}-end`}>End date</Label>
        <Input
          id={`${idPrefix}-end`}
          name="endDate"
          type="date"
          defaultValue={defaults?.endDate ?? ""}
        />
      </div>
    </div>
  );
}

/**
 * Starts a new campaign from the UI (issue #66) — shown when there is no
 * active campaign (none yet, or the previous one was finished). The server
 * enforces one active campaign at a time.
 */
export function CreateCampaignForm() {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    createCampaign,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <CampaignFields idPrefix="new-campaign" />
      <Feedback state={state} />
      <div>
        <Button type="submit" pending={pending}>
          {pending ? "Starting..." : "Start campaign"}
        </Button>
      </div>
    </form>
  );
}

/** Edits the campaign's name, dates and length (issue #66). */
export function EditCampaignForm({
  campaign,
}: {
  campaign: {
    id: string;
    name: string;
    totalCycles: number;
    startDate: string | null;
    endDate: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    updateCampaign,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="campaignId" value={campaign.id} />
      <CampaignFields idPrefix={`edit-campaign-${campaign.id}`} defaults={campaign} />
      <Feedback state={state} />
      <div>
        <Button variant="outline" type="submit" pending={pending}>
          {pending ? "Saving..." : "Save campaign"}
        </Button>
      </div>
    </form>
  );
}
