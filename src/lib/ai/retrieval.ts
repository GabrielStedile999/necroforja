/**
 * Busca semântica de regras (RAG). Embute a pergunta e recupera os chunks mais
 * próximos por distância de cosseno (pgvector).
 */
import { sql, cosineDistance, desc, gt } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { embedText } from "./embeddings";

export interface RetrievedChunk {
  heading: string;
  content: string;
  source: string;
  book: string | null;
  page: number | null;
  similarity: number;
}

/** Rótulo de citação oficial, ex.: "Necromunda: Core Rulebook (2023), p. 92". */
export function citationLabel(c: {
  book: string | null;
  page: number | null;
  source: string;
  heading: string;
}): string {
  if (c.book) {
    return c.page ? `${c.book}, p. ${c.page}` : c.book;
  }
  return c.heading ? `${c.source} — ${c.heading}` : c.source;
}

export async function searchRules(
  query: string,
  k = 8,
  // limiar baixo: a busca é cross-lingual (pergunta em PT, regras em EN),
  // o que reduz os escores de similaridade dos trechos relevantes.
  minSimilarity = 0.1,
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(query);

  const similarity = sql<number>`1 - (${cosineDistance(
    schema.ruleChunks.embedding,
    queryEmbedding,
  )})`;

  const rows = await db
    .select({
      heading: schema.ruleChunks.heading,
      content: schema.ruleChunks.content,
      source: schema.ruleChunks.source,
      book: schema.ruleChunks.book,
      page: schema.ruleChunks.page,
      similarity,
    })
    .from(schema.ruleChunks)
    .where(gt(similarity, minSimilarity))
    .orderBy(desc(similarity))
    .limit(k);

  return rows;
}
