/**
 * Seed do jornal de campanha (issue #5) — insere o primeiro post: o
 * Relatório das Missões da Semana 1 (idempotente: pula se o slug já existir).
 *
 * A capa aponta para o bucket público `blog` no Supabase Storage; envie a
 * imagem com o nome `week-1-mission-report.png` (via /admin/blog ou console).
 *
 * Uso: configure DATABASE_URL (e SUPABASE_URL) no .env e rode
 *   npm run db:seed:blog
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, schema } from "./index";

const SLUG = "week-1-mission-report";

const COVER = process.env.SUPABASE_URL
	? `${process.env.SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/public/blog/${SLUG}.png`
	: null;

const BODY_PT = `> Transmissão de Campanha // Necromunda

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

const BODY_EN = `> Campaign Transmission // Necromunda

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

async function seedBlog() {
	console.log("→ Seeding campaign journal (issue #5)...");

	const existing = await db.query.posts.findFirst({
		where: eq(schema.posts.slug, SLUG),
		columns: { id: true },
	});
	if (existing) {
		console.log(`  • Post "${SLUG}" already exists — nothing to do.`);
		return;
	}

	await db.insert(schema.posts).values({
		slug: SLUG,
		type: "session_report",
		titleEn: "Weekly Mission Report",
		titlePt: "Relatório das Missões da Semana",
		excerptEn:
			"Two war zones burned this week: the fall of the Badzones Outpost and the Gunk War — victories for the Corpse Grinders and the Squat Prospectors.",
		excerptPt:
			"Duas zonas de guerra arderam nesta semana: a queda do Badzones Outpost e a Gunk War — vitórias de Corpse Grinders e Squat Prospectors.",
		bodyEn: BODY_EN,
		bodyPt: BODY_PT,
		coverImage: COVER,
		coverAlt: "Weekly mission report — campaign transmission poster",
		published: true,
		publishedAt: new Date("2026-07-17T12:00:00Z"),
	});

	console.log(`  ✓ Post "${SLUG}" created${COVER ? "" : " (no cover — SUPABASE_URL not set)"}.`);
	if (COVER) {
		console.log(`  ↳ Upload the cover as blog/${SLUG}.png in Supabase Storage.`);
	}
}

seedBlog()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
