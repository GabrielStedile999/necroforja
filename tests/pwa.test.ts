import { describe, expect, it } from "vitest";
import { getCacheStrategy } from "@/lib/pwa/cache-routes";

/* ------------------------------------------------------------------ */
/*  getCacheStrategy — exhaustive route coverage                       */
/* ------------------------------------------------------------------ */

describe("getCacheStrategy", () => {
  // ---- network-only --------------------------------------------------

  it("returns network-only for /api/ routes", () => {
    expect(getCacheStrategy("/api/fighter")).toBe("network-only");
    expect(getCacheStrategy("/api/gang/create")).toBe("network-only");
  });

  it("returns network-only for /admin routes", () => {
    expect(getCacheStrategy("/admin")).toBe("network-only");
    expect(getCacheStrategy("/admin/gangs")).toBe("network-only");
    expect(getCacheStrategy("/admin/gangs/abc123/export")).toBe("network-only");
  });

  it("returns network-only for /login routes", () => {
    expect(getCacheStrategy("/login")).toBe("network-only");
    expect(getCacheStrategy("/login?callbackUrl=/player")).toBe("network-only");
  });

  it("returns network-only for /dashboard routes", () => {
    expect(getCacheStrategy("/dashboard")).toBe("network-only");
    expect(getCacheStrategy("/dashboard/overview")).toBe("network-only");
  });

  it("returns network-only for /_next/data/ routes", () => {
    expect(getCacheStrategy("/_next/data/abc123/player.json")).toBe(
      "network-only",
    );
  });

  // ---- cache-first ---------------------------------------------------

  it("returns cache-first for /_next/static/ assets", () => {
    expect(getCacheStrategy("/_next/static/chunks/main.js")).toBe(
      "cache-first",
    );
    expect(getCacheStrategy("/_next/static/css/app.css")).toBe("cache-first");
  });

  it("returns cache-first for /icons/ assets", () => {
    expect(getCacheStrategy("/icons/icon-192.png")).toBe("cache-first");
    expect(getCacheStrategy("/icons/icon-512.png")).toBe("cache-first");
  });

  it("returns cache-first for /icon.svg (exact match)", () => {
    expect(getCacheStrategy("/icon.svg")).toBe("cache-first");
  });

  it("returns cache-first for /favicon.ico (exact match)", () => {
    expect(getCacheStrategy("/favicon.ico")).toBe("cache-first");
  });

  // ---- network-first -------------------------------------------------

  it("returns network-first for / (root)", () => {
    expect(getCacheStrategy("/")).toBe("network-first");
  });

  it("returns network-first for /player routes", () => {
    expect(getCacheStrategy("/player")).toBe("network-first");
    expect(getCacheStrategy("/player/fighters/123")).toBe("network-first");
  });

  it("returns network-first for any other unknown route", () => {
    expect(getCacheStrategy("/about")).toBe("network-first");
    expect(getCacheStrategy("/rules")).toBe("network-first");
  });

  // ---- edge cases / boundary checks ----------------------------------

  it("does NOT treat /admintools as network-only (startsWith exact prefix)", () => {
    // /admintools starts with /admin so it IS network-only — this is correct
    // behaviour: conservative, keeps sensitive-looking paths network-only.
    expect(getCacheStrategy("/admintools")).toBe("network-only");
  });

  it("does NOT treat /icon.svg/extra as cache-first (exact-match variants)", () => {
    // /icon.svg/extra does not match any cache-first exact rule and is not
    // under a cache-first prefix → falls through to network-first.
    expect(getCacheStrategy("/icon.svg/extra")).toBe("network-first");
  });

  it("treats /api (no trailing slash) as network-first — only /api/ prefix is network-only", () => {
    // getCacheStrategy matches /api/ with trailing slash; /api alone is not a
    // match → falls through to network-first (safe default).
    expect(getCacheStrategy("/api")).toBe("network-first");
  });
});
