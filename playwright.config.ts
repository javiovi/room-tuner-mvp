import { defineConfig, devices } from "@playwright/test"

const PORT = 3100
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  // Keep these out of vitest's reach: unit tests are *.test.ts, browser specs are *.spec.ts.
  testMatch: "**/*.spec.ts",
  // The wizard writes to sessionStorage, which is per-tab: parallel workers don't collide.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    // The app is mobile-first, so that's what it gets tested at.
    ...devices["iPhone 13"],
  },

  webServer: {
    // The production build, not dev: it's what actually ships, and it catches the
    // prerender/hydration problems that dev's looser rendering hides.
    command: `pnpm run build && pnpm run start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // These specs never assert on saved data, so a real database isn't needed — the app
      // degrades to an unsaved report, which is itself worth exercising.
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-service-key",
    },
  },
})
