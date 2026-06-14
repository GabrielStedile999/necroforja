/**
 * Camada de embeddings (OpenAI text-embedding-3-small, 1536 dims) via AI SDK.
 * Roda só no servidor. A chave fica em OPENAI_API_KEY.
 */
import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";

const model = openai.embedding(EMBEDDING_MODEL);

/** Embedding de um único texto (ex.: a pergunta do usuário). */
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({ model, value: text });
  return embedding;
}

/** Embeddings em lote (ingestão de chunks). */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model, values: texts });
  return embeddings;
}
