import { requireUser } from "./guards";
import { getGangById, getGangByOwnerId } from "@/lib/db/queries";
import type { Gang } from "@/types";

export type GangResolution =
  | { gang: Gang; isAdmin: boolean }
  | { error: string };

/**
 * Single authorisation choke point for roster writes (issue #65 —
 * Arbitrator mode). Resolves WHICH gang a mutation may touch:
 *
 * - **Admin (Arbitrator)**: any gang, addressed explicitly via `gangId`
 *   (the admin owns no gang, so an explicit target is required).
 * - **Player**: always their own gang. A `gangId` sent by the client is
 *   only accepted when it matches their own — a tampered hidden field can
 *   never write to another gang.
 *
 * Every action in src/app/player/actions.ts goes through this helper, so
 * the per-resource ownership checks (fighterBelongsToGang, etc.) validate
 * against the gang resolved HERE.
 */
export async function resolveGangForWrite(
  gangId?: string | null,
): Promise<GangResolution> {
  const user = await requireUser();

  if (user.role === "admin") {
    if (!gangId) return { error: "Select a gang first (Arbitrator mode)." };
    const gang = await getGangById(gangId);
    return gang ? { gang, isAdmin: true } : { error: "Gang not found." };
  }

  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "You don't have a gang yet." };
  if (gangId && gangId !== gang.id) return { error: "Invalid gang." };
  return { gang, isAdmin: false };
}

/** Reads the optional `gangId` hidden field from a form payload. */
export function gangIdFromForm(formData: FormData): string | undefined {
  const raw = formData.get("gangId");
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}
