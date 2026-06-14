# Base de conhecimento do assistente (RAG)

O assistente responde a partir de duas fontes, indexadas por `npm run rules:ingest`:

## 1. Livros oficiais — `content/books/*.jsonl` (fonte principal)

Cada linha é uma página do livro, no formato:

```json
{ "book": "Necromunda: Core Rulebook (2023)", "page": 92, "text": "..." }
```

Os chunks herdam **livro + página**, então cada resposta cita a referência
oficial (ex.: *Core Rulebook (2023), p. 92*) — fácil de conferir no livro.

> Esses arquivos são gerados a partir dos PDFs (texto por página) e ficam no
> **`.gitignore`** (`/content/books`). São de uso **local/privado** dos jogadores
> que possuem os livros — © Games Workshop. Não redistribua.

## 2. Notas próprias — `content/rules/*.md` (opcional)

Resumos/paráfrases seus. São indexados sem número de página (a citação cai para
"arquivo — seção"). Use só se quiser complementar os livros.

## Atualizar a base

```bash
# requer DATABASE_URL e OPENAI_API_KEY no .env
npm run rules:ingest   # recria a base (idempotente)
```
