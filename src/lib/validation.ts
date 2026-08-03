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

/**
 * Optional characteristic field (Fighter Card, Core Rulebook p.78).
 * An empty form input means "not set" (issue #63): it is normalised to
 * `undefined` instead of being coerced to 0, so an untouched field on the
 * edit form leaves the stored value unchanged (drizzle skips undefined
 * columns in `.set()`).
 */
const statField = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().int().min(0).max(max).optional(),
  );

/**
 * Target-roll stat (WS/BS/I and the mental stats): a D6 roll, so the value
 * is strictly 1–6. Empty means "not set"; no "-"/"+" characters accepted.
 */
const rollStatField = () =>
  z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce
      .number()
      .int()
      .min(1, "Roll stats range from 1 to 6.")
      .max(6, "Roll stats range from 1 to 6.")
      .optional(),
  );

/** Add/edit a fighter in the gang. */
export const fighterSchema = z.object({
  name: z.string().min(1, "Please enter a name.").max(60),
  type: z.string().min(1).max(80),
  category: fighterCategoryEnum,
  baseCost: z.coerce.number().int().min(0).max(2000),
  m: statField(20),
  ws: rollStatField(),
  bs: rollStatField(),
  s: statField(20),
  t: statField(20),
  w: statField(20),
  i: rollStatField(),
  a: statField(20),
  ld: rollStatField(),
  cl: rollStatField(),
  wil: rollStatField(),
  int: rollStatField(),
});

/** Full update of an existing fighter (issue #63) — same fields + target id. */
export const updateFighterSchema = fighterSchema.extend({
  fighterId: z.string().uuid("Invalid fighter ID."),
});

export type UpdateFighterInput = z.infer<typeof updateFighterSchema>;

/* ---------------------- Campaign CRUD (issue #66) ---------------------- */

/** Optional YYYY-MM-DD date field; empty input means "not set". */
const optionalDateField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format.")
  .optional()
  .or(z.literal("").transform(() => undefined));

/**
 * Creates a campaign (issue #66). Minimum 3 cycles so the generalised
 * GD → Downtime → Spark shape holds (see lib/campaign-rules.ts
 * downtimeCycle); 14 is a pragmatic upper bound (~2 official campaigns).
 */
export const createCampaignSchema = z.object({
  name: z.string().trim().min(2, "Campaign name too short.").max(80),
  startDate: optionalDateField,
  endDate: optionalDateField,
  totalCycles: z.coerce
    .number()
    .int()
    .min(3, "Campaigns run from 3 to 14 cycles.")
    .max(14, "Campaigns run from 3 to 14 cycles.")
    .default(7),
});

/** Edits the campaign's name/dates/length (totalCycles >= currentCycle is
 *  enforced in the action, which knows the current cycle). */
export const updateCampaignSchema = createCampaignSchema.extend({
  campaignId: z.string().uuid("Invalid campaign ID."),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

/**
 * Jumps the campaign to a specific cycle (issue #66 follow-up) — forwards
 * or BACKWARDS (regret button for a mis-clicked "Advance cycle"). Bounds
 * against totalCycles are enforced in the action.
 */
export const setCampaignCycleSchema = z.object({
  campaignId: z.string().uuid("Invalid campaign ID."),
  cycle: z.coerce
    .number()
    .int()
    .min(1, "Cycle must be at least 1.")
    .max(14, "Cycle cannot exceed 14."),
});

export type SetCampaignCycleInput = z.infer<typeof setCampaignCycleSchema>;

/** Activates/deactivates a gang's participation in the campaign. */
export const toggleGangActiveSchema = z.object({
  gangId: z.string().uuid("Invalid gang ID."),
  /** Current state, flipped by the action. */
  isActive: z.enum(["true", "false"]),
});

/* ------------------------ Gang CRUD (issue #64) ------------------------ */

/**
 * Reputation starts at 1 and "measures the gang's prestige" (Core Rulebook
 * — separate attribute from Rating; limits Hangers-on/Brutes). 1–20 is a
 * pragmatic bound for campaign play; the Arbitrator adjusts it manually
 * until battle events automate it (issue #69).
 */
export const updateGangSchema = z.object({
  gangId: z.string().uuid("Invalid gang ID."),
  name: z.string().trim().min(2, "Gang name too short.").max(60),
  house: z.string().trim().min(2, "House too short.").max(60),
  reputation: z.coerce
    .number()
    .int()
    .min(1, "Reputation ranges from 1 to 20.")
    .max(20, "Reputation ranges from 1 to 20."),
});

/** Transfer ownership; empty string releases the gang (no owner). */
export const transferGangSchema = z.object({
  gangId: z.string().uuid("Invalid gang ID."),
  newOwnerUserId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/** Creates a gang for an existing account that has none. */
export const createGangForUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID."),
  name: z.string().trim().min(2, "Gang name too short.").max(60),
  house: z.string().trim().min(2, "House too short.").max(60),
});

/** Destructive: the admin must type the gang's exact name to confirm. */
export const deleteGangSchema = z.object({
  gangId: z.string().uuid("Invalid gang ID."),
  confirmName: z.string().min(1, "Type the gang name to confirm."),
});

export type UpdateGangInput = z.infer<typeof updateGangSchema>;
export type TransferGangInput = z.infer<typeof transferGangSchema>;
export type CreateGangForUserInput = z.infer<typeof createGangForUserSchema>;
export type DeleteGangInput = z.infer<typeof deleteGangSchema>;

/* ---------------------- Fighter portrait (issue #63) ---------------------- */

/**
 * Portrait rules: a LIGHT identification image (face / upper body of the
 * mini). Rationale for the bounds:
 * - 2 MB max — it renders at ~48–96px; anything heavier is wasted transfer
 *   at the table (the gallery keeps 10 MB for full photos).
 * - JPEG/PNG/WebP only — no GIF/SVG (animation is noise at avatar size and
 *   SVG is an XSS surface on user uploads).
 * - Client additionally enforces 100–2048px per side before uploading:
 *   below 100px the mini is unrecognisable, above 2048px the file is a
 *   full photo, not an avatar (see FighterAvatarForm).
 */
export const FIGHTER_AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const FIGHTER_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const FIGHTER_AVATAR_MIN_DIMENSION = 100; // px, client-side check
export const FIGHTER_AVATAR_MAX_DIMENSION = 2048; // px, client-side check

/** Step 1 — ask for a signed upload URL for a fighter portrait. */
export const fighterAvatarRequestSchema = z.object({
  fighterId: z.string().uuid("Invalid fighter ID."),
  mime: z.enum(FIGHTER_AVATAR_MIME_TYPES),
  bytes: z
    .number()
    .int()
    .positive()
    .max(FIGHTER_AVATAR_MAX_BYTES, "File too large (max 2 MB)."),
});

/** Step 2 — after the direct upload, persist the path on the fighter row. */
export const fighterAvatarConfirmSchema = z.object({
  fighterId: z.string().uuid("Invalid fighter ID."),
  path: z
    .string()
    .min(1)
    .max(300)
    .regex(
      /^fighter\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/,
      "Unexpected portrait path format.",
    ),
});

export type FighterAvatarRequest = z.infer<typeof fighterAvatarRequestSchema>;
export type FighterAvatarConfirmInput = z.infer<
  typeof fighterAvatarConfirmSchema
>;

/** Add an equipment item to a fighter. */
export const addEquipmentSchema = z.object({
  fighterId: z.string().uuid(),
  name: z.string().min(1).max(80),
  category: equipmentCategoryEnum,
  cost: z.coerce.number().int().min(0).max(2000),
  /**
   * Catalogue pick (issue #67). When present the server uses the CATALOGUE
   * row's name/category/cost (authoritative snapshot) and links the owned
   * item to it; the free-text fields above act as a fallback for custom gear.
   */
  catalogId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/* ----------------------- Trading Post (issue #68) ----------------------- */

/**
 * Purchase of a catalogue item with an atomic Stash-credits debit.
 * `destination` is either the literal "stash" or the target fighter's id.
 * Qty above 1 only makes sense for the Stash (a fighter equips one copy —
 * the three-weapon cap reasons about individual items).
 */
export const purchaseEquipmentSchema = z
  .object({
    catalogItemId: z.string().uuid("Invalid catalogue item ID."),
    destination: z.union([
      z.literal("stash"),
      z.string().uuid("Invalid destination."),
    ]),
    qty: z.coerce.number().int().min(1, "Minimum qty: 1.").max(9).default(1),
  })
  .refine((d) => d.destination === "stash" || d.qty === 1, {
    message: "Buying onto a fighter is one item at a time.",
    path: ["qty"],
  });

/* -------------------- Equipment catalogue (issue #67) -------------------- */

/**
 * Catalogue items never use the "skill" category (skills are issue #71
 * territory); the master list covers weapons, wargear, armour and upgrades.
 */
export const catalogCategoryEnum = z.enum([
  "weapon",
  "wargear",
  "armour",
  "upgrade",
]);

export const catalogSubcategoryEnum = z.enum([
  "basic",
  "pistol",
  "special",
  "heavy",
  "close_combat",
  "grenade",
]);

/**
 * One cell of the printed weapon profile (Rng S/L, Acc S/L, Str, AP, D, Am).
 * Text, not number: the book mixes numbers and symbols ("-", "S", "S+1",
 * "+1", "4+", "E", "T″"). Empty input means "not set".
 */
const profileCell = z.preprocess(
  // "" is a VALID string, so a plain .optional().or(z.literal("")) would keep
  // it — normalise blanks to undefined up front ("not set", stored as null).
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().max(12, "Profile value too long.").optional(),
);

/** Create/edit an official catalogue item (/admin/catalog). */
export const catalogItemSchema = z.object({
  name: z.string().trim().min(2, "Name too short.").max(80),
  category: catalogCategoryEnum,
  subcategory: catalogSubcategoryEnum
    .optional()
    .or(z.literal("").transform(() => undefined)),
  cost: z.coerce
    .number()
    .int()
    .min(0, "Cost cannot be negative.")
    .max(9999, "Cost too high."),
  rangeShort: profileCell,
  rangeLong: profileCell,
  accShort: profileCell,
  accLong: profileCell,
  strength: profileCell,
  ap: profileCell,
  damage: profileCell,
  ammo: profileCell,
  traits: z.string().trim().max(300).optional().default(""),
  effect: z.string().trim().max(1000).optional().default(""),
});

export const updateCatalogItemSchema = catalogItemSchema.extend({
  catalogItemId: z.string().uuid("Invalid catalogue item ID."),
});

/** Enables/disables a catalogue item (current state, flipped by the action). */
export const toggleCatalogItemSchema = z.object({
  catalogItemId: z.string().uuid("Invalid catalogue item ID."),
  enabled: z.enum(["true", "false"]),
});

/** Destructive: owned copies keep their snapshot (catalog_id → null). */
export const deleteCatalogItemSchema = z.object({
  catalogItemId: z.string().uuid("Invalid catalogue item ID."),
});

export type CatalogItemInput = z.infer<typeof catalogItemSchema>;
export type UpdateCatalogItemInput = z.infer<typeof updateCatalogItemSchema>;

/* ------------------- Keyword rules (issue #67 follow-up) ------------------- */

/**
 * One glossary entry: a base keyword ("Rapid Fire", no parameters) and its
 * REWRITTEN functional summary. Content lives only in the private database
 * (IP strategy — see schema.ts keywordRules).
 */
export const keywordRuleSchema = z.object({
  keyword: z.string().trim().min(2, "Keyword too short.").max(60),
  summary: z.string().trim().min(10, "Summary too short.").max(2000),
  book: z.preprocess(
    // "" is a valid string — normalise blanks to undefined ("not set").
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(80).optional(),
  ),
  page: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().int().min(1).max(2000).optional(),
  ),
});

export const updateKeywordRuleSchema = keywordRuleSchema.extend({
  keywordRuleId: z.string().uuid("Invalid keyword rule ID."),
});

export const deleteKeywordRuleSchema = z.object({
  keywordRuleId: z.string().uuid("Invalid keyword rule ID."),
});

/** Bulk paste-import: a JSON array of keywordRuleSchema objects. */
export const importKeywordRulesSchema = z.object({
  payload: z.string().trim().min(2, "Paste the JSON array."),
});

export type KeywordRuleInput = z.infer<typeof keywordRuleSchema>;

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
  /** Catalogue pick (issue #67) — same semantics as addEquipmentSchema. */
  catalogId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
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
  /** Who painted the minis (issue #52) — optional, highlighted when present. */
  authorName: z.string().trim().max(60, "Author name too long.").default(""),
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

/* ------------------ Gallery visitor interactions (issue #52) ------------------ */

/** Anonymous 1–5 vote on a gallery photo (POST /api/gallery/[id]/rating). */
export const galleryRatingSchema = z.object({
  rating: z.coerce
    .number()
    .int("Whole stars only.")
    .min(1, "Minimum rating is 1.")
    .max(5, "Maximum rating is 5."),
});

/**
 * Anonymous comment on a gallery photo (POST /api/gallery/[id]/comments).
 * Plain text only — the client renders it via React's default escaping, never
 * as HTML. The honeypot field is checked separately in the route handler so
 * bots get a fake success instead of a validation hint.
 */
export const galleryCommentSchema = z.object({
  authorName: z.string().trim().min(2, "Name too short.").max(40, "Name too long."),
  body: z.string().trim().min(3, "Comment too short.").max(800, "Comment too long."),
});

/** Admin decision over a pending comment (moderation queue, issue #52). */
export const galleryCommentModerationSchema = z.object({
  id: z.string().uuid("Invalid comment id."),
  decision: z.enum(["approve", "reject", "delete"]),
});

export type GalleryRatingInput = z.infer<typeof galleryRatingSchema>;
export type GalleryCommentInput = z.infer<typeof galleryCommentSchema>;
export type GalleryCommentModerationInput = z.infer<
  typeof galleryCommentModerationSchema
>;

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
