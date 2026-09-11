import { expect, test, type Page } from "@playwright/test"

/**
 * The two things that were never covered by a test and are the easiest to break:
 * the wizard keeping what the user typed, and the wizard reaching a report at all.
 */

const ROOM = { largo: "4.2", ancho: "3.1", altura: "2.5" }

/** Fills the form on whatever page is already loaded. */
async function fillSpaceFields(page: Page) {
  await page.fill('input[name="largo"]', ROOM.largo)
  await page.fill('input[name="ancho"]', ROOM.ancho)
  await page.fill('input[name="altura"]', ROOM.altura)
  await page.selectOption('select[name="tipoPiso"]', "madera")
  await page.selectOption('select[name="tipoParedes"]', "desnudas")
}

/** Navigates to the step first. Not for use right after a click that already navigates there
 *  — the two navigations interrupt each other. */
async function gotoSpaceAndFill(page: Page) {
  await page.goto("/espacio")
  await fillSpaceFields(page)
}

test.describe("wizard", () => {
  test("keeps the room measurements across a reload", async ({ page }) => {
    await gotoSpaceAndFill(page)
    await page.getByRole("button", { name: "Continuar" }).click()
    await expect(page).toHaveURL(/\/disposicion/)

    // Back to the form and hard reload: in-memory state is gone, so anything still on
    // screen came out of session storage and back through the seeding effect.
    await page.goto("/espacio")
    await page.reload()

    await expect(page.locator('input[name="largo"]')).toHaveValue(ROOM.largo)
    await expect(page.locator('input[name="ancho"]')).toHaveValue(ROOM.ancho)
    await expect(page.locator('input[name="altura"]')).toHaveValue(ROOM.altura)
    await expect(page.locator('select[name="tipoPiso"]')).toHaveValue("madera")
    await expect(page.locator('select[name="tipoParedes"]')).toHaveValue("desnudas")
  })

  test("blocks the step until the space is described", async ({ page }) => {
    await page.goto("/espacio")
    await expect(page.getByRole("button", { name: "Continuar" })).toBeDisabled()

    await fillSpaceFields(page)
    await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled()
  })

  test("goes from goal to a full report", async ({ page }) => {
    await page.goto("/objetivo")
    await page.getByRole("radio", { name: /Escuchar m.sica/ }).click()
    await page.getByRole("button", { name: "Continuar" }).click()

    await expect(page).toHaveURL(/\/espacio/)
    await fillSpaceFields(page)
    await page.getByRole("button", { name: "Continuar" }).click()

    await expect(page).toHaveURL(/\/disposicion/)
    await page.getByRole("radio", { name: /Centrado en pared corta/ }).click()
    await page.getByRole("radio", { name: /Cerca del centro del espacio/ }).click()
    await page.getByRole("button", { name: "Continuar" }).click()

    // Furniture is optional — straight through.
    await expect(page).toHaveURL(/\/muebles/)
    await page.getByRole("button", { name: "Analizar mi espacio" }).click()

    // Skip the microphone step: it needs a permission no CI runner will grant.
    await expect(page).toHaveURL(/\/medicion/)
    await page.getByRole("button", { name: "Omitir y analizar" }).click()

    // The analysis runs, then the report. Generous timeout: this is real computation.
    await expect(page).toHaveURL(/\/resultado/, { timeout: 60_000 })

    // The tabs are plain buttons today (no tablist semantics — a real a11y gap, tracked
    // separately), so they are matched by their visible label.
    await expect(page.getByRole("button", { name: /Resumen/ })).toBeVisible({ timeout: 30_000 })

    // The paywall is dormant, so every tab is present — this fails the day it silently
    // switches back on.
    await expect(page.getByRole("button", { name: /Diagrama/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /Presupuesto/ })).toBeVisible()
  })
})

test.describe("when the analysis fails", () => {
  test("shows an error screen with a retry, and leaves a log line behind", async ({ page }) => {
    const logged: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") logged.push(message.text())
    })

    // The API answering 500 is the one failure the user can't do anything about, and
    // until now it left no trace anywhere.
    await page.route("**/api/analyze-room", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: '{"error":"Internal server error"}' })
    )

    await page.goto("/espacio")
    await fillSpaceFields(page)
    await page.getByRole("button", { name: "Continuar" }).click()
    // Let the app's own navigation land before taking over, or the two interrupt each other.
    await expect(page).toHaveURL(/\/disposicion/)
    await page.goto("/analizando")

    // The user gets a way out, not a spinner forever.
    await expect(page.getByRole("button", { name: /Reintentar|Try again/i })).toBeVisible({ timeout: 30_000 })
    expect(page.url()).toContain("/analizando")

    // And whoever is debugging gets told what happened.
    expect(logged.join("\n")).toContain("[analizando]")
  })
})
