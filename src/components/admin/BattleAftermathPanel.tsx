"use client";

import { useId, useState } from "react";
import { useActionState } from "react";
import {
  recordBattleEvent,
  type CampaignState,
} from "@/app/admin/campaign/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { BattleEventKind } from "@/lib/validation";

type GangOption = { id: string; name: string };
type FighterOption = { id: string; name: string; status: string };

const KIND_LABEL: Record<BattleEventKind, string> = {
  credits_gained: "Credits (±)",
  xp_gained: "XP (±)",
  fighter_injured: "Fighter injured",
  fighter_dead: "Fighter died",
  fighter_captured: "Fighter captured",
  reputation_change: "Reputation (±)",
};

const FIGHTER_KINDS: BattleEventKind[] = [
  "xp_gained",
  "fighter_injured",
  "fighter_dead",
  "fighter_captured",
];

const AMOUNT_KINDS: BattleEventKind[] = [
  "credits_gained",
  "xp_gained",
  "reputation_change",
];

/**
 * Aftermath entry form for ONE resolved challenge (issue #69): the
 * Arbitrator logs what the battle did — credits, XP, injuries, deaths,
 * captures, reputation — one event per submit. The kind decides which
 * fields show (fighter selector, ± amount); mistakes are corrected with a
 * compensating event (negative amount), never by editing the log.
 */
export function BattleAftermathPanel({
  challengeId,
  gangs,
  fightersByGang,
}: {
  challengeId: string;
  /** Participants of the challenge only. */
  gangs: GangOption[];
  fightersByGang: Record<string, FighterOption[]>;
}) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    recordBattleEvent,
    {},
  );
  const [kind, setKind] = useState<BattleEventKind>("credits_gained");
  const [gangId, setGangId] = useState(gangs[0]?.id ?? "");
  const uid = useId();

  const needsFighter = FIGHTER_KINDS.includes(kind);
  const needsAmount = AMOUNT_KINDS.includes(kind);
  const fighters = fightersByGang[gangId] ?? [];

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-2"
      aria-label="Log battle aftermath event"
    >
      <input type="hidden" name="challengeId" value={challengeId} />

      <div className="w-40">
        <Label htmlFor={`${uid}-gang`}>Gang</Label>
        <Select
          id={`${uid}-gang`}
          name="gangId"
          value={gangId}
          onChange={(e) => setGangId(e.target.value)}
          className="h-9"
        >
          {gangs.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-44">
        <Label htmlFor={`${uid}-kind`}>Event</Label>
        <Select
          id={`${uid}-kind`}
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as BattleEventKind)}
          className="h-9"
        >
          {(Object.keys(KIND_LABEL) as BattleEventKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </Select>
      </div>

      {needsFighter && (
        <div className="w-44">
          <Label htmlFor={`${uid}-fighter`}>Fighter</Label>
          <Select
            id={`${uid}-fighter`}
            name="fighterId"
            className="h-9"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Select…
            </option>
            {fighters.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
                {f.status !== "active" ? ` (${f.status.replace(/_/g, " ")})` : ""}
              </option>
            ))}
          </Select>
        </div>
      )}

      {needsAmount && (
        <div className="w-28">
          <Label htmlFor={`${uid}-amount`}>Amount ±</Label>
          <Input
            id={`${uid}-amount`}
            name="amount"
            type="number"
            step={1}
            required
            placeholder={kind === "credits_gained" ? "120" : "3"}
            className="h-9"
          />
        </div>
      )}

      <div className="min-w-40 flex-1">
        <Label htmlFor={`${uid}-notes`}>Notes (optional)</Label>
        <Input
          id={`${uid}-notes`}
          name="notes"
          maxLength={300}
          placeholder="e.g. scenario reward"
          className="h-9"
        />
      </div>

      <Button type="submit" variant="outline" pending={pending} className="h-9">
        {pending ? "..." : "Log event"}
      </Button>

      <div className="basis-full" role="status" aria-live="polite">
        {state.error && <span className="text-xs text-blood">{state.error}</span>}
        {state.success && (
          <span className="text-xs text-toxic">{state.success}</span>
        )}
      </div>
    </form>
  );
}
