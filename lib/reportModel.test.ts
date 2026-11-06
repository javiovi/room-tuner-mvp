import { describe, expect, it } from "vitest"
import { surfaceAbsorption, correctedMaterials, rt60ChartMaximum, budgetTotal } from "./reportModel"
import { calculateTotalAbsorption, evaluateRT60 } from "./acousticsCalculations"
import { rt60Reference } from "./rt60Reference"
import { generatePdfRequestSchema, reportPersonalizationSchema } from "./validation/schemas"
import { getReportExperiments } from "./reportExperiments"
import { es } from "./translations/es"
import { mockProject, mockAnalysis } from "./mockData"

describe("personalised reports", () => {
  const project = { ...mockProject, lengthM: 5, widthM: 4, heightM: 3, floorType: "madera" as const, wallType: "desnudas" as const }
  it("surface contributions reconcile with total absorption for every band", () => {
    const result = surfaceAbsorption(project), total = calculateTotalAbsorption(project)
    for (const band of ["low", "mid", "high"] as const) expect(result.rows.reduce((sum, row) => sum + row[band], result.furniture[band])).toBeCloseTo(total[band], 8)
  })
  it("surface coefficients do not change when furniture is added", () => {
    const empty = correctedMaterials({ ...project, furniture: [] }, 0)
    const furnished = correctedMaterials(project, 0)
    expect(empty.floorAbsorption).toBeCloseTo((.15 + .1 + .1) / 3)
    expect(empty.floorAbsorption).toBe(furnished.floorAbsorption)
    expect(empty.wallAbsorption).toBe(furnished.wallAbsorption)
    expect(furnished.furnitureContribution).toBeGreaterThan(empty.furnitureContribution)
  })
  it("a common chart scale contains all values without saturating distinct bars", () => {
    const max = rt60ChartMaximum([3.47, 2.93, 2.12], .5)
    expect(max).toBeGreaterThanOrEqual(3.47)
    expect(3.47 / max).toBeGreaterThan(2.93 / max)
    expect(2.93 / max).toBeGreaterThan(2.12 / max)
  })
  it("shares the same goal reference with the app evaluation", () => {
    for (const goal of ["music", "work", "instrument"] as const) {
      const range = rt60Reference(goal)
      expect(evaluateRT60((range.min + range.max) / 2, goal).rating).toBe("good")
    }
  })
  it("derives totals from quantities and unit prices even for an old stored total", () => {
    expect(budgetTotal([{ ...mockAnalysis.lowBudgetChanges.items[0], quantity: 2, unitPrice: 10, totalPrice: 999 }])).toBe(20)
  })
  it("uses current restrictions for the PDF experiments", () => {
    const items = getReportExperiments({ ...project, concern: "bass", moveConstraints: { speakers: false, listening: false, furniture: false } }, "viva", es.experiments)
    expect(items.map(item => item.id)).not.toContain("symmetry")
    expect(items.map(item => item.id)).not.toContain("position")
  })
  it("accepts personal notes and rejects oversized notes", () => {
    expect(reportPersonalizationSchema.safeParse({ experiments: { position: { tried: true, outcome: "better", note: "Cambió la voz" } } }).success).toBe(true)
    expect(reportPersonalizationSchema.safeParse({ experiments: { position: { tried: true, note: "x".repeat(501) } } }).success).toBe(false)
  })
  it("keeps old reports downloadable without personalization", () => {
    expect(generatePdfRequestSchema.safeParse({ project: mockProject, analysis: mockAnalysis, locale: "es" }).success).toBe(true)
  })
})
