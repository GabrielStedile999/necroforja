/**
 * Semantic rules search (RAG). Embeds the question and retrieves the closest
 * chunks by cosine distance (pgvector).
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

/** Official citation label, e.g. "Necromunda: Core Rulebook (2023), p. 92". */
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
  // low threshold: the search is cross-lingual (question in PT, rules in EN),
  // which reduces the similarity scores of relevant chunks.
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
