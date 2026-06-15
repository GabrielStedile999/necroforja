# Deploy — Vercel + Supabase

Guia para colocar o NecroForja no ar. Custo inicial: **US$ 0/mês**
(Vercel Hobby + Supabase Free). Tempo estimado: ~30–45 min.

> ⚠️ Vercel **Hobby** é só uso **não comercial** — um portfólio se enquadra. Se um
> dia virar produto pago/com anúncios, migrar para Pro (US$ 20/mês) ou Cloudflare.

## Pré-requisitos

- Repositório no GitHub (público recomendado para portfólio).
- Contas: [Vercel](https://vercel.com), [Supabase](https://supabase.com) e,
  opcional, [Upstash](https://upstash.com) (rate limit durável).
- Chaves de IA: `OPENAI_API_KEY` (embeddings) e `ANTHROPIC_API_KEY` (geração).

---

## 1. Banco — Supabase

1. **Create project** → escolha a região **South America (São Paulo)**.
2. Habilite o pgvector: **SQL Editor** → cole o conteúdo de
   `scripts/enable-pgvector.sql` (`CREATE EXTENSION IF NOT EXISTS vector;`) → Run.
3. Pegue **duas** connection strings em **Project Settings → Database**:
   - **Pooled** (Transaction, porta **6543**) → será o `DATABASE_URL` da app em
     produção. Acrescente `?pgbouncer=true&connection_limit=1` ao final. Use esta
     porque o Vercel é serverless (muitas conexões curtas).
   - **Direct** (porta **5432**) → use só para rodar migrações/seed da sua máquina.

---

## 2. Migrar, semear e indexar (da sua máquina, contra o banco de produção)

> A **ingestão de regras roda localmente**, porque `content/books/` está
> gitignored (IP) e não existe no servidor. Ela grava os vetores no banco de
> produção; depois a app só lê.

Crie um `.env` local apontando para o banco de produção (use a string **direct**
para isto) e rode:

```bash
# DATABASE_URL = string DIRECT (porta 5432) do Supabase
npm run db:push        # cria as tabelas (pgvector já habilitado no passo 1)
npm run db:seed        # campanha + Sympathisers + contas (usa ADMIN_EMAIL etc.)
npm run rules:ingest   # embeddings dos livros → rule_chunk (precisa OPENAI_API_KEY)
```

Defina antes, no mesmo `.env`: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PLAYER_PASSWORD`
(ver `.env.example`). Guarde as credenciais — são o seu acesso de Arbitrator.

---

## 3. App — Vercel

1. **Add New → Project** → importe o repositório do GitHub. Framework é
   detectado automaticamente (Next.js); não mude nada no build.
2. **Environment Variables** (Production) — adicione:

   | Variável | Valor |
   |---|---|
   | `DATABASE_URL` | string **pooled** (6543, com `?pgbouncer=true&connection_limit=1`) |
   | `AUTH_SECRET` | gere com `npx auth secret` |
   | `AUTH_URL` | a URL pública (ex.: `https://necroforja.vercel.app`) |
   | `ANTHROPIC_API_KEY` | sua chave |
   | `ASSISTANT_MODEL` | `claude-haiku-4-5` |
   | `OPENAI_API_KEY` | sua chave |
   | `EMBEDDING_MODEL` | `text-embedding-3-small` |
   | `UPSTASH_REDIS_REST_URL` / `_TOKEN` | (opcional) rate limit durável |

   > `ADMIN_*` / `PLAYER_PASSWORD` **não** são necessárias na Vercel — só foram
   > usadas no seed local (passo 2).
3. **Deploy.** Ao terminar, ajuste `AUTH_URL` para a URL final (se mudou) e
   refaça o deploy.

---

## 4. Verificação pós-deploy

- Abrir a URL → a landing pública carrega (ranking + mapa de Sympathisers).
- `/login` com as credenciais do Arbitrator → cai em `/admin`.
- `/admin/campaign` → criar/resolver um desafio reflete na landing.
- `/player/assistant` → perguntar uma regra retorna resposta com **livro + página**.

---

## 5. Domínio próprio (quando registrar)

Vercel → Project → **Settings → Domains** → adicionar `necroforja.com.br` (ou
`.gg`). Configure os registros DNS conforme as instruções da Vercel e atualize
`AUTH_URL` para o domínio final.

---

## Gotchas (já tratados ou a observar)

- **Pooler vs direct:** app usa a string **pooled** (6543); migrações usam a
  **direct** (5432). Misturar causa erros de conexão em serverless.
- **pgvector:** habilite a extensão **antes** do `db:push`, senão a criação da
  tabela `rule_chunk` falha.
- **Supabase Free pausa após ~7 dias** sem atividade. Para uma campanha
  intermitente, crie um **Vercel Cron** (ou tarefa agendada) que faz um GET na
  landing 1x/dia para manter o projeto "acordado".
- **Ingestão de regras:** sempre local (os livros não vão para o repo/servidor).
  Rode `rules:ingest` da sua máquina sempre que mudar o chunking ou o conteúdo.
- **Build sem DATABASE_URL:** o `next build` da Vercel terá a env definida, então
  ok. Em CI local sem banco, use um `DATABASE_URL` dummy só para o build.
