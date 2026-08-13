"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addInjury, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  INJURY_PRESETS,
  STAT_KEYS,
  STAT_LABEL,
} from "@/lib/data/advancements";

/**
 * Record-lasting-injury form (issue #71). The D66 roll happens at the
 * table; here the result is recorded — a preset (name + effects come from
 * the server config) or a custom entry with an optional −1 stat penalty.
 */
export function InjuryForm({
  fighterId,
  gangId,
}: {
  fighterId: string;
  gangId: string;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    addInjury,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [preset, setPreset] = useState<string>(INJURY_PRESETS[0]?.id ?? "");
  const isCustom = preset === "";

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="fighterId" value={fighterId} />
      <input type="hidden" name="gangId" value={gangId} />

      <div className="flex flex-wrap items-end gap-2">
        <div className="w-52">
          <Label htmlFor={`inj-preset-${fighterId}`}>Lasting injury</Label>
          <Select
            id={`inj-preset-${fighterId}`}
            name="preset"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="h-9"
          >
            {INJURY_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.effects.length > 0
                  ? ` (${p.effects
                      .map(
                        (ef) =>
                          `${STAT_LABEL[ef.stat]} ${ef.improvement > 0 ? "+" : "−"}1`,
                      )
                      .join(", ")})`
                  : ""}
              </option>
            ))}
            <option value="">Custom…</option>
          </Select>
        </div>

        {isCustom && (
          <>
            <div className="min-w-36 flex-1">
              <Label htmlFor={`inj-name-${fighterId}`}>Name</Label>
              <Input
                id={`inj-name-${fighterId}`}
                name="name"
                maxLength={80}
                placeholder="e.g. Crushed Fingers"
                required
                className="h-9"
              />
            </div>
            <div className="w-36">
              <Label htmlFor={`inj-stat-${fighterId}`}>Penalty (−1)</Label>
              <Select
                id={`inj-stat-${fighterId}`}
                name="statKey"
                defaultValue=""
                className="h-9"
              >
                <option value="">No stat effect</option>
                {STAT_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {STAT_LABEL[k]} −1
                  </option>
                ))}
              </Select>
            </div>
          </>
        )}

        <div className="min-w-36 flex-1">
          <Label htmlFor={`inj-notes-${fighterId}`}>Notes (optional)</Label>
          <Input
            id={`inj-notes-${fighterId}`}
            name="notes"
            maxLength={300}
            placeholder="e.g. vs Iron Reapers, C3"
            className="h-9"
          />
        </div>

        <Button type="submit" pending={pending} variant="outline" className="h-9">
          {pending ? "..." : "Record"}
        </Button>
      </div>

      <div role="status" aria-live="polite">
        {state.error && <p className="text-xs text-blood">{state.error}</p>}
        {state.success && <p className="text-xs text-toxic">{state.success}</p>}
      </div>
    </form>
  );
}
