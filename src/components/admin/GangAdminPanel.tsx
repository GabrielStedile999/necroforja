"use client";

import { useActionState } from "react";
import {
  updateGang,
  transferGang,
  deleteGang,
  type GangAdminState,
} from "@/app/admin/gangs/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

interface CandidateOption {
  id: string;
  displayName: string;
}

function Feedback({ state }: { state: GangAdminState }) {
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

/**
 * Gang identity administration (issue #64): edit name/house/Reputation,
 * transfer ownership (or release), and delete with type-to-confirm.
 * One instance per gang row in the admin dashboard — ids are suffixed
 * with the gang id.
 */
export function GangAdminPanel({
  gang,
  candidates,
}: {
  gang: { id: string; name: string; house: string; reputation: number };
  /** Players able to RECEIVE the gang (no gang of their own). */
  candidates: CandidateOption[];
}) {
  const [editState, editAction, editPending] = useActionState<
    GangAdminState,
    FormData
  >(updateGang, {});
  const [transferState, transferAction, transferPending] = useActionState<
    GangAdminState,
    FormData
  >(transferGang, {});
  const [deleteState, deleteAction, deletePending] = useActionState<
    GangAdminState,
    FormData
  >(deleteGang, {});

  return (
    <div className="flex flex-col gap-6">
      {/* ---- Identity + Reputation ---- */}
      <form action={editAction} className="flex flex-col gap-3">
        <input type="hidden" name="gangId" value={gang.id} />
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Label htmlFor={`gang-name-${gang.id}`}>Gang name</Label>
            <Input
              id={`gang-name-${gang.id}`}
              name="name"
              defaultValue={gang.name}
              required
            />
          </div>
          <div>
            <Label htmlFor={`gang-house-${gang.id}`}>House</Label>
            <Input
              id={`gang-house-${gang.id}`}
              name="house"
              defaultValue={gang.house}
              required
            />
          </div>
          <div>
            <Label
              htmlFor={`gang-rep-${gang.id}`}
              title="Reputation — the gang's prestige; starts at 1 and limits Hangers-on/Brutes"
            >
              Reputation
            </Label>
            <Input
              id={`gang-rep-${gang.id}`}
              name="reputation"
              type="number"
              min={1}
              max={20}
              defaultValue={gang.reputation}
              onKeyDown={(e) => {
                if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              required
            />
          </div>
        </div>
        <Feedback state={editState} />
        <div>
          <Button variant="outline" type="submit" pending={editPending}>
            {editPending ? "Saving..." : "Save gang"}
          </Button>
        </div>
      </form>

      {/* ---- Transfer / release ---- */}
      <form action={transferAction} className="flex flex-col gap-3">
        <input type="hidden" name="gangId" value={gang.id} />
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Label htmlFor={`gang-owner-${gang.id}`}>Transfer to</Label>
            <Select id={`gang-owner-${gang.id}`} name="newOwnerUserId">
              <option value="">— release (no owner) —</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="outline" type="submit" pending={transferPending}>
            {transferPending ? "Transferring..." : "Transfer"}
          </Button>
        </div>
        <Feedback state={transferState} />
      </form>

      {/* ---- Delete (type-to-confirm) ---- */}
      <form action={deleteAction} className="flex flex-col gap-3">
        <input type="hidden" name="gangId" value={gang.id} />
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Label htmlFor={`gang-del-${gang.id}`} className="text-blood">
              Delete gang — type &quot;{gang.name}&quot; to confirm
            </Label>
            <Input
              id={`gang-del-${gang.id}`}
              name="confirmName"
              placeholder={gang.name}
              autoComplete="off"
              required
            />
          </div>
          <Button
            variant="outline"
            type="submit"
            pending={deletePending}
            className="border-blood/60 text-blood hover:text-blood"
          >
            {deletePending ? "Deleting..." : "Delete gang"}
          </Button>
        </div>
        <p className="text-xs text-muted">
          Irreversible: fighters, equipment, stash, challenges and control
          history are removed with the gang.
        </p>
        <Feedback state={deleteState} />
      </form>
    </div>
  );
}
