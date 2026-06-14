import { anthropic } from "@ai-sdk/anthropic";
import { streamText, type CoreMessage } from "ai";
import { auth } from "@/auth";
import { searchRules, citationLabel } from "@/lib/ai/retrieval";
import { rateLimit } from "@/lib/ai/rate-limit";

export const maxDuration = 30;

/**
 * Rules assistant (RAG). Authenticated and rate-limited.
 * Retrieves relevant chunks via pgvector and responds with Claude, citing sources.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Not authenticated.", { status: 401 });
  }
  if (!rateLimit(session.user.id)) {
    return new Response("Too many questions in a short time. Please wait a moment.", {
      status: 429,
    });
  }

  const { messages } = (await req.json()) as { messages: CoreMessage[] };

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const query =
    typeof lastUser?.content === "string" ? lastUser.content : "";

  let context = "(empty)";
  try {
    const chunks = await searchRules(query, 8);
    if (chunks.length > 0) {
      context = chunks
        .map((c, i) => `[${i + 1}] SOURCE: ${citationLabel(c)}\n${c.content}`)
        .join("\n\n");
    }
  } catch {
    // rules base not yet ingested / database unavailable
    context = "(empty)";
  }

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

  const result = streamText({
    model: anthropic(model),
    system,
    messages,
    onError: ({ error }) => {
      // appears in the server terminal for debugging
      console.error("[assistant] streamText error:", error);
    },
  });

  // By default the AI SDK masks stream errors; here we forward them to the client
  // so the UI can display them.
  return result.toDataStreamResponse({
    getErrorMessage: (error) =>
      error instanceof Error ? error.message : "Error generating the response.",
  });
}
