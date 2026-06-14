/**
 * GET /player/export
 *
 * Generates and downloads a PDF gang sheet for the authenticated player's gang.
 * Must run in Node.js runtime (pdf-lib is not edge-compatible).
 */
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGangByOwnerId } from "@/lib/db/queries";
import { buildGangSheetPdf } from "@/lib/pdf/gangSheet";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const gang = await getGangByOwnerId(session.user.id);
  if (!gang) {
    return new NextResponse("No gang found for this account.", { status: 404 });
  }

  const pdfBytes = await buildGangSheetPdf(gang);
  const filename = `${gang.name.replace(/[^a-z0-9]/gi, "_")}-gang-sheet.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
