import { hash, verify } from "@node-rs/argon2";

/**
 * Hash de senha com Argon2id (parâmetros padrão recomendados).
 * Roda apenas no servidor (runtime Node).
 */
export function hashPassword(plain: string): Promise<string> {
  return hash(plain);
}

export function verifyPassword(
  hashed: string,
  plain: string,
): Promise<boolean> {
  return verify(hashed, plain);
}
