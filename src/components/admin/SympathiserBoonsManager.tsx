"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  importSympathiserBoons,
  deleteSympathiserBoon,
  type CatalogAdminState,
} from "@/app/admin/catalog/actions";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";

function StateMessages({ state }: { state: CatalogAdminState }) {
  return (
    <div role="status" aria-live="polite">
      {state.error && <p className="text-xs text-blood">{state.error}</p>}
      {state.success && <p className="text-xs text-toxic">{state.success}</p>}
    </div>
  );
}

/**
 * Paste-import for the rewritten Sympathiser boon summaries (issue #85) —
 * the keyword-rules IP flow: content comes from a private gitignored JSON
 * and lives only in the database. Upsert by sympathiser id.
 */
export function ImportSympathiserBoonsForm() {
  const [state, formAction, pending] = useActionState<
    CatalogAdminState,
    FormData
  >(importSympathiserBoons, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div>
        <Label htmlFor="boon-import">
          JSON array — [{"{"}&quot;sympathiserId&quot;, &quot;summary&quot;{"}"}, …]
        </Label>
        <Textarea
          id="boon-import"
          name="payload"
          className="min-h-[120px] font-mono text-xs"
          placeholder="Paste the content of sympathiser-boons.private.json here"
          required
        />
      </div>
      <StateMessages state={state} />
      <div className="flex items-center gap-3">
        <Button type="submit" pending={pending} variant="outline">
          {pending ? "Importing..." : "Import / update boons"}
        </Button>
        <span className="text-xs text-muted">
          Upsert by sympathiser id — safe to re-import after edits.
        </span>
      </div>
    </form>
  );
}

/** One imported summary with its delete button (re-import recreates it). */
export function SympathiserBoonRow({
  boon,
}: {
  boon: { id: string; sympathiserId: string; name: string; summary: string };
}) {
  const [state, formAction, pending] = useActionState<
    CatalogAdminState,
    FormData
  >(deleteSympathiserBoon, {});

  return (
    <div className="flex flex-col gap-1 border-b border-rivet/40 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium text-ink">{boon.name}</p>
          <p className="m-0 text-sm text-muted">{boon.summary}</p>
        </div>
        <form action={formAction}>
          <input type="hidden" name="sympathiserBoonId" value={boon.id} />
          <Button
            type="submit"
            pending={pending}
            variant="ghost"
            className="h-7 px-2 text-xs text-blood hover:text-blood"
          >
            Remove
          </Button>
        </form>
      </div>
      <StateMessages state={state} />
    </div>
  );
}
