import { z } from "zod";

/** Login (Credentials provider). */
export const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

/** Admin cria uma conta de jogador + a gangue dele (sem self-signup). */
export const createPlayerSchema = z.object({
  displayName: z.string().min(2, "Nome muito curto.").max(60),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(8, "Mínimo de 8 caracteres."),
  gangName: z.string().min(2, "Nome da gangue muito curto.").max(60),
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

/** Adicionar/editar um fighter na gangue. */
export const fighterSchema = z.object({
  name: z.string().min(1, "Informe o nome.").max(60),
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

/** Adicionar um item de equipamento a um fighter. */
export const addEquipmentSchema = z.object({
  fighterId: z.string().uuid(),
  name: z.string().min(1).max(80),
  category: equipmentCategoryEnum,
  cost: z.coerce.number().int().min(0).max(2000),
});

/** Arbitrator registra um desafio por um Sympathiser. */
export const createChallengeSchema = z.object({
  challengerGangId: z.string().uuid(),
  // pode ser vazio quando o stake é um Sympathiser ainda não controlado
  challengedGangId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  sympathiserId: z.string().min(1, "Selecione o Sympathiser em disputa."),
  scenario: z.string().max(80).optional(),
});

export const challengeOutcomeEnum = z.enum([
  "challenger_win",
  "challenged_win",
  "declined",
  "draw",
]);

/** Arbitrator resolve um desafio. */
export const resolveChallengeSchema = z.object({
  challengeId: z.string().uuid(),
  outcome: challengeOutcomeEnum,
});

/** Atualiza os créditos do Stash da gangue. */
export const setStashCreditsSchema = z.object({
  credits: z.coerce
    .number()
    .int()
    .min(0, "Créditos não podem ser negativos.")
    .max(99999, "Valor muito alto."),
});

/** Adiciona um item ao Stash. */
export const addStashItemSchema = z.object({
  name: z.string().min(1, "Informe o nome.").max(80),
  category: equipmentCategoryEnum,
  cost: z.coerce.number().int().min(0).max(2000),
  qty: z.coerce.number().int().min(1, "Qty mínima: 1.").max(99).default(1),
});

/** Remove um item do Stash. */
export const removeStashItemSchema = z.object({
  stashItemId: z.string().uuid("ID inválido."),
});

/** Move um item do Stash para um fighter (operação atômica). */
export const equipFromStashSchema = z.object({
  stashItemId: z.string().uuid("ID do item inválido."),
  fighterId: z.string().uuid("ID do fighter inválido."),
});

/** Altera o status de um fighter (active/in_recovery/injured/captured/dead). */
export const updateFighterStatusSchema = z.object({
  fighterId: z.string().uuid("ID do fighter inválido."),
  status: fighterStatusEnum,
  /** Gangue captora — obrigatório apenas quando status = "captured". */
  capturedByGangId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/** Adiciona XP a um fighter (delta positivo). */
export const addFighterXpSchema = z.object({
  fighterId: z.string().uuid("ID do fighter inválido."),
  xpDelta: z.coerce
    .number()
    .int()
    .min(1, "Mínimo 1 XP.")
    .max(100, "Máximo 100 XP por vez."),
});

/** Remove um item equipado de um fighter. */
export const removeEquipmentSchema = z.object({
  fighterId: z.string().uuid("ID do fighter inválido."),
  equipmentId: z.string().uuid("ID do equipamento inválido."),
});

export type LoginInput = z.infer<typeof loginSchema>;
/** Admin atribui manualmente um Sympathiser a uma gangue (ou libera). */
export const assignSympathiserSchema = z.object({
  sympathiserId: z.string().min(1, "Selecione o Sympathiser."),
  /** UUID da gangue, ou "" para liberar (marcar como sem controlador). */
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
