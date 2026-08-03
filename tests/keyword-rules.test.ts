/**
 * Keyword glossary tests (issue #67 follow-up).
 *
 * Lib half: trait-string parsing and lookup ("Rapid Fire (1)" must find the
 * "Rapid Fire" entry).
 *
 * Schema half: keyword/summary bounds, optional book/page normalisation.
 *
 * Action half (I/O mocked): duplicate guard, JSON paste-import (bad JSON,
 * bad entries, atomic upsert-by-keyword).
 *
 * The rule CONTENT itself is intentionally not in the repo (IP strategy):
 * summaries are rewritten in our own words and live only in the private
 * database — these tests only exercise structure and behaviour.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { splitTraits, keywordKey, keywordRuleMap } from "@/lib/keywords";
import {
  keywordRuleSchema,
  importKeywordRulesSchema,
} from "@/lib/validation";

/* ---- next/cache ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/* ---- Auth guards ---- */
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin-1", role: "admin" }),
  requireUser: vi.fn(),
}));

/* ---- Drizzle db ---- */
const { dbMock, mockKeywordFindFirst } = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
  const insertValues = vi.fn(() => ({
    onConflictDoUpdate,
    returning: vi.fn().mockResolvedValue([{ id: "kw-1" }]),
  }));
  const insert = vi.fn(() => ({ values: insertValues }));
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set: updateSet }));
  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  const del = vi.fn(() => ({ where: deleteWhere }));
  const mockKeywordFindFirst = vi.fn();
  const dbMock: any = {
    insert,
    insertValues,
    onConflictDoUpdate,
    update,
    updateSet,
    delete: del,
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(dbMock),
    ),
    query: {
      keywordRules: { findFirst: mockKeywordFindFirst, findMany: vi.fn() },
      equipmentCatalog: { findFirst: vi.fn(), findMany: vi.fn() },
    },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { dbMock, mockKeywordFindFirst };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    keywordRules: {
      id: "keyword_rule.id",
      keyword: "keyword_rule.keyword",
    },
    equipmentCatalog: {
      id: "equipment_catalog.id",
      name: "equipment_catalog.name",
    },
    equipment: { id: "equipment.id" },
  },
}));

import {
  createKeywordRule,
  importKeywordRules,
} from "@/app/admin/catalog/actions";

const SUMMARY = "A natural 6 to hit wounds automatically - no wound roll.";

function form(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

/* ------------------------------------------------------------------ */
/*  Trait parsing / lookup                                              */
/* ------------------------------------------------------------------ */
describe("keywords lib", () => {
  it("splits a printed traits string into individual traits", () => {
    expect(splitTraits("Rapid Fire (1), Knockback,  Unwieldy ")).toEqual([
      "Rapid Fire (1)",
      "Knockback",
      "Unwieldy",
    ]);
    expect(splitTraits("")).toEqual([]);
  });

  it("strips parameters and case for the lookup key", () => {
    expect(keywordKey("Rapid Fire (1)")).toBe("rapid fire");
    expect(keywordKey('Blast (3")')).toBe("blast");
    expect(keywordKey("Melee")).toBe("melee");
  });

  it('"Rapid Fire (2)" finds the "Rapid Fire" glossary entry', () => {
    const map = keywordRuleMap([
      { keyword: "Rapid Fire", summary: "burst fire summary" },
      { keyword: "Knockback", summary: "push summary" },
    ]);
    expect(map[keywordKey("Rapid Fire (2)")]?.summary).toBe(
      "burst fire summary",
    );
    expect(map[keywordKey("Shock")]).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ */
/*  Schemas                                                             */
/* ------------------------------------------------------------------ */
describe("keyword rule schemas", () => {
  it("normalises empty book/page and coerces page", () => {
    const r = keywordRuleSchema.safeParse({
      keyword: "Shock",
      summary: SUMMARY,
      book: "",
      page: "",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.book).toBeUndefined();
      expect(r.data.page).toBeUndefined();
    }
    const r2 = keywordRuleSchema.safeParse({
      keyword: "Shock",
      summary: SUMMARY,
      page: "316",
    });
    expect(r2.success).toBe(true);
    if (r2.success) expect(r2.data.page).toBe(316);
  });

  it("rejects a too-short summary (a keyword needs a real explanation)", () => {
    expect(
      keywordRuleSchema.safeParse({ keyword: "Shock", summary: "6=win" })
        .success,
    ).toBe(false);
    expect(importKeywordRulesSchema.safeParse({ payload: "" }).success).toBe(
      false,
    );
  });
});

/* ------------------------------------------------------------------ */
/*  Actions                                                             */
/* ------------------------------------------------------------------ */
describe("createKeywordRule", () => {
  it("rejects a duplicate keyword", async () => {
    mockKeywordFindFirst.mockResolvedValue({ id: "kw-1" });

    const res = await createKeywordRule(
      {},
      form({ keyword: "Shock", summary: SUMMARY }),
    );

    expect(res.error).toMatch(/already has a rule/);
    expect(dbMock.insert).not.toHaveBeenCalled();
  });
});

describe("importKeywordRules", () => {
  it("rejects invalid JSON and non-array payloads", async () => {
    const bad = await importKeywordRules({}, form({ payload: "{oops" }));
    expect(bad.error).toMatch(/Invalid JSON/);

    const notArray = await importKeywordRules(
      {},
      form({ payload: '{"keyword":"Shock"}' }),
    );
    expect(notArray.error).toMatch(/non-empty JSON array/);
  });

  it("points at the first invalid entry", async () => {
    const res = await importKeywordRules(
      {},
      form({
        payload: JSON.stringify([
          { keyword: "Shock", summary: SUMMARY },
          { keyword: "Melee" }, // missing summary
        ]),
      }),
    );

    expect(res.error).toMatch(/^Entry 2:/);
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });

  it("upserts every entry by keyword inside one transaction", async () => {
    const res = await importKeywordRules(
      {},
      form({
        payload: JSON.stringify([
          { keyword: "Shock", summary: SUMMARY, book: "Core Rulebook 2023", page: 316 },
          { keyword: "Melee", summary: "Can be used to make close combat attacks." },
        ]),
      }),
    );

    expect(res.success).toMatch(/2 keyword rule/);
    expect(dbMock.transaction).toHaveBeenCalledTimes(1);
    expect(dbMock.insertValues).toHaveBeenCalledTimes(2);
    expect(dbMock.onConflictDoUpdate).toHaveBeenCalledTimes(2);
    expect(dbMock.insertValues.mock.calls[0]?.[0]).toMatchObject({
      keyword: "Shock",
      page: 316,
    });
  });
});
