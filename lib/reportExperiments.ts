import type { RoomProject } from "@/app/types/room"
import type { Translations } from "@/lib/translations/es"

export type ExperimentRecord = { tried: boolean; outcome?: "better" | "same" | "worse"; note: string }
export type ExperimentRecords = Record<string, ExperimentRecord>
export function getReportExperiments(project: RoomProject, character: "viva" | "equilibrada" | "seca", c: Translations["experiments"]) {
  const items = [
    project.goal === "music" && project.moveConstraints?.speakers !== false && project.concern !== "noise"
      ? { id: "symmetry", title: c.symmetryTitle, action: c.symmetryAction, why: c.symmetryWhy, check: c.symmetryCheck }
      : { id: "quiet", title: c.quietTitle, action: c.quietAction, why: c.quietWhy, check: c.quietCheck },
    ...(project.moveConstraints?.listening !== false ? [{ id: "position", title: c.positionTitle, action: c.positionAction, why: c.positionWhy, check: c.positionCheck }] : []),
    character === "seca" && project.concern !== "echo"
      ? { id: "dry", title: c.dryTitle, action: c.dryAction, why: c.dryWhy, check: c.dryCheck }
      : { id: "echo", title: c.echoTitle, action: c.echoAction, why: c.echoWhy, check: c.echoCheck },
  ]
  const priority = project.concern === "echo" ? "echo" : project.concern === "bass" ? "position" : project.concern === "noise" ? "quiet" : "symmetry"
  return items.sort((a, b) => Number(b.id === priority) - Number(a.id === priority))
}
