# PROJECT_CONTEXT

Contexto técnico do projeto, escrito para que um assistente possa trabalhar nele
sem reanalisar tudo. Para o roadmap, ver `IMPLEMENTATION_PLAN.md`. Para decisões
estratégicas originais, ver `PLANO-TECNICO.md`.

## 1. O que é

Aplicação web com dois objetivos sobrepostos:

1. **Portfólio** de engenharia/product design (Gabriel Stedile).
2. **Ferramenta real** para arbitrar a campanha de Necromunda *The Aranthian
   Succession: Cinderak Burning*. O app é, na prática, a ferramenta digital do
   Arbitrator: gerencia gangues, créditos, Sympathisers, desafios e ranking.

Público pequeno (poucos jogadores). Prioridades: performance de renderização,
segurança, ótima UX mobile (uso em mesa via celular/tablet) e SEO na parte
pública.

## 2. Stack

- **Next.js 16** (App Router, React 19, Server Components) + **TypeScript strict**
  (`noUncheckedIndexedAccess` ligado — atenção a acessos indexados).
- **Tailwind CSS v4** (config CSS-first via `@theme` em `globals.css`) + componentes
  próprios estilo shadcn (não há dependência de lib de UI).
- **PostgreSQL** + **Drizzle ORM** (`postgres-js`). Hospedagem pretendida: Supabase
  (região São Paulo). **pgvector** para o RAG.
- **Auth.js v5** (`next-auth@5 beta`) com provider **Credentials** + **Argon2id**
  (`@node-rs/argon2`). Sem self-signup.
- **IA / RAG:** Vercel **AI SDK v4** (`ai@4`), `@ai-sdk/anthropic` (geração, Claude),
  `@ai-sdk/openai` (embeddings), `@ai-sdk/react` (`useChat`).
- **Zod** para validação. **Vitest** para testes. Deploy alvo: **Vercel** (Hobby).

Versões fixadas em `package.json`. AI SDK propositalmente na **linha v4** (API
`useChat` com `input/handleInputChange/handleSubmit/isLoading`, e
`result.toDataStreamResponse()` na rota). NÃO migrar para v5 sem refatorar.

## 3. Estrutura (resumo do que cada parte faz)

```
src/
  middleware.ts              # protege /admin (role admin) e /player (autenticado)
  auth.config.ts             # config Auth.js edge-safe (callbacks authorized/jwt/session)
  auth.ts                    # NextAuth completo (Credentials + argon2 + DB) — runtime Node
  app/
    layout.tsx, globals.css  # fontes (Oswald/Inter/JetBrains), metadados, tokens de tema
    page.tsx                 # landing pública (dynamic). Usa lib/repo.getPublicView()
    login/                   # page.tsx + actions.ts (authenticate via signIn)
    dashboard/page.tsx       # despacha admin/player conforme o papel
    admin/
      page.tsx               # contas: lista jogadores, cria conta+gangue, ativa/desativa
      actions.ts             # createPlayer, togglePlayerActive (requireAdmin)
      campaign/
        page.tsx             # painel da campanha: avançar ciclo, criar/resolver desafios
        actions.ts           # createChallenge, resolveChallenge, advanceCycle
    player/
      page.tsx               # gangue do jogador: roster, Rating/Wealth, link assistente
      actions.ts             # addFighter, removeFighter, addEquipment (própria gangue)
      assistant/page.tsx     # chat do assistente de regras (RulesChat)
    api/
      auth/[...nextauth]/    # handlers do Auth.js
      assistant/route.ts     # POST RAG: auth + rate limit + retrieval + streamText (Claude)
  components/
    SiteHeader.tsx           # header server, ciente de sessão (login/logout/links por papel)
    CampaignStatus / GangRankingTable / SympathiserMap / ChallengeLog  # landing (presentational, recebem props)
    SignOutButton.tsx
    ui/                      # button, card, badge, input(+Label,Select)
    admin/                   # CreatePlayerForm, CreateChallengeForm, ResolveChallengeForm (client, useActionState)
    player/AddFighterForm.tsx
    auth/LoginForm.tsx
    assistant/RulesChat.tsx  # client, useChat -> /api/assistant
  lib/
    scoring.ts               # fórmulas oficiais: fighterTotalCost, gangRating, gangWealth, creditsRemaining
    campaign-rules.ts        # phaseForCycle, nextCycleState, challengeOrder, rollScenario, controlWinner
    repo.ts                  # getPublicView(): DB se DATABASE_URL, senão dados-semente (fallback)
    validation.ts            # schemas Zod (login, createPlayer, fighter, equipment, challenge…)
    utils.ts                 # cn() (clsx + tailwind-merge)
    auth/                    # password (argon2), guards (requireUser/requireAdmin), session-actions (signOut)
    data/                    # sympathisers.ts (catálogo 26), campaign.ts (semente: 4 gangues + controle)
    db/                      # schema.ts, index.ts (cliente), queries.ts, mutations.ts, seed.ts
    ai/                      # chunk.ts, embeddings.ts, retrieval.ts, ingest.ts, rate-limit.ts
  types/
    index.ts                 # tipos de domínio + view pública (PublicView, GangRankRow, etc.)
    next-auth.d.ts           # augmenta Session/JWT com id + role
content/
  books/*.jsonl              # texto dos livros página a página (GITIGNORED — IP). Fonte do RAG
  rules/*.md                 # notas próprias opcionais (README explica)
scripts/enable-pgvector.sql  # CREATE EXTENSION vector (rodar 1x no banco)
tests/                       # scoring, campaign-rules, chunk, fase1 (validação + senha)
```

## 4. Como as principais partes funcionam

### Autenticação e autorização
- `middleware.ts` usa `auth.config.ts` (edge-safe, SEM DB/argon2). O callback
  `authorized` decide acesso por rota: `/admin` exige `role === "admin"`, `/player`
  exige sessão.
- `auth.ts` (runtime Node) tem o provider Credentials: valida com `loginSchema`,
  busca usuário (`getUserByEmail`), confere senha com `verifyPassword` (argon2).
- Sessão é **JWT**; `id` e `role` são propagados em callbacks `jwt`/`session`.
  Tipos aumentados em `types/next-auth.d.ts`.
- Em Server Actions/Components, usar `requireUser()` / `requireAdmin()` de
  `lib/auth/guards.ts`.

### Dados da campanha (DB)
- Schema em `lib/db/schema.ts`. Tabelas: `campaign`, `app_user`, `gang`, `fighter`,
  `equipment`, `fighter_equipment`, `stash_item`, `sympathiser`,
  `sympathiser_control`, `challenge`, `triumph`, `rule_chunk` (pgvector).
- Leituras em `queries.ts` (mapeiam linhas → tipos de domínio via `toDomainGang`).
  Escritas/derivados em `mutations.ts` (`recalcGangScores`, `setSympathiserController`,
  `advanceCampaignCycle`).
- **Rating/Wealth são cacheados** em `gang.rating_cached`/`wealth_cached`,
  recalculados a cada mutação via `recalcGangScores`. O cálculo-fonte está em
  `lib/scoring.ts` (funções puras).

### Landing pública (resiliente)
- `lib/repo.ts > getPublicView()`: se `DATABASE_URL` existe, lê do banco; se não
  (ou se as tabelas não existem / erro), cai para os **dados-semente** estáticos
  (`lib/data/*`). Por isso a landing nunca quebra sem banco.
- Componentes da landing são **presentational** (recebem `view`/props); não
  buscam dados sozinhos. A página (`app/page.tsx`) é `dynamic`.

### Mecânica da campanha (Cinderak Burning)
- 7 ciclos: Great Darkness (1-3) → Downtime (4) → Spark of Rebellion (5-7).
  `phaseForCycle`/`nextCycleState` em `campaign-rules.ts`.
- **Sympathisers** = moeda da campanha (26, catálogo em `lib/data/sympathisers.ts`,
  apenas `id`+`name`). O Arbitrator liga/desliga cada um via `sympathiser.enabled`
  (action `toggleSympathiser` em `/admin/campaign`); só os **habilitados** aparecem
  no mapa público e podem ser disputados. NÃO há mais lógica de baralho
  (card/suit) — foi removida por não fazer sentido no app.
  Ranking público ordena por nº de Sympathisers controlados, desempate por Rating.
- **Desafios:** admin cria (`createChallenge`) e resolve (`resolveChallenge`). Ao
  resolver, `controlWinner` decide quem fica com o Sympathiser e
  `setSympathiserController` transfere o controle (histórico via `is_current`).
  Cenário pode ser rolado por `rollScenario` (tabela 2D6 por fase).

### Assistente de Regras (RAG)
- Rota `POST /api/assistant` (`app/api/assistant/route.ts`): autenticada
  (`auth()` → 401), com **rate limit** por usuário (`lib/ai/rate-limit.ts`, em
  memória), recupera trechos (`searchRules`) e gera resposta com Claude
  (`streamText` → `toDataStreamResponse`).
- **Pipeline de ingestão** (`npm run rules:ingest` → `lib/ai/ingest.ts`): lê
  `content/books/*.jsonl` (livro+página) e `content/rules/*.md`; **pula páginas de
  índice**; quebra em chunks (`chunk.ts`, `chunkPlain` quebra por verbete
  MAIÚSCULO p/ isolar cada trait/regra); embeddings via OpenAI
  (`text-embedding-3-small`, 1536 dims); grava em `rule_chunk`.
- **Retrieval** (`retrieval.ts`): embute a pergunta, busca por distância de
  cosseno (pgvector), `k=8`, `minSimilarity=0.1` (baixo por ser cross-lingual
  PT→EN). `citationLabel()` formata "Livro, p. X".
- O prompt instrui o modelo a responder só com o contexto e fechar com uma seção
  **"Fontes:"** com livro + página, **sem inventar página**.

## 5. Decisões técnicas já tomadas (e por quê)

- **Next.js App Router + Server Components**: SEO (SSR/SSG na parte pública),
  performance, segredos no servidor. (Ver PLANO-TECNICO seção 2.)
- **Postgres + Drizzle** (não NoSQL): dados relacionais e integridade; pgvector no
  mesmo banco serve o RAG. Drizzle pela leveza em serverless.
- **Auth.js Credentials + Argon2id**, sem self-signup: admin cria contas; menor
  superfície de ataque; mostra engenharia de auth no portfólio.
- **AI SDK v4** (não v5): API estável e conhecida (`useChat` clássico,
  `toDataStreamResponse`). Migrar para v5 exigiria refatorar rota + chat.
- **Embeddings OpenAI + geração Anthropic**: multi-provider via AI SDK (bom sinal
  de portfólio). Modelos configuráveis por env.
- **Livros indexados página a página** (não as notas paráfrase): permite citar
  **livro + página oficiais**, verificáveis. Texto dos livros fica **gitignored**
  (`/content/books`) — IP.
- **Rating/Wealth cacheados** no banco para leitura rápida no ranking.
- **Repo com fallback estático**: landing funciona sem banco conectado.

## 6. Problemas já resolvidos (não repetir)

- **Modelo de IA descontinuado**: `claude-3-5-haiku-latest` (da base de 2025) foi
  aposentado → falha silenciosa. Padrão atual: **`claude-haiku-4-5`**. Além disso,
  usar `||` (não `??`) ao ler `ASSISTANT_MODEL` para tratar string vazia no `.env`
  como "não definido".
- **Erros de stream invisíveis**: o AI SDK mascara erros por padrão. A rota usa
  `streamText({ onError })` + `toDataStreamResponse({ getErrorMessage })`, e a UI
  (`RulesChat`) renderiza `error` com botão "Tentar novamente". Manter isso.
- **RAG retornava índice em vez da definição**: causado por (a) chunks grandes
  multi-tema, (b) páginas de índice/sumário, (c) busca cross-lingual estreita.
  Resolvido com chunking por verbete MAIÚSCULO, filtro `isIndexLike` na ingestão,
  e `k=8`/`minSimilarity=0.1`.
- **Citação `[1]` sem referência**: agora o contexto carrega `FONTE: Livro, p. X`
  e o modelo lista "Fontes:" ao final.
- **Numeração de página**: calibrada — página impressa = índice do PDF − 1 (nos
  dois livros). Confirmado (Gang Rating p.92, fundação p.81).
- **Augmentação de JWT não aplicada em `auth.config`**: no callback `session`,
  fazer cast (`token.id as string`, `token.role as "admin" | "player"`).
- **Tabelas estourando o grid na landing**: itens do grid precisam de `min-w-0`
  (senão a tabela força a coluna a crescer e sobrepõe o mapa). Tabelas largas vão
  dentro de um wrapper `overflow-x-auto`. Ver `app/page.tsx` e `GangRankingTable`.
- **Lógica de baralho removida**: `card`/`suit`/`CardSuit`/pgEnum `card_suit` foram
  retirados de schema, types, data, seed, repo e UI. Sympathisers agora têm só
  `id`, `name` e `enabled`. Se reaparecer referência a "carta/naipe", é resíduo.
- **`StashItem.id` ausente no tipo de domínio**: a coluna `stash_item.id` não era
  exposta em `types/index.ts` nem em `toDomainGang`. Corrigido: `StashItem` agora
  inclui `id: string`, e `toDomainGang` mapeia `s.id`. Fixtures de teste de
  scoring foram atualizados para incluir `id` no stash.

## 7. Convenções de código

- TypeScript **strict**; com `noUncheckedIndexedAccess`, acessos como `arr[0]` são
  `T | undefined` → usar `!` quando garantido ou checagem.
- Import alias **`@/*` → `src/*`**.
- **Server Actions**: arquivo com `"use server"`; retornam estado
  `{ error?, success? }` para `useActionState`. Sempre validar com Zod e checar
  autorização (`requireUser`/`requireAdmin`) e propriedade (ex.: fighter pertence à
  gangue do usuário) ANTES de escrever. Chamar `revalidatePath` após mutação.
- **Componentes**: presentational recebem dados por props; só os que precisam de
  estado/efeito têm `"use client"`. Formulários client usam `useActionState`.
- **Estilo Necromunda**: usar tokens do tema (`bg-void`, `text-hazard`, `text-ink`,
  `text-muted`, `border-rivet`, `bg-panel`, `text-toxic`, `text-blood`, `text-cyan`),
  classe `stencil` para títulos. Não introduzir libs de UI.
- **DB**: leituras em `queries.ts`, escritas/derivados em `mutations.ts`. Após
  alterar uma gangue, chamar `recalcGangScores(gangId)`.
- Páginas autenticadas/admin: `export const dynamic = "force-dynamic"`.
- Idioma da UI e mensagens: **português**.

## 8. Cuidados importantes para futuras alterações

- **IP / Games Workshop**: o assistente é **privado** (atrás de login). Nunca
  expor texto de regras/arte na área pública. `content/books/` é gitignored e não
  deve ser commitado. Citar livro+página é ok; reproduzir o conteúdo publicamente, não.
- **Edge vs Node**: `middleware.ts`/`auth.config.ts` NÃO podem importar DB nem
  argon2 (rodam no edge). Lógica que toca banco/cripto fica em `auth.ts`/actions
  (runtime Node).
- **Mudou o schema?** Rodar `npm run db:push`. **Mudou o chunking/ingestão ou o
  conteúdo dos livros?** Rodar `npm run rules:ingest` (recria `rule_chunk`).
- **pgvector** precisa estar habilitado no banco (`scripts/enable-pgvector.sql`)
  antes do `db:push`.
- **Dimensão de embedding** (1536) está acoplada ao modelo
  `text-embedding-3-small` (`EMBEDDING_DIMENSIONS` no schema). Trocar o modelo de
  embedding exige migração da coluna `vector` e reingestão.
- **Não migrar o AI SDK para v5** sem refatorar `route.ts` (resposta de stream) e
  `RulesChat.tsx` (`useChat`).
- **Verificação no sandbox**: o registro npm é bloqueado e o `node_modules` é do
  macOS (binário nativo incompatível com o Linux do sandbox), então `vitest` não
  roda aqui. Padrão usado: `tsc --noEmit` (com um stub ambiente para
  `@node-rs/argon2` num `.d.ts` temporário na raiz, removido depois) + runners
  standalone via `node --experimental-strip-types` para funções puras. Os testes
  `vitest` rodam na máquina do usuário com `npm test`.

## 9. Scripts e variáveis

- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `db:push`,
  `db:seed`, `db:studio`, `rules:ingest`.
- `.env` (ver `.env.example`): `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`,
  `ANTHROPIC_API_KEY`, `ASSISTANT_MODEL` (= `claude-haiku-4-5`), `OPENAI_API_KEY`,
  `EMBEDDING_MODEL` (= `text-embedding-3-small`), e as credenciais do seed
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `PLAYER_PASSWORD`.
- Credenciais de seed: definidas no `.env` (com fallbacks genéricos em `seed.ts`);
  jogadores ficam `<nome>@campaign.local`. Trocar após o 1º login.

## 10. Estado atual

Fases 1–3 do `PLANO-TECNICO.md` entregues (auth+contas, gestão de gangue,
desafios+ranking vivo, assistente RAG). Features 1, 2 e 3 do `IMPLEMENTATION_PLAN.md`
entregues (equipar/desequipar fighters, gestão de Stash, ciclo de vida do fighter
+ Downtime). Pendências e próximos
passos detalhados em `IMPLEMENTATION_PLAN.md`.
