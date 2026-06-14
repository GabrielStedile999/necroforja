/**
 * Gang Sheet PDF builder (Feature 7).
 *
 * Two exported layers:
 *  1. `buildGangSheetData(gang)` — pure function, testable, extracts all
 *     display data (rating, wealth, per-fighter totals) from a Gang object.
 *  2. `buildGangSheetPdf(gang)` — calls the above then assembles an A4 PDF
 *     using pdf-lib (no native binaries; must run in Node runtime, not edge).
 *
 * Requires: `npm install pdf-lib`
 */
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { Gang } from "@/types";
import { gangRating, gangWealth, fighterTotalCost } from "@/lib/scoring";

/* ------------------------------------------------------------------ */
/*  Pure data layer (no pdf-lib dependency)                             */
/* ------------------------------------------------------------------ */

export interface GangSheetFighterRow {
  name: string;
  type: string;
  category: string;
  status: string;
  xp: number;
  /** baseCost + sum of all equipped items. */
  totalCost: number;
  /** false when status === "dead" (excluded from Rating). */
  isAlive: boolean;
  equipment: { name: string; category: string; cost: number }[];
}

export interface GangSheetData {
  gangName: string;
  house: string;
  ownerName: string;
  rating: number;
  wealth: number;
  stashCredits: number;
  reputation: number;
  fighters: GangSheetFighterRow[];
  stashItems: { name: string; category: string; cost: number; qty: number }[];
  /** Formatted date string (locale en-GB). */
  generatedAt: string;
}

/**
 * Pure function: extracts all display-ready data from a Gang domain object.
 * No side-effects; suitable for unit testing without pdf-lib.
 */
export function buildGangSheetData(gang: Gang): GangSheetData {
  return {
    gangName: gang.name,
    house: gang.house,
    ownerName: gang.ownerName,
    rating: gangRating(gang),
    wealth: gangWealth(gang),
    stashCredits: gang.stashCredits,
    reputation: gang.reputation,
    fighters: gang.fighters.map((f) => ({
      name: f.name,
      type: f.type,
      category: f.category,
      status: f.status,
      xp: f.xp,
      totalCost: fighterTotalCost(f),
      isAlive: f.status !== "dead",
      equipment: f.equipment.map((e) => ({
        name: e.name,
        category: e.category,
        cost: e.cost,
      })),
    })),
    stashItems: gang.stash.map((s) => ({
      name: s.equipment.name,
      category: s.equipment.category,
      cost: s.equipment.cost,
      qty: s.qty,
    })),
    generatedAt: new Date().toLocaleDateString("en-GB"),
  };
}

/* ------------------------------------------------------------------ */
/*  PDF assembly                                                        */
/* ------------------------------------------------------------------ */

// A4 at 72 dpi (points)
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 40;

// Font sizes
const SIZE_TITLE = 16;
const SIZE_HEADING = 11;
const SIZE_BODY = 9;
const SIZE_SMALL = 8;

// Row height for fighter table lines
const ROW_H = 16;

// Theme colours
const C_INK = rgb(0.1, 0.1, 0.1);
const C_WHITE = rgb(1, 1, 1);
const C_MUTED = rgb(0.45, 0.45, 0.45);
const C_BORDER = rgb(0.75, 0.75, 0.75);
const C_PANEL = rgb(0.12, 0.12, 0.12); // dark header band
const C_STRIPE = rgb(0.96, 0.96, 0.96); // zebra even rows
const C_METRIC_BG = rgb(0.92, 0.92, 0.92);
const C_DEAD = rgb(0.65, 0.1, 0.1);

// Column layout as fractions of the usable width W
type ColDef = { x: number; w: number };
const COL_NAME: ColDef = { x: 0, w: 0.24 };
const COL_TYPECAT: ColDef = { x: 0.24, w: 0.19 };
const COL_STATUS: ColDef = { x: 0.43, w: 0.11 };
const COL_XP: ColDef = { x: 0.54, w: 0.05 };
const COL_EQUIP: ColDef = { x: 0.59, w: 0.28 };
const COL_COST: ColDef = { x: 0.87, w: 0.13 };

const ALL_COLS: { col: ColDef; label: string }[] = [
  { col: COL_NAME, label: "Fighter" },
  { col: COL_TYPECAT, label: "Type / Category" },
  { col: COL_STATUS, label: "Status" },
  { col: COL_XP, label: "XP" },
  { col: COL_EQUIP, label: "Equipment" },
  { col: COL_COST, label: "Cost" },
];

/** Clips text to fit within maxWidth points for the given font/size. */
function clipText(
  str: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string {
  if (font.widthOfTextAtSize(str, size) <= maxWidth) return str;
  let s = str;
  while (s.length > 0 && font.widthOfTextAtSize(s + "…", size) > maxWidth) {
    s = s.slice(0, -1);
  }
  return s + "…";
}

/**
 * Assembles an A4 gang-sheet PDF and returns the raw bytes.
 * Must be called in a Node.js runtime (not edge).
 */
export async function buildGangSheetPdf(gang: Gang): Promise<Uint8Array> {
  const data = buildGangSheetData(gang);

  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await doc.embedFont(StandardFonts.Helvetica);

  // Mutable page + cursor (y = distance from bottom; decreases as we move down)
  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN; // top of the next element
  const W = PAGE_W - MARGIN * 2;
  const X = MARGIN;

  /** Opens a new page when the remaining space is insufficient. */
  function ensureSpace(needed: number): void {
    if (y - needed < MARGIN + 30) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  }

  type Color = ReturnType<typeof rgb>;

  /** Draws text at the current cursor (or at an explicit y). */
  function txt(
    str: string,
    opts: {
      x?: number;
      y?: number;
      size?: number;
      bold?: boolean;
      color?: Color;
      maxWidth?: number;
    } = {},
  ): void {
    const font = opts.bold ? fontBold : fontReg;
    const size = opts.size ?? SIZE_BODY;
    const s =
      opts.maxWidth != null
        ? clipText(str, font, size, opts.maxWidth)
        : str;
    page.drawText(s, {
      x: opts.x ?? X,
      y: opts.y ?? y,
      size,
      font,
      color: opts.color ?? C_INK,
    });
  }

  /** Horizontal rule across the full usable width. */
  function hline(yPos: number, color: Color = C_BORDER, thickness = 0.5): void {
    page.drawLine({
      start: { x: X, y: yPos },
      end: { x: X + W, y: yPos },
      thickness,
      color,
    });
  }

  /** Filled rectangle. */
  function rect(
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    color: Color,
  ): void {
    page.drawRectangle({ x: rx, y: ry, width: rw, height: rh, color });
  }

  /* ---- HEADER BAND ----------------------------------------- */
  const HEADER_H = 50;
  rect(X, y - HEADER_H, W, HEADER_H, C_PANEL);

  txt(data.gangName, {
    x: X + 8,
    y: y - 19,
    size: SIZE_TITLE,
    bold: true,
    color: C_WHITE,
    maxWidth: W * 0.65,
  });

  txt(`${data.house}  ·  ${data.ownerName}`, {
    x: X + 8,
    y: y - 37,
    size: SIZE_SMALL,
    color: rgb(0.65, 0.65, 0.65),
  });

  const dateStr = `Generated ${data.generatedAt}`;
  const dateW = fontReg.widthOfTextAtSize(dateStr, SIZE_SMALL);
  txt(dateStr, {
    x: X + W - dateW - 8,
    y: y - 37,
    size: SIZE_SMALL,
    color: rgb(0.5, 0.5, 0.5),
  });

  y -= HEADER_H + 4;

  /* ---- METRICS BAND ---------------------------------------- */
  const METRIC_H = 28;
  rect(X, y - METRIC_H, W, METRIC_H, C_METRIC_BG);

  const metrics: { label: string; value: string }[] = [
    { label: "Rating", value: String(data.rating) },
    { label: "Wealth", value: String(data.wealth) },
    { label: "Stash Credits", value: `${data.stashCredits}c` },
    { label: "Reputation", value: String(data.reputation) },
  ];

  const mColW = W / metrics.length;
  for (let mi = 0; mi < metrics.length; mi++) {
    const m = metrics[mi]!;
    const mx = X + mi * mColW + 8;
    txt(m.label, {
      x: mx,
      y: y - 10,
      size: SIZE_SMALL - 1,
      color: C_MUTED,
    });
    txt(m.value, {
      x: mx,
      y: y - 22,
      size: SIZE_HEADING,
      bold: true,
      color: C_INK,
    });
  }

  y -= METRIC_H + 10;

  /* ---- ROSTER ---------------------------------------------- */
  txt("ROSTER", { size: SIZE_HEADING, bold: true });
  hline(y - SIZE_HEADING - 2, C_INK, 0.8);
  y -= SIZE_HEADING + 8;

  // Column header row
  rect(X, y - ROW_H, W, ROW_H, rgb(0.82, 0.82, 0.82));
  for (const { col, label } of ALL_COLS) {
    txt(label, {
      x: X + W * col.x + 3,
      y: y - ROW_H + 4,
      size: SIZE_SMALL - 1,
      bold: true,
      color: C_MUTED,
    });
  }
  y -= ROW_H;

  // Fighter rows
  for (let fi = 0; fi < data.fighters.length; fi++) {
    const f = data.fighters[fi]!;
    const equipCount = Math.max(1, f.equipment.length);
    const rowH = equipCount * ROW_H;

    ensureSpace(rowH + 2);

    if (fi % 2 === 0) {
      rect(X, y - rowH, W, rowH, C_STRIPE);
    }

    const baseY = y - ROW_H + 4; // text baseline for the first line
    const tColor: Color = f.isAlive ? C_INK : C_MUTED;

    // Fighter name
    txt(f.name, {
      x: X + W * COL_NAME.x + 3,
      y: baseY,
      size: SIZE_BODY,
      bold: true,
      color: tColor,
      maxWidth: W * COL_NAME.w - 6,
    });

    // Type / Category
    txt(`${f.type} / ${f.category}`, {
      x: X + W * COL_TYPECAT.x + 3,
      y: baseY,
      size: SIZE_SMALL,
      color: tColor,
      maxWidth: W * COL_TYPECAT.w - 6,
    });

    // Status
    const statusLabel =
      f.status === "in_recovery" ? "recovery" : f.status;
    txt(statusLabel, {
      x: X + W * COL_STATUS.x + 3,
      y: baseY,
      size: SIZE_SMALL,
      color: f.status === "dead" ? C_DEAD : tColor,
      maxWidth: W * COL_STATUS.w - 6,
    });

    // XP
    txt(String(f.xp), {
      x: X + W * COL_XP.x + 3,
      y: baseY,
      size: SIZE_SMALL,
      color: tColor,
    });

    // Equipment lines (stacked)
    if (f.equipment.length === 0) {
      txt("—", {
        x: X + W * COL_EQUIP.x + 3,
        y: baseY,
        size: SIZE_SMALL,
        color: C_MUTED,
      });
    } else {
      for (let ei = 0; ei < f.equipment.length; ei++) {
        const e = f.equipment[ei]!;
        txt(`${e.name} (${e.cost}c)`, {
          x: X + W * COL_EQUIP.x + 3,
          y: y - (ei + 1) * ROW_H + 4,
          size: SIZE_SMALL,
          color: tColor,
          maxWidth: W * COL_EQUIP.w - 6,
        });
      }
    }

    // Total cost (right-aligned within its column)
    const costStr = `${f.totalCost}c`;
    const costW = fontBold.widthOfTextAtSize(costStr, SIZE_SMALL);
    txt(costStr, {
      x: X + W * (COL_COST.x + COL_COST.w) - costW - 4,
      y: baseY,
      size: SIZE_SMALL,
      bold: true,
      color: tColor,
    });

    hline(y - rowH, C_BORDER);
    y -= rowH;
  }

  /* ---- STASH ----------------------------------------------- */
  y -= 12;
  ensureSpace(60);

  txt("STASH", { size: SIZE_HEADING, bold: true });
  hline(y - SIZE_HEADING - 2, C_INK, 0.8);
  y -= SIZE_HEADING + 8;

  txt(`Credits: ${data.stashCredits}c`, { size: SIZE_BODY });
  y -= ROW_H;

  if (data.stashItems.length === 0) {
    txt("No items in Stash.", { size: SIZE_BODY, color: C_MUTED });
    y -= ROW_H;
  } else {
    for (const item of data.stashItems) {
      ensureSpace(ROW_H);
      const qtyStr = item.qty > 1 ? ` ×${item.qty}` : "";
      txt(`${item.name}  ·  ${item.category}  ·  ${item.cost}c${qtyStr}`, {
        x: X + 12,
        size: SIZE_BODY,
        color: C_MUTED,
      });
      y -= ROW_H;
    }
  }

  /* ---- FOOTER ---------------------------------------------- */
  y -= 16;
  ensureSpace(20);
  hline(y, C_BORDER);
  y -= 12;
  txt("Necromunda: The Aranthian Succession — Cinderak Burning Campaign", {
    size: SIZE_SMALL - 1,
    color: rgb(0.55, 0.55, 0.55),
  });

  return doc.save();
}
