# Publishing NecroForja on GitHub

Quick guide to pushing the repository. (You can delete this file afterwards.)

## Description (repository "About" field)

> NecroForja — Necromunda campaign manager. Public dashboard (ranking +
> Sympathisers), player area (gang, fighters, credits) and AI rules assistant
> (RAG). Next.js 16 · TypeScript · Drizzle/Postgres · Auth.js · AI SDK.

## Topics (repository tags)

```
nextjs  react  typescript  tailwindcss  drizzle-orm  postgresql  pgvector
authjs  ai-sdk  rag  server-components  supabase  tabletop  portfolio
```

> The `necromunda` topic is optional (descriptive/nominative use, helps discovery).
> Keep the trademark **out of the repository name and domain** — use it only as a
> descriptive mention. See the IP notice in the README.

## Before the first push — checklist

- [x] `.env` is in `.gitignore` (secrets do NOT go to the repo).
- [x] `content/books/` (full text of the books, © Games Workshop) is ignored —
      local/private use.
- [x] No hardcoded secrets in code (`src/`).
- [ ] Confirm the real `.env` was **not** committed (`git status` before push).

## Commands

```bash
cd "path/to/Portfolio"

git init
git add .
git status                      # confirm: .env and content/books are NOT listed
git commit -m "feat: NecroForja — Necromunda campaign manager (MVP phases 1-3)"

git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/necroforja.git
git push -u origin main
```

## Suggested README sections for GitHub (already covered)

- Stack, how to run, scripts, authentication, AI rules assistant (RAG), roadmap,
  and the IP notice — all in `README.md`.
- For portfolio impact: add 2–3 screenshots (landing, Arbitrator panel, assistant
  chat) and, once deployed, the Vercel deploy link.
