"use client";

import { useActionState } from "react";
import {
  grantFreshRecruitment,
  type CampaignState,
} from "@/app/admin/campaign/actions";
import { Button } from "@/components/ui/button";

/**
 * Downtime step D — Fresh Recruitment (issue #83): one click credits the
 * configured amount to every active gang's Stash, once per campaign. The
 * server holds the one-shot guard; this form only reflects it (disabled
 * once granted) and shows the outcome.
 */
export function FreshRecruitmentForm({
  campaignId,
  credits,
  activeGangCount,
  grantedAt,
}: {
  campaignId: string;
  credits: number;
  activeGangCount: number;
  /** ISO date-time of the grant; null = not granted yet. */
  grantedAt: string | null;
}) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    grantFreshRecruitment,
    {},
  );
  const granted = grantedAt !== null;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="campaignId" value={campaignId} />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="outline"
          pending={pending}
          disabled={granted || activeGangCount === 0}
          aria-describedby="fresh-recruitment-hint"
        >
          {pending
            ? "Granting..."
            : `Grant ${credits}c to ${activeGangCount} active gang${activeGangCount === 1 ? "" : "s"}`}
        </Button>
        {granted && (
          <span className="font-mono text-xs uppercase tracking-wider text-toxic">
            granted{" "}
            {/* ISO date slice: identical on server and client (no hydration drift) */}
            <time dateTime={grantedAt}>{grantedAt.slice(0, 10)}</time>
          </span>
        )}
      </div>
      <p id="fresh-recruitment-hint" className="text-xs text-muted">
        One-shot per campaign. The credits land in each Stash — the book says
        they must be spent right away, so police leftovers at the table.
      </p>
      {state.error && (
        <p className="text-xs text-blood" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-xs text-toxic" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}
