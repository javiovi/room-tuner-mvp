import { expect, test } from "@playwright/test"
import { mockAnalysis } from "../lib/mockData"

const project = { goal: "music", concern: "bass", dimensionSource: "measured", lengthM: 5, widthM: 4, heightM: 3, floorType: "madera", wallType: "desnudas", furniture: ["sofa"], speakerPlacement: "esquina", listeningPosition: "sillon-pared-posterior", moveConstraints: { speakers: true, listening: true, furniture: false } }
test.beforeEach(async ({ page }, testInfo) => {
  await page.addInitScript(({ project, analysis }) => {
    if (!sessionStorage.getItem("roomtuner-session")) sessionStorage.setItem("roomtuner-session", JSON.stringify({ version: 1, state: { project, analysis, projectId: null, analysisPersisted: false, reportPersonalization: {} } }))
  }, { project: { ...project, concern: testInfo.title.startsWith("unable") ? "clarity" : project.concern }, analysis: mockAnalysis })
})

test("one record, explicit layout confirmation and a preview that preserves both plans", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", e=>errors.push(e.message))
  await page.goto("/resultado")
  await expect(page.getByRole("article")).toHaveCount(1)
  await expect(page.getByRole("heading", { name: "Compará dos lugares de escucha" })).toHaveCount(1)
  await expect(page.getByRole("button", { name: "Mostrame cómo" })).not.toBeVisible()
  await page.getByText("Ver la ayuda del plano", { exact: true }).click()
  const planner = page.getByRole("region", { name: "Probá otra distribución" })
  await expect(planner.getByRole("button", { name: "Propuesta", exact: true })).toBeDisabled()
  await expect(planner.getByText("Ver distancias orientativas", { exact: true })).not.toBeVisible()
  await planner.getByRole("button", { name: "El plano se parece a mi espacio" }).click()
  const listener = planner.locator('[data-object="listening"]')
  const speaker = planner.locator('[data-object="speaker-0"]')
  const before = await listener.getAttribute("data-y"), speakerX = await speaker.getAttribute("data-x")
  await planner.getByRole("button", { name: "Mostrame cómo" }).click()
  await expect.poll(()=>listener.getAttribute("data-y")).not.toBe(before)
  await expect(speaker).toHaveAttribute("data-x",speakerX!)
  const saved = await page.evaluate(()=>JSON.parse(sessionStorage.getItem("roomtuner-session")!).state.reportPersonalization.layout)
  expect(saved.current.listeningPosition.y).toBe(Number(before))
  await planner.getByRole("button", { name: "Volver al plano", exact: true }).click()
  await expect(listener).toHaveAttribute("data-y",before!)
  await page.getByLabel("Mejoró", { exact: true }).check()
  await page.getByLabel("¿Qué cambiaste? (opcional)").fill("Otro asiento")
  await page.reload()
  await expect(page.getByLabel("Mejoró", { exact: true })).toBeChecked()
  await expect(page.getByLabel("¿Qué cambiaste? (opcional)")).toHaveValue("Otro asiento")
  let payload: {personalization:{experiments:{position:unknown}}} | undefined
  await page.route("**/api/generate-pdf",async route=>{payload=route.request().postDataJSON();await route.fulfill({contentType:"application/pdf",body:"%PDF-1.4\n"})})
  await page.getByRole("button",{name:/Descargar PDF/i}).click()
  await expect.poll(()=>payload?.personalization.experiments.position).toEqual({tried:true,outcome:"better",note:"Otro asiento"})
  expect(errors).toEqual([])
})

test("unable is not counted as tried and another option retains the earlier note", async ({ page }) => {
  await page.goto("/resultado")
  await page.getByLabel("No pude probarlo",{exact:true}).check()
  await page.getByLabel("¿Qué cambiaste? (opcional)").fill("No puedo mover el asiento hoy")
  await page.getByRole("button",{name:"Probar otra alternativa"}).click()
  await expect(page.getByRole("article")).toHaveCount(1)
  await expect(page.getByRole("heading",{name:"Compará dos lugares de escucha"})).toBeVisible()
  await page.reload()
  await expect(page.getByRole("heading",{name:"Compará dos lugares de escucha"})).toBeVisible()
  await page.getByRole("button",{name:"Volver a la prueba anterior"}).click()
  await expect(page.getByLabel("No pude probarlo",{exact:true})).toBeChecked()
  await expect(page.getByLabel("¿Qué cambiaste? (opcional)")).toHaveValue("No puedo mover el asiento hoy")
  const record = await page.evaluate(()=>JSON.parse(sessionStorage.getItem("roomtuner-session")!).state.reportPersonalization.experiments.symmetry)
  expect(record.tried).toBe(false)
})

test("technical estimates do not prescribe treatment and English stays usable", async ({ page }) => {
  await page.goto("/resultado")
  await page.getByRole("tab",{name:"Quiero entender más"}).click()
  await page.locator("summary").filter({hasText:/^Modos de sala$/}).click()
  await expect(page.getByText(/no indican cuánto se escuchan/i)).toBeVisible()
  await expect(page.getByText(/requieren tratamiento|Modos críticos|Alta severidad/i)).toHaveCount(0)
  await page.getByRole("button",{name:"Cambiar a inglés"}).click()
  await page.getByRole("tab",{name:"What to try today"}).click()
  await expect(page.getByRole("heading",{name:"Compare two listening positions"})).toBeVisible()
  await expect(page.getByLabel("I could not try it",{exact:true})).toBeVisible()
})
