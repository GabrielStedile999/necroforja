/**
 * GET /admin/gangs/[gangId]/export
 *
 * Admin-only: generates and downloads a PDF gang sheet for any gang by ID.
 * Must run in Node.js runtime (pdf-lib is not edge-compatible).
 */
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGangById } from "@/lib/db/queries";
import { buildGangSheetPdf } from "@/lib/pdf/gangSheet";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gangId: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { gangId } = await params;
  const gang = await getGangById(gangId);
  if (!gang) {
    return new NextResponse("Gang not found.", { status: 404 });
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
