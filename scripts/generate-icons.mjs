#!/usr/bin/env node
/**
 * Generates PWA icons for NecroForja.
 *
 * Usage:  node scripts/generate-icons.mjs
 * Output: public/icons/icon-192.png
 *         public/icons/icon-512.png
 *
 * No external dependencies — uses only Node.js built-ins (zlib + fs).
 *
 * Icon design:
 *   • Background: #0b0c0e (void dark)
 *   • Outer border:  #f2a900 (hazard yellow) — 6 % of size on each side
 *   • Central rhombus (Necromunda danger marker):  hazard yellow
 *   • Circular cutout in the rhombus centre:  void dark
 */

import { mkdirSync, writeFileSync } from "fs";
import { deflateSync } from "zlib";

/* ------------------------------------------------------------------ */
/*  Colour palette                                                      */
/* ------------------------------------------------------------------ */
const BG     = [0x0b, 0x0c, 0x0e]; // void
const ACCENT = [0xf2, 0xa9, 0x00]; // hazard yellow

/* ------------------------------------------------------------------ */
/*  Minimal PNG encoder (RFC 2083)                                      */
/* ------------------------------------------------------------------ */

/** CRC-32 lookup-table implementation. */
function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) {
    crc ^= b;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** Builds a single PNG chunk: length + type + data + CRC-32. */
function pngChunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(d.length, 0);
  const forCrc = Buffer.concat([t, d]);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(forCrc), 0);
  return Buffer.concat([len, t, d, crcBuf]);
}

/**
 * Creates a square PNG from a pixel function.
 * @param {number} size - Width = Height (pixels)
 * @param {(x: number, y: number, size: number) => [number,number,number]} pixelFn
 */
function makePNG(size, pixelFn) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR: width(4) height(4) bitDepth(1) colorType(1) compression(1) filter(1) interlace(1)
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 8-bit channels
  ihdr[9] = 2; // RGB (no alpha)
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw image data: for each row: filter_byte(0) + width × 3 bytes
  const stride = 1 + size * 3;
  const raw = Buffer.allocUnsafe(size * stride);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter = None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelFn(x, y, size);
      const o = y * stride + 1 + x * 3;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b;
    }
  }

  // IDAT uses the zlib (RFC 1950) wrapper format, which deflateSync produces
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ */
/*  Icon pixel function                                                  */
/* ------------------------------------------------------------------ */

/**
 * Returns the RGB colour for pixel (x, y) in a size×size icon.
 *
 * Layout:
 *  ┌─────────────────────────────────────────┐
 *  │░░░░░░░░░░ hazard border (6 %) ░░░░░░░░░░│
 *  │░ ┌─────────────────────────────────┐ ░  │
 *  │░ │          void dark              │ ░  │
 *  │░ │       ╱‾‾‾‾‾‾‾‾‾‾╲             │ ░  │
 *  │░ │      ╱  hazard     ╲            │ ░  │
 *  │░ │     ╱   rhombus     ╲           │ ░  │
 *  │░ │    ╱   ┌────────┐    ╲          │ ░  │
 *  │░ │   ╱    │  void  │     ╲         │ ░  │
 *  │░ │   ╲    │ cutout │    ╱          │ ░  │
 *  │░ │    ╲   └────────┘   ╱           │ ░  │
 *  │░ │     ╲              ╱            │ ░  │
 *  │░ │      ╲____________╱             │ ░  │
 *  │░ └─────────────────────────────────┘ ░  │
 *  └─────────────────────────────────────────┘
 *
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @returns {[number, number, number]}
 */
function pixel(x, y, size) {
  const border  = Math.round(size * 0.06);
  const cx = size / 2;
  const cy = size / 2;

  // Outer hazard border
  if (x < border || x >= size - border || y < border || y >= size - border) {
    return ACCENT;
  }

  // Centred rhombus (diamond / danger marker)
  const dx = Math.abs(x - cx);
  const dy = Math.abs(y - cy);
  const rhombusR = size * 0.30; // half-span along each axis

  if (dx + dy < rhombusR) {
    // Circular void cutout in the centre of the rhombus
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    if (dist < size * 0.11) return BG;
    return ACCENT;
  }

  return BG;
}

/* ------------------------------------------------------------------ */
/*  Generate and write                                                   */
/* ------------------------------------------------------------------ */

mkdirSync("public/icons", { recursive: true });

for (const size of [192, 512]) {
  const path = `public/icons/icon-${size}.png`;
  writeFileSync(path, makePNG(size, pixel));
  console.log(`✔  ${path}`);
}
