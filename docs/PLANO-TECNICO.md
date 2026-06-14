# Plano Técnico — Portfólio + Gestor de Campanha Necromunda

> Documento de arquitetura e decisões de produto. Versão 1.0 — Jun/2026.
> Autor do projeto: Gabriel Stedile. Documento vivo: revisar a cada fase.

---

## 1. Visão geral e estratégia

O projeto tem **dois objetivos sobrepostos** que, felizmente, se reforçam:

1. **Portfólio profissional** — provar capacidade de engenharia e product design para recrutadores. Aqui o que importa é: stack moderna e defensável, código limpo, performance medível (Lighthouse), acessibilidade, SEO, deploy real em produção e uma feature de IA que diferencie.
2. **Ferramenta real de campanha Necromunda** — você é o árbitro (Arbitrator) e precisa gerenciar gangues, créditos, missões e ranking durante jogos presenciais, com ótima experiência em celular/tablet.

A boa notícia: a melhor decisão técnica para o objetivo 1 (Next.js + Postgres + IA com RAG + deploy gratuito) é exatamente a mesma que serve o objetivo 2. Não há conflito. Construímos **um produto só**, e o portfólio é "este produto funcionando de verdade + o repositório bem documentado".

**Princípio condutor:** começar pequeno (MVP enxuto), arquitetar para expansão, e tratar cada fase como uma "feature de portfólio" demonstrável isoladamente.

---

## 2. Stack recomendada (e por quê)

### 2.1 Resumo executivo da stack

| Camada | Escolha | Alternativa considerada |
|---|---|---|
| Framework | **Next.js 16.2 (App Router, React 19, Server Components)** | Vite + React Router (SPA pura) |
| Linguagem | **TypeScript** (strict) | — |
| Estilo | **Tailwind CSS v4 + shadcn/ui (Radix)** | CSS Modules, Panda CSS |
| Banco | **PostgreSQL** (via Supabase ou Neon) | SQLite/Turso, MongoDB |
| ORM | **Drizzle ORM** | Prisma |
| Auth | **Auth.js v5** (admin cria contas) ou **Supabase Auth** | Clerk (pago acima do free) |
| Validação | **Zod** (cliente + servidor) | Yup |
| IA | **Vercel AI SDK + RAG com pgvector** | API direta sem abstração |
| Hospedagem | **Vercel (Hobby, grátis)** + banco no **Supabase/Neon** | Cloudflare Pages + D1 |
| Testes | **Vitest + Playwright** | Jest + Cypress |
| Qualidade | **ESLint + Prettier + Biome opcional**, **TypeScript strict** | — |

### 2.2 Framework: Next.js 16 (App Router)

A versão estável atual (jun/2026) é a **16.2.7**, com React 19 e Turbopack como bundler padrão. É a escolha certa aqui por quatro razões alinhadas aos seus requisitos explícitos:

- **SEO e "ser encontrado pelo Google"** — Next renderiza no servidor (SSR/SSG). A landing page pública e qualquer página que precise ranquear vêm com HTML completo, metadados dinâmicos (Metadata API), `sitemap.xml`, `robots.txt` e Open Graph nativos. Uma SPA pura (Vite/CRA) entrega uma `<div id="root">` vazia e prejudica indexação — exatamente o que você quer evitar.
- **Velocidade e otimização de renderização** (seu requisito central) — Server Components renderizam dados no servidor e enviam só o HTML/JSON necessário, reduzindo JavaScript no cliente. Streaming + Suspense exibem a página progressivamente. `next/image` otimiza imagens automaticamente (importante num site com arte pesada de Necromunda). `next/font` elimina layout shift de fontes.
- **Segurança** — Server Components e Server Actions mantêm lógica sensível e segredos no servidor; o cliente nunca vê credenciais de banco ou chaves de IA. Middleware centraliza checagem de autenticação por rota.
- **Portfólio** — é o framework React mais valorizado no mercado hoje. Demonstrar domínio de App Router, Server Components e Server Actions é um forte sinal de senioridade.

**Trade-off honesto:** se você quisesse o mínimo de complexidade possível, um Vite + React SPA é mais simples mentalmente. Mas você perderia SEO, otimização de renderização server-side e pontos de portfólio — três coisas que você pediu explicitamente. Next.js vence com folga aqui.

### 2.3 Estilo: Tailwind v4 + shadcn/ui

- **Tailwind v4** — utilitários atômicos, mobile-first por padrão (essencial para o uso em mesa via celular/tablet), zero CSS morto em produção, e tokens de tema centralizados (vamos definir as cores Necromunda como CSS variables/tokens).
- **shadcn/ui** — componentes acessíveis (construídos sobre Radix: foco, teclado, ARIA prontos) que você **copia para o seu repositório** em vez de importar como dependência. Isso significa controle total do visual — perfeito para reescrever a aparência no tom Necromunda sem brigar com estilos de uma lib. Acessibilidade "de graça" também ajuda o portfólio.

### 2.4 TypeScript strict + Zod

`tsconfig` em modo `strict`. **Zod** define os schemas de validação uma única vez e os reaproveita em: validação de formulários no cliente, validação nas Server Actions/rotas de API, e inferência de tipos. Isso fecha a porta para dados inválidos chegarem ao banco — um pilar de segurança e de qualidade de código demonstrável.

---

## 3. Banco de dados (avaliação pedida)

### 3.1 A escolha: PostgreSQL relacional

Seus dados são **fortemente relacionais e com integridade rígida**: uma campanha tem várias gangues; uma gangue tem vários fighters; cada fighter tem várias armas/equipamentos/skills; cada item tem um custo em créditos; batalhas geram eventos de pontuação. Os cálculos de "créditos gastos" e "gang rating" dependem de somas consistentes dessas relações.

Para esse perfil, **PostgreSQL** é a escolha natural e a mais defensável em portfólio:

- Integridade referencial (foreign keys), transações ACID, constraints — você nunca terá um fighter órfão ou um equipamento sem dono.
- SQL maduro para os agregados de pontuação (somar custos, ranquear gangues).
- **pgvector**: extensão que transforma o mesmo Postgres num banco vetorial para a feature de IA (RAG). Um banco só serve dados da aplicação **e** a busca semântica de regras — elegante e econômico.
- Ecossistema enorme, ótimo para currículo.

**Por que não as alternativas:**
- *MongoDB (NoSQL)*: documentos aninhados parecem convenientes para uma gangue, mas você perderia integridade referencial e agregações relacionais ficariam mais frágeis. Não recomendado para dados com tantas relações e cálculos.
- *SQLite/Turso*: excelente e baratíssimo, ótimo para baixo tráfego. Viável, mas Postgres + pgvector entrega a IA no mesmo lugar e impressiona mais no portfólio. Fica como alternativa válida se quiser simplicidade extrema.

### 3.2 Onde hospedar o Postgres: Supabase vs Neon

Ambos têm free tier generoso e região na **América do Sul (São Paulo / `sa-east-1`)**, o que reduz latência para os jogadores no Brasil.

**Supabase (recomendado para começar rápido)** — Postgres gerenciado + Auth + Storage (para imagens de gangues/fighters) + Row Level Security, tudo num pacote. Free tier (jun/2026): ~500 MB de banco, 1 GB de storage, 5 GB de banda, até 50.000 usuários ativos/mês, 2 projetos. **Atenção:** o projeto é **pausado após ~7 dias sem atividade** no plano grátis e não há backups automáticos. Para uma campanha com jogos esporádicos, isso significa que o primeiro acesso após dias parados pode demorar a "acordar" — contornável com um cron ping (a própria feature de "task agendada" pode manter vivo) ou aceitando o cold start.

**Neon (alternativa elegante)** — Postgres serverless que **escala a zero** e volta rápido; ótimo para tráfego intermitente como o seu. Também tem pgvector. Mais "só banco" (auth você resolve com Auth.js).

**Recomendação:** comece com **Supabase** pela economia de tempo (auth + storage + db + RLS num lugar só) e migre/avalie Neon se o cold start incomodar. Em ambos, **selecione a região São Paulo** na criação.

### 3.3 ORM: Drizzle

**Drizzle ORM** — SQL-like, type-safe, leve e com migrations versionadas. Roda muito bem em ambiente serverless/edge (importante na Vercel) e gera tipos TypeScript a partir do schema. Prefiro a Prisma aqui pela leveza no serverless e pela transparência do SQL gerado (bom para você aprender e para falar sobre em entrevista). Prisma é alternativa perfeitamente válida se você priorizar DX/maturidade.

---

## 4. Hospedagem e custo

### 4.1 Recomendação: Vercel (Hobby/grátis) + Supabase (grátis)

- **Vercel Hobby** hospeda o Next.js com CDN global, HTTPS automático, deploy a cada `git push`, preview deployments por PR e edge network (boa latência no Brasil). Free tier (jun/2026): 100 GB de banda, ~1 milhão de invocações de função/mês — muito acima do que sua campanha precisa.
- **Custo total previsto: US$ 0/mês** no início (Vercel Hobby + Supabase Free).

**Ponto de atenção importante — uso comercial:** o plano **Hobby da Vercel é apenas para uso pessoal/não comercial**. Um portfólio e uma ferramenta privada de campanha **se enquadram como não comercial** — está OK. Se um dia o site exibir anúncios, links de afiliados ou virar produto pago, será preciso o plano **Pro (US$ 20/mês)**.

### 4.2 Alternativa se quiser evitar a cláusula comercial

**Cloudflare Pages + Workers** (com banco no Neon ou no Cloudflare D1/SQLite) permite uso comercial no free tier e tem excelente rede no Brasil. Mais configuração, porém. Mantenha como plano B; para os seus objetivos, Vercel + Supabase é o caminho mais rápido e bonito.

### 4.3 Domínio

Compre um domínio próprio (`.com`/`.dev`, ~US$ 10–15/ano) — é o único custo recomendado e vale muito para portfólio e SEO. Aponte para a Vercel. É o que separa "projeto de hobby" de "produto profissional" aos olhos de um recrutador.

---

## 5. Design system "tom Necromunda" (sem infringir IP)

### 5.1 A linha de IP — o que pode e o que evitar

Games Workshop é **agressiva** na defesa de suas marcas. A regra prática segura:

- **Pode:** capturar o *tom* e a *linguagem visual de gênero* — gótico industrial, sub-cúpula (underhive), metal corroído, faixas de perigo (hazard stripes), tipografia stencil, atmosfera distópica. Estética de gênero não é protegível.
- **Evite:** o logotipo da Necromunda, fontes proprietárias da GW, os símbolos/ícones específicos das Casas (Goliath, Escher, Orlock, Van Saar, Delaque, Cawdor), arte oficial, o "aquila"/iconografia imperial registrada, e os nomes próprios como marca de produto. Não republique arte oficial nem use os logos.
- **Estratégia:** crie **iconografia e nomes próprios originais** que evoquem o universo. Se a campanha usa as Casas oficiais nas regras, referencie-as como **texto** ("Casa Goliath") para uso pessoal/privado dos jogadores — sem reproduzir os logos/artes. O risco é baixíssimo num site privado de campanha, mas o portfólio público deve usar **arte e marca próprias**.

> Resumo: o usuário deve **sentir** que é Necromunda ao entrar; mas tudo que é marca registrada é substituído por equivalentes originais seus.

### 5.2 Paleta de cores (tokens)

Fundo escuro industrial com acentos tóxicos/perigo. Tokens propostos (CSS variables):

```
--bg-void:        #0B0C0E   /* preto-fuligem, fundo base            */
--bg-panel:       #15171B   /* painéis/cards, metal escuro          */
--bg-elevated:    #1E2127   /* superfícies elevadas                 */
--border-rivet:   #2C2F36   /* bordas, "chapas rebitadas"           */
--ink:            #E6E1D6   /* texto principal, off-white sujo      */
--ink-muted:      #9A968C   /* texto secundário                     */
--hazard:         #F2A900   /* âmbar/perigo — CTA primário          */
--hazard-strong:  #FF7A00   /* laranja-aviso, destaques             */
--toxic:          #8FBF3F   /* verde-tóxico — status/sucesso        */
--blood:          #A11B1B   /* vermelho-sangue — perigo/exclusão    */
--rust:           #7A4A2B   /* ferrugem — detalhes                  */
--gas-cyan:       #3FB6A8   /* ciano de neon — links/IA             */
```

Modo escuro é o **padrão** (e provavelmente único — combina com o tom). Garanta contraste AA: o off-white `--ink` sobre `--bg-void` passa folgado.

### 5.3 Tipografia

Use fontes **livres/open-source** com cara industrial (sem usar as proprietárias da GW):

- **Display/títulos:** uma stencil ou condensed industrial — ex.: *Oswald*, *Saira Condensed*, *Teko* ou *Anton* (Google Fonts, licença OFL). Maiúsculas, tracking aberto, peso forte.
- **Corpo:** uma sans neutra e legível em mesa — *Inter* ou *IBM Plex Sans*.
- **Mono (dados/estatísticas):** *JetBrains Mono* ou *IBM Plex Mono* — combina com o tom "terminal de cúpula" e fica ótimo em tabelas de créditos/rating.

Carregue via `next/font` (zero layout shift).

### 5.4 Linguagem visual de componentes

- **Painéis "chapa metálica"**: cards com borda de 1px `--border-rivet`, cantos levemente chanfrados, opcional textura sutil de ruído/grão.
- **Hazard stripes**: faixas diagonais âmbar/preto como separadores ou em estados de alerta (usar com parcimônia).
- **Botões**: primário âmbar (`--hazard`) com texto escuro; estados de foco bem visíveis (acessibilidade).
- **Cabeçalhos de seção**: estilo "stencil estampado", uppercase, com um pequeno traço/ícone original à esquerda.
- **Microinterações**: transições rápidas (120–180ms), sem exageros — performance e seriedade.
- **Iconografia**: lucide-react como base, com 3–5 ícones próprios autorais para dar identidade (ex.: marcador de gangue, crédito, missão).

### 5.5 Acessibilidade e mobile-first

Como o uso real é em **celular/tablet na mesa de jogo**, o design é mobile-first de verdade: alvos de toque ≥44px, tabelas que viram cards no mobile, navegação por baixo (bottom-nav) no app de gestão, e contraste alto para ambientes mal iluminados. Tudo testado em Lighthouse (meta: 95+ em Performance, Accessibility, SEO, Best Practices).

---

## 6. Features e roadmap por fases

### Fase 0 — Fundação (infra + design tokens)
Repositório, Next.js + TS strict, Tailwind + tokens Necromunda, shadcn/ui customizado, schema inicial Drizzle, conexão Supabase (região SP), CI básico (lint + typecheck + testes), deploy na Vercel com domínio. **Entregável de portfólio:** "site no ar, deploy automatizado".

### Fase 1 — MVP (autenticação + gangues)
- **Login do administrador** e **dashboard do admin**: criar/editar/desativar contas de jogadores manualmente (sem self-signup — fechado por design). Convite por e-mail ou senha temporária.
- **Página pública (landing)**: dashboard aberto da campanha — fase atual, missão atual, nº de jogadores, gangues participantes, e um **ranking dos melhores jogadores**. SSG/ISR para SEO e velocidade.
- **Dashboard do jogador**: criar a própria gangue, ver/editar a lista de fighters, e o cálculo automático de **créditos gastos** e **gang rating** por fighter e total.

### Fase 2 — Campanha viva
- Registro de **batalhas/missões** (resultado, participantes, recompensas/créditos, ferimentos/mortes).
- **Pontuação automática** e ranking atualizado a partir dos eventos de batalha.
- Linha do tempo da campanha; estado "em que missão estamos".
- Histórico de cada gangue (evolução de rating ao longo do tempo).

### Fase 3 — IA (o diferencial de portfólio)
Assistente de regras com **RAG** (detalhado na seção 7).

### Fase 4 — Polimento e PWA
- **PWA** (instalável, funciona offline-friendly para consulta em mesa).
- Otimização de imagens, code-splitting fino, auditoria Lighthouse.
- Exportar ficha de gangue em PDF.
- Logs/observabilidade básica.

---

## 7. Modelo de dados (esboço)

Entidades principais (PostgreSQL):

```
campaign        (id, name, status, current_phase, current_mission_id, created_at)
user            (id, email, role['admin'|'player'], display_name, is_active, created_at)
gang            (id, campaign_id, owner_user_id, name, house, credits_stash, rating_cached, created_at)
fighter         (id, gang_id, name, type, base_cost, status['active'|'injured'|'dead'], xp)
equipment       (id, name, category['weapon'|'wargear'|'skill'], cost)  -- catálogo
fighter_equipment (fighter_id, equipment_id, qty)                       -- N:N
battle          (id, campaign_id, mission_id, played_at, notes)
battle_result   (id, battle_id, gang_id, outcome, credits_earned, points)
mission         (id, campaign_id, name, sequence)
rule_chunk      (id, source, heading, content, embedding vector)        -- para a IA (pgvector)
```

**Cálculos derivados:**
- *Custo da gangue (créditos gastos)* = Σ `fighter.base_cost` + Σ (`equipment.cost` × `qty`).
- *Gang rating* = custo da gangue + bônus de XP/skills conforme as regras Necromunda (a fórmula exata vem dos livros — ajustar quando os PDFs subirem).
- Manter `rating_cached` na gangue, recalculado em escrita (Server Action) para leitura rápida na landing/ranking.

**Segurança de dados (RLS):** com Supabase, políticas de Row Level Security garantem que um jogador só leia/edite a **própria** gangue, enquanto o admin vê tudo, e o público só acessa a view agregada da campanha. Isso é defesa em profundidade além da checagem na aplicação.

---

## 8. Feature de IA — Assistente de Regras (RAG)

### 8.1 O conceito
Um **assistente conversacional** que responde dúvidas de regras da campanha. Em vez de o LLM "inventar", usamos **RAG (Retrieval-Augmented Generation)**: indexamos os textos de regras em pedaços (chunks), geramos embeddings, e na hora da pergunta buscamos os trechos mais relevantes (busca vetorial com pgvector) e os entregamos ao modelo como contexto. Respostas ancoradas, com citação da fonte.

### 8.2 Por que é uma ótima feature de portfólio
RAG é a aplicação de IA mais demandada no mercado hoje. Mostra que você sabe: chunking, embeddings, busca vetorial, prompt engineering, streaming de resposta e UX de chat. Tudo no mesmo Postgres (pgvector), sem infra extra.

### 8.3 Pipeline técnico
1. **Ingestão**: você alimenta as regras aos poucos (texto). Pipeline divide em chunks (~500–800 tokens), gera embeddings e salva em `rule_chunk.embedding`.
2. **Consulta**: pergunta do usuário → embedding → `ORDER BY embedding <-> query` (similaridade) no Postgres → top-k chunks.
3. **Geração**: chunks + pergunta vão ao LLM via **Vercel AI SDK** (streaming da resposta no chat). Prompt instrui a responder só com base no contexto e citar a seção.
4. **Guardrails**: se não houver contexto relevante, responder "não encontrei nas regras" em vez de alucinar.

### 8.4 Aplicações além do chat
- **FAQ interativo**: perguntas frequentes pré-computadas.
- **Resumo de regras**: gerar resumos de seções sob demanda.
- **Assistente do árbitro**: durante o jogo, consulta rápida ("quanto custa reagrupar?", "como funciona ferimento X?").

### 8.5 Custo e provedores
Use **API da Anthropic (Claude)** ou **OpenAI** — pague-por-uso, centavos no seu volume. Embeddings são baratíssimos. Coloque **rate limiting** na rota de IA (proteção de custo e segurança). Chaves ficam só no servidor (variáveis de ambiente na Vercel), nunca no cliente.

### 8.6 ⚠️ Cuidado de IP na IA
As regras da Necromunda são **material protegido por copyright**. Para o **uso privado** da sua campanha (usuários autenticados que já possuem os livros) o risco é baixo. Mas **não exponha o assistente de regras publicamente** reproduzindo texto integral dos livros — isso seria redistribuição de conteúdo protegido. Recomendação: o assistente de IA fica **atrás do login**, restrito aos jogadores da campanha; a parte pública usa apenas conteúdo original seu. Assim você demonstra a engenharia de RAG no portfólio (pode gravar um vídeo/demo) sem republicar IP de terceiros.

---

## 9. Performance, segurança e SEO (requisitos transversais)

**Performance / renderização:**
- Server Components por padrão; Client Components só onde há interatividade.
- Streaming + Suspense; `next/image` e `next/font`; ISR/SSG nas páginas públicas.
- `rating_cached` para evitar recálculo em leitura; índices no Postgres nas FKs e colunas de ordenação.
- Meta Lighthouse: 95+ nas quatro categorias.

**Segurança:**
- Auth via Auth.js v5 (ou Supabase Auth), sessões em cookies httpOnly/secure.
- Middleware protegendo rotas `/admin` e `/player`; autorização por papel.
- **RLS no Postgres** como segunda camada.
- Validação Zod em toda entrada; ORM parametrizado (sem SQL injection).
- Segredos só no servidor; rate limiting na IA e no login; headers de segurança (CSP, HSTS) — a Vercel facilita.
- Sem self-signup: superfície de ataque reduzida por design.

**SEO / "encontrado pelo Google":**
- HTML renderizado no servidor, Metadata API por página, `sitemap.xml`, `robots.txt`, dados estruturados (JSON-LD), Open Graph para compartilhamento.
- Domínio próprio + HTTPS + Core Web Vitals verdes (que o Google usa como sinal de ranking).

---

## 10. Qualidade, testes e DX (pontos de portfólio)

- **TypeScript strict**, ESLint, Prettier.
- **Vitest** (unidade — sobretudo os cálculos de créditos/rating, que são o coração do domínio) + **Playwright** (e2e dos fluxos críticos: login, criar gangue, ver ranking).
- **CI no GitHub Actions**: lint + typecheck + testes em cada PR; deploy automático na Vercel.
- **README forte** + este documento + diagramas (modelo de dados, arquitetura). Para recrutador, documentação clara é um diferencial enorme.
- Commits convencionais, branches por feature, preview deploys por PR.

---

## 11. Riscos e decisões em aberto

- **Cold start do Supabase Free** (pausa após ~7 dias) — mitigar com task agendada de ping ou aceitar o atraso no primeiro acesso. Reavaliar Neon se incomodar.
- **Fórmula exata de rating/créditos** — ✅ resolvida a partir dos livros (ver Apêndice A). Estruturar o catálogo de equipamentos como dado configurável para ajustar sem mudar código.
- **Uso comercial na Vercel** — manter o projeto não comercial; se mudar, ir para Pro ou Cloudflare.
- **IP da IA** — manter assistente de regras atrás do login (seção 8.6).

---

## 12. Próximos passos sugeridos

1. Você revisa este plano + o Apêndice A e ajusta escopo do MVP.
2. ✅ PDFs lidos — fórmulas e mecânica da campanha extraídas (Apêndice A). Falta apenas você confirmar **quais Sympathisers** e **quais gangues/jogadores** já estão na sua campanha atual para semear os dados.
3. Eu gero um **mockup visual** (landing + dashboard) no tom Necromunda para validarmos o design antes de codar.
4. Iniciamos a **Fase 0** (scaffold do repositório).

> Quando quiser, é só dizer por onde começar (mockup, scaffold, ou refinar regras com os livros).

---

## Apêndice A — Regras extraídas dos livros (Core Rulebook 2023 + Cinderak Burning)

Esta seção transforma as regras oficiais nas **especificações concretas** que o software precisa implementar. Os números abaixo vêm diretamente dos dois PDFs.

### A.1 A campanha que você arbitra: *The Aranthian Succession — Cinderak Burning*

Não é uma campanha genérica — tem estrutura e mecânica próprias, e **o app é basicamente a ferramenta digital do Arbitrator** (você). As responsabilidades que o livro atribui ao Arbitrator mapeiam quase 1:1 para features:

| Responsabilidade do Arbitrator (livro) | Feature do app |
|---|---|
| Listar todas as gangues envolvidas | Dashboard admin: CRUD de jogadores/gangues |
| Acompanhar o controle de Sympathisers | Painel de Sympathisers (quem controla o quê) |
| Manter jogadores informados da progressão | Landing pública: ciclo/fase atual, ranking |
| Decidir início/fim de cada fase e do campeonato | Admin: datas de ciclos e fases |
| Registrar vitórias | Log de desafios/batalhas |
| Conceder Triumphs no fim | Tela de encerramento e premiação |

### A.2 Estrutura temporal da campanha

A campanha tem **7 ciclos** (cada ciclo ≈ 1 semana, mas o Arbitrator define), divididos em três fases:

```
Fase 1: Great Darkness     → 3 ciclos
Downtime                   → 1 ciclo   (recuperação/recrutamento; passos A–E)
Fase 3: Spark of Rebellion → 3 ciclos
```

Passos do Downtime (no fim da fase Great Darkness): A. Fighters Recover · B. Captives Returned · C. Juves/Prospects promovidos · D. Fresh Recruitment · E. Declare Allegiance.

> Implicação para o app: a entidade `campaign` precisa de `phase` (enum: great_darkness | downtime | spark_of_rebellion) e `current_cycle` (1–7), com datas. A landing pública mostra "Ciclo 4 de 7 — Downtime".

### A.3 Sympathisers (o coração do placar)

Sympathisers são um tipo especial de **Território** — a "moeda" da campanha. Mecânica:

- Deck montado com **metade de um baralho**: só Espadas e Ouros (26 cartas = 26 Sympathisers, ex.: *Promethium Guild*, *Water Guild*, *House Ulanti*, *Heretek*…).
- Cada gangue **começa** com alguns; o objetivo é controlar o máximo.
- A cada ciclo, **cada jogador faz 1 desafio (challenge)** a outra gangue por um Sympathiser.
- **Ordem dos desafios:** no 1º ciclo, aleatória; depois, em ordem **crescente de Gang Rating** (a gangue de menor Rating desafia primeiro).
- Quem **vence a batalha** assume o controle do Sympathiser em jogo. Se o desafio é recusado, o desafiante leva o Sympathiser automaticamente.
- Cada Sympathiser dá **Boons** enquanto controlado (ex.: "+D6×10 créditos ao Stash", regras especiais). Variam entre as fases.
- Cenário da batalha: tabela 2D6 (Fall of Badzones, Gunk War, Out of the Storm, Street Fight, etc.).

> Implicação: entidades `sympathiser` (catálogo de 26), `sympathiser_control` (qual gangue controla qual, com histórico) e `challenge` (desafiante, desafiado, sympathiser em jogo, ciclo, cenário, resultado). O **ranking público principal** é "nº de Sympathisers controlados por gangue".

### A.4 Vitória

Vencer é **mais que controlar Sympathisers**. No fim, o Arbitrator concede **Triumphs** com base em: ajudar a própria facção a vencer, a **Wealth** da gangue, e quão bem sobreviveu à Great Darkness. → tela de encerramento com premiação configurável pelo Arbitrator.

### A.5 Fórmulas exatas (Core Rulebook, p.80–92)

Estas são as fórmulas oficiais que os cálculos do app devem reproduzir:

- **Orçamento de fundação (Succession Campaign): 2.000 créditos** (não os 1.000 padrão de campanha). Créditos não gastos vão para o **Stash**. Se usar veículos, +400 créditos só para wargear/veículos "Mounted".
- **Gang Rating** = custo total de **todos os fighters e veículos**, **incluindo todo o equipamento e upgrades** que carregam.
  `rating = Σ fighter.cost(incl. armas+wargear+skills+upgrades) + Σ vehicle.cost(incl. upgrades+wargear)`
- **Wealth** = Gang Rating **+** valor de quaisquer **créditos e equipamentos no Stash**.
  `wealth = rating + stash_credits + Σ stash_equipment.cost`
- **Reputation** — atributo **separado** do Rating; começa em **1**; mede o prestígio da gangue e limita o nº de Hangers-on/Brutes. (Cresce/cai por eventos de campanha.)

> O app calcula Rating e Wealth automaticamente a cada alteração da gangue e guarda `rating_cached`/`wealth_cached` para leitura rápida no ranking e na ordenação de desafios.

### A.6 Estrutura do Fighter (Fighter Card, p.78)

Cada fighter tem: **nome**, **custo em créditos**, e o perfil de **características** — 12 atributos, sendo os 4 últimos (psicológicos) destacados:

```
M  WS  BS  S  T  W  I  A   |  Ld  Cl  Wil  Int
(Movement, Weapon Skill, Ballistic Skill, Strength, Toughness,
 Wounds, Initiative, Attacks | Leadership, Cool, Willpower, Intelligence)
```

Além disso, cada fighter carrega: **armas**, **skills**, **equipamento/armadura**, e em campanha acumula **XP** e **Advancements**, podendo sofrer **Lasting Injuries**, ficar **In Recovery**, ser **Captured** ou morrer. Categorias de modelo: Leader, Champion, Prospect, Ganger, Juve, Crew (+ Hangers-on, Brutes). Veículos têm card análogo (custo, características da tripulação, armas, upgrades, wargear).

> Implicação: `fighter` ganha colunas para os 12 atributos, `category`, `xp`, `status` (active/in_recovery/injured/captured/dead) e `captured_by`. O catálogo `equipment` precisa de `category` (weapon/wargear/skill/armour/upgrade) e `cost`.

### A.7 Modelo de dados refinado (substitui/expande a seção 7)

```
campaign            (id, name, phase, current_cycle, start_date, end_date,
                     downtime_after_cycle, status)
user                (id, email, role, display_name, is_active)
gang                (id, campaign_id, owner_user_id, name, house,
                     stash_credits, reputation, rating_cached, wealth_cached)
fighter             (id, gang_id, name, type, category, base_cost,
                     m, ws, bs, s, t, w, i, a, ld, cl, wil, int,
                     xp, status, captured_by_gang_id)
equipment           (id, name, category['weapon'|'wargear'|'skill'|'armour'|'upgrade'], cost)
fighter_equipment   (fighter_id, equipment_id, qty)
stash_item          (id, gang_id, equipment_id, qty)      -- equipamento parado no Stash
sympathiser         (id, name, card, suit, boon_text, boon_spark_text)  -- 26 do catálogo
sympathiser_control (id, sympathiser_id, gang_id, since_cycle)          -- + histórico
challenge           (id, campaign_id, cycle, challenger_gang_id,
                     challenged_gang_id, sympathiser_id, scenario,
                     outcome, resolved)
triumph             (id, campaign_id, gang_id, title, awarded_at)
rule_chunk          (id, source, heading, content, embedding vector)    -- IA/RAG
```

### A.8 Ajuste na landing pública (com base no que a campanha realmente expõe)

A "dashboard pública" que você idealizou agora tem conteúdo concreto e fiel à campanha:

- **Estado da campanha:** "Cinderak Burning — Ciclo X/7 · Fase: Great Darkness / Downtime / Spark of Rebellion".
- **Mapa de Sympathisers:** os 26, com a gangue que controla cada um (a peça visual mais "Necromunda" do site).
- **Ranking de gangues:** por nº de Sympathisers controlados (principal) e por Gang Rating / Wealth (secundários).
- **Gangues participantes:** nome, Casa, líder, nº de fighters.
- **Log recente de desafios:** quem desafiou quem, por qual Sympathiser, resultado.

### A.9 Reforço de IP (confirmado nos PDFs)

Os dois livros trazem aviso explícito de copyright da Games Workshop proibindo reprodução por qualquer meio. Isso **confirma a recomendação da seção 8.6**: o assistente de IA de regras e qualquer texto derivado dos livros ficam **atrás do login**, restritos aos seus jogadores (que possuem os livros). A camada pública usa exclusivamente conteúdo e arte **originais seus**. Nomes de mecânicas (Sympathiser, Gang Rating) podem aparecer como termos funcionais; o que não se reproduz é **texto de regras, arte e logos** oficiais em área pública.
