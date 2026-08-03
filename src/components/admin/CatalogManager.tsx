"use client";

/**
 * /admin/catalog client widgets (issue #67) — the Arbitrator's master list
 * of Trading Post equipment. Every item is a <details> dropdown whose body
 * is a full edit form (fix a transcription, rebalance a cost, disable or
 * delete), plus a create form and the one-off official-seed button.
 *
 * Owned gear snapshots name/cost at acquisition: edits here only affect
 * FUTURE acquisitions.
 */

import { useState, useActionState, useRef, useEffect } from "react";
import {
  createCatalogItem,
  updateCatalogItem,
  toggleCatalogItem,
  deleteCatalogItem,
  seedOfficialCatalog,
  type CatalogAdminState,
} from "@/app/admin/catalog/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KeywordChips, type KeywordRuleMap } from "@/components/rules/KeywordChips";

export interface CatalogItemView {
  id: string;
  name: string;
  category: "weapon" | "wargear" | "skill" | "armour" | "upgrade";
  subcategory: string | null;
  cost: number;
  rangeShort: string | null;
  rangeLong: string | null;
  accShort: string | null;
  accLong: string | null;
  strength: string | null;
  ap: string | null;
  damage: string | null;
  ammo: string | null;
  traits: string;
  effect: string;
  enabled: boolean;
}

const CATEGORIES = ["weapon", "wargear", "armour", "upgrade"] as const;

const SUBCATEGORIES = [
  ["", "—"],
  ["basic", "Basic"],
  ["pistol", "Pistol"],
  ["special", "Special"],
  ["heavy", "Heavy"],
  ["close_combat", "Close combat"],
  ["grenade", "Grenade"],
] as const;

/** The printed weapon profile header (Rng S/L · Acc S/L · Str AP D Am). */
const PROFILE_FIELDS = [
  ["rangeShort", "Rng S"],
  ["rangeLong", "Rng L"],
  ["accShort", "Acc S"],
  ["accLong", "Acc L"],
  ["strength", "Str"],
  ["ap", "AP"],
  ["damage", "D"],
  ["ammo", "Am"],
] as const;

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

/**
 * The shared field set of the create and edit forms. The weapon profile grid
 * only renders for weapons — picking another category hides (and on submit
 * clears) the profile cells.
 */
function CatalogFields({
  idPrefix,
  item,
}: {
  idPrefix: string;
  item?: CatalogItemView;
}) {
  const [category, setCategory] = useState<string>(item?.category ?? "weapon");
  const isWeapon = category === "weapon";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-name`}>Name</Label>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            defaultValue={item?.name ?? ""}
            placeholder="e.g.: Boltgun"
            required
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-category`}>Category</Label>
          <Select
            id={`${idPrefix}-category`}
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-cost`}>Cost (c)</Label>
          <Input
            id={`${idPrefix}-cost`}
            name="cost"
            type="number"
            min={0}
            max={9999}
            defaultValue={item?.cost ?? 0}
            required
          />
        </div>
      </div>

      {isWeapon && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor={`${idPrefix}-subcategory`}>Weapon type</Label>
              <Select
                id={`${idPrefix}-subcategory`}
                name="subcategory"
                defaultValue={item?.subcategory ?? ""}
              >
                {SUBCATEGORIES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {/* 2 columns on mobile, 4 on sm+ (same pattern as the fighter card) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PROFILE_FIELDS.map(([name, label]) => (
              <div key={name}>
                <Label htmlFor={`${idPrefix}-${name}`}>{label}</Label>
                <Input
                  id={`${idPrefix}-${name}`}
                  name={name}
                  maxLength={12}
                  defaultValue={item?.[name] ?? ""}
                  placeholder="-"
                />
              </div>
            ))}
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-traits`}>Traits</Label>
            <Input
              id={`${idPrefix}-traits`}
              name="traits"
              maxLength={300}
              defaultValue={item?.traits ?? ""}
              placeholder="e.g.: Rapid Fire (1), Knockback"
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor={`${idPrefix}-effect`}>Effect / notes</Label>
        <Input
          id={`${idPrefix}-effect`}
          name="effect"
          maxLength={1000}
          defaultValue={item?.effect ?? ""}
          placeholder="e.g.: 5+ save · alternate profile notes · house rules"
        />
      </div>
    </div>
  );
}

/* ------------------------- Create + seed ---------------------------- */

export function CreateCatalogItemForm() {
  const [state, formAction, pending] = useActionState<CatalogAdminState, FormData>(
    createCatalogItem,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <CatalogFields idPrefix="cat-new" />
      <StateMessages state={state} />
      <div>
        <Button type="submit" pending={pending} variant="outline">
          {pending ? "Creating..." : "Create item"}
        </Button>
      </div>
    </form>
  );
}

export function SeedCatalogButton() {
  const [state, formAction, pending] = useActionState<CatalogAdminState, FormData>(
    seedOfficialCatalog,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <StateMessages state={state} />
      <div>
        <Button type="submit" pending={pending} variant="outline">
          {pending ? "Seeding..." : "Seed official catalogue"}
        </Button>
      </div>
      <p className="text-xs text-muted">
        Inserts the Core Rulebook Trading Post items that are not in the list
        yet. Existing entries (including your edits) are never touched — safe
        to press again.
      </p>
    </form>
  );
}

/* --------------------------- Item editor ---------------------------- */

/** Compact one-line profile summary shown on the closed dropdown. */
function profileSummary(item: CatalogItemView): string {
  if (item.category !== "weapon") return item.effect;
  const cells = [
    item.rangeShort && `${item.rangeShort}/${item.rangeLong ?? "-"}`,
    item.strength && `S${item.strength}`,
    item.ap && `AP${item.ap}`,
    item.damage && `D${item.damage}`,
    item.ammo && `Am ${item.ammo}`,
  ].filter(Boolean);
  return cells.join(" · ");
}

export function CatalogItemEditor({
  item,
  keywordRules = {},
}: {
  item: CatalogItemView;
  /** keywordKey → rule map (from the database) for the clickable chips. */
  keywordRules?: KeywordRuleMap;
}) {
  const [state, formAction, pending] = useActionState<CatalogAdminState, FormData>(
    updateCatalogItem,
    {},
  );
  const [deleteState, deleteAction, deletePending] = useActionState<
    CatalogAdminState,
    FormData
  >(deleteCatalogItem, {});
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <details
      className={`group rounded-sm border border-rivet/60 bg-elevated/30 ${
        item.enabled ? "" : "opacity-60"
      }`}
    >
      <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-elevated/60">
        <span className="font-medium text-ink">{item.name}</span>
        {!item.enabled && <Badge variant="muted">disabled</Badge>}
        <span className="ml-auto flex items-center gap-3 text-xs text-muted">
          <span className="hidden font-mono sm:inline">
            {profileSummary(item)}
          </span>
          <span className="font-mono text-hazard">{item.cost}c</span>
        </span>
      </summary>

      <div className="flex flex-col gap-3 border-t border-rivet/50 px-3 py-3">
        {/* clickable keywords → rule modal (issue #67 follow-up) */}
        {item.traits && (
          <KeywordChips traits={item.traits} rules={keywordRules} />
        )}
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="catalogItemId" value={item.id} />
          <CatalogFields idPrefix={`cat-${item.id}`} item={item} />
          <StateMessages state={state} />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" pending={pending} variant="outline">
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 border-t border-rivet/40 pt-3">
          <form action={toggleCatalogItem}>
            <input type="hidden" name="catalogItemId" value={item.id} />
            <input type="hidden" name="enabled" value={String(item.enabled)} />
            <Button type="submit" variant="ghost" className="text-xs">
              {item.enabled ? "Disable (leave pick lists)" : "Enable"}
            </Button>
          </form>

          {/* Two-step delete — no browser confirm dialogs. */}
          {confirmDelete ? (
            <form action={deleteAction} className="flex items-center gap-2">
              <input type="hidden" name="catalogItemId" value={item.id} />
              <span className="text-xs text-blood">Delete permanently?</span>
              <Button
                type="submit"
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
            </form>
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
        <p className="text-xs text-muted">
          Gear already acquired keeps its purchase name/cost — edits here only
          affect future acquisitions. Prefer <em>Disable</em> over delete.
        </p>
      </div>
    </details>
  );
}
