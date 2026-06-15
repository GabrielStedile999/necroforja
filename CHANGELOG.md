# Changelog

Todas as mudanças relevantes deste projeto. Formato baseado em
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e versionamento
[SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Alterado
- **Ficha de gangue em PDF** redesenhada: layout em "dossiê" espaçado com tema
  NecroForja (header escuro + linha hazard, métricas em mono, blocos de fighter
  com tarja lateral, equipamento com quebra de linha, mortos destacados).

### Adicionado
- Gestão de equipamento e Stash do jogador (equipar/desequipar, mover do Stash).
- Ciclo de vida do fighter (status/XP) e efeitos de Downtime.
- Atribuição manual de Sympathisers e on/off pelo Arbitrator.
- Triumphs e encerramento de campanha.
- Melhorias do assistente de IA (recuperação) e rate limit durável (Upstash).
- Exportação de ficha de gangue em PDF.
- PWA (instalável) e ajustes de SEO/Lighthouse.
- Testes de integração e endurecimento geral.

> Atualize esta seção a cada PR. Ao publicar uma versão, mova os itens para uma
> seção versionada (ex.: `## [0.2.0] - 2026-07-01`).

## [0.1.0] - 2026-06-15

### Adicionado
- **Fase 1:** autenticação (Auth.js v5 + Argon2id), criação de contas pelo
  admin, edição de gangue com recálculo de Rating/Wealth, rotas protegidas.
- **Fase 2:** desafios por Sympathiser (registro/resolução com transferência de
  controle), avanço de ciclo/fase, painel do Arbitrator, ranking vivo na landing.
- **Fase 3:** assistente de regras com IA (RAG) — pgvector + embeddings + Claude,
  citando livro e página oficiais; ingestão de `content/`.
- Identidade visual "tom Necromunda" e marca **NecroForja**.
