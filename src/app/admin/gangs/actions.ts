import { db } from "@/lib/db";
import { fighters, gangs, audit_logs } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/navigation";

export async function sellCaptive(
  fighterId: string,
  bountyOverride?: number
) |
  async function ransomCaptive(
  fighterId: string,
  amount: number
) |
  async function releaseCaptive(
  fighterId: string
) {
  const session = await auth();
  if (!session || session.user.role!== "admin") {
    throw new Error("Unauthorized");
  }

  return await db.transaction(async (tx) => {
    const fighter = await tx.query.fighters.findFirst({
      where: eq(fighters.id, fighterId),
      with: {
        capturedByGang: true,
        ownerGang: true,
      },
    });

    if (!fighter ||!fighter.capturedByGangId) {
      throw new Error("Fighter is not a captive");
    }

    const captorGangId = fighter.capturedByGangId;
    const ownerGangId = fighter.gangId;

    if (captorGangId === ownerGangId) {
      throw new Error("Cannot trade your own captive");
    }

    // Calculate value
    // fighterTotalCost is a helper or logic we assume exists in schema/utils
    // For this implementation, we'll assume we need to calculate it or it's a column
    // Since I don't have the full schema, I'll use a placeholder logic for cost
    const cost = fighter.totalCost || 0;

    if (bountyOverride!== undefined) {
      // SELL / BOUNTY FLOW
      const finalAmount = Math.ceil(bountyOverride / 5) * 5;
      
      // 1. Credit captor
      await tx.update(gangs)
        set({ stash: sql`${gangs.stash} + ${finalAmount}` })
        where(eq(gangs.id, captorGangId));

      // 2. Delete fighter (cascade handles equipment)
      await tx.delete(fighters).where(eq(fighters.id, fighterId));

      // 3. Log
      await tx.insert(audit_logs).values({
        action: "captive_sold",
        description: `Sold captive ${fighter.name} for ${finalAmount} credits`,
        adminId: session.user.id,
      });

    } else if (amount > 0) {
      // RANSOM FLOW
      const ownerGang = await tx.query.gangs.findFirst({ where: eq(gangs.id, ownerGangId) });
      if (!ownerGang || ownerGang.stash < amount) {
        throw new Error("Owner gang has insufficient funds");
      }

      // 1. Transfer credits
      await tx.update(gangs).set({ stash: sql`${gangs.stash} - ${amount}` }).where(eq(gangs.id, ownerGangId));
      await tx.update(gangs).set({ stash: sql`${gangs.stash} + ${amount}` }).where(eq(gangs.id, captorGangId));

      // 2. Release fighter
      await tx.update(fighters)
        set({ capturedByGangId: null, status: "active" })
        where(eq(fighters.id, fighterId));

      await tx.insert(audit_logs).values({
        action: "captive_ransomed",
        description: `Ransomed ${fighter.name} for ${amount} credits`,
        adminId: session.user.id,
      });
    } else {
      // RELEASE FLOW
      await tx.update(fighters)
        set({ capturedByGangId: null, status: "active" })
        where(eq(fighters.id, fighterId));

      await tx.insert(audit_logs).values({
        action: "captive_released",
        description: `Released ${fighter.name} without payment`,
        adminId: session.user.id,
      });
    }

    revalidatePath("/admin/gangs");
    revalidatePath("/player/gangs");
    return { success: true };
  });
}
