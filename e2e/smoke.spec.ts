import { test, expect } from "@playwright/test";

/**
 * Navigation smoke tests (issue #27).
 *
 * Goal: catch "the page doesn't render at all" regressions on the public
 * routes and the primary navigation — not exhaustive UI/visual coverage.
 */

const PUBLIC_ROUTES: Array<{ path: string; title: RegExp }> = [
  { path: "/", title: /NecroForja/ },
  { path: "/lore", title: /Lore & Setting/ },
  { path: "/how-to-play", title: /How to Play/ },
  { path: "/gangs", title: /The Gangs/ },
  { path: "/dashboard", title: /Campaign Dashboard/ },
  { path: "/login", title: /Sign In/ },
];

for (const route of PUBLIC_ROUTES) {
  test(`${route.path} renders without error`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.ok(), `${route.path} should return a 2xx status`).toBeTruthy();

    await expect(page).toHaveTitle(route.title);

    // A generic guard against Next.js/React error overlays and 500 pages —
    // these render "Application error" / "Server Error" text even with a
    // 200 status in some deployments.
    await expect(page.getByText(/application error/i)).toHaveCount(0);

    // Every one of these routes renders exactly one <h1> (in the Hero/
    // CampaignStatus/Card component) — a single reliable "the page actually
    // rendered its content" signal without pinning to page-specific copy.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}

test.describe("primary navigation", () => {
  test("desktop GAME mega-menu opens on hover", async ({ page }) => {
    await page.goto("/");

    await page.getByText("GAME").first().hover();

    // The GAME mega-panel links into the mode pages — asserting on one is
    // enough to prove the panel actually opened.
    await expect(page.getByRole("link", { name: /skirmish/i }).first()).toBeVisible();
  });

  test("desktop FACTIONS mega-menu opens on hover", async ({ page }) => {
    await page.goto("/");

    await page.getByText("FACTIONS").first().hover();

    await expect(
      page.getByRole("link", { name: /compare all houses/i }),
    ).toBeVisible();
  });

  test("desktop nav links reach their destination", async ({ page }) => {
    await page.goto("/");
    // Label renomeado de "WORLD" para "LORE" (issue #19, limpeza do nav);
    // âncora exata pra não colidir com o título "Lore & Setting" da página.
    await page.getByRole("link", { name: /^lore$/i }).click();
    await expect(page).toHaveURL(/\/lore$/);
  });

  test("mobile burger opens the mobile nav", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.getByRole("button", { name: /close menu/i })).toBeVisible();
  });
});

test.describe("site search (issue #15)", () => {
  // Assertions stick to the static page index (`lib/search/pages.ts`), which
  // needs no DB seed data — CI runs `db:seed` (gangs/campaign), not the
  // journal/rules seeds, so post/rule results can't be relied on here.

  // Global keyboard shortcuts (Ctrl/Cmd+K) only work once SiteNav has
  // hydrated and attached its keydown listener — a bare `page.keyboard.press`
  // right after `goto` can race hydration and silently no-op, since Playwright
  // dispatches the key event immediately with no actionability wait. Clicking
  // the (always-present) search button first is a reliable hydration guard:
  // Playwright's click() waits for the element to be ready to receive events.

  test("opens via the nav search button and finds a static page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /search/i }).first().click();

    const input = page.getByPlaceholder(/search pages/i);
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();

    await input.fill("how to play");
    await expect(page.getByRole("button", { name: /how to play/i })).toBeVisible();
  });

  test("Ctrl/Cmd+K opens the dialog from anywhere on the page", async ({ page }) => {
    await page.goto("/");
    // Hydration guard (see openViaShortcut docstring): prove the page is
    // interactive by clicking the search button and closing it again before
    // exercising the keyboard shortcut itself.
    await page.getByRole("button", { name: /search/i }).first().click();
    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder(/search pages/i)).toHaveCount(0);

    await page.keyboard.press("Control+k");
    await expect(page.getByPlaceholder(/search pages/i)).toBeVisible();
  });

  test("Enter navigates to the selected result", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /search/i }).first().click();
    await page.getByPlaceholder(/search pages/i).fill("gallery");
    await page.getByRole("button", { name: /gallery/i }).first().waitFor();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/gallery$/);
  });

  test("shows an empty state with a Rules Assistant suggestion", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /search/i }).first().click();
    await page.getByPlaceholder(/search pages/i).fill("zzz-no-such-thing");
    await expect(page.getByText(/no results/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /rules assistant/i })).toBeVisible();
  });

  test("Escape closes the dialog", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /search/i }).first().click();
    const input = page.getByPlaceholder(/search pages/i);
    await expect(input).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(input).toHaveCount(0);
  });

  test("a section result (not just the page) links straight to its anchor", async ({ page }) => {
    // Sections (lib/search/sections.ts) are static, same as the page index —
    // no DB seed needed. House Escher is a real id on /gangs (Chapter/anchor
    // pattern shared with how-to-play, skirmish, campaign and lore).
    await page.goto("/");
    await page.getByRole("button", { name: /search/i }).first().click();
    await page.getByPlaceholder(/search pages/i).fill("escher");
    const result = page.getByRole("button", { name: /house escher/i }).first();
    await result.waitFor();
    // The subtitle names the parent page — proves this is a location hit,
    // not just the generic /gangs page result also shown for this query.
    await expect(result).toContainText(/gangs/i);
    await result.click();
    await expect(page).toHaveURL(/\/gangs#house-escher$/);
  });
});
