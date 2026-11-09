import type { RoomProject, EnhancedAnalysisResponse } from "@/app/types/room"
import { absorptionCoefficients, calculateFurnitureAbsorption } from "@/lib/acousticsCalculations"
import type { Layout, MoveConstraints } from "@/lib/layoutTrial"
import type { ExperimentRecords } from "@/lib/reportExperiments"

export interface ReportPersonalization {
  layout?: { confirmed?: boolean; current: Layout; proposal: Layout; moves: MoveConstraints; view: "current" | "proposal"; source: "user" | "schematic" }
  experiments?: ExperimentRecords
}
export function surfaceAbsorption(project: RoomProject) {
  const floorArea = (project.lengthM ?? 0) * (project.widthM ?? 0)
  const wallArea = 2 * ((project.lengthM ?? 0) + (project.widthM ?? 0)) * (project.heightM ?? 0)
  const furniture = calculateFurnitureAbsorption(project.furniture ?? [])
  const rows = [
    { id: "floor", area: floorArea, coefficient: absorptionCoefficients.floor[project.floorType ?? "otro"] },
    { id: "walls", area: wallArea, coefficient: absorptionCoefficients.wall[project.wallType ?? "desnudas"] },
    { id: "ceiling", area: floorArea, coefficient: { low: .02, mid: .02, high: .03 } },
  ].map(row => ({ ...row, low: row.area * row.coefficient.low, mid: row.area * row.coefficient.mid, high: row.area * row.coefficient.high }))
  return { rows, furniture }
}
export function correctedMaterials(project: RoomProject, total: number): EnhancedAnalysisResponse["materialsAnalysis"] {
  const { rows, furniture } = surfaceAbsorption(project)
  const average = (v: { low: number; mid: number; high: number }) => (v.low + v.mid + v.high) / 3
  return { floorAbsorption: average(rows[0].coefficient), wallAbsorption: average(rows[1].coefficient), ceilingAbsorption: average(rows[2].coefficient), furnitureContribution: average(furniture), totalAbsorption: total }
}
export { rt60Reference } from "@/lib/rt60Reference"
export function rt60ChartMaximum(values: number[], referenceMax: number) {
  return Math.ceil(Math.max(referenceMax * 1.25, ...values.filter(Number.isFinite)) * 2) / 2
}
export function budgetTotal(items: EnhancedAnalysisResponse["lowBudgetChanges"]["items"]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}
