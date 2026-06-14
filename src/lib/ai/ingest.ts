/**
 * Rules ingestion for RAG. Generates chunks + embeddings and writes to rule_chunk.
 *
 * Sources:
 *  - content/books/*.jsonl  → book text, page by page
 *    (each line: { "book": string, "page": number, "text": string }).
 *    Chunks inherit book + page for verifiable official citations.
 *  - content/rules/*.md     → own notes/summaries (no page number).
 *
 * Usage: configure DATABASE_URL and OPENAI_API_KEY in .env and run `npm run rules:ingest`.
 *
 * ⚠️ IP: content/books/ contains the full text of the books and is in .gitignore.
 * It is for local/private use (players who own the books); do not redistribute.
 */
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { db, schema } from "../db";
import { chunkMarkdown, chunkPlain } from "./chunk";
import { embedTexts } from "./embeddings";

const BATCH = 64;

interface Record {
  source: string;
  book: string | null;
  page: number | null;
  heading: string;
  content: string;
}

async function readDirSafe(dir: string, ext: string): Promise<string[]> {
  try {
    return (await readdir(dir)).filter((f) => f.endsWith(ext));
  } catch {
    return [];
  }
}

/** Detects index/table-of-contents pages (many dotted lines) — noise for RAG. */
function isIndexLike(text: string): boolean {
  return (text.match(/\.{4,}/g)?.length ?? 0) >= 5;
}

async function collectBookRecords(): Promise<Record[]> {
  const dir = path.resolve(process.cwd(), "content/books");
  const files = await readDirSafe(dir, ".jsonl");
  const records: Record[] = [];

  for (const file of files) {
    const raw = await readFile(path.join(dir, file), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const page = JSON.parse(trimmed) as {
        book: string;
        page: number;
        text: string;
      };
      if (isIndexLike(page.text)) continue; // skip table of contents/index
      for (const content of chunkPlain(page.text)) {
        records.push({
          source: file,
          book: page.book,
          page: page.page,
          heading: "",
          content,
        });
      }
    }
  }
  return records;
}

async function collectNoteRecords(): Promise<Record[]> {
  const dir = path.resolve(process.cwd(), "content/rules");
  const files = await readDirSafe(dir, ".md");
  const records: Record[] = [];

  for (const file of files) {
    if (file.toLowerCase() === "readme.md") continue;
    const text = await readFile(path.join(dir, file), "utf8");
    for (const c of chunkMarkdown(text, file)) {
      records.push({
        source: c.source,
        book: null,
        page: null,
        heading: c.heading,
        content: c.content,
      });
    }
  }
  return records;
}

async function ingest() {
  const records = [
    ...(await collectBookRecords()),
    ...(await collectNoteRecords()),
  ];

  if (records.length === 0) {
    console.error(
      "✗ Nothing to ingest. Add content/books/*.jsonl or content/rules/*.md.",
    );
    process.exit(1);
  }
  console.log(`→ ${records.length} chunks to index.`);

  // Recreates the base (idempotent).
  await db.delete(schema.ruleChunks);

  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const embeddings = await embedTexts(batch.map((r) => r.content));
    await db.insert(schema.ruleChunks).values(
      batch.map((r, j) => ({
        source: r.source,
        book: r.book,
        page: r.page,
        heading: r.heading,
        content: r.content,
        embedding: embeddings[j]!,
      })),
    );
    inserted += batch.length;
    console.log(`  ✓ ${inserted}/${records.length}`);
  }

  console.log("✔ Ingestion complete.");
  process.exit(0);
}

ingest().catch((err) => {
  console.error("✗ Ingestion error:", err);
  process.exit(1);
});
