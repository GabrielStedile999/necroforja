/**
 * Seed do jornal de campanha (issue #5) — idempotente, seguro de rodar
 * quantas vezes quiser:
 *
 * - `ambush-at-the-sump-gates` (battle report, proxy oficial) — insere se faltar;
 * - `week-1-mission-report` — insere se faltar; se já existir, atualiza o
 *   título para "Season 1 Mid-Point: The Map Redrawn" (rebatizado);
 * - `painting-the-rust` (diário de pintura, proxy) — insere se faltar.
 *
 * A capa do mission report aponta para o bucket público `blog`; envie a
 * imagem como `week-1-mission-report.png` (via /admin/blog ou console).
 *
 * Uso: configure DATABASE_URL (e SUPABASE_URL) no .env e rode
 *   npm run db:seed:blog
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, schema } from "./index";

const STORAGE_BASE = process.env.SUPABASE_URL
	? `${process.env.SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/public/blog`
	: null;

/* ────────────────── week-1-mission-report (session report) ─────────────── */

const MISSION_SLUG = "week-1-mission-report";
const AMBUSH_SLUG = "ambush-at-the-sump-gates";

const MISSION_TITLE_EN = "Season 1 Mid-Point: The Map Redrawn";
const MISSION_TITLE_PT = "Metade da Temporada 1: O Mapa Redesenhado";

const MISSION_BODY_PT = `> Transmissão de Campanha // Necromunda

Duas zonas de guerra arderam nesta semana. Nos badzones, uma posição Delaque ruiu sob lâminas, fumaça e carne moída. Em outro front, um tanque de gunk resistiu a uma maré de fanáticos e mutantes.

## I. Fall of Badzones Outpost

**Davi // Red Harvest // Corpse Grinders** vs **Gabriel // Shadow Syndicate // Delaque**

Os açougueiros da Red Harvest lançaram-se sobre um posto avançado da Shadow Syndicate, famintos por novos territórios. Nos primeiros turnos, os Delaque mantiveram as linhas e tentaram evacuar suas forças antes do colapso. Mas no quinto turno, o avanço dos Corpse Grinders tornou-se impossível de deter. Cobertos por sucessivas nuvens de smoke grenades, eles romperam as defesas e transformaram o outpost em um matadouro. A Shadow Syndicate sofreu pesadas baixas.

**Vitória: Corpse Grinders**

## II. Gunk War

**Jeferson // Thick Boys // Squat Prospectors** vs **Heitor // Cult of the Wyrm // Corrupted Outcast**

Enquanto os Thick Boys tentavam proteger e drenar um tanque de gunk, o Cult of the Wyrm atacou com fúria brutal para reduzi-lo a escombros flamejantes. Os Corrupted Outcasts abriram caminho na violência, infligindo pesadas baixas aos Prospectors, e a carnificina se espalhou por toda a zona de combate. Ainda assim, quando a fumaça baixou, os cultistas não possuíam as ferramentas nem o poder de fogo necessários para destruir o tanque. Contra todas as probabilidades, a prospecção foi concluída com sucesso.

**Vitória: Squat Prospectors**

---

### Resumo tático

- **Setor perdido:** Badzones Outpost
- **Setor mantido:** Gunk Tank
- **Vencedores:** Red Harvest / Thick Boys
- **Baixas pesadas:** Shadow Syndicate / Thick Boys
`;

const MISSION_BODY_EN = `> Campaign Transmission // Necromunda

Two war zones burned this week. In the badzones, a Delaque position collapsed under blades, smoke and ground meat. On another front, a gunk tank held out against a tide of fanatics and mutants.

## I. Fall of Badzones Outpost

**Davi // Red Harvest // Corpse Grinders** vs **Gabriel // Shadow Syndicate // Delaque**

The butchers of the Red Harvest threw themselves at a Shadow Syndicate outpost, hungry for new territory. In the early turns the Delaque held the lines and tried to evacuate their forces before the collapse. But by the fifth turn the Corpse Grinder advance had become impossible to stop. Covered by successive clouds of smoke grenades, they broke through the defences and turned the outpost into a slaughterhouse. The Shadow Syndicate suffered heavy casualties.

**Victory: Corpse Grinders**

## II. Gunk War

**Jeferson // Thick Boys // Squat Prospectors** vs **Heitor // Cult of the Wyrm // Corrupted Outcast**

While the Thick Boys tried to protect and drain a gunk tank, the Cult of the Wyrm attacked with brutal fury to reduce it to flaming rubble. The Corrupted Outcasts carved a path through the violence, inflicting heavy casualties on the Prospectors, and the carnage spread across the whole combat zone. Even so, when the smoke settled, the cultists had neither the tools nor the firepower needed to destroy the tank. Against all odds, the prospecting operation was completed successfully.

**Victory: Squat Prospectors**

---

### Tactical summary

- **Sector lost:** Badzones Outpost
- **Sector held:** Gunk Tank
- **Winners:** Red Harvest / Thick Boys
- **Heavy casualties:** Shadow Syndicate / Thick Boys
`;

/* ─────────────── ambush-at-the-sump-gates (battle report, proxy) ────────── */

const AMBUSH_BODY_PT = `> Transmissão de Campanha // Necromunda

Zelotes Cawdor incendiaram um antro químico Escher em uma guerra de território brutal nos portões do Sump. O que começou como uma patrulha de rotina terminou em chamas purificadoras: as Escher, encurraladas entre os tanques de químicos e a horda em avanço, venderam caro cada passarela.

Quando o fogo baixou, o antro era cinza — e a conta final do açougueiro, pesada para os dois lados.

---

*Relato completo da mesa, com fotos e a conta final do açougueiro, em breve.*
`;

const AMBUSH_BODY_EN = `> Campaign Transmission // Necromunda

Cawdor zealots torched an Escher chem-den in a brutal turf war at the Sump gates. What began as a routine patrol ended in cleansing flame: the Escher, cornered between the chem-vats and the advancing horde, sold every walkway dearly.

When the fire died down, the den was ash — and the final butcher's bill heavy on both sides.

---

*Full report from the tabletop, with photos and the final butcher's bill, coming soon.*
`;

/* ──────────────────── painting-the-rust (painting, proxy) ───────────────── */

const PAINTING_BODY_PT = `> Diário de Pintura // NecroForja

Do plástico cru à sujeira da sub-colmeia — as técnicas por trás da gangue destaque do mês, passo a passo.

## O plano

- Base e primer
- Ferrugem em camadas (chipping + pigmentos)
- Weathering final: óleos, grime e poeira dos Ash Wastes

---

*Passo a passo completo, com fotos de cada etapa, em breve.*
`;

const PAINTING_BODY_EN = `> Painting Log // NecroForja

From bare plastic to underhive grime — the techniques behind this month's featured gang, step by step.

## The plan

- Base coat and primer
- Layered rust (chipping + pigments)
- Final weathering: oils, grime and Ash Wastes dust

---

*Full step-by-step, with photos of every stage, coming soon.*
`;

/* ───────────────────────────────── seed ─────────────────────────────────── */

type SeedPost = typeof schema.posts.$inferInsert;

const POSTS: SeedPost[] = [
	{
		slug: MISSION_SLUG,
		type: "session_report",
		titleEn: MISSION_TITLE_EN,
		titlePt: MISSION_TITLE_PT,
		excerptEn:
			"Two war zones burned this week: the fall of the Badzones Outpost and the Gunk War — victories for the Corpse Grinders and the Squat Prospectors.",
		excerptPt:
			"Duas zonas de guerra arderam nesta semana: a queda do Badzones Outpost e a Gunk War — vitórias de Corpse Grinders e Squat Prospectors.",
		bodyEn: MISSION_BODY_EN,
		bodyPt: MISSION_BODY_PT,
		coverImage: STORAGE_BASE ? `${STORAGE_BASE}/${MISSION_SLUG}.png` : null,
		coverAlt: "Weekly mission report — campaign transmission poster",
		published: true,
		publishedAt: new Date("2026-07-17T12:00:00Z"),
	},
	{
		slug: AMBUSH_SLUG,
		// battle report: jogo único, isolado — diferente do session report,
		// que é um jogo da campanha em andamento.
		type: "battle_report",
		titleEn: "Ambush at the Sump Gates",
		titlePt: "Emboscada nos Portões do Sump",
		excerptEn:
			"Cawdor zealots torch an Escher chem-den in a brutal turf war — full report from the tabletop, with photos and the final butcher's bill.",
		excerptPt:
			"Zelotes Cawdor incendeiam um antro químico Escher em uma guerra de território brutal — relato completo da mesa, com fotos e a conta final do açougueiro.",
		bodyEn: AMBUSH_BODY_EN,
		bodyPt: AMBUSH_BODY_PT,
		coverImage: null,
		coverAlt: null,
		published: true,
		publishedAt: new Date("2026-06-28T12:00:00Z"),
	},
	{
		slug: "painting-the-rust",
		type: "painting",
		titleEn: "Painting the Rust: Weathering the Underhive",
		titlePt: "Pintando a Ferrugem: Weathering na Sub-colmeia",
		excerptEn:
			"From bare plastic to underhive grime — the techniques behind this month's featured gang, step by step.",
		excerptPt:
			"Do plástico cru à sujeira da sub-colmeia — as técnicas por trás da gangue destaque do mês, passo a passo.",
		bodyEn: PAINTING_BODY_EN,
		bodyPt: PAINTING_BODY_PT,
		coverImage: null,
		coverAlt: null,
		published: true,
		publishedAt: new Date("2026-06-05T12:00:00Z"),
	},
];

async function seedBlog() {
	console.log("→ Seeding campaign journal (issue #5)...");

	for (const post of POSTS) {
		const existing = await db.query.posts.findFirst({
			where: eq(schema.posts.slug, post.slug),
			columns: { id: true, titleEn: true, type: true },
		});

		if (!existing) {
			await db.insert(schema.posts).values(post);
			console.log(`  ✓ Post "${post.slug}" created.`);
			continue;
		}

		// Já existe: updates pontuais pendentes por slug.
		if (post.slug === MISSION_SLUG && existing.titleEn !== MISSION_TITLE_EN) {
			// Rebatizado na metade da temporada.
			await db
				.update(schema.posts)
				.set({
					titleEn: MISSION_TITLE_EN,
					titlePt: MISSION_TITLE_PT,
					updatedAt: new Date(),
				})
				.where(eq(schema.posts.id, existing.id));
			console.log(`  ✓ Post "${post.slug}" retitled to "${MISSION_TITLE_EN}".`);
		} else if (post.slug === AMBUSH_SLUG && existing.type !== "battle_report") {
			// Reclassificado: jogo isolado → battle report (não session report).
			await db
				.update(schema.posts)
				.set({ type: "battle_report", updatedAt: new Date() })
				.where(eq(schema.posts.id, existing.id));
			console.log(`  ✓ Post "${post.slug}" reclassified as battle_report.`);
		} else {
			console.log(`  • Post "${post.slug}" already exists — skipped.`);
		}
	}

	if (STORAGE_BASE) {
		console.log(`  ↳ Cover: upload blog/${MISSION_SLUG}.png in Supabase Storage.`);
	} else {
		console.log("  ↳ SUPABASE_URL not set — mission report seeded without cover.");
	}
}

seedBlog()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
