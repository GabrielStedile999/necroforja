import { hash, verify } from "@node-rs/argon2";

/**
 * Password hash with Argon2id (recommended default parameters).
 * Runs server-side only (Node runtime).
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
