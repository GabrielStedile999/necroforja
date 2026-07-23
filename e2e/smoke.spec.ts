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
    await page.getByRole("link", { name: /world/i }).click();
    await expect(page).toHaveURL(/\/lore$/);
  });

  test("mobile burger opens the mobile nav", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.getByRole("button", { name: /close menu/i })).toBeVisible();
  });
});
