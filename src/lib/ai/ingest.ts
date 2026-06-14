/**
 * Ingestão de regras para o RAG. Gera chunks + embeddings e grava em rule_chunk.
 *
 * Fontes:
 *  - content/books/*.jsonl  → texto dos livros, página a página
 *    (cada linha: { "book": string, "page": number, "text": string }).
 *    Os chunks herdam livro + página, para citação oficial verificável.
 *  - content/rules/*.md     → notas/resumos próprios (sem página).
 *
 * Uso: configure DATABASE_URL e OPENAI_API_KEY no .env e rode `npm run rules:ingest`.
 *
 * ⚠️ IP: content/books/ contém o texto integral dos livros e está no .gitignore.
 * É de uso local/privado (jogadores que possuem os livros); não redistribua.
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

/** Detecta páginas de índice/sumário (muitos pontilhados) — ruído para o RAG. */
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
      if (isIndexLike(page.text)) continue; // pula sumário/índice
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
      "✗ Nada para ingerir. Adicione content/books/*.jsonl ou content/rules/*.md.",
    );
    process.exit(1);
  }
  console.log(`→ ${records.length} chunks para indexar.`);

  // Recria a base (idempotente).
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

  console.log("✔ Ingestão concluída.");
  process.exit(0);
}

ingest().catch((err) => {
  console.error("✗ Erro na ingestão:", err);
  process.exit(1);
});
