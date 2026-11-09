import type { RoomProject } from "@/app/types/room"
import type { Translations } from "@/lib/translations/es"

export type ExperimentRecord = { tried: boolean; outcome?: "better" | "same" | "worse" | "unable"; note: string }
export type ExperimentRecords = Record<string, ExperimentRecord>
export function experimentCatalog(c: Translations["experiments"]) {
  return (["symmetry", "position", "quiet", "echo", "dry", "windowClose", "doorClose", "quietSpot", "noisePath"] as const).map(id => ({ id, title: c[`${id}Title`], action: c[`${id}Action`], why: c[`${id}Why`], check: c[`${id}Check`] }))
}

export function getReportExperiments(project: RoomProject, character: "viva" | "equilibrada" | "seca", c: Translations["experiments"]) {
  const symmetry = { id: "symmetry", title: c.symmetryTitle, action: c.symmetryAction, why: c.symmetryWhy, check: c.symmetryCheck }
  const position = { id: "position", title: c.positionTitle, action: c.positionAction, why: c.positionWhy, check: c.positionCheck }
  const quiet = { id: "quiet", title: c.quietTitle, action: c.quietAction, why: c.quietWhy, check: c.quietCheck }
  const echo = { id: "echo", title: c.echoTitle, action: c.echoAction, why: c.echoWhy, check: c.echoCheck }
  const dry = { id: "dry", title: c.dryTitle, action: c.dryAction, why: c.dryWhy, check: c.dryCheck }
  if (project.concern === "noise") {
    if (project.noiseSource === "inside") return [quiet]
    const catalog = experimentCatalog(c)
    const first = project.noiseEntry === "window" ? "windowClose" : project.noiseEntry === "door" ? "doorClose" : "noisePath"
    const selected = catalog.filter(item => item.id === first)
    if (project.moveConstraints?.listening !== false) selected.push(...catalog.filter(item => item.id === "quietSpot"))
    return selected
  }
  if (project.concern === "echo") return [echo]
  const movable = [
    ...(project.moveConstraints?.listening !== false ? [position] : []),
    ...(project.goal === "music" && project.moveConstraints?.speakers !== false ? [symmetry] : []),
  ]
  if (project.concern === "bass") return movable.filter(item => item.id === "position")
  return [...(project.goal === "music" ? [...movable].reverse() : []), character === "seca" ? dry : echo]
}
