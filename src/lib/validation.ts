import { z } from "zod";

/** Login (Credentials provider). */
export const loginSchema = z.object({
  email: z.string().email("Invalid e-mail."),
  password: z.string().min(1, "Please enter your password."),
});

/** Admin creates a player account + their gang (no self-signup). */
export const createPlayerSchema = z.object({
  displayName: z.string().min(2, "Name too short.").max(60),
  email: z.string().email("Invalid e-mail."),
  password: z.string().min(8, "Minimum 8 characters."),
  gangName: z.string().min(2, "Gang name too short.").max(60),
  house: z.string().min(2).max(60),
});

/**
 * Admin edits a player account (issue #57) — name, login e-mail and,
 * opcionalmente, uma senha nova: vazia mantém a atual; preenchida segue a
 * mesma regra do create (mínimo 8).
 */
export const updatePlayerSchema = z.object({
  userId: z.string().uuid("Invalid user id."),
  displayName: z.string().min(2, "Name too short.").max(60),
  email: z.string().email("Invalid e-mail."),
  password: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.union([z.literal(""), z.string().min(8, "Minimum 8 characters.")]))
    .transform((v) => (v === "" ? undefined : v)),
});

export const fighterCategoryEnum = z.enum([
  "leader",
  "champion",
  "prospect",
  "ganger",
  "juve",
  "crew",
  "hanger_on",
  "brute",
]);

export const fighterStatusEnum = z.enum([
  "active",
  "in_recovery",
  "injured",
  "captured",
  "dead",
]);

export const equipmentCategoryEnum = z.enum([
  "weapon",
  "wargear",
  "skill",
  "armour",
  "upgrade",
]);

/** Add/edit a fighter in the gang. */
export const fighterSchema = z.object({
  name: z.string().min(1, "Please enter a name.").max(60),
  type: z.string().min(1).max(80),
  category: fighterCategoryEnum,
  baseCost: z.coerce.number().int().min(0).max(2000),
  m: z.coerce.number().int().min(0).max(20).optional(),
  ws: z.coerce.number().int().min(0).max(12).optional(),
  bs: z.coerce.number().int().min(0).max(12).optional(),
  s: z.coerce.number().int().min(0).max(20).optional(),
  t: z.coerce.number().int().min(0).max(20).optional(),
  w: z.coerce.number().int().min(0).max(20).optional(),
  i: z.coerce.number().int().min(0).max(12).optional(),
  a: z.coerce.number().int().min(0).max(20).optional(),
  ld: z.coerce.number().int().min(0).max(12).optional(),
  cl: z.coerce.number().int().min(0).max(12).optional(),
  wil: z.coerce.number().int().min(0).max(12).optional(),
  int: z.coerce.number().int().min(0).max(12).optional(),
});

/** Add an equipment item to a fighter. */
export const addEquipmentSchema = z.object({
  fighterId: z.string().uuid(),
  name: z.string().min(1).max(80),
  category: equipmentCategoryEnum,
  cost: z.coerce.number().int().min(0).max(2000),
});

/** Arbitrator registers a challenge for a Sympathiser. */
export const createChallengeSchema = z.object({
  challengerGangId: z.string().uuid(),
  // can be empty when the stake is an uncontrolled Sympathiser
  challengedGangId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  sympathiserId: z.string().min(1, "Select the contested Sympathiser."),
  scenario: z.string().max(80).optional(),
});

export const challengeOutcomeEnum = z.enum([
  "challenger_win",
  "challenged_win",
  "declined",
  "draw",
]);

/** Arbitrator resolves a challenge. */
export const resolveChallengeSchema = z.object({
  challengeId: z.string().uuid(),
  outcome: challengeOutcomeEnum,
});

/** Updates the gang's Stash credits. */
export const setStashCreditsSchema = z.object({
  credits: z.coerce
    .number()
    .int()
    .min(0, "Credits cannot be negative.")
    .max(99999, "Value too high."),
});

/** Adds an item to the Stash. */
export const addStashItemSchema = z.object({
  name: z.string().min(1, "Please enter a name.").max(80),
  category: equipmentCategoryEnum,
  cost: z.coerce.number().int().min(0).max(2000),
  qty: z.coerce.number().int().min(1, "Minimum qty: 1.").max(99).default(1),
});

/** Removes an item from the Stash. */
export const removeStashItemSchema = z.object({
  stashItemId: z.string().uuid("Invalid ID."),
});

/** Moves an item from the Stash to a fighter (atomic operation). */
export const equipFromStashSchema = z.object({
  stashItemId: z.string().uuid("Invalid item ID."),
  fighterId: z.string().uuid("Invalid fighter ID."),
});

/** Changes a fighter's status (active/in_recovery/injured/captured/dead). */
export const updateFighterStatusSchema = z.object({
  fighterId: z.string().uuid("Invalid fighter ID."),
  status: fighterStatusEnum,
  /** Capturing gang — required only when status = "captured". */
  capturedByGangId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/** Adds XP to a fighter (positive delta). */
export const addFighterXpSchema = z.object({
  fighterId: z.string().uuid("Invalid fighter ID."),
  xpDelta: z.coerce
    .number()
    .int()
    .min(1, "Minimum 1 XP.")
    .max(100, "Maximum 100 XP at a time."),
});

/** Removes an equipped item from a fighter. */
export const removeEquipmentSchema = z.object({
  fighterId: z.string().uuid("Invalid fighter ID."),
  equipmentId: z.string().uuid("Invalid equipment ID."),
});

export type LoginInput = z.infer<typeof loginSchema>;
/** Awards a Triumph to a gang (or to the campaign as a whole if gangId is empty). */
export const awardTriumphSchema = z.object({
  title: z.string().min(1, "Please enter a title.").max(100),
  gangId: z
    .string()
    .uuid("Invalid gang ID.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type AwardTriumphInput = z.infer<typeof awardTriumphSchema>;

/** Admin manually assigns a Sympathiser to a gang (or releases it). */
export const assignSympathiserSchema = z.object({
  sympathiserId: z.string().min(1, "Select the Sympathiser."),
  /** Gang UUID, or "" to release (mark as uncontrolled). */
  gangId: z.string(),
});

/* ---------------------- Campaign journal (issue #5) ---------------------- */

export const postTypeEnum = z.enum([
  "session_report",
  "battle_report",
  "chronicle",
  "painting",
  "news",
]);

/** Create/update a journal post (bilingual fields; slug is a logic key). */
export const postSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug too short.")
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, digits and hyphens.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  type: postTypeEnum,
  titleEn: z.string().min(3, "English title too short.").max(120),
  titlePt: z.string().min(3, "Portuguese title too short.").max(120),
  excerptEn: z.string().max(300).default(""),
  excerptPt: z.string().max(300).default(""),
  bodyEn: z.string().min(1, "English body is required.").max(50_000),
  bodyPt: z.string().min(1, "Portuguese body is required.").max(50_000),
  coverImage: z
    .string()
    .max(500)
    .refine(
      (v) => v === "" || v.startsWith("/") || v.startsWith("https://"),
      "Cover must be an https:// URL or a site-relative path.",
    )
    .default(""),
  coverAlt: z.string().max(200).default(""),
  published: z.coerce.boolean().default(false),
});

export type PostInput = z.infer<typeof postSchema>;

/** Image upload constraints for the reports bucket. */
export const REPORT_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const REPORT_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

/* ------------------------- Gallery (issues #6/#24) ------------------------- */

/**
 * Fixed gallery categories (issue #6: gangs, battles, painting…).
 * Single source of truth — the Drizzle pg enum, the zod schema, the object
 * path prefix in the bucket and the i18n filter chips all derive from this.
 */
export const GALLERY_CATEGORIES = [
  "battle",
  "painting",
  "gang",
  "terrain",
  "misc",
] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

/** Upload constraints for the gallery bucket (mirrored in the bucket config). */
export const GALLERY_IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const GALLERY_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const galleryCategoryEnum = z.enum(GALLERY_CATEGORIES);

/** Step 1 — admin asks for a signed upload URL (file goes direct to storage). */
export const galleryUploadRequestSchema = z.object({
  filename: z.string().min(1).max(200),
  mime: z.enum(GALLERY_IMAGE_MIME_TYPES),
  bytes: z
    .number()
    .int()
    .positive()
    .max(GALLERY_IMAGE_MAX_BYTES, "File too large (max 10 MB)."),
  category: galleryCategoryEnum,
});

/** Step 2 — after the direct upload, persist the image metadata row. */
export const galleryConfirmSchema = z.object({
  path: z
    .string()
    .min(1)
    .max(300)
    // category prefix + slug segment, extension included ("battle/foo-a1b2c3.webp")
    .regex(
      /^[a-z]+\/[a-z0-9-]+\.[a-z0-9]+$/,
      "Unexpected object path format.",
    ),
  category: galleryCategoryEnum,
  altEn: z.string().min(3, "English alt text is required.").max(300),
  altPt: z.string().max(300).default(""),
  captionEn: z.string().max(500).default(""),
  captionPt: z.string().max(500).default(""),
  tags: z.array(z.string().min(1).max(40)).max(12).default([]),
  width: z.number().int().positive().max(20_000),
  height: z.number().int().positive().max(20_000),
});

/** Metadata edit (alt/captions/category/tags/published) for an existing image. */
export const galleryUpdateSchema = galleryConfirmSchema
  .omit({ path: true, width: true, height: true })
  .extend({
    id: z.string().uuid(),
    published: z.coerce.boolean().default(true),
  });

/** Parses the comma-separated tags field of the admin forms. */
export function parseTagList(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 12);
}

export type GalleryUploadRequest = z.infer<typeof galleryUploadRequestSchema>;
export type GalleryConfirmInput = z.infer<typeof galleryConfirmSchema>;
export type GalleryUpdateInput = z.infer<typeof galleryUpdateSchema>;

export type AssignSympathiserInput = z.infer<typeof assignSympathiserSchema>;
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type FighterInput = z.infer<typeof fighterSchema>;
export type AddEquipmentInput = z.infer<typeof addEquipmentSchema>;
export type RemoveEquipmentInput = z.infer<typeof removeEquipmentSchema>;
export type SetStashCreditsInput = z.infer<typeof setStashCreditsSchema>;
export type AddStashItemInput = z.infer<typeof addStashItemSchema>;
export type RemoveStashItemInput = z.infer<typeof removeStashItemSchema>;
export type EquipFromStashInput = z.infer<typeof equipFromStashSchema>;
export type UpdateFighterStatusInput = z.infer<typeof updateFighterStatusSchema>;
export type AddFighterXpInput = z.infer<typeof addFighterXpSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type ResolveChallengeInput = z.infer<typeof resolveChallengeSchema>;

/** Contact form (issue #39 follow-up) — /contact. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name too short.").max(80, "Name too long."),
  email: z.string().trim().email("Invalid e-mail.").max(200),
  subject: z.string().trim().min(3, "Subject too short.").max(120, "Subject too long."),
  message: z.string().trim().min(10, "Message too short.").max(4000, "Message too long."),
});

export type ContactInput = z.infer<typeof contactSchema>;
