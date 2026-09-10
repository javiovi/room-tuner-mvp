import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    // Browser specs live in e2e/ and are run by Playwright, not here.
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
  },
})
