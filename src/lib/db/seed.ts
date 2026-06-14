/**
 * Seed do banco — popula a campanha Cinderak Burning com os 26 Sympathisers,
 * os 4 jogadores/gangues e o controle inicial de Sympathisers.
 *
 * Uso: configure DATABASE_URL no .env e rode `npm run db:seed`.
 */
import "dotenv/config";
import { db, schema } from "./index";
import { SYMPATHISERS } from "../data/sympathisers";
import { GANGS, CAMPAIGN, SYMPATHISER_CONTROL } from "../data/campaign";
import { gangRating, gangWealth } from "../scoring";
import { hashPassword } from "../auth/password";

// Credenciais iniciais do seed — definidas via .env (com fallbacks genéricos).
// Troque após o primeiro login. Veja .env.example.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "change-me-admin";
const PLAYER_PASSWORD = process.env.PLAYER_PASSWORD ?? "change-me-player";

async function seed() {
  console.log("→ Semeando campanha Cinderak Burning...");

  // 1. Campanha
  const [campaign] = await db
    .insert(schema.campaigns)
    .values({
      name: CAMPAIGN.name,
      phase: CAMPAIGN.phase,
      currentCycle: CAMPAIGN.currentCycle,
      totalCycles: CAMPAIGN.totalCycles,
      startDate: CAMPAIGN.startDate,
      endDate: CAMPAIGN.endDate,
    })
    .returning();
  if (!campaign) throw new Error("Falha ao criar campanha");
  console.log(`  ✓ Campanha: ${campaign.name}`);

  // 2. Sympathisers (catálogo dos 26)
  await db.insert(schema.sympathisers).values(
    SYMPATHISERS.map((s) => ({
      id: s.id,
      name: s.name,
      enabled: true,
    })),
  );
  console.log(`  ✓ ${SYMPATHISERS.length} Sympathisers`);

  // 3. Admin (você) + jogadores + gangues
  const [admin] = await db
    .insert(schema.users)
    .values({
      email: ADMIN_EMAIL,
      role: "admin",
      displayName: "Arbitrator",
      passwordHash: await hashPassword(ADMIN_PASSWORD),
    })
    .returning();
  console.log(`  ✓ Admin: ${admin?.displayName}`);

  const gangIdBySlug = new Map<string, string>();

  for (const g of GANGS) {
    const [user] = await db
      .insert(schema.users)
      .values({
        email: `${g.ownerName.toLowerCase()}@campaign.local`,
        role: "player",
        displayName: g.ownerName,
        passwordHash: await hashPassword(PLAYER_PASSWORD),
      })
      .returning();

    const [gang] = await db
      .insert(schema.gangs)
      .values({
        campaignId: campaign.id,
        ownerUserId: user?.id,
        name: g.name,
        house: g.house,
        stashCredits: g.stashCredits,
        reputation: g.reputation,
        ratingCached: gangRating(g),
        wealthCached: gangWealth(g),
      })
      .returning();
    if (!gang) throw new Error(`Falha ao criar gangue ${g.name}`);
    gangIdBySlug.set(g.id, gang.id);

    // fighters + equipamento
    for (const f of g.fighters) {
      const [fighter] = await db
        .insert(schema.fighters)
        .values({
          gangId: gang.id,
          name: f.name,
          type: f.type,
          category: f.category,
          baseCost: f.baseCost,
          xp: f.xp,
          status: f.status,
          ...f.profile,
        })
        .returning();

      for (const item of f.equipment) {
        const [eq] = await db
          .insert(schema.equipment)
          .values({ name: item.name, category: item.category, cost: item.cost })
          .returning();
        if (fighter && eq) {
          await db.insert(schema.fighterEquipment).values({
            fighterId: fighter.id,
            equipmentId: eq.id,
            qty: 1,
          });
        }
      }
    }
    console.log(
      `  ✓ Gangue: ${g.name} (${g.ownerName}) — Rating ${gangRating(g)} / Wealth ${gangWealth(g)}`,
    );
  }

  // 4. Controle inicial de Sympathisers
  for (const [slug, symIds] of Object.entries(SYMPATHISER_CONTROL)) {
    const gangId = gangIdBySlug.get(slug);
    if (!gangId) continue;
    for (const symId of symIds) {
      await db.insert(schema.sympathiserControl).values({
        sympathiserId: symId,
        gangId,
        sinceCycle: 1,
        isCurrent: true,
      });
    }
  }
  console.log("  ✓ Controle de Sympathisers definido");

  console.log("\n✔ Seed concluído. Credenciais de acesso:");
  console.log(`   Admin:    ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`   Jogadores: <nome>@campaign.local / ${PLAYER_PASSWORD}`);
  console.log("   (defina ADMIN_EMAIL/ADMIN_PASSWORD/PLAYER_PASSWORD no .env)");
  process.exit(0);
}

seed().catch((err) => {
  console.error("✗ Erro no seed:", err);
  process.exit(1);
});
