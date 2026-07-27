import { logger } from "@/lib/logger";
import type { ContactInput } from "@/lib/validation";

/**
 * Contact e-mail delivery (issue #39 follow-up) — Resend REST API.
 *
 * Sem SDK novo: a API do Resend é um único POST JSON, então usamos fetch
 * direto e mantemos o package.json enxuto.
 *
 * Privacidade: o endereço de destino NUNCA aparece no código nem no cliente
 * (repo público) — vive só na env `CONTACT_EMAIL_TO`. A mensagem vai como
 * texto puro (sem HTML), o que elimina injeção de markup no corpo; o
 * reply-to aponta para o visitante, então responder é um clique.
 *
 * Envs:
 * - RESEND_API_KEY      — chave da conta Resend (server-only).
 * - CONTACT_EMAIL_TO    — destino das mensagens (server-only, nunca exposto).
 * - CONTACT_EMAIL_FROM  — opcional; default usa o domínio de onboarding do
 *                         Resend, que funciona sem verificar domínio próprio.
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type SendContactResult = "sent" | "not_configured" | "failed";

export async function sendContactEmail(input: ContactInput): Promise<SendContactResult> {
  // `||` (não `??`): string vazia no .env conta como ausente.
  const apiKey = process.env.RESEND_API_KEY || "";
  const to = process.env.CONTACT_EMAIL_TO || "";
  if (!apiKey || !to) {
    logger.warn("contact: email not configured (RESEND_API_KEY / CONTACT_EMAIL_TO missing)");
    return "not_configured";
  }

  const from = process.env.CONTACT_EMAIL_FROM || "NecroForja <onboarding@resend.dev>";

  const body = [
    `Name: ${input.name}`,
    `E-mail: ${input.email}`,
    "",
    input.message,
  ].join("\n");

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: `[NECROFORJA] ${input.subject}`,
        text: body,
      }),
    });

    if (!response.ok) {
      logger.error("contact: Resend rejected the message", {
        status: response.status,
        body: await response.text().catch(() => ""),
      });
      return "failed";
    }

    return "sent";
  } catch (error) {
    logger.error("contact: failed to reach Resend", { error });
    return "failed";
  }
}
