/**
 * Embeddings layer (OpenAI text-embedding-3-small, 1536 dims) via AI SDK.
 * Runs server-side only. The key is stored in OPENAI_API_KEY.
 */
import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";

const model = openai.embedding(EMBEDDING_MODEL);

/** Embedding for a single text (e.g. the user's question). */
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({ model, value: text });
  return embedding;
}

/** Batch embeddings (chunk ingestion). */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model, values: texts });
  return embeddings;
}
