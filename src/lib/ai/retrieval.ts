/**
 * Semantic rules search (RAG). Embeds the question and retrieves the closest
 * chunks by cosine distance (pgvector).
 *
 * `searchRulesWithExpansion` is the recommended entry point: it runs a cheap
 * Claude call to expand the query into official Necromunda terminology, searches
 * with both the original and expanded queries, and merges the results.
 */
import { sql, cosineDistance, desc, gt } from "drizzle-orm";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
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
  minSimilarity = 0.1,
): Promise<RetrievedChunk[]> {
  const { db, schema } = await import("@/lib/db");
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

/**
 * Uses Claude Haiku to rewrite the query using official Necromunda rulebook
 * terminology, improving recall against the English rules corpus.
 * Returns the original query unchanged on any error.
 */
export async function expandQuery(query: string): Promise<string> {
  // `||` not `??`: treat an empty string in .env as "not defined".
  const model = process.env.ASSISTANT_MODEL?.trim() || "claude-haiku-4-5";

  try {
    const { text } = await generateText({
      model: anthropic(model),
      prompt: `Rewrite the question below as a concise English search phrase (20 words max) using official Necromunda rulebook terminology. Output ONLY the search phrase, nothing else.

Question: ${query}`,
      maxTokens: 60,
    });
    return text.trim() || query;
  } catch {
    return query;
  }
}

/**
 * Merges two ranked chunk lists, deduplicates by content prefix, re-sorts by
 * similarity, and caps the result at k.
 *
 * Pure function — safe to unit-test without DB or AI calls.
 */
export function mergeChunks(
  a: RetrievedChunk[],
  b: RetrievedChunk[],
  k: number,
): RetrievedChunk[] {
  const seen = new Set<string>();
  const merged: RetrievedChunk[] = [];

  for (const chunk of [...a, ...b]) {
    // Use the first 120 chars of content as the dedup key.
    const key = chunk.content.trim().slice(0, 120);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(chunk);
    }
  }

  return merged.sort((x, y) => y.similarity - x.similarity).slice(0, k);
}

/**
 * Searches with the original query AND an LLM-expanded version, then merges
 * and deduplicates the results. Falls back gracefully if expansion or the
 * second search fails.
 */
export async function searchRulesWithExpansion(
  query: string,
  k = 8,
  minSimilarity = 0.1,
): Promise<RetrievedChunk[]> {
  // Run original search and query expansion in parallel to reduce latency.
  const [original, expandedQuery] = await Promise.all([
    searchRules(query, k, minSimilarity),
    expandQuery(query).catch(() => query),
  ]);

  // Skip the second search when expansion returned the same string.
  if (expandedQuery === query) {
    return original;
  }

  const expanded = await searchRules(expandedQuery, k, minSimilarity).catch(
    () => [] as RetrievedChunk[],
  );

  return mergeChunks(original, expanded, k);
}
