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
  type Color,
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
/*  PDF assembly — "NecroForja dossier" theme                           */
/* ------------------------------------------------------------------ */

// A4 at 72 dpi (points)
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 44;
const PAD = 10; // inner padding of blocks

// Theme palette (mirrors the app tokens; light body for printability)
const C_VOID = rgb(0.043, 0.047, 0.055); // #0B0C0E header/footer bands
const C_PAPER = rgb(0.98, 0.972, 0.953); // off-white background
const C_INK = rgb(0.13, 0.13, 0.12); // body text
const C_LIGHT = rgb(0.902, 0.882, 0.839); // text on dark bands (#E6E1D6)
const C_HAZARD = rgb(0.949, 0.663, 0.0); // #F2A900 accents
const C_MUTED = rgb(0.42, 0.41, 0.39);
const C_RIVET = rgb(0.78, 0.77, 0.74); // hairlines
const C_BLOOD = rgb(0.631, 0.106, 0.106); // dead / danger
const C_ROW = rgb(0.965, 0.953, 0.929); // faint zebra panel

function statusLabel(s: string): string {
  return s === "in_recovery" ? "recovery" : s;
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
  const fontMono = await doc.embedFont(StandardFonts.CourierBold);

  const W = PAGE_W - MARGIN * 2;
  const X = MARGIN;

  let page: PDFPage = newPage();
  let y = PAGE_H - MARGIN;

  /* ---- low-level helpers ----------------------------------- */

  function newPage(): PDFPage {
    const p = doc.addPage([PAGE_W, PAGE_H]);
    // paper background
    p.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C_PAPER });
    // footer chrome
    p.drawLine({
      start: { x: MARGIN, y: MARGIN - 8 },
      end: { x: PAGE_W - MARGIN, y: MARGIN - 8 },
      thickness: 0.5,
      color: C_RIVET,
    });
    p.drawText("NECROFORJA  ·  Cinderak Burning", {
      x: MARGIN,
      y: MARGIN - 20,
      size: 7,
      font: fontReg,
      color: C_MUTED,
    });
    return p;
  }

  function ensureSpace(needed: number): void {
    if (y - needed < MARGIN + 36) {
      page = newPage();
      y = PAGE_H - MARGIN;
    }
  }

  function txt(
    str: string,
    opts: {
      x?: number;
      y?: number;
      size?: number;
      font?: PDFFont;
      color?: Color;
      maxWidth?: number;
    } = {},
  ): void {
    const font = opts.font ?? fontReg;
    const size = opts.size ?? 9;
    let s = str;
    if (opts.maxWidth != null) {
      while (s.length > 0 && font.widthOfTextAtSize(s, size) > opts.maxWidth) {
        s = s.slice(0, -1);
      }
      if (s.length < str.length) s = s.slice(0, -1) + "…";
    }
    page.drawText(s, {
      x: opts.x ?? X,
      y: opts.y ?? y,
      size,
      font,
      color: opts.color ?? C_INK,
    });
  }

  function rect(rx: number, ry: number, rw: number, rh: number, color: Color) {
    page.drawRectangle({ x: rx, y: ry, width: rw, height: rh, color });
  }

  function rightText(
    str: string,
    rightX: number,
    yPos: number,
    size: number,
    font: PDFFont,
    color: Color,
  ): void {
    const w = font.widthOfTextAtSize(str, size);
    txt(str, { x: rightX - w, y: yPos, size, font, color });
  }

  /** Word-wraps a string to fit maxWidth; returns one or more lines. */
  function wrap(
    str: string,
    font: PDFFont,
    size: number,
    maxWidth: number,
  ): string[] {
    const words = str.split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const word of words) {
      const test = cur ? `${cur} ${word}` : word;
      if (cur && font.widthOfTextAtSize(test, size) > maxWidth) {
        lines.push(cur);
        cur = word;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  }

  /** Dark section band with an amber tick + uppercase amber label. */
  function sectionBand(label: string): void {
    const h = 22;
    ensureSpace(h + 14);
    rect(X, y - h, W, h, C_VOID);
    rect(X, y - h, 4, h, C_HAZARD); // left accent tick
    txt(label.toUpperCase(), {
      x: X + 14,
      y: y - 15,
      size: 10,
      font: fontBold,
      color: C_HAZARD,
    });
    y -= h + 14;
  }

  /* ---- HEADER ---------------------------------------------- */
  const HEAD_H = 74;
  rect(X, y - HEAD_H, W, HEAD_H, C_VOID);
  rect(X, y - HEAD_H, W, 4, C_HAZARD); // hazard base line

  txt(data.gangName.toUpperCase(), {
    x: X + 16,
    y: y - 32,
    size: 22,
    font: fontBold,
    color: C_LIGHT,
    maxWidth: W * 0.7,
  });
  txt(`${data.house}  ·  ${data.ownerName}`, {
    x: X + 16,
    y: y - 52,
    size: 9,
    font: fontReg,
    color: C_HAZARD,
    maxWidth: W * 0.7,
  });
  rightText("GANG ROSTER", X + W - 16, y - 26, 9, fontBold, C_LIGHT);
  rightText(
    `Generated ${data.generatedAt}`,
    X + W - 16,
    y - 40,
    7.5,
    fontReg,
    C_MUTED,
  );
  y -= HEAD_H + 18;

  /* ---- METRICS --------------------------------------------- */
  const MH = 48;
  const metrics: { label: string; value: string }[] = [
    { label: "Rating", value: String(data.rating) },
    { label: "Wealth", value: String(data.wealth) },
    { label: "Stash", value: `${data.stashCredits}c` },
    { label: "Reputation", value: String(data.reputation) },
  ];
  const cw = W / metrics.length;
  // outline
  page.drawRectangle({
    x: X,
    y: y - MH,
    width: W,
    height: MH,
    borderColor: C_RIVET,
    borderWidth: 1,
  });
  metrics.forEach((m, i) => {
    const cx = X + i * cw;
    rect(cx, y - 3, cw, 3, C_HAZARD); // top accent per cell
    if (i > 0) {
      page.drawLine({
        start: { x: cx, y: y - 3 },
        end: { x: cx, y: y - MH },
        thickness: 0.5,
        color: C_RIVET,
      });
    }
    txt(m.label.toUpperCase(), {
      x: cx + 12,
      y: y - 20,
      size: 7,
      font: fontBold,
      color: C_MUTED,
    });
    txt(m.value, {
      x: cx + 12,
      y: y - 40,
      size: 17,
      font: fontMono,
      color: C_INK,
    });
  });
  y -= MH + 20;

  /* ---- ROSTER (fighter blocks) ----------------------------- */
  sectionBand(`Roster · ${data.fighters.length} fighters`);

  if (data.fighters.length === 0) {
    txt("No fighters yet.", { size: 9, color: C_MUTED });
    y -= 18;
  }

  for (let fi = 0; fi < data.fighters.length; fi++) {
    const f = data.fighters[fi]!;
    const accent = f.isAlive ? C_HAZARD : C_BLOOD;
    const nameColor = f.isAlive ? C_INK : C_MUTED;

    const equipStr =
      f.equipment.length === 0
        ? "Equipment: —"
        : "Equipment: " +
          f.equipment.map((e) => `${e.name} (${e.cost}c)`).join(",  ");
    const equipLines = wrap(equipStr, fontReg, 8.5, W - PAD * 2 - 8);

    const blockH = PAD + 15 + 13 + equipLines.length * 11 + PAD;
    ensureSpace(blockH + 8);

    // panel + left accent stripe
    rect(X, y - blockH, W, blockH, C_ROW);
    rect(X, y - blockH, 3, blockH, accent);

    const innerX = X + PAD + 8;
    let yy = y - PAD - 10;

    // line 1: name + total cost
    txt(f.name, {
      x: innerX,
      y: yy,
      size: 11,
      font: fontBold,
      color: nameColor,
      maxWidth: W - PAD * 2 - 90,
    });
    rightText(`${f.totalCost}c`, X + W - PAD, yy, 11, fontMono, nameColor);
    yy -= 15;

    // line 2: meta
    const metaColor = f.status === "dead" ? C_BLOOD : C_MUTED;
    txt(`${f.type}  ·  ${f.category}  ·  ${statusLabel(f.status)}  ·  XP ${f.xp}`, {
      x: innerX,
      y: yy,
      size: 8.5,
      font: fontReg,
      color: metaColor,
      maxWidth: W - PAD * 2 - 16,
    });
    yy -= 13;

    // equipment (wrapped)
    for (const line of equipLines) {
      txt(line, {
        x: innerX,
        y: yy,
        size: 8.5,
        font: fontReg,
        color: f.isAlive ? rgb(0.25, 0.25, 0.24) : C_MUTED,
      });
      yy -= 11;
    }

    y -= blockH + 8; // breathing room between fighters
  }

  /* ---- STASH ----------------------------------------------- */
  y -= 6;
  sectionBand("Stash");

  txt(`Credits: ${data.stashCredits}c`, {
    size: 9,
    font: fontBold,
    color: C_INK,
  });
  y -= 16;

  if (data.stashItems.length === 0) {
    txt("No items in Stash.", { size: 8.5, color: C_MUTED });
    y -= 14;
  } else {
    for (const item of data.stashItems) {
      ensureSpace(14);
      const qty = item.qty > 1 ? `  ×${item.qty}` : "";
      txt(`•  ${item.name}`, {
        x: X + 6,
        size: 8.5,
        color: C_INK,
        maxWidth: W * 0.6,
      });
      txt(`${item.category}  ·  ${item.cost}c${qty}`, {
        x: X + W * 0.6,
        size: 8.5,
        color: C_MUTED,
      });
      y -= 14;
    }
  }

  return doc.save();
}
