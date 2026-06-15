"use client";

import { useActionState, useState } from "react";
import { updateFighterStatus, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import type { FighterStatus } from "@/types";

const STATUS_OPTIONS: { value: FighterStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "in_recovery", label: "In recovery" },
  { value: "injured", label: "Injured" },
  { value: "captured", label: "Captured" },
  { value: "dead", label: "Dead" },
];

interface GangOption {
  id: string;
  name: string;
}

export function UpdateFighterStatusForm({
  fighterId,
  currentStatus,
  otherGangs,
}: {
  fighterId: string;
  currentStatus: FighterStatus;
  otherGangs: GangOption[];
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    updateFighterStatus,
    {},
  );

  // Controls display of the capturing gang selector.
  const [showCapture, setShowCapture] = useState(
    currentStatus === "captured",
  );

  // Reset the selector when the status from the server changes — React's
  // "adjust state during render" pattern (no effect, no cascading render).
  const [prevStatus, setPrevStatus] = useState(currentStatus);
  if (currentStatus !== prevStatus) {
    setPrevStatus(currentStatus);
    setShowCapture(currentStatus === "captured");
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="fighterId" value={fighterId} />

      <div className="flex flex-wrap items-end gap-2">
        <div>
          <Label htmlFor={`status-${fighterId}`}>Status</Label>
          <Select
            id={`status-${fighterId}`}
            name="status"
            defaultValue={currentStatus}
            onChange={(e) =>
              setShowCapture(e.target.value === "captured")
            }
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        {showCapture && otherGangs.length > 0 && (
          <div>
            <Label htmlFor={`captor-${fighterId}`}>Captured by</Label>
            <Select id={`captor-${fighterId}`} name="capturedByGangId">
              <option value="">— no gang —</option>
              {otherGangs.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <Button type="submit" disabled={pending} variant="outline">
          {pending ? "Saving..." : "Update"}
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
