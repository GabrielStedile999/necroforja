-- Habilita a extensão pgvector (necessária para o assistente de IA / RAG).
-- Rode uma vez no banco antes de `npm run db:push`.
-- No Supabase: Dashboard > SQL Editor > cole e execute.
CREATE EXTENSION IF NOT EXISTS vector;
