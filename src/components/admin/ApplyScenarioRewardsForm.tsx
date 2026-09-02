"use client";

import { useActionState } from "react";
import {
  applyScenarioRewards,
  type CampaignState,
} from "@/app/admin/campaign/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { getScenario, diceBounds } from "@/lib/data/scenarios";

/** One rolled-value input, bounded by its dice label. */
function RolledInput({
  id,
  name,
  label,
  dice,
}: {
  id: string;
  name: string;
  label: string;
  dice: string;
}) {
  const bounds = diceBounds(dice);
  return (
    <div className="w-40">
      <Label htmlFor={id}>
        {label} ({dice})
      </Label>
      <Input
        id={id}
        name={name}
        type="number"
        min={bounds?.min}
        max={bounds?.max}
        step={bounds?.step}
        required
        className="h-9"
      />
    </div>
  );
}

/**
 * Applies a scenario's standard rewards to ONE resolved challenge (issue
 * #87): the inputs are pre-bounded by the catalogue's dice labels, the
 * Arbitrator types the table's rolled results, and the server emits the
 * battle_event rows (#69) once per challenge. Per-fighter XP goes through
 * the aftermath panel as always.
 */
export function ApplyScenarioRewardsForm({
  challengeId,
  scenarioId,
  outcome,
  challengerName,
  challengedName,
}: {
  challengeId: string;
  scenarioId: string;
  /** "challenger_win" | "challenged_win" | "draw" (declined never renders). */
  outcome: string;
  challengerName: string;
  /** Null when the challenge had no defender (free Sympathiser). */
  challengedName: string | null;
}) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    applyScenarioRewards,
    {},
  );

  const scenario = getScenario(scenarioId);
  if (!scenario) return null;
  const r = scenario.rewards;

  const isDraw = outcome === "draw";
  const winnerIsChallenger = outcome === "challenger_win";
  const winnerName = winnerIsChallenger ? challengerName : challengedName;
  const loserName = winnerIsChallenger ? challengedName : challengerName;

  const showWinnerCredits =
    !isDraw &&
    !!r.creditsWinner &&
    !(r.winnerCreditsOnlyAttacker && !winnerIsChallenger);
  const showLoserCredits = !isDraw && !!r.creditsLoser && !!loserName;
  const showRepWinner =
    !isDraw && !!r.repWinner && !(r.repWinnerOnlyDefender && winnerIsChallenger);
  const showDraw = isDraw && !!r.creditsDraw;

  const nothingStandard =
    !showWinnerCredits && !showLoserCredits && !showRepWinner && !showDraw &&
    r.repBottled === 0;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="challengeId" value={challengeId} />

      {nothingStandard ? (
        <p className="m-0 text-xs text-muted">
          {scenario.name} has no standard reward line for this outcome —
          record everything through the aftermath events below.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            {showWinnerCredits && (
              <RolledInput
                id={`rw-cw-${challengeId}`}
                name="creditsWinner"
                label={`${winnerName ?? "Winner"} credits`}
                dice={r.creditsWinner!}
              />
            )}
            {showLoserCredits && (
              <RolledInput
                id={`rw-cl-${challengeId}`}
                name="creditsLoser"
                label={`${loserName} credits`}
                dice={r.creditsLoser!}
              />
            )}
            {showDraw && (
              <>
                <RolledInput
                  id={`rw-dc-${challengeId}`}
                  name="creditsDrawChallenger"
                  label={`${challengerName} credits`}
                  dice={r.creditsDraw!}
                />
                {challengedName && (
                  <RolledInput
                    id={`rw-dd-${challengeId}`}
                    name="creditsDrawChallenged"
                    label={`${challengedName} credits`}
                    dice={r.creditsDraw!}
                  />
                )}
              </>
            )}
            {showRepWinner && (
              <RolledInput
                id={`rw-rep-${challengeId}`}
                name="repWinner"
                label={`${winnerName ?? "Winner"} Reputation`}
                dice={r.repWinner!}
              />
            )}
          </div>

          {r.repBottled !== 0 && (
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
              <span>Bottled out ({r.repBottled} Rep):</span>
              <label className="flex items-center gap-1">
                <input type="checkbox" name="bottledChallenger" />
                {challengerName}
              </label>
              {challengedName && (
                <label className="flex items-center gap-1">
                  <input type="checkbox" name="bottledChallenged" />
                  {challengedName}
                </label>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" pending={pending} variant="outline" className="h-9">
              {pending ? "..." : "Apply scenario rewards"}
            </Button>
            <span className="text-xs text-muted">
              once per challenge · {r.xpEach} XP per participant and scenario
              XP extras go through the aftermath events
            </span>
          </div>
        </>
      )}

      <div role="status" aria-live="polite">
        {state.error && <p className="text-xs text-blood">{state.error}</p>}
        {state.success && <p className="text-xs text-toxic">{state.success}</p>}
      </div>
    </form>
  );
}
