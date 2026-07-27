"use server";

import { headers } from "next/headers";
import { rateLimit } from "@/lib/ai/rate-limit";
import { sendContactEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { contactSchema } from "@/lib/validation";

/**
 * Server action do formulário de contato (issue #39 follow-up).
 *
 * Error é um CÓDIGO estável em inglês (não texto de exibição) — a UI traduz
 * via content.ts/content.en.ts (issue #12: lógica em inglês).
 *
 * Anti-abuso, em camadas:
 * - honeypot: o campo escondido "ncf_extra" só é preenchido por bots — nesse
 *   caso respondemos sucesso silencioso (sem dica de detecção) e descartamos.
 *   (Nome não-padrão de propósito: "website" era preenchido pelo autofill do
 *   Chrome junto com nome/email, derrubando envios legítimos.);
 * - rate limit por IP (3/h) + global (20/h) via Upstash, fail-open (issue #32);
 * - validação zod (tamanhos mín/máx) espelhando os atributos nativos do form.
 */
export type ContactState = {
  ok?: boolean;
  error?: "invalid_input" | "rate_limited" | "send_failed" | "not_configured";
};

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot — bots preenchem tudo; humanos nunca veem este campo.
  const honeypot = formData.get("ncf_extra");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    logger.warn("contact: honeypot tripped, dropping message");
    return { ok: true };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  // Rate limit por IP + global (protege a cota do provedor de email).
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const [ipAllowed, globalAllowed] = await Promise.all([
    rateLimit(`contact:${ip}`, 3, 3600),
    rateLimit("contact:global", 20, 3600),
  ]);
  if (!ipAllowed || !globalAllowed) {
    return { error: "rate_limited" };
  }

  const result = await sendContactEmail(parsed.data);
  if (result === "not_configured") return { error: "not_configured" };
  if (result === "failed") return { error: "send_failed" };

  return { ok: true };
}
