# Contributing / Development Workflow

This project follows a lean but professional workflow — designed to evolve well
and read clearly as a portfolio piece. It applies equally to solo work and to
AI-assisted feature development.

## Language

**English is the only language for all project artifacts**: code comments, commit
messages, PR titles, issue titles/bodies, documentation, and in-app text. This
applies regardless of the language used in conversation — all generated output
goes to the repository in English.

## The change cycle

1. **Issue first.** Every bug/feature/improvement starts as an _issue_
   (templates in `.github/ISSUE_TEMPLATE`). Use labels: `bug`, `enhancement`,
   `tech-debt`, `documentation`. Group by _milestone_ (e.g. "Phase 5").
2. **Branch per change**, branching off `main`:
   - `feat/<slug>` — new feature
   - `fix/<slug>` — bug fix
   - `refactor/<slug>` — tech-debt / refactor
   - `docs/<slug>` — documentation
   - `chore/<slug>` — infra/config
3. **Implement** following the conventions in `docs/PROJECT_CONTEXT.md` (§7 and §8).
4. **Verify locally** before opening a PR:
   ```bash
   npm run typecheck && npm run lint && npm test
   ```
5. **Pull Request** referencing the issue (`Closes #N`), title in
   Conventional Commits format. CI runs typecheck + lint + test.
6. **Squash merge** into `main`. Keeps history clean (1 commit per feature).

## Working with the AI assistant (Claude) — who does what

- **Claude:** writes/edits code and runs verification (`typecheck`). Has no
  access to your git/GitHub — delivers the commands ready to run.
- **You (terminal):** runs `git`/`gh` commands (issue, branch, commit, push,
  PR, merge).
- **CI (automatic):** runs typecheck + lint + test on every PR.

### Recipe for EACH feature/bug (copy and paste)

1. **[you] Create the issue** (note the number it returns, e.g. `#12`):
   ```bash
   gh issue create --label enhancement \
     --title "Short feature/bug title" \
     --body "Goal, expected behaviour and acceptance criteria."
   ```
2. **[you → Claude]** Tell Claude what you want (referencing the issue). E.g.:
   "let's work on issue #12: export campaign ranking as CSV".
3. **[Claude]** Implements the code and runs `typecheck`. Notifies when done.
4. **[you] Create branch, commit and open the PR:**
   ```bash
   git checkout -b feat/feature-slug      # or fix/...
   git add -A
   git commit -m "feat: short description"
   git push -u origin feat/feature-slug
   gh pr create --base main \
     --title "feat: short description" \
     --body "Closes #12"
   ```
5. **[CI]** Runs automatically on the PR. If it goes **red**, paste the log here
   and Claude will fix it.
6. **[you] Merge when checks are green:**
   ```bash
   gh pr merge --squash --delete-branch
   git checkout main && git pull
   ```
   `Closes #12` closes the issue automatically on merge.

### Shortcut for trivial changes (typo, text adjustment)

No issue/PR — directly on `main`:
```bash
git add -A && git commit -m "docs: fix typo in README" && git push
```

> Practical rule: **changed schema?** run `npm run db:push`. **Changed ingestion/
> rule content?** run `npm run rules:ingest`. (You run; Claude tells you when.)

## Conventional Commits

Format: `type(optional scope): description`. Examples:

```
feat(player): equip and unequip fighters
fix(assistant): handle empty string in ASSISTANT_MODEL
refactor(rate-limit): Upstash backend with in-memory fallback
docs: deployment guide for Vercel
test(campaign-rules): cover 2D6 scenario table
chore(ci): add typecheck/lint/test workflow
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `build`.

## When to run database/AI commands

- Changed **schema** (`src/lib/db/schema.ts`) → `npm run db:push`.
- Changed **chunking/ingestion** or content in `content/` → `npm run rules:ingest`.
- `pgvector` must be enabled on the database before `db:push`
  (`scripts/enable-pgvector.sql`).

## Architecture decisions (ADR)

Relevant technical decisions are recorded — currently in `docs/TECHNICAL_PLAN.md` and
`docs/PROJECT_CONTEXT.md` (§5 and §6). For new major decisions (switching AI
provider, migrating AI SDK, changing data model), create a short ADR in
`docs/adr/NNNN-title.md` (context → decision → consequences).

## Non-regressions

See `docs/PROJECT_CONTEXT.md §8`. Key rules:

- **Do not** migrate the AI SDK to v5 without refactoring the route and `useChat`.
- `proxy.ts` / `auth.config.ts` are **edge-safe**: no DB or argon2 imports.
- Read env with `||` (not `??`) to treat `""` as absent.
- Always validate with Zod + check authorisation/ownership before writing.
- **IP:** `content/books/` is gitignored; the assistant is private (behind login).
