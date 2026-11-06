import { expect, test } from "@playwright/test"
import { mockAnalysis, mockProject } from "../lib/mockData"

const oldId = "d92b9fb3-611e-41d2-a43a-60bdd9437362"
const newId = "77085c95-6c81-46d7-9abd-e88b718ead3f"

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ analysis, project, id }) => {
    sessionStorage.setItem("roomtuner-session", JSON.stringify({ version: 1, state: {
      project: { ...project, concern: "bass", measuredRT60: { value: .7, method: "T20", confidence: "high" } },
      analysis, projectId: id, analysisPersisted: true,
      reportPersonalization: { experiments: { symmetry: { tried: true, note: "Old room note" } } },
    } }))
  }, { analysis: mockAnalysis, project: mockProject, id: oldId })
})

test("the report link wins over another room cached in the same tab", async ({ page }) => {
  await page.route(`**/api/projects/${newId}`, route => route.fulfill({
    json: { project: { goal: "work", dimensionSource: "approximate", concern: "noise", lengthM: 3, widthM: 3, heightM: 2.5 },
      analysis: { ...mockAnalysis, generatedAt: "2026-11-06T12:00:00Z", inputContext: { dimensionSource: "approximate", concern: "noise" } } },
  }))
  await page.goto(`/resultado?id=${newId}`)
  await expect(page.getByText("Orientación rápida · dimensiones supuestas")).toBeVisible()
  await expect(page.getByRole("tab")).toHaveCount(2)
  const state = await page.evaluate(() => JSON.parse(sessionStorage.getItem("roomtuner-session")!).state)
  expect(state.projectId).toBe(newId)
  expect(state.project.concern).toBe("noise")
  expect(state.project.measuredRT60).toBeUndefined()
  expect(JSON.stringify(state.reportPersonalization)).not.toContain("Old room note")
})

test("an unavailable link does not show the previously cached report", async ({ page }) => {
  await page.route(`**/api/projects/${newId}`, route => route.fulfill({ status: 404, json: { error: "Project not found" } }))
  await page.goto(`/resultado?id=${newId}`)
  await expect(page.getByRole("link", { name: /Volver al inicio|Back to home/i })).toBeVisible()
  await expect(page.getByRole("tab")).toHaveCount(0)
})
