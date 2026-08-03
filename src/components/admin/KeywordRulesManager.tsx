"use client";

/**
 * Keyword glossary management (/admin/catalog, issue #67 follow-up).
 *
 * Every keyword is a <details> dropdown with a full edit form, plus a
 * create form and a JSON paste-import (upsert by keyword) fed from the
 * private gitignored file. Content lives ONLY in the database — the public
 * repo ships no rule text (see actions.ts for the full IP strategy note).
 */

import { useActionState, useRef, useEffect, useState } from "react";
import {
  createKeywordRule,
  updateKeywordRule,
  deleteKeywordRule,
  importKeywordRules,
  type CatalogAdminState,
} from "@/app/admin/catalog/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export interface KeywordRuleView {
  id: string;
  keyword: string;
  summary: string;
  book: string | null;
  page: number | null;
}

function StateMessages({ state }: { state: CatalogAdminState }) {
  return (
    <>
      {state.error && (
        <p className="rounded-sm border border-blood/40 bg-blood/15 px-3 py-2 text-sm text-blood">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-sm border border-toxic/40 bg-toxic/10 px-3 py-2 text-sm text-toxic">
          {state.success}
        </p>
      )}
    </>
  );
}

function KeywordFields({
  idPrefix,
  rule,
}: {
  idPrefix: string;
  rule?: KeywordRuleView;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2">
          <Label htmlFor={`${idPrefix}-keyword`}>Keyword</Label>
          <Input
            id={`${idPrefix}-keyword`}
            name="keyword"
            defaultValue={rule?.keyword ?? ""}
            placeholder='e.g.: Rapid Fire (no "(X)")'
            required
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-book`}>Book</Label>
          <Input
            id={`${idPrefix}-book`}
            name="book"
            defaultValue={rule?.book ?? ""}
            placeholder="Core Rulebook 2023"
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-page`}>Page</Label>
          <Input
            id={`${idPrefix}-page`}
            name="page"
            type="number"
            min={1}
            max={2000}
            defaultValue={rule?.page ?? ""}
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-summary`}>
          Summary (own words — never book text)
        </Label>
        <Textarea
          id={`${idPrefix}-summary`}
          name="summary"
          defaultValue={rule?.summary ?? ""}
          className="min-h-[90px]"
          required
        />
      </div>
    </div>
  );
}

export function CreateKeywordRuleForm() {
  const [state, formAction, pending] = useActionState<CatalogAdminState, FormData>(
    createKeywordRule,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <KeywordFields idPrefix="kw-new" />
      <StateMessages state={state} />
      <div>
        <Button type="submit" pending={pending} variant="outline">
          {pending ? "Creating..." : "Create keyword"}
        </Button>
      </div>
    </form>
  );
}

export function ImportKeywordRulesForm() {
  const [state, formAction, pending] = useActionState<CatalogAdminState, FormData>(
    importKeywordRules,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div>
        <Label htmlFor="kw-import">
          JSON array — [{"{"}&quot;keyword&quot;, &quot;summary&quot;, &quot;book&quot;?, &quot;page&quot;?{"}"}, …]
        </Label>
        <Textarea
          id="kw-import"
          name="payload"
          className="min-h-[120px] font-mono text-xs"
          placeholder='Paste the content of keyword-rules.private.json here'
          required
        />
      </div>
      <StateMessages state={state} />
      <div className="flex items-center gap-3">
        <Button type="submit" pending={pending} variant="outline">
          {pending ? "Importing..." : "Import / update keywords"}
        </Button>
        <span className="text-xs text-muted">
          Upsert by keyword — safe to re-import after edits.
        </span>
      </div>
    </form>
  );
}

export function KeywordRuleEditor({ rule }: { rule: KeywordRuleView }) {
  const [state, formAction, pending] = useActionState<CatalogAdminState, FormData>(
    updateKeywordRule,
    {},
  );
  const [deleteState, deleteAction, deletePending] = useActionState<
    CatalogAdminState,
    FormData
  >(deleteKeywordRule, {});
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <details className="group rounded-sm border border-rivet/60 bg-elevated/30">
      <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-elevated/60">
        <span className="font-medium text-ink">{rule.keyword}</span>
        <span className="ml-auto max-w-[60%] truncate text-xs text-muted">
          {rule.summary}
        </span>
      </summary>
      <div className="flex flex-col gap-3 border-t border-rivet/50 px-3 py-3">
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="keywordRuleId" value={rule.id} />
          <KeywordFields idPrefix={`kw-${rule.id}`} rule={rule} />
          <StateMessages state={state} />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" pending={pending} variant="outline">
              {pending ? "Saving..." : "Save changes"}
            </Button>
            {/* Two-step delete — no browser confirm dialogs. */}
            {confirmDelete ? (
              <span className="flex items-center gap-2">
                <span className="text-xs text-blood">Delete permanently?</span>
                <Button
                  type="submit"
                  formAction={deleteAction}
                  pending={deletePending}
                  variant="ghost"
                  className="text-xs text-blood"
                >
                  {deletePending ? "Deleting..." : "Yes, delete"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </span>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="ml-auto text-xs text-blood/80 hover:text-blood"
                onClick={() => setConfirmDelete(true)}
              >
                Delete…
              </Button>
            )}
          </div>
          <StateMessages state={deleteState} />
        </form>
      </div>
    </details>
  );
}
