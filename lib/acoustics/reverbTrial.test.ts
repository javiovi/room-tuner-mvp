import {describe,it,expect} from "vitest"
import {reverbTrial} from "./reverbTrial"
import type {RoomProject} from "@/app/types/room"
const project:RoomProject={goal:"music",dimensionSource:"measured",lengthM:5,widthM:4,heightM:3,floorType:"madera",wallType:"desnudas",furniture:[]}
describe("domestic material reverberation comparisons",()=>{
 it("keeps the original model with no covered surface",()=>{
  const no=reverbTrial(project,"none",2)!,zero=reverbTrial(project,"rug",0)!
  expect(no.trial).toEqual(no.baseline)
  expect(zero.trial).toEqual(zero.baseline)
 })
 it("updates bands differently and bounds coverage to an actual surface",()=>{
  const rug=reverbTrial(project,"rug",2)!,curtain=reverbTrial(project,"curtain",2)!
  expect(rug.trial.mid).toBeLessThan(rug.baseline.mid)
  expect(rug.trial.high).toBeLessThan(rug.baseline.high)
  // Rug coefficient at low frequencies does not exceed wood: no invented bass improvement.
  expect(rug.trial.low).toBe(rug.baseline.low)
  expect(curtain.trial.mid).toBeLessThan(curtain.baseline.mid)
  expect(reverbTrial(project,"rug",10000)!.area).toBe(20)
 })
 it("does not count an already carpeted floor as a second carpet and rejects missing/approximate inputs",()=>{
  const carpet=reverbTrial({...project,floorType:"alfombra"},"rug",2)!
  expect(carpet.trial).toEqual(carpet.baseline)
  expect(reverbTrial({...project,dimensionSource:"approximate"},"rug",2)).toBeNull()
  expect(reverbTrial({...project,wallType:undefined},"rug",2)).toBeNull()
  expect(reverbTrial(project,"rug",NaN)).toBeNull()
 })
})
