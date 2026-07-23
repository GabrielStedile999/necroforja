import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright — navigation smoke tests (issue #27).
 *
 * Scope on purpose: this suite checks that the public routes render without
 * error and that primary navigation works, NOT exhaustive UI coverage (that's
 * what the vitest suite in tests/ is for — pure logic, scoring, etc.).
 *
 * In CI this runs against a `next start` production build with a seeded
 * database (see .github/workflows/ci.yml, job `e2e`). Locally, point
 * PLAYWRIGHT_BASE_URL at an already-running dev/start server, or let
 * `webServer` below start one for you (requires a working .env — see
 * .env.example — with a reachable DATABASE_URL).
 */
const PORT = process.env.PLAYWRIGHT_PORT || "3100";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Sandboxes that pre-provision a Chromium build under a different
        // revision than this package expects can point here instead of
        // running `playwright install` (network-restricted environments).
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
          : undefined,
      },
    },
  ],

  // Reuses a server you already have running (e.g. `npm run dev`) instead of
  // spawning a second one — set PLAYWRIGHT_SKIP_WEB_SERVER=1 for that.
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: process.env.CI ? "npm run start" : "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
