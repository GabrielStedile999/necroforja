# Publicar o NecroForja no GitHub

Guia rápido para subir o repositório. (Pode apagar este arquivo depois.)

## Descrição (campo "About" do repositório)

> NecroForja — gestor de campanhas de Necromunda. Painel público (ranking +
> Sympathisers), área do jogador (gangue, fighters, créditos) e assistente de
> regras com IA (RAG). Next.js 16 · TypeScript · Drizzle/Postgres · Auth.js · AI SDK.

## Topics (tags do repositório)

```
nextjs  react  typescript  tailwindcss  drizzle-orm  postgresql  pgvector
authjs  ai-sdk  rag  server-components  supabase  tabletop  portfolio
```

> O topic `necromunda` é opcional (uso descritivo/nominativo, ajuda a descoberta).
> Mantenha a marca **fora do nome do repositório e do domínio** — apenas como
> menção descritiva. Ver a nota de IP no README.

## Antes do primeiro push — checklist

- [x] `.env` está no `.gitignore` (segredos NÃO vão para o repo).
- [x] `content/books/` (texto integral dos livros, © Games Workshop) está
      ignorado — uso local/privado.
- [x] Sem segredos hardcoded no código (`src/`).
- [ ] Conferir que o `.env` real **não** foi commitado (`git status` antes do push).

## Comandos

```bash
cd "caminho/para/Portfolio"

git init
git add .
git status                      # confirme: .env e content/books NÃO listados
git commit -m "feat: NecroForja — gestor de campanhas de Necromunda (MVP fases 1-3)"

git branch -M main
git remote add origin git@github.com:SEU_USUARIO/necroforja.git
git push -u origin main
```

## Sugestão de seções para o README no GitHub (já cobertas)

- Stack, como rodar, scripts, autenticação, assistente de IA (RAG), roadmap e a
  nota de IP — tudo já está no `README.md`.
- Para impressionar em portfólio: adicione 2–3 screenshots (landing, painel do
  Arbitrator, chat do assistente) e, quando publicar, o link do deploy na Vercel.
