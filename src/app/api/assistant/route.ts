import { anthropic } from "@ai-sdk/anthropic";
import { streamText, type CoreMessage } from "ai";
import { auth } from "@/auth";
import { searchRules, citationLabel } from "@/lib/ai/retrieval";
import { rateLimit } from "@/lib/ai/rate-limit";

export const maxDuration = 30;

/**
 * Assistente de regras (RAG). Autenticado e com rate limit.
 * Recupera trechos relevantes via pgvector e responde com Claude, citando fontes.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Não autenticado.", { status: 401 });
  }
  if (!rateLimit(session.user.id)) {
    return new Response("Muitas perguntas em pouco tempo. Aguarde um instante.", {
      status: 429,
    });
  }

  const { messages } = (await req.json()) as { messages: CoreMessage[] };

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const query =
    typeof lastUser?.content === "string" ? lastUser.content : "";

  let context = "(vazio)";
  try {
    const chunks = await searchRules(query, 8);
    if (chunks.length > 0) {
      context = chunks
        .map((c, i) => `[${i + 1}] FONTE: ${citationLabel(c)}\n${c.content}`)
        .join("\n\n");
    }
  } catch {
    // base de regras ainda não ingerida / banco indisponível
    context = "(vazio)";
  }

  const system = `Você é o assistente de regras da campanha Necromunda "Cinderak Burning".
Responda em português, de forma objetiva e USANDO SOMENTE o CONTEXTO abaixo.
Cada item do CONTEXTO vem numerado e traz a referência oficial no formato:
  [n] FONTE: <Livro>, p. <página>
Ao afirmar uma regra, cite o número entre colchetes, por exemplo [1], [2].
Ao final da resposta, inclua uma seção "Fontes:" listando APENAS as referências que você citou, uma por linha, no formato exato:
  [n] <Livro>, p. <página>
copiando o texto da FONTE correspondente do CONTEXTO (livro e página). Nunca invente número de página nem altere a página indicada.
Se o CONTEXTO não contiver a resposta, diga claramente que não encontrou nas regras carregadas e sugira reformular — nesse caso, não inclua a seção "Fontes:". Nunca invente regras.

CONTEXTO:
${context}`;

  // `|| ` (não `??`) para tratar string vazia no .env como "não definido".
  const model = process.env.ASSISTANT_MODEL?.trim() || "claude-haiku-4-5";

  const result = streamText({
    model: anthropic(model),
    system,
    messages,
    onError: ({ error }) => {
      // aparece no terminal do servidor para depuração
      console.error("[assistant] erro no streamText:", error);
    },
  });

  // Por padrão o AI SDK mascara erros do stream; aqui os repassamos ao cliente
  // para que a UI possa exibi-los.
  return result.toDataStreamResponse({
    getErrorMessage: (error) =>
      error instanceof Error ? error.message : "Erro ao gerar a resposta.",
  });
}
