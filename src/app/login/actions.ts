"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

/**
 * Error is a stable, English error CODE (not display text) — the UI
 * translates it via messages/<locale>.json (issue #12: logic in English).
 */
export type LoginState = { error?: "invalid_credentials" };

export async function authenticate(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/portal",
    });
    return {};
  } catch (error) {
    // signIn throws a redirect on success — must propagate.
    if (error instanceof AuthError) {
      return { error: "invalid_credentials" };
    }
    throw error;
  }
}
