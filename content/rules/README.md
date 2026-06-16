# Assistant Knowledge Base (RAG)

The assistant answers from two sources, indexed by `npm run rules:ingest`:

## 1. Official books — `content/books/*.jsonl` (primary source)

Each line is a page from a book, in the format:

```json
{ "book": "Necromunda: Core Rulebook (2023)", "page": 92, "text": "..." }
```

Chunks inherit **book + page**, so each response cites the official reference
(e.g. *Core Rulebook (2023), p. 92*) — easy to verify in the book.

> These files are generated from the PDFs (text per page) and are in the
> **`.gitignore`** (`/content/books`). They are for **local/private** use by
> players who own the books — © Games Workshop. Do not redistribute.

## 2. Custom notes — `content/rules/*.md` (optional)

Your own summaries/paraphrases. Indexed without a page number (the citation falls
back to "file — section"). Use only to supplement the books.

## Updating the knowledge base

```bash
# requires DATABASE_URL and OPENAI_API_KEY in .env
npm run rules:ingest   # rebuilds the base (idempotent)
```
