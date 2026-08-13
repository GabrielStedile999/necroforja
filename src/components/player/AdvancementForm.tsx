"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { buyAdvancement, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  STAT_ADVANCEMENTS,
  SKILL_ADVANCEMENTS,
  STAT_KEYS,
  STAT_LABEL,
  SKILL_TIER_KEYS,
  type StatKey,
  type SkillTier,
} from "@/lib/data/advancements";

/**
 * Buy-advancement form (issue #71): stat bump or recorded skill. Costs
 * shown come from the shared config, but the SERVER recomputes them
 * (including the repeat surcharge) — the form never posts a price.
 */
export function AdvancementForm({
  fighterId,
  gangId,
  xp,
}: {
  fighterId: string;
  gangId: string;
  /** Fighter's current XP — display only. */
  xp: number;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    buyAdvancement,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<"stat_increase" | "skill">("stat_increase");
  const [statKey, setStatKey] = useState<StatKey>("wil");
  const [skillTier, setSkillTier] = useState<SkillTier>("primary_random");

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  const cost =
    kind === "stat_increase"
      ? STAT_ADVANCEMENTS[statKey]
      : SKILL_ADVANCEMENTS[skillTier];

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="fighterId" value={fighterId} />
      <input type="hidden" name="gangId" value={gangId} />

      <div className="flex flex-wrap items-end gap-2">
        <div className="w-36">
          <Label htmlFor={`adv-kind-${fighterId}`}>Advancement</Label>
          <Select
            id={`adv-kind-${fighterId}`}
            name="kind"
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as "stat_increase" | "skill")
            }
            className="h-9"
          >
            <option value="stat_increase">Characteristic +1</option>
            <option value="skill">Skill</option>
          </Select>
        </div>

        {kind === "stat_increase" ? (
          <div className="w-40">
            <Label htmlFor={`adv-stat-${fighterId}`}>Characteristic</Label>
            <Select
              id={`adv-stat-${fighterId}`}
              name="statKey"
              value={statKey}
              onChange={(e) => setStatKey(e.target.value as StatKey)}
              className="h-9"
            >
              {STAT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {STAT_LABEL[k]} — {STAT_ADVANCEMENTS[k].xpCost} XP
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <>
            <div className="w-52">
              <Label htmlFor={`adv-tier-${fighterId}`}>Skill access</Label>
              <Select
                id={`adv-tier-${fighterId}`}
                name="skillTier"
                value={skillTier}
                onChange={(e) => setSkillTier(e.target.value as SkillTier)}
                className="h-9"
              >
                {SKILL_TIER_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {SKILL_ADVANCEMENTS[k].label} — {SKILL_ADVANCEMENTS[k].xpCost} XP
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-40 flex-1">
              <Label htmlFor={`adv-skill-${fighterId}`}>Skill name</Label>
              <Input
                id={`adv-skill-${fighterId}`}
                name="skillName"
                maxLength={60}
                placeholder="e.g. Nerves of Steel"
                required
                className="h-9"
              />
            </div>
          </>
        )}

        <Button type="submit" pending={pending} variant="outline" className="h-9">
          {pending ? "..." : `Buy (${cost.xpCost} XP)`}
        </Button>
      </div>

      <p className="text-xs text-muted">
        XP available: <span className="font-mono text-ink">{xp}</span> · cost{" "}
        {cost.xpCost} XP · fighter cost +{cost.creditIncrease}c. Repeats of the
        same characteristic cost +2 XP each (Juves/Prospects exempt). Dice are
        rolled at the table — record the result here.
      </p>

      <div role="status" aria-live="polite">
        {state.error && <p className="text-xs text-blood">{state.error}</p>}
        {state.success && <p className="text-xs text-toxic">{state.success}</p>}
      </div>
    </form>
  );
}
