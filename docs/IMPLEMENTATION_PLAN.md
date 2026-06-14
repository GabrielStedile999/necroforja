# IMPLEMENTATION_PLAN

Roadmap das próximas features, em ordem recomendada. Cada item é
auto-suficiente: um assistente deve conseguir implementar **uma feature por vez**
lendo este arquivo + `PROJECT_CONTEXT.md`, sem reanalisar o projeto inteiro.

Convenções válidas para todas as features (ver PROJECT_CONTEXT §7):
- Validar entrada com **Zod** (`lib/validation.ts`), checar autorização
  (`requireUser`/`requireAdmin`) e **propriedade** antes de escrever.
- Após mutação em gangue, chamar `recalcGangScores(gangId)`; sempre
  `revalidatePath` das rotas afetadas.
- Server Actions retornam `{ error?, success? }` e são consumidas por
  `useActionState` em componentes `"use client"`.
- Usar tokens do tema Necromunda; UI em português; páginas autenticadas com
  `export const dynamic = "force-dynamic"`.
- Verificar com `tsc --noEmit` (stub de `@node-rs/argon2`) + testes Vitest na
  máquina do usuário.

Status atual: Fases 1–3 entregues. As features abaixo são a Fase 4+ e
refinamentos.

---

## Prompt de handoff (copiar/colar)

Use isto para delegar **uma feature por vez** a um modelo implementador (Claude
Code, Codex/Cursor, etc.). Pré-requisito: o implementador precisa de **acesso
direto ao repositório** (ler/escrever arquivos) — não funciona bem em chat puro.
Recomendado: modelo intermediário (Sonnet/GPT-5) para as features mecânicas;
reservar um modelo mais forte (ou revisão dele) para as #6 (IA/RAG), #8 (PWA) e
#10 (testes). Abra um **contexto novo por feature** para gastar menos tokens.

Substitua `<NÚMERO>` pela feature desejada e cole o prompt abaixo:

```
Você vai implementar UMA feature neste projeto (Next.js 16 + TS + Drizzle +
Auth.js + RAG). Trabalhe apenas no escopo da feature; não refatore o resto.

Antes de codar, leia COMPLETO:
- PROJECT_CONTEXT.md  (stack, estrutura, convenções, problemas já resolvidos)
- A seção "## <NÚMERO>." de IMPLEMENTATION_PLAN.md (a feature a implementar)
- O bloco "Convenções válidas para todas as features" no topo de IMPLEMENTATION_PLAN.md

Regras inegociáveis (de PROJECT_CONTEXT §6 e §8):
- NÃO migrar o AI SDK para v5 (o código depende da API v4).
- middleware.ts / auth.config.ts são edge-safe: não importar DB nem argon2 ali.
- Ao ler env, usar `||` (não `??`) para tratar "" como ausente.
- Validar entrada com Zod; checar requireUser/requireAdmin E propriedade
  (ex.: o recurso pertence à gangue do usuário) ANTES de escrever.
- Após mutação em gangue, chamar recalcGangScores(gangId); revalidatePath.
- UI em português, tokens do tema Necromunda; páginas autenticadas com
  `export const dynamic = "force-dynamic"`.

Entregue:
1. A implementação completa da feature, seguindo os "Arquivos prováveis".
2. `npm run typecheck` SEM erros. (No sandbox, se @node-rs/argon2 ou os pacotes
   @ai-sdk/* não instalarem, crie um .d.ts ambiente temporário declarando-os,
   rode o tsc e remova o stub depois — ver PROJECT_CONTEXT §8.)
3. Testes Vitest novos para a lógica pura introduzida; não quebrar os existentes.
4. Cumprir os "Critérios de aceite" da feature.
5. Atualizar PROJECT_CONTEXT.md se schema, convenções ou comportamento mudaram.
6. Um resumo final: o que mudou, e os comandos que EU (usuário) preciso rodar
   na minha máquina (ex.: `npm run db:push`, `npm run rules:ingest`, `npm test`).

Não rode db:push/seed/ingest você mesmo (dependem do meu banco/chaves); apenas
me diga quando são necessários. Pergunte se algo do escopo estiver ambíguo.
```

> Dica: depois que a feature passar (tsc + testes + critérios de aceite), peça ao
> implementador para atualizar este arquivo marcando a feature como concluída,
> para a próxima iteração continuar limpa.

---

## 1. Equipar/desequipar fighters (UI de equipamento) ✅ CONCLUÍDA

**Objetivo.** Permitir que o jogador equipe armas/wargear/armadura/skills nos
fighters da própria gangue pela interface. A action `addEquipment` já existe;
falta UI e a remoção de item.

**Comportamento esperado.**
- Em `/player`, cada fighter mostra seus itens equipados (nome + custo) e o custo
  total do fighter.
- Formulário "Adicionar equipamento" por fighter: nome, categoria
  (weapon/wargear/skill/armour/upgrade), custo. Ao enviar, o item é criado e
  vinculado; Rating/Wealth recalculam.
- Botão "remover" por item equipado.

**Arquivos prováveis.**
- `src/app/player/actions.ts` — já tem `addEquipment`; adicionar
  `removeEquipment(formData)` (valida que o `fighter_equipment` pertence a fighter
  da gangue do usuário; deleta vínculo + opcionalmente o `equipment`).
- `src/components/player/AddEquipmentForm.tsx` (novo, client, `useActionState`).
- `src/app/player/page.tsx` — renderizar itens por fighter + formulário + remover.
- `src/lib/validation.ts` — já tem `addEquipmentSchema`; criar
  `removeEquipmentSchema` se necessário.
- `src/lib/db/queries.ts` — `getGangByOwnerId` já traz `fighter.equipment`; reusar.

**Riscos.** Autorização (não equipar fighter de outra gangue) — reusar
`fighterBelongsToGang`. Excluir `equipment` órfão vs. compartilhado: hoje cada
item é uma linha própria por fighter, então pode deletar com segurança.

**Critérios de aceite.**
- Jogador adiciona/remove item; Rating e Wealth atualizam na hora.
- Jogador não consegue alterar fighter de outra gangue (testar action direta).
- Itens aparecem listados sob cada fighter.

---

## 2. Gestão de Stash (créditos + equipamento guardado) ✅ CONCLUÍDA

**Objetivo.** Refletir corretamente a **Wealth** (= Rating + Stash). Hoje
`stash_credits` existe e `stash_item` está no schema, mas não há UI para mexer.

**Comportamento esperado.**
- Jogador vê o Stash (créditos + itens guardados) na `/player`.
- Ações: ajustar créditos do Stash (recompensas pós-batalha), adicionar/remover
  item ao Stash, e **mover item do Stash para um fighter** (e vice-versa).

**Arquivos prováveis.**
- `src/app/player/actions.ts` — `setStashCredits`, `addStashItem`,
  `removeStashItem`, `equipFromStash` (transação: remove de `stash_item`, cria
  `fighter_equipment`).
- `src/lib/validation.ts` — schemas de stash.
- `src/components/player/StashPanel.tsx` (novo).
- `src/app/player/page.tsx` — painel de Stash.
- `src/lib/db/mutations.ts` — helper de transação se mover item; `recalcGangScores`.

**Riscos.** Consistência (mover item deve ser atômico — usar transação Drizzle
`db.transaction`). Wealth depende de `stash_item.qty * equipment.cost` — conferir
`gangWealth` (já implementado).

**Critérios de aceite.**
- Alterar créditos/itens do Stash muda a Wealth (não o Rating).
- Mover item Stash→fighter aumenta o Rating e some do Stash; Wealth constante.
- Operações restritas à própria gangue.

---

## 3. Ciclo de vida do fighter + passos de Downtime ✅ CONCLUÍDA

**Objetivo.** Suportar status do fighter (active/in_recovery/injured/captured/dead),
XP/avanços e os passos de Downtime da campanha.

**Comportamento esperado.**
- Jogador/admin altera status e XP do fighter; fighters mortos não contam no
  Rating (já tratado em `gangRating`).
- Admin, ao avançar para/da fase Downtime, dispara os passos: limpar "In
  Recovery", devolver capturados, etc. (ver PLANO-TECNICO Apêndice A; Core
  Rulebook p.164+ via assistente).
- "Captured": registrar `captured_by_gang_id`.

**Arquivos prováveis.**
- `src/app/player/actions.ts` — `updateFighterStatus`, `addFighterXp`.
- `src/app/admin/campaign/actions.ts` — `applyDowntime(campaignId)` (limpa
  recovery, devolve capturados) acionado ao entrar no ciclo 4.
- `src/lib/validation.ts` — schemas.
- `src/app/player/page.tsx` — controles de status/XP por fighter.
- `src/lib/db/mutations.ts` — `applyDowntimeEffects`.

**Riscos.** Regras de Downtime são detalhadas; começar pelo essencial (recovery +
capturados) e iterar. Recalcular Rating quando status muda (mortos saem).

**Critérios de aceite.**
- Marcar fighter como `dead` reduz o Rating; `in_recovery` é resetado no Downtime.
- XP persiste e aparece no roster.
- Captura registra a gangue captora.

---

## 4. Admin: atribuição inicial de Sympathisers

**Objetivo.** Permitir ao Arbitrator definir/ajustar manualmente quem controla
cada Sympathiser (hoje só muda via resolução de desafio; o estado inicial vem do
seed).

**Comportamento esperado.**
- Em `/admin/campaign`, uma seção lista os 26 Sympathisers com o controlador
  atual e um seletor para reatribuir (ou "livre").
- Reatribuir usa `setSympathiserController` (encerra controle atual, cria novo).

**Arquivos prováveis.**
- `src/app/admin/campaign/actions.ts` — `assignSympathiser(formData)`
  (`requireAdmin`, valida sympathiserId ∈ catálogo, gangId ∈ campanha ou vazio).
- `src/components/admin/SympathiserAssignForm.tsx` (novo).
- `src/app/admin/campaign/page.tsx` — seção de atribuição.
- `src/lib/validation.ts` — `assignSympathiserSchema`.

**Riscos.** Manter histórico consistente (`is_current`). Para "livre", inserir
controle com `gangId = null` ou apenas encerrar o atual (decidir: encerrar e não
inserir é mais limpo).

**Critérios de aceite.**
- Admin reatribui um Sympathiser; landing e mapa refletem na hora.
- Marcar como "livre" remove o controlador.
- Não-admin não acessa.

---

## 5. Triumphs e encerramento da campanha

**Objetivo.** Fechar o loop da campanha: ao fim (ciclo 7), o Arbitrator concede
**Triumphs** (tabela `triumph` já existe) e a campanha pode ser marcada como
encerrada.

**Comportamento esperado.**
- Em `/admin/campaign`, quando `currentCycle === totalCycles`, aparece a seção
  "Encerramento": conceder Triumphs (título + gangue) e botão "Encerrar campanha"
  (muda `campaign.status` para `finished`).
- A landing pública mostra os Triumphs e um selo de "Campanha encerrada".

**Arquivos prováveis.**
- `src/app/admin/campaign/actions.ts` — `awardTriumph`, `finishCampaign`.
- `src/lib/db/queries.ts` — `listTriumphs(campaignId)`.
- `src/lib/repo.ts` + `src/types/index.ts` — incluir `triumphs` no `PublicView`.
- `src/components/admin/AwardTriumphForm.tsx` (novo).
- `src/components/Triumphs.tsx` (novo, landing) + `src/app/page.tsx`.

**Riscos.** `getActiveCampaign` filtra `status = "active"`; ao encerrar, a landing/
admin que dependem dela precisam tratar campanha `finished` (mostrar resultado em
vez de painel ativo).

**Critérios de aceite.**
- Admin concede Triumphs e encerra; landing mostra resultado.
- Encerrada, o painel de desafios fica somente-leitura.

---

## 6. Melhorias do assistente de IA

**Objetivo.** Aumentar a precisão (busca cross-lingual) e a usabilidade das fontes.

**Comportamento esperado.**
- **Expansão de query PT→EN:** antes da busca, traduzir/expandir os termos-chave
  da pergunta para inglês (chamada barata ao Claude ou um dicionário simples) e
  embutir a versão EN (ou ambas, mesclando resultados). Melhora o recall sobre o
  texto em inglês.
- **Painel de fontes clicável:** em vez de só texto, anexar os trechos
  recuperados (livro, página, similaridade) como dados estruturados e renderizar
  um bloco "Fontes" abaixo da resposta.

**Arquivos prováveis.**
- `src/lib/ai/retrieval.ts` — `expandQuery()` opcional; mesclar resultados de duas
  buscas (dedupe por conteúdo).
- `src/app/api/assistant/route.ts` — usar `StreamData`/`appendMessageAnnotation`
  do AI SDK v4 para enviar as fontes; manter o fallback textual.
- `src/components/assistant/RulesChat.tsx` — ler `message.annotations` e renderizar
  o painel de fontes.

**Riscos.** A wiring de `StreamData` não é testável no sandbox — validar por
`tsc` contra os tipos reais do AI SDK e testar manualmente. Expansão de query
adiciona latência/custo (mínimos no volume atual). Não quebrar o fallback textual
já funcional.

**Critérios de aceite.**
- Pergunta em PT sobre regra específica (ex.: "trait Web") retorna a definição com
  livro+página corretos.
- Cada resposta exibe as fontes consultadas de forma estruturada.

---

## 7. Exportar ficha da gangue em PDF

**Objetivo.** Gerar um PDF imprimível da gangue (roster, custos, Rating/Wealth)
para uso em mesa.

**Comportamento esperado.**
- Botão "Exportar PDF" em `/player` (e admin por gangue). Gera o PDF no servidor
  e faz download.

**Arquivos prováveis.**
- `src/app/player/export/route.ts` (Route Handler `GET` que retorna o PDF) ou uma
  Server Action que devolve um blob.
- `src/lib/pdf/gangSheet.ts` — montagem do PDF.
- Dependência: avaliar `@react-pdf/renderer` ou `pdf-lib` (sem nativo; cuidado com
  bundle/edge — usar runtime Node).

**Riscos.** Bibliotecas de PDF podem ser pesadas/edge-incompatíveis — fixar
`runtime = "nodejs"` na rota. Acentuação/fontes no PDF.

**Critérios de aceite.**
- Download de um PDF legível com o roster e os totais corretos.
- Apenas dono/admin exporta a gangue.

---

## 8. PWA (instalável e amigável offline)

**Objetivo.** Permitir instalar o app no celular/tablet e consultar dados básicos
mesmo com conexão ruim na mesa de jogo.

**Comportamento esperado.**
- Manifesto + ícones; service worker com cache das páginas do jogador e assets.
- Consulta de gangue/roster funciona offline (último estado em cache).

**Arquivos prováveis.**
- `src/app/manifest.ts` (Next Metadata) + ícones em `public/`.
- Service worker (ex.: `@serwist/next` ou `next-pwa`) — avaliar compatibilidade
  com Next 16.
- Ajustes em `layout.tsx` (metadados PWA).

**Riscos.** SW + App Router exigem cuidado; dados autenticados não devem ser
cacheados indevidamente. Escolher lib compatível com Next 16.

**Critérios de aceite.**
- App instalável (Lighthouse PWA).
- Roster visível offline após visita prévia; mutações exigem rede (degradar com
  mensagem clara).

---

## 9. SEO e auditoria Lighthouse (parte pública)

**Objetivo.** Maximizar descoberta e qualidade da landing (meta: 95+ nas 4
categorias).

**Comportamento esperado.**
- `sitemap.xml`, `robots.txt`, Open Graph/Twitter, JSON-LD; imagens otimizadas;
  Core Web Vitals verdes.

**Arquivos prováveis.**
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`.
- Ajustes de metadados em `layout.tsx`/`page.tsx`.

**Riscos.** Apenas a landing deve ser indexável; `/admin` e `/player` ficam
`noindex` (e já são protegidos). Garantir que `dynamic` na landing não derrube
métricas — considerar ISR onde possível.

**Critérios de aceite.**
- Lighthouse 95+ em Performance/Accessibility/Best Practices/SEO na landing.
- `sitemap.xml` e `robots.txt` válidos; OG renderiza no compartilhamento.

---

## 10. Hardening: testes de integração, rate limit durável, observabilidade

**Objetivo.** Robustez para produção e sinal de qualidade no portfólio.

**Comportamento esperado.**
- Testes de Server Actions (criação de conta, desafio→transferência de controle,
  recálculo de Rating) — idealmente com Postgres efêmero (Testcontainers/PGlite).
- Rate limit durável para serverless multi-instância (substituir o in-memory por
  **Upstash Ratelimit**) no `/api/assistant`.
- Logging/observabilidade básica (erros de IA, falhas de auth).

**Arquivos prováveis.**
- `tests/` — novos testes de integração.
- `src/lib/ai/rate-limit.ts` — backend Upstash opcional (fallback in-memory em dev).
- `src/app/api/assistant/route.ts` — usar o novo rate limiter.

**Riscos.** Testes de integração exigem banco; escolher PGlite (sem container) p/
rodar em CI. Upstash adiciona env/infra (free tier existe).

**Critérios de aceite.**
- `npm test` cobre os fluxos críticos de escrita.
- Rate limit funciona consistentemente em ambiente serverless.

---

## Notas de priorização

- **1–3** completam o *core loop* de gestão de gangue (equipar, stash, ciclo de
  vida) — maior valor para o uso real e dependências de outras features.
- **4–5** fecham a **mecânica da campanha** (Sympathisers manuais + encerramento).
- **6** é alto valor de portfólio (IA) e pode ser feito a qualquer momento depois
  da 1.
- **7–9** são polimento/entrega (PDF, PWA, SEO).
- **10** é hardening; fazer antes de divulgar o projeto publicamente.

Sugestão de execução: uma feature por iteração, sempre terminando com `tsc`,
testes e (se mexeu em schema/ingestão) `db:push` / `rules:ingest`.
