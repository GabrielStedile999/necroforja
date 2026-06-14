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
/** Admin manually assigns a Sympathiser to a gang (or releases it). */
export const assignSympathiserSchema = z.object({
  sympathiserId: z.string().min(1, "Select the Sympathiser."),
  /** Gang UUID, or "" to release (mark as uncontrolled). */
  gangId: z.string(),
});

export type AssignSympathiserInput = z.infer<typeof assignSympathiserSchema>;
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
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
