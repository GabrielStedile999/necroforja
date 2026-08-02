# Changelog

All notable changes to this project. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[SemVer](https://semver.org/) versioning.

## [Unreleased]

### Added
- **Ciclo de vida da campanha pela UI** (issue #66): campanha agora nasce e
  é editada no `/admin/campaign` — card "Start a campaign" quando não existe
  nenhuma (ou quando a anterior foi encerrada) e painel "Edit campaign"
  (nome, datas, total de ciclos) na campanha ativa. Uma campanha ativa por
  vez (decisão de produto — landing, challenges e ranking assumem uma só);
  encurtar a campanha abaixo do ciclo atual é rejeitado. A estrutura de
  fases foi **generalizada pelo tamanho** (`downtimeCycle` em
  `campaign-rules.ts`): o ciclo único de Downtime fica no meio — 7 ciclos
  mantém o 3/1/3 oficial da Cinderak Burning, 5 vira 2/1/2 etc. (mínimo 3,
  máximo 14); o texto do painel e o gatilho dos efeitos de Downtime passaram
  a derivar da fase, não do ciclo 4 fixo. **Guard no seed**: `db:seed` agora
  imprime o host do banco e ABORTA se já existir campanha (a menos de
  `--force`) — o seed vira ferramenta de bootstrap, campanha de verdade se
  cria pela UI. Refinamentos de mesa: **"Set cycle"** pula pra qualquer
  ciclo, inclusive pra trás (botão de arrependimento do "Advance cycle" —
  a fase re-deriva; voltar não restaura fighters já resetados pelo
  Downtime, e cair NO ciclo de Downtime aplica os efeitos); **participação
  na campanha** — coluna nova `gang.is_active`
  (`scripts/campaign-players.sql`, migração aditiva): card "Campaign
  players" no painel lista as gangs com Activate/Deactivate — jogador
  cadastrado pode ficar de fora sem perder dados; gangs inativas somem do
  ranking público e das opções de challenge/assignment/captura; e o
  **Sympathiser Assignment** virou grid de duas colunas com as opções
  carregando gang + nome do player (só ativos). 14 testes novos
  (total: 425).
- **CRUD de gang + gestão de Reputation** (issue #64): o Árbitro agora
  controla o ciclo de vida completo das gangs pelo dashboard admin — painel
  "Edit gang" por player com edição de nome/house/**Reputation** (1–20,
  atributo separado do Rating que começa em 1 e limita Hangers-on/Brutes;
  ajuste manual até os eventos de batalha automatizarem, issue #69),
  **transferência de dono** (só pra contas de player sem gang — regra 1:1 —
  ou "release" pra deixar sem dono), **exclusão com type-to-confirm**
  (digitar o nome exato da gang; cascade apaga fighters/equipamento/stash/
  challenges/histórico de controle) e **criação de gang pra conta existente**
  sem gang (antes, conta sem gang era um beco sem saída). Gangs sem dono
  aparecem numa seção própria ("Unassigned gangs") e continuam gerenciáveis.
  Reputation agora é exibida como métrica no painel da gang (`/player` e
  `/admin/gangs/[gangId]`). Actions em `src/app/admin/gangs/actions.ts`
  (todas `requireAdmin`), 14 testes novos (total: 411).
- **Edição completa de fighter** (issue #63): cada fighter no `/player` ganhou
  um painel "Edit fighter" (mesmo padrão `<details>` da edição de conta no
  admin) que permite ao dono corrigir nome, type, categoria, custo base e o
  perfil de 12 características (M/WS/BS/S/T/W/I/A/Ld/Cl/Wil/Int, limites do
  Fighter Card) sem perder XP, status ou equipamento — antes só dava pra
  remover e recriar. Os campos foram extraídos pro componente compartilhado
  `FighterFields`, e o formulário de recrutamento agora também oferece o
  perfil opcional. Característica deixada em branco significa "não definida"
  no recrutamento e "inalterada" na edição (normalização no zod:
  `statField` transforma `""` em `undefined`; o update ignora colunas
  undefined). O grid do perfil segue a ordem de leitura do card oficial de
  fighter — 4 colunas × 3 linhas (M T W I / BS WS S A / Ld Cl Wil INT) — e
  cada input indica a natureza do dado com sufixo: `″` (polegadas) no M e
  `+` (rolagem-alvo) em BS/WS/I e nos atributos mentais; S/T/W/A são valores
  puros. Rolagens-alvo são valores de D6: aceitam estritamente 1–6 (dígito
  único no input, com filtro ativo de digitação/colagem; zod valida no
  servidor); `null` no banco significa "nunca preenchido" (exibido vazio).
  Cada atributo tem tooltip nativo (~1s de hover) com o nome completo e a
  natureza do dado (ex.: M → "Movement — distance in inches").
- **Limite de 3 armas por fighter** ("Equipping a Fighter", Core Rulebook
  2023, p.83): tentar equipar uma 4ª arma — tanto adicionando equipamento
  novo quanto movendo uma arma do Stash — retorna erro junto ao botão com a
  referência da regra. Só a categoria `weapon` conta pro teto
  (`MAX_WEAPONS_PER_FIGHTER` em `lib/campaign-rules.ts`;
  `countFighterWeapons` em `lib/db/queries.ts`); armas com asterisco
  contando em dobro e o teto de 2 pra Mounted ficam pro catálogo de
  equipamento (issue #67), já que hoje equipamento é texto livre.
- **Retrato do fighter** (issue #63): cada fighter pode ter uma imagem de
  identificação (rosto/torso da mini) exibida no roster (48px) com fallback
  no brasão do site (`/brand/logo-light.png`). Regras de upload: JPEG/PNG/
  WebP, máx. 2 MB, 100–2048px por lado (leve de propósito — renderiza
  pequena). Fluxo signed-upload igual ao da galeria (request → PUT direto no
  bucket `gallery` sob o prefixo `fighter/` → confirm com HEAD no servidor),
  autorizado via `resolveGangForWrite` (dono ou modo Árbitro) + rate limit
  por gang; trocar/remover apaga o objeto anterior (banco é a fonte de
  verdade). **Migração aditiva**: `fighter.avatar_path text`
  (`scripts/fighter-avatar.sql` ou `npm run db:push`). Action `updateFighter` segue o padrão da #62: ownership check +
  update + recálculo de Rating/Wealth numa única transação.
- **Modo Árbitro — admin gerencia qualquer roster** (issue #65): o painel de
  gerenciamento inteiro do `/player` (roster, stash, recrutamento, edição,
  status, XP) foi extraído pro componente compartilhado `GangManager` e agora
  também é servido em `/admin/gangs/[gangId]` (link "Manage" em cada player
  do dashboard admin, badge "Arbitrator mode"). A autorização foi
  centralizada no helper `resolveGangForWrite`
  (`src/lib/auth/gang-access.ts`): admin resolve qualquer gang endereçada
  pelo `gangId` oculto dos forms; player resolve sempre a própria gang — um
  `gangId` adulterado no client nunca escreve em gang alheia (testado). As
  actions revalidam `/player` e `/admin/gangs/[gangId]`. Zero mudança de
  comportamento pro player. 18 testes novos nas duas features (total: 388).

### Changed
- **Hardening transacional das server actions multi-passo** (issue #62):
  toda mutação com 2+ escritas dependentes agora roda dentro de um único
  `db.transaction` — `addFighter`, `removeFighter`, `addEquipment`,
  `removeEquipment`, `setStashCredits`, `addStashItem`, `removeStashItem`,
  `updateFighterStatus` (player), `resolveChallenge` e `advanceCycle`
  (admin). Falha no meio não deixa mais lixo parcial (equipamento órfão,
  challenge resolvido sem transferir o Sympathiser, Downtime pela metade).
  Os helpers de `lib/db/mutations.ts` (`recalcGangScores`,
  `setSympathiserController`, `applyDowntimeEffects`,
  `advanceCampaignCycle`) e `getGangById` aceitam um handle `DbOrTx`
  opcional para compor a transação do chamador — `setSympathiserController`
  abre a própria transação quando chamado sozinho (o par close+insert do
  histórico de controle nunca mais se separa) — e o recálculo de
  Rating/Wealth passou a commitar junto com a mutação que o originou.
  `addFighterXp` trocou o read-then-write por um incremento atômico em SQL
  (`xp = xp + delta`): dois submits simultâneos não perdem mais XP. Sem
  mudança de comportamento no caminho feliz; 12 testes novos
  (`tests/transactional-hardening.test.ts`, `tests/mutations-tx.test.ts`)
  cobrem rollback no meio da operação, composição de tx nos helpers e o
  formato atômico do incremento de XP (total: 370).

### Added
- **Loading estilizado (cyberpunk) para interações do usuário** (issue #60):
  novo `Spinner` compartilhado em `ui/spinner.tsx` — anel de ticks cyan com
  arco magenta varrendo por cima e glow, estética HUD das referências da
  issue — em dois tamanhos (`sm` inline em botões, `md` para painéis), com
  anti-flicker (só aparece se a espera passar de ~180ms), fallback estático
  sob `prefers-reduced-motion` e contrato de a11y (`role="status"` +
  `sr-only` quando rotulado; decorativo quando o texto visível ao lado já
  anuncia). Barra de progresso global de navegação entre rotas
  (`nextjs-toploader`, rota (b) do plano da issue) renderizada uma vez no
  layout raiz e restilizada via CSS: gradiente magenta→cyan segmentado com
  glow, `fixed` no topo (zero CLS) e o mesmo delay anti-flicker. O `Button`
  ganhou a prop `pending` (spinner inline + `aria-busy`, mantendo o
  `disabled` anti-duplo-submit) e todas as interações mapeadas na issue
  foram conectadas: ContactForm, LoginForm, GalleryRating (com anúncio
  sr-only do voto em trânsito), GalleryComments, GalleryUploadForm (spinner
  por arquivo), SiteSearch, RulesChat, os 9 forms do admin e os 7 do
  player. Testes de convenção (vitest) + e2e Playwright cobrindo o ciclo do
  spinner num form e a barra numa navegação.
- **Autor da pintura, rating 1–5 e comentários anônimos na galeria**
  (issue #52): nova coluna `author_name` em `gallery_image` (campo no
  upload e na edição do admin), exibida em destaque —
  `PINTADO POR // NOME`, bold + cor de acento — na legenda do card e no
  lightbox (i18n en/pt-BR). Qualquer visitante, sem login, avalia uma
  foto de 1 a 5 estrelas: identidade anônima via cookie httpOnly
  `ncf_anon` (UUID aleatório) guardado no banco só como
  HMAC-SHA256 (`voter_hash` — nenhum IP ou identificador cru, LGPD),
  1 voto por visitante por foto (`unique (image_id, voter_hash)`) com
  upsert para mudar a nota; média/total chegam via ISR (card compacto
  `★ 4.2 · 7`) e as estrelas interativas do lightbox fazem update
  otimista contra `POST /api/gallery/[id]/rating`. Comentários anônimos
  pré-moderados (`gallery_comment`, status `pending|approved|rejected`):
  nascem pendentes via `POST /api/gallery/[id]/comments` (zod, honeypot
  com sucesso falso para bots, rate-limit fail-open por voter+IP+dia) e
  só aparecem — em chunk dinâmico carregado sob demanda no lightbox —
  depois do Approve na nova fila de moderação do `/admin/gallery`.
  Tabelas novas com RLS ligado sem policies (acesso só server-side),
  `scripts/supabase-gallery.sql` atualizado em sincronia com o schema
  Drizzle, política de privacidade menciona o cookie `ncf_anon` e
  a11y AA nos controles novos (grupo de botões navegável por teclado,
  estado por `aria-pressed` + glifo ★/☆, `role="img"` com rótulo na
  média).
- **Edição de conta de player no painel admin** (issue #57): cada linha da
  lista de players ganhou um "Edit account" (`<details>` nativo) com o novo
  `EditPlayerForm` — nome de exibição, e-mail de login e senha nova
  opcional (vazia mantém a atual) —, action `updatePlayer` com
  `requireAdmin` + zod (`updatePlayerSchema`), hash argon2 só quando a
  senha muda, unicidade de e-mail excluindo o próprio player e recusa a
  contas não-player (a conta admin não é editável pela UI). Permite migrar
  logins antigos `@campaign.local` pelo painel, sem SQL manual. Sessões JWT
  já emitidas não são derrubadas (expiram em até 7 dias).
- **Mostrar/ocultar senha no login** (issue #54): novo componente
  reutilizável `PasswordInput` (`ui/password-input.tsx`) com ícones
  `Eye`/`EyeOff` do lucide-react, usado no formulário de `/login`;
  acessível (`aria-label` dinâmico traduzido en/pt-BR,
  `aria-pressed` refletindo o estado, alvo de clique de 40px) e
  puramente visual — `autoComplete`/`name` do campo intocados. Fora de
  escopo (por design): o campo "Initial password" do painel admin, que já
  é texto visível.

### Changed
- **Domínio-padrão de login `@player.necroforja`** (issue #55): o seed
  gera jogadores como `<nome>@player.necroforja` (antes
  `@campaign.local`) e a documentação esclarece que o "email" é só
  identificador de login (nunca envia e-mail) com a parte antes do `@`
  livre, escolhida pelo admin caso a caso. Contas existentes em produção
  não mudam.

### Added
- **Área de usuário logado no topo** (issue #40): novo componente único
  `UserMenu` (avatar por iniciais com cor determinística derivada do nome
  — paleta das seis Grandes Casas, helpers puros em `lib/avatar.ts` —,
  nome e dropdown com identidade, atalhos Dashboard/Minha Gangue/Painel
  do Arbitrator e sign out) usado pelos dois headers: no `SiteNav`
  (páginas públicas, estáticas) a sessão é buscada client-side num idle
  callback via `/api/auth/session` (hook `useSessionUser` com cache de
  módulo — sem `SessionProvider` global e sem forçar render dinâmico;
  mesmo padrão de perf do SiteSearch, issue #42), com variante inline
  `UserMenuMobile` no menu fullscreen; no `SiteHeader`
  (dashboard/admin/player, já dinâmicos) o usuário vem do `auth()`
  server-side por prop — "My Gang"/"Arbitrator" viraram atalhos do
  dropdown e o `SignOutButton` avulso foi removido. Dropdown com padrão
  disclosure acessível (`aria-expanded`/`aria-controls`, Escape fecha e
  devolve o foco, clique fora fecha); namespace i18n `UserMenu` en/pt-BR
  com teste de paridade de chaves. O cache de sessão é
  stale-while-revalidate: snapshot instantâneo em navegações client-side,
  revalidado a cada mount (login/logout no meio da sessão SPA refletem no
  header sem F5). Sessão JWT com `maxAge` explícito de 7 dias (rolante —
  o cookie é reemitido a cada visita).

### Added
- **Página do criador `/creator`** (issue #39): foto (WebP estático via
  `next/image`) + bio en/pt-BR no padrão `content.ts`/`content.en.ts`/
  `content.i18n.ts`, ficha técnica do hobby, links para LinkedIn e
  repositório público e JSON-LD `ProfilePage` (novo builder
  `buildCreatorJsonLd`, ancorando a entidade "Gabriel Stedile" da issue
  #47); indexada no sitemap e na busca do site.
- **Página de contato `/contact`** (issue #39): formulário (nome, e-mail,
  assunto, mensagem) com validação nativa + zod (`contactSchema`),
  honeypot invisível, rate limit por IP e global (Upstash, fail-open) e
  entrega por e-mail via API REST do Resend (sem SDK novo) com
  `reply_to` do visitante; o endereço de destino vive só em env
  (`CONTACT_EMAIL_TO`) — nunca no código nem no cliente (repo público);
  novo componente `Textarea` em `ui/input.tsx`; indexada no sitemap e na
  busca do site.
- **Páginas legais `/privacy` e `/terms`** (issue #39): política de
  privacidade (cookies essenciais, métricas anônimas, LGPD, remoção de
  imagens) e termos de uso (natureza de fan project, uso aceitável,
  disclaimer Games Workshop) escritos para a natureza real do projeto;
  renderizador compartilhado `LegalDocument` com seções numeradas e
  âncoras; linkadas na bottom bar do footer (antes `<span>`s mortos).

### Changed
- **Footer sem placeholders** (issue #39): os 7 links sem destino real
  (Roadmap, Discord, Creators, Forums, Help, Status e o Contact "/")
  saíram; colunas reorganizadas em JOGO (Visão Geral, Como Jogar, Lore,
  Facções, Modo Skirmish, Modo Campanha), CAMPANHA (Dashboard, Jornal,
  Galeria, Custom Rules) e SUPORTE (FAQ, Criador, Contato, Conta) — todo
  link do footer agora aponta para uma página que existe.
- **Seção About da landing enxugada** (follow-up da issue #47): texto novo
  em 3 parágrafos (gerenciador de campanha no universo de Warhammer 40k,
  "não é loja", idiomas/PWA/acesso sem conta) e remoção do link "VER O
  CÓDIGO NO GITHUB" — o repositório continua linkado no /creator e no FAQ.

### Fixed
- **Botão "Conheça as gangues" do CTA** (follow-up): era um `<div>` morto
  com TODO da época em que /gangs não existia (issue #8) — virou `Link`
  real para `/gangs`.

### Added
- **Páginas FAQ e Campaign Custom Rules** (issue #41): duas rotas novas —
  `/faq` com perguntas frequentes agrupadas por tema (geral, campanha,
  site & conta) em `<details>`/`<summary>` nativos (acessível, zero JS), e
  `/house-rules` com as regras da casa da campanha (primeira: "Infiltrate
  & Hidden Deployment", 5 cláusulas, do corpo da issue); conteúdo en/pt-BR
  no padrão `content.ts`/`content.en.ts`/`content.i18n.ts`; links "FAQ" e
  "Campaign Custom Rules" na coluna Campaign Tools do mega-menu GAME e
  entradas no menu mobile; páginas indexadas no sitemap e na busca do
  site (páginas + seções).
- **Seção "What is NecroForja" na landing** (issue #47): bloco 05 // ABOUT
  com 3 parágrafos indexáveis dizendo o que a NecroForja é (web app,
  gerenciador digital de campanha, projeto de portfólio) e o que não é
  (loja de miniaturas — desambiguação da marca alemã NecroForge), com
  links para o repositório público e o FAQ; texto puro, sem assets novos.

### Changed
- **JSON-LD enriquecido** (issue #47): `WebSite` e `SoftwareApplication`
  ganham `alternateName`, `sameAs` (repositório GitHub público),
  `inLanguage` (en/pt-BR) e `publisher`; autor agora aponta para o
  LinkedIn (mesma referência do footer, issue #49); novo builder
  `buildFaqJsonLd` emite `FAQPage` em `/faq`; descriptions/OG do layout e
  da landing reforçam "digital campaign manager / web app" para ancorar a
  entidade; testes unitários atualizados/adicionados.

### Fixed
- **Trailer cortado no mobile** (issue #49): o modal do trailer agora é
  renderizado via portal em `document.body` — dentro da árvore do Hero
  (overflow-hidden + camadas com efeitos), o Safari iOS tratava o
  `position: fixed` como relativo ao hero e o vídeo aparecia cortado
  quando a página estava scrollada.

### Added
- **Créditos do criador no footer** (issue #49): linha na bottom bar com
  link para o LinkedIn (`noopener noreferrer`), i18n en/pt-BR;
  `metadata.authors` do layout agora aponta para o LinkedIn.

### Changed
- **Ajustes de conteúdo** (issue #49): intro da seção "Na campanha" de
  /gangs sem a frase "Dados direto do banco da campanha." (en e pt-BR);
  card externo YAKTRIBE.GAMES removido do How to Play (mantido o da
  Games Workshop).
- **Limpeza do menu principal** (junto da issue #19): link de topo "NEWS"
  renomeado para "REPORTS"/"RELATÓRIOS" e "WORLD"/"MUNDO" para "LORE"
  (nomes iguais às páginas de destino); "Lore" e "Reports" removidos do
  mega-panel GAME — eram links duplicados para os mesmos destinos dos
  links de topo.
- **Performance/a11y da landing e code-splitting** (issue #42): arte do hero
  convertida de `public/hero.png` (1.2 MB, background-image inline) para
  WebP de 77 KB servido via `next/image` com `priority` (preload do LCP,
  srcset/AVIF automáticos); `RulesChat` (@ai-sdk/react), `SiteSearch` e o
  lightbox da galeria (extraído para `GalleryLightbox.tsx`) agora carregam
  em chunks separados sob demanda (`next/dynamic`/`React.lazy`), fora do JS
  inicial das rotas; hierarquia de headings corrigida na landing (`<h2>`
  reais em Features/News, título de report em `<h3>`) e textos decorativos
  de baixa opacidade elevados para contraste AA (≥4.5:1).
- **Landing "Dispatches" section renamed to "Reports"** (EN "Reports" /
  PT-BR "Relatórios") and now loads the 3 latest published journal posts
  from the database, each row linking to /reports/<slug>; static placeholder
  items removed from messages. Landing wrapper switched from
  `overflow-x: hidden` to `overflow-x-clip` so the SiteNav is sticky like
  on the other pages. Reports seed now covers 3 posts (Ambush at the Sump
  Gates, the retitled "Season 1 Mid-Point: The Map Redrawn", and the
  Painting the Rust proxy).
- **PDF gang sheet** redesigned: "dossier" spaced layout with NecroForja theme
  (dark header + hazard stripe, metrics in mono, fighter blocks with side band,
  equipment with line breaks, dead fighters highlighted).

### Added
- **Símbolos das gangues nos cards da landing** (issue #19): faixa de arte
  (~110px) no topo de cada card da seção "The Gangs" com o emblema da gangue
  — arte própria estilizada (stencil spray-paint), sem arte oficial da GW
  (ver issue #17). Cobertura completa: **17 símbolos** como WebP 640px em
  `src/components/gangs/symbols/` chaveados por slug do catálogo
  (`symbols.ts`, pensado para reuso no nav/página de gangues). Fallback
  defensivo (logos de marca por hash determinístico do slug, evitando
  hydration mismatch) fica disponível para gangues futuras sem arte.
- **Carrossel de jogadores da campanha na landing** (issue #18): nova seção
  "03 // THE PLAYERS" entre Gangs e Reports (Reports renumerada para 04) —
  marquee infinito em CSS puro (mesmo keyframe do Ticker, pausa no hover,
  respeita `prefers-reduced-motion`) com os jogadores ativos vindos do banco
  (`listActivePlayersPublic`: gangues cujo dono é `player` com
  `is_active = true`), cards com retrato, nome, gangue e cor da casa
  (`matchHouseSlug`), retratos como assets estáticos WebP otimizados
  (~30–58 KB) e placeholder temático para jogador sem retrato; seção some
  graciosamente com banco offline ou sem jogadores.
- **Lighthouse CI + axe-core no pipeline** (issue #42): `@lhci/cli` roda no
  job e2e contra o build de produção (home/gallery/reports/skirmish) com
  thresholds "warn" não bloqueantes (`lighthouserc.json`) e relatório por PR
  (link no log + artifact); `@axe-core/playwright` em `e2e/a11y.spec.ts`
  cobre as mesmas rotas — violações `critical` falham, demais impactos são
  logados como baseline.
- **Campaign journal** (`/reports`, issue #5): Postgres-backed posts (bilingual
  EN/PT-BR, four types: session report, chronicle, painting log, dispatch),
  public listing with client-side type filter + post page rendering Markdown
  (react-markdown/GFM), admin editor with zod-validated server actions,
  image upload to Supabase Storage (bucket `reports`, REST — no SDK), dynamic
  sitemap entries, nav/footer links and seed with the week 1 mission report.
- **Gangs page** (`/gangs`, issue #8): full dossiers of the six Great Houses
  (art, identity, playstyle, strengths/weaknesses) plus cards for the
  independent, Ash Wastes and Hive Secundus gangs, with i18n (EN/PT-BR),
  a live "In the campaign" section reading the `gang` table, and nav/landing
  links (mega-menu, mobile menu, landing cards, LoreCTA) now pointing at it.
- Player equipment and Stash management (equip/unequip, move from Stash).
- Fighter lifecycle (status/XP) and Downtime effects.
- Manual Sympathiser assignment by the Arbitrator.
- Triumphs and campaign closure.
- AI assistant improvements (retrieval) and durable rate limit (Upstash).
- PDF gang sheet export.
- PWA (installable) and SEO/Lighthouse adjustments.
- Integration tests and general hardening.

### Security
- **Pre-open-source hardening (issue #43):** `db:seed` now refuses to run
  with the default admin/player passwords whenever `DATABASE_URL` doesn't
  point at `localhost`/`127.0.0.1`, preventing an accidental seed of
  production with publicly-known credentials. Added a `LICENSE`
  (All rights reserved).

### Fixed
- `opengraph-image.tsx` no longer declares `runtime = "edge"` (the image is
  fully static, so it's now pre-rendered at build time) and loads its local
  crest asset via `fs.readFile` instead of an Edge-only `fetch(new URL(...))`
  pattern, which failed under the Node.js runtime.

> Update this section with every PR. When publishing a version, move items to a
> versioned section (e.g. `## [0.2.0] - 2026-07-01`).

## [0.1.0] - 2026-06-15

### Added
- **Phase 1:** authentication (Auth.js v5 + Argon2id), admin account creation,
  gang editing with Rating/Wealth recalculation, protected routes.
- **Phase 2:** Sympathiser challenges (registration/resolution with control
  transfer), cycle/phase advancement, Arbitrator panel, live ranking on the landing.
- **Phase 3:** AI rules assistant (RAG) — pgvector + embeddings + Claude,
  citing official book and page; `content/` ingestion.
- "Necromunda tone" visual identity and **NecroForja** brand.
