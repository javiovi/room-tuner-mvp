import type { RoomProject } from "@/app/types/room"
// Product guidance for mid frequencies; these are not compliance thresholds.
export function rt60Reference(goal: RoomProject["goal"]) {
  return goal === "instrument" ? { min: .4, max: .7 } : goal === "work" ? { min: .2, max: .4 } : { min: .3, max: .5 }
}
