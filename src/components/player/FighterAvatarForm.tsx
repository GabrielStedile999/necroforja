"use client";

import { useRef, useState, useActionState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  requestFighterAvatarUpload,
  confirmFighterAvatar,
  removeFighterAvatar,
  type PlayerState,
} from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import {
  FIGHTER_AVATAR_MAX_BYTES,
  FIGHTER_AVATAR_MIME_TYPES,
  FIGHTER_AVATAR_MIN_DIMENSION,
  FIGHTER_AVATAR_MAX_DIMENSION,
} from "@/lib/validation";

/** Reads intrinsic pixel size of a local file before uploading. */
async function readImageSize(
  file: File,
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("Could not read image dimensions."));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Fighter portrait upload (issue #63). Rules (see lib/validation.ts): a
 * LIGHT identification image — face/upper body of the mini — JPEG/PNG/WebP,
 * ≤2 MB, 100–2048px per side. Signed-upload flow (same as the gallery):
 * request URL → PUT straight to storage → confirm (server re-checks).
 */
export function FighterAvatarForm({
  fighterId,
  gangId,
  currentUrl,
  fighterName,
}: {
  fighterId: string;
  gangId: string;
  currentUrl: string | null;
  fighterName: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<PlayerState>({});
  const [removeState, removeAction, removePending] = useActionState<
    PlayerState,
    FormData
  >(removeFighterAvatar, {});

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMessage({ error: "Choose an image first." });
      return;
    }
    setMessage({});

    // Client-side gate (server re-validates size/type after the upload)
    if (
      !(FIGHTER_AVATAR_MIME_TYPES as readonly string[]).includes(file.type)
    ) {
      setMessage({ error: "Use a JPEG, PNG or WebP image." });
      return;
    }
    if (file.size > FIGHTER_AVATAR_MAX_BYTES) {
      setMessage({ error: "File too large (max 2 MB)." });
      return;
    }
    try {
      const { width, height } = await readImageSize(file);
      if (
        width < FIGHTER_AVATAR_MIN_DIMENSION ||
        height < FIGHTER_AVATAR_MIN_DIMENSION
      ) {
        setMessage({ error: "Image too small (min 100×100px)." });
        return;
      }
      if (
        width > FIGHTER_AVATAR_MAX_DIMENSION ||
        height > FIGHTER_AVATAR_MAX_DIMENSION
      ) {
        setMessage({
          error: "Image too big (max 2048px per side) — crop to the face/torso.",
        });
        return;
      }
    } catch {
      setMessage({ error: "Could not read the image." });
      return;
    }

    setBusy(true);
    try {
      const req = await requestFighterAvatarUpload({
        gangId,
        fighterId,
        mime: file.type,
        bytes: file.size,
      });
      if (!req.ok) {
        setMessage({ error: req.error });
        return;
      }

      const put = await fetch(req.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: file,
      });
      if (!put.ok) {
        setMessage({ error: `Storage rejected the upload (${put.status}).` });
        return;
      }

      const confirmed = await confirmFighterAvatar({
        gangId,
        fighterId,
        path: req.path,
      });
      setMessage(confirmed);
      if (confirmed.success) {
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  const feedback = message.error
    ? { text: message.error, error: true }
    : message.success
      ? { text: message.success, error: false }
      : removeState.error
        ? { text: removeState.error, error: true }
        : removeState.success
          ? { text: removeState.success, error: false }
          : null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        Portrait
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Image
          src={currentUrl ?? "/brand/logo-light.png"}
          alt={`Portrait of ${fighterName}`}
          width={64}
          height={64}
          className="h-16 w-16 border border-rivet object-cover"
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor={`avatar-${fighterId}`} className="sr-only">
            Portrait image (JPEG, PNG or WebP, max 2 MB)
          </Label>
          <input
            ref={fileRef}
            id={`avatar-${fighterId}`}
            type="file"
            accept={FIGHTER_AVATAR_MIME_TYPES.join(",")}
            className="max-w-64 text-xs text-muted file:mr-2 file:border file:border-rivet file:bg-elevated file:px-2 file:py-1 file:text-xs file:text-ink"
          />
          <p className="text-xs text-muted">
            Face/upper body of the mini · JPEG/PNG/WebP · max 2 MB ·
            100–2048px
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              pending={busy}
              onClick={handleUpload}
            >
              {busy ? "Uploading..." : "Upload portrait"}
            </Button>
            {currentUrl && (
              <form action={removeAction}>
                <input type="hidden" name="fighterId" value={fighterId} />
                <input type="hidden" name="gangId" value={gangId} />
                <Button
                  type="submit"
                  variant="ghost"
                  pending={removePending}
                  className="text-blood hover:text-blood"
                >
                  Remove
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {feedback && (
        <p
          className={
            feedback.error
              ? "rounded-sm border border-blood/40 bg-blood/15 px-3 py-2 text-sm text-blood"
              : "rounded-sm border border-toxic/40 bg-toxic/10 px-3 py-2 text-sm text-toxic"
          }
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
