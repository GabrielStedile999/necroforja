# Deployment — Vercel + Supabase

Guide to deploying NecroForja. Initial cost: **US$ 0/month**
(Vercel Hobby + Supabase Free). Estimated time: ~30–45 min.

> ⚠️ Vercel **Hobby** is for **non-commercial** use only — a portfolio qualifies.
> If it ever becomes a paid product or carries ads, upgrade to Pro (US$ 20/month)
> or move to Cloudflare.

## Prerequisites

- Repository on GitHub (public recommended for portfolio).
- Accounts: [Vercel](https://vercel.com), [Supabase](https://supabase.com), and
  optionally [Upstash](https://upstash.com) (durable rate limiting).
- AI keys: `OPENAI_API_KEY` (embeddings) and `ANTHROPIC_API_KEY` (generation).

---

## 1. Database — Supabase

1. **Create project** → choose the **South America (São Paulo)** region.
2. Enable pgvector: **SQL Editor** → paste the content of
   `scripts/enable-pgvector.sql` (`CREATE EXTENSION IF NOT EXISTS vector;`) → Run.
3. Get **two** connection strings from **Project Settings → Database**:
   - **Pooled** (Transaction, port **6543**) → this becomes `DATABASE_URL` for the
     production app. Append `?pgbouncer=true&connection_limit=1`. Use this because
     Vercel is serverless (many short-lived connections).
   - **Direct** (port **5432**) → use only for running migrations/seed from your
     machine.

---

## 2. Migrate, seed and ingest (from your machine, against the production database)

> **Rule ingestion runs locally**, because `content/books/` is gitignored (IP)
> and does not exist on the server. It writes vectors to the production database;
> the app only reads them afterwards.

Create a local `.env` pointing to the production database (use the **direct**
string for this) and run:

```bash
# DATABASE_URL = DIRECT string (port 5432) from Supabase
npm run db:push        # creates tables (pgvector already enabled in step 1)
npm run db:seed        # campaign + Sympathisers + accounts (uses ADMIN_EMAIL etc.)
npm run rules:ingest   # book embeddings → rule_chunk (requires OPENAI_API_KEY)
```

Set in the same `.env` beforehand: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PLAYER_PASSWORD`
(see `.env.example`). Save these credentials — they are your Arbitrator access.

---

## 3. App — Vercel

1. **Add New → Project** → import the GitHub repository. Framework is detected
   automatically (Next.js); do not change the build settings.
2. **Environment Variables** (Production) — add:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | **pooled** string (6543, with `?pgbouncer=true&connection_limit=1`) |
   | `AUTH_SECRET` | generate with `npx auth secret` |
   | `AUTH_URL` | the public URL (e.g. `https://necroforja.vercel.app`) |
   | `ANTHROPIC_API_KEY` | your key |
   | `ASSISTANT_MODEL` | `claude-haiku-4-5` |
   | `OPENAI_API_KEY` | your key |
   | `EMBEDDING_MODEL` | `text-embedding-3-small` |
   | `UPSTASH_REDIS_REST_URL` / `_TOKEN` | (optional) durable rate limiting |

   > `ADMIN_*` / `PLAYER_PASSWORD` are **not** needed on Vercel — they were only
   > used for the local seed (step 2).
3. **Deploy.** When done, update `AUTH_URL` to the final URL (if it changed) and
   redeploy.

---

## 4. Post-deploy verification

- Open the URL → the public landing loads (ranking + Sympathiser map).
- `/login` with Arbitrator credentials → lands on `/admin`.
- `/admin/campaign` → create/resolve a challenge and it reflects on the landing.
- `/player/assistant` → ask a rule question and get a response with **book + page**.

---

## 5. Custom domain (when you register one)

Vercel → Project → **Settings → Domains** → add `necroforja.com.br` (or `.gg`).
Configure DNS records per Vercel's instructions and update `AUTH_URL` to the
final domain.

---

## Gotchas (already handled or to watch out for)

- **Pooler vs direct:** the app uses the **pooled** string (6543); migrations use
  the **direct** string (5432). Mixing them causes connection errors in serverless.
- **pgvector:** enable the extension **before** `db:push`, otherwise the
  `rule_chunk` table creation fails.
- **Supabase Free pauses after ~7 days** of inactivity. For an intermittent
  campaign, create a **Vercel Cron** (or scheduled task) that GETs the landing
  once/day to keep the project "awake".
- **Rule ingestion:** always runs locally (books never go to the repo/server).
  Re-run `rules:ingest` from your machine whenever you change chunking or content.
- **Build without DATABASE_URL:** Vercel's `next build` will have the env set, so
  it's fine. For local CI without a database, use a dummy `DATABASE_URL` just for
  the build.
