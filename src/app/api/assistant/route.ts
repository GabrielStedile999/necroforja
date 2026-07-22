import { anthropic } from "@ai-sdk/anthropic";
import { StreamData, streamText, type CoreMessage } from "ai";
import { auth } from "@/auth";
import { searchRulesWithExpansion, citationLabel } from "@/lib/ai/retrieval";
import { rateLimit } from "@/lib/ai/rate-limit";
import { logger } from "@/lib/logger";

export const maxDuration = 30;

// Daily message quota per logged-in user (issue #13) — caps API cost exposure
// independently of the short burst window below. Configurable via env so the
// limit can be tuned without a code change; `||` treats an empty string as unset.
const DAILY_MESSAGE_LIMIT = Number(process.env.ASSISTANT_DAILY_MESSAGE_LIMIT || "50");

/**
 * Rules assistant (RAG). Authenticated and rate-limited.
 * Retrieves relevant chunks via pgvector and responds with Claude, citing sources.
 */
export async function POST(req: Request) {
  // ---- Authentication ------------------------------------------------
  const session = await auth();
  if (!session?.user) {
    logger.warn("Unauthenticated request to /api/assistant", {
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
    });
    return new Response("Not authenticated.", { status: 401 });
  }

  // ---- Burst rate limiting (async — supports Upstash in production) --
  // Protects against rapid-fire spam (default: 20 requests / 60 s).
  const allowed = await rateLimit(session.user.id);
  if (!allowed) {
    logger.warn("Rate limit exceeded on /api/assistant", {
      userId: session.user.id,
    });
    return new Response("Too many questions in a short time. Please wait a moment.", {
      status: 429,
    });
  }

  // ---- Daily quota -----------------------------------------------------
  // Separate key/window from the burst limiter above: caps total questions
  // per user per day, which is what actually bounds Anthropic API cost.
  const dailyAllowed = await rateLimit(
    `daily:${session.user.id}`,
    DAILY_MESSAGE_LIMIT,
    24 * 60 * 60,
  );
  if (!dailyAllowed) {
    logger.warn("Daily message limit reached on /api/assistant", {
      userId: session.user.id,
      limit: DAILY_MESSAGE_LIMIT,
    });
    return new Response(
      `You've reached the daily limit of ${DAILY_MESSAGE_LIMIT} questions for the rules assistant. Please try again tomorrow.`,
      { status: 429 },
    );
  }

  const { messages } = (await req.json()) as { messages: CoreMessage[] };

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const query =
    typeof lastUser?.content === "string" ? lastUser.content : "";

  let chunks: Awaited<ReturnType<typeof searchRulesWithExpansion>> = [];
  let context = "(empty)";
  try {
    chunks = await searchRulesWithExpansion(query, 8);
    if (chunks.length > 0) {
      context = chunks
        .map((c, i) => `[${i + 1}] SOURCE: ${citationLabel(c)}\n${c.content}`)
        .join("\n\n");
    }
  } catch {
    // rules base not yet ingested / database unavailable
    context = "(empty)";
  }

  // Structured source list sent to the client as a message annotation.
  const structuredSources = chunks.map((c) => ({
    label: citationLabel(c),
    book: c.book,
    page: c.page,
    similarity: Math.round(c.similarity * 100) / 100,
  }));

  const system = `You are the rules assistant for the Necromunda "Cinderak Burning" campaign.
Answer in English, objectively and USING ONLY the CONTEXT below.
Each item in the CONTEXT is numbered and includes the official reference in the format:
  [n] SOURCE: <Book>, p. <page>
When stating a rule, cite the number in brackets, for example [1], [2].
At the end of your response, include a "Sources:" section listing ONLY the references you cited, one per line, in the exact format:
  [n] <Book>, p. <page>
copying the text from the corresponding SOURCE in the CONTEXT (book and page). Never invent a page number or alter the indicated page.
If the CONTEXT does not contain the answer, clearly state that you did not find it in the loaded rules and suggest rephrasing — in that case, do not include the "Sources:" section. Never invent rules.

CONTEXT:
${context}`;

  // `||` (not `??`) to treat an empty string in .env as "not defined".
  const model = process.env.ASSISTANT_MODEL?.trim() || "claude-haiku-4-5";

  const data = new StreamData();

  const result = streamText({
    model: anthropic(model),
    system,
    messages,
    onFinish: () => {
      // Attach the retrieved sources as a structured annotation on the message
      // so the client can render a "Sources" panel without parsing the text.
      data.appendMessageAnnotation({ sources: structuredSources });
      data.close();
    },
    onError: ({ error }) => {
      logger.error("streamText error in /api/assistant", {
        userId: session.user.id,
        error: error instanceof Error ? error.message : String(error),
      });
      data.close();
    },
  });

  // By default the AI SDK masks stream errors; here we forward them to the client
  // so the UI can display them.
  return result.toDataStreamResponse({
    data,
    getErrorMessage: (error) =>
      error instanceof Error ? error.message : "Error generating the response.",
  });
}
