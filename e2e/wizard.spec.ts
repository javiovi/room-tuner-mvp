import { expect, test, type Page } from "@playwright/test"

/**
 * The two things that were never covered by a test and are the easiest to break:
 * the wizard keeping what the user typed, and the wizard reaching a report at all.
 */

const ROOM = { largo: "4.2", ancho: "3.1", altura: "2.5" }

/** Fills the form on whatever page is already loaded. */
async function fillSpaceFields(page: Page) {
  await page.getByRole("button", { name: "Tengo las medidas", exact: true }).click()
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
    await page.getByRole("button", { name: "Tengo las medidas", exact: true }).click()
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

    await expect(page.getByRole("tab")).toHaveCount(0)
    await page.getByText("Registrar la prueba y ver otras opciones",{exact:true}).click()
    const firstAction = page.getByRole("article").first()
    await firstAction.getByLabel("Mejoró", { exact: true }).check()
    await firstAction.getByLabel("¿Qué cambiaste? (opcional)").fill("Moví los parlantes")
    await page.reload()
    await page.getByText("Registrar la prueba y ver otras opciones",{exact:true}).click()
    const restored = page.getByRole("article").first()
    await expect(restored.getByLabel("Mejoró", { exact: true })).toBeChecked()
    await expect(restored.getByLabel("¿Qué cambiaste? (opcional)")).toHaveValue("Moví los parlantes")
    await page.screenshot({ path: "/tmp/roomtuner-today-mobile.png", fullPage: true })
    let pdfPayload: Record<string, unknown> | undefined
    await page.route("**/api/generate-pdf", async route => {
      pdfPayload = route.request().postDataJSON()
      await route.fulfill({ status: 200, contentType: "application/pdf", body: "%PDF-1.4\n" })
    })
    await page.getByRole("button", { name: /Descargar PDF/i }).click()
    await expect.poll(() => pdfPayload).toBeTruthy()
    const exported = pdfPayload?.personalization as { experiments: Record<string, { note: string; outcome: string }> }
    expect(exported.experiments.symmetry).toMatchObject({ outcome: "better", note: "Moví los parlantes" })


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

test("quick route needs no measurements, furniture or microphone", async ({ page }) => {
  await page.goto("/objetivo")
  await page.getByRole("combobox", { name: "Tu prioridad" }).selectOption("noise")
  await page.getByRole("combobox", { name: "¿De dónde viene el ruido?" }).selectOption("outside")
  await page.getByRole("combobox", { name: "¿Por dónde parece entrar?" }).selectOption("window")
  await page.getByRole("radio", { name: /Trabajar/ }).click()
  await page.getByRole("button", { name: "Continuar", exact: true }).click()
  await expect(page.getByRole("button", { name: "No tengo las medidas" })).toHaveAttribute("aria-pressed", "true")
  await expect(page.locator('input[name="largo"]')).not.toBeVisible()
  await page.getByRole("button", { name: "Continuar", exact: true }).click()
  await expect(page).toHaveURL(/\/resultado/, { timeout: 60000 })
  await expect(page.getByRole("article")).toHaveCount(1)
  await expect(page.getByRole("heading", { name: "Compará con la ventana bien cerrada" })).toBeVisible()
  await expect(page.getByRole("button", { name: /Descargar PDF/i })).not.toBeVisible()
  await expect(page.getByText("Ver la ayuda del plano", { exact: true })).not.toBeVisible()
  await page.getByText("Qué mejoras podés considerar", { exact: true }).click()
  await expect(page.getByText(/Solo si comprobaste una holgura o junta deteriorada en esa puerta o ventana/ )).toBeVisible()
  await expect(page.getByText(/No podemos prometer una reducción en dB/)).toBeVisible()
  await page.getByLabel("No pude probarlo", { exact: true }).check()
  await page.reload()
  await expect(page.getByLabel("No pude probarlo", { exact: true })).toBeChecked()
  await page.getByRole("link", { name: "Agregar medidas para afinar la propuesta" }).click()
  await expect(page.locator('input[name="largo"]')).toHaveValue("")
})

test("carries a local room photo and a suspected noise entry through the short journey", async ({page}) => {
  await page.goto("/")
  await page.getByRole("button", {name:"Fotografiar mi espacio"}).first().click()
  await page.locator('input[capture="environment"]').setInputFiles("public/placeholder.jpg")
  await expect(page).toHaveURL(/\/medidas/)
  await expect(page.getByRole("img", {name:"Tu habitación"})).toBeVisible()
  await page.locator("select").filter({has: page.locator('option[value="work"]')}).selectOption("work")
  await fillSpaceFields(page)
  await page.getByRole("button",{name:"Continuar", exact:true}).click()
  await expect(page).toHaveURL(/\/objetos/)
  await page.getByRole("combobox", { name: "Tu prioridad" }).selectOption("noise")
  await page.getByRole("combobox", { name: "¿De dónde viene el ruido?" }).selectOption("outside")
  await page.getByRole("combobox", { name: "¿Por dónde parece entrar?" }).selectOption("window")
  await page.getByRole("button", {name:"Marcar entrada sospechada"}).click()
  const request = page.waitForRequest(req => req.url().endsWith("/api/analyze-room"))
  await page.getByRole("button",{name:"Analizar mi espacio"}).click()
  const body = (await request).postDataJSON()
  expect(body).toMatchObject({goal:"work", concern:"noise", noiseEntry:"window", lengthM:4.2})
  expect(JSON.stringify(body)).not.toMatch(/photo|data:image|photoBytes|zones/)
  await expect(page).toHaveURL(/\/resultado/, {timeout:60000})
  await page.reload()
  await expect(page.getByRole("img",{name:"Tu habitación",exact:true})).toBeVisible()
  await expect(page.getByRole("heading",{name:"Compará con la ventana bien cerrada"})).toBeVisible()
})
