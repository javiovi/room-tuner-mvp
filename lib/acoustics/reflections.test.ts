import {describe,expect,it} from "vitest"
import {firstReflections,smallStereoTrial,reflectionSites,stereoMismatch} from "./reflections"
import type {Layout} from "@/lib/layoutTrial"
const room:Layout={width:4,length:6,speakerPositions:[{x:.25,y:.2},{x:.75,y:.2}],listeningPosition:{x:.5,y:.7},furnitureLayout:[]}
const heights={room:3,speaker:1,ear:1.5}
describe("first order image-source geometry",()=>{
 it("intersects each reflected ray with its wall and matches the image-source distance",()=>{
  const rays=firstReflections(room,heights)
  expect(rays).toHaveLength(12)
  for(const r of rays){
   const axis=r.wall==="left"||r.wall==="right"?"x":r.wall==="front"||r.wall==="back"?"y":"z"
   const plane=r.wall==="right"?4:r.wall==="back"?6:r.wall==="ceiling"?3:0
   expect(r.point[axis]).toBeCloseTo(plane,10)
   const image={...r.source,[axis]:2*plane-r.source[axis]}
   expect(r.pathM).toBeCloseTo(Math.hypot(image.x-r.receiver.x,image.y-r.receiver.y,image.z-r.receiver.z),10)
   expect(r.excessMs).toBeGreaterThanOrEqual(0)
   expect(r.u).toBeGreaterThanOrEqual(0);expect(r.u).toBeLessThanOrEqual(1)
   expect(r.v).toBeGreaterThanOrEqual(0);expect(r.v).toBeLessThanOrEqual(1)
  }
 })
 it("uses the source-to-wall distances rather than a midpoint and calculates each channel separately",()=>{
  const paths=firstReflections(room,heights).filter(r=>r.wall==="left")
  // Image L=(-1,1.2,1), receiver=(2,4.2,1.5): t=1/3 -> y=2.2, z=7/6.
  expect(paths[0].point.y).toBeCloseTo(2.2)
  expect(paths[0].point.z).toBeCloseTo(7/6)
  expect(paths[1].point.y).not.toBeCloseTo(paths[0].point.y)
  expect(paths[0].point.y).not.toBeCloseTo((1.2+4.2)/2)
 })
 it("changes reflection sites after a listener move, retaining left/right mirror symmetry",()=>{
  const rays=firstReflections(room,heights)
  expect(rays.find(r=>r.id==="0-left")!.point.y).toBeCloseTo(rays.find(r=>r.id==="1-right")!.point.y)
  const moved=firstReflections({...room,listeningPosition:{x:.6,y:.6}},heights)
  expect(moved.find(r=>r.id==="0-left")!.point.y).not.toBeCloseTo(rays.find(r=>r.id==="0-left")!.point.y)
 })
 it("rejects nonfinite dimensions, points outside the room and heights above the ceiling",()=>{
  expect(firstReflections({...room,width:NaN},heights)).toEqual([])
  expect(firstReflections(room,{...heights,ear:4})).toEqual([])
  expect(firstReflections({...room,listeningPosition:{x:0,y:.5}},heights)).toEqual([])
 })
 it("does not recommend fixed corner traps regardless of geometry",()=>{
  const sites=reflectionSites(room)
  expect(sites).toHaveLength(4)
  expect(sites.every(s=>s.type==="absorber"&&["left","right"].includes(s.wall))).toBe(true)
 })
})
describe("small reversible stereo trials",()=>{
 const asymmetric={...room,listeningPosition:{x:.8,y:.7}}
 it("makes a single move within 30 cm that improves the stated distance metric without mutating the input",()=>{
  const next=smallStereoTrial(asymmetric,{speakers:true,listening:true,furniture:false})
  expect(stereoMismatch(next)).toBeLessThan(stereoMismatch(asymmetric))
  const shifts=[...room.speakerPositions,asymmetric.listeningPosition].map((p,i)=>{const q=[...next.speakerPositions,next.listeningPosition][i];return Math.hypot((p.x-q.x)*4,(p.y-q.y)*6)})
  expect(shifts.filter(n=>n>.001)).toHaveLength(1)
  expect(Math.max(...shifts)).toBeLessThanOrEqual(.30000001)
  expect(asymmetric.listeningPosition.x).toBe(.8)
 })
 it("keeps fixed objects and does not offer a move for already equal distances",()=>{
  expect(smallStereoTrial(asymmetric,{speakers:false,listening:false,furniture:false})).toBe(asymmetric)
  expect(smallStereoTrial(room,{speakers:true,listening:true,furniture:false})).toBe(room)
 })
 it("does not move the seat into a marked obstacle",()=>{
  const blocked={...asymmetric,furnitureLayout:[{type:"mesa",x:.75,y:.7,width:.4,length:.4}]}
  const next=smallStereoTrial(blocked,{speakers:false,listening:true,furniture:false})
  if(next!==blocked)expect(next.listeningPosition.x<.5||next.listeningPosition.y<.45||next.listeningPosition.y>.95).toBe(true)
 })
})
