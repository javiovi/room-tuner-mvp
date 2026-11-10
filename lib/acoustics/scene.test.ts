import {describe,it,expect} from "vitest"
import {initialScene,instrumentTrial,sourceDistance,wallClearance} from "./scene"
import type {Layout} from "@/lib/layoutTrial"
const heights={room:3,speaker:1.2,ear:1.2}
const layout:Layout={width:4,length:5,speakerPositions:[{x:.3,y:.3}],listeningPosition:{x:.6,y:.5},furnitureLayout:[]}
const moves={speakers:true,listening:true,furniture:false}
describe("purpose-specific instrument geometry",()=>{
 it("starts with one source for instruments and two for stereo listening",()=>{
  expect(initialScene({goal:"instrument"},layout).speakerPositions).toHaveLength(1)
  expect(initialScene({goal:"music"},layout).speakerPositions).toHaveLength(2)
 })
 it("moves a recording microphone closer but an open reinforcement mic farther from the speaker",()=>{
  const recording=instrumentTrial(layout,moves,"recording",heights),live=instrumentTrial(layout,moves,"reinforcement",heights)
  expect(sourceDistance(recording,heights)).toBeLessThan(sourceDistance(layout,heights))
  expect(sourceDistance(live,heights)).toBeGreaterThan(sourceDistance(layout,heights))
  expect(sourceDistance(recording,heights)).toBeGreaterThanOrEqual(.25)
  for(const next of [recording,live]){
   const s=layout.speakerPositions[0],n=next.speakerPositions[0]
   expect(Math.hypot((s.x-n.x)*4,(s.y-n.y)*5)).toBeLessThanOrEqual(.300001)
   expect(Math.hypot((layout.listeningPosition.x-next.listeningPosition.x)*4,(layout.listeningPosition.y-next.listeningPosition.y)*5)).toBeLessThanOrEqual(.300001)
  }
 })
 it("moves an acoustic source/listener pair away from a near wall while preserving their relationship",()=>{
  const near={...layout,speakerPositions:[{x:.05,y:.3}],listeningPosition:{x:.15,y:.4}}
  const next=instrumentTrial(near,moves,"acoustic",heights)
  expect(wallClearance(next)).toBeGreaterThan(wallClearance(near))
  expect(sourceDistance(next,heights)).toBeCloseTo(sourceDistance(near,heights))
 })
 it("respects fixed objects, marked obstacles and unknown setup",()=>{
  expect(instrumentTrial(layout,{speakers:false,listening:false,furniture:false},"recording",heights)).toBe(layout)
  expect(instrumentTrial(layout,moves,null,heights)).toBe(layout)
  const blocked={...layout,furnitureLayout:[{type:"mesa",x:.5,y:.5,width:.99,length:.99}]}
  expect(instrumentTrial(blocked,moves,"recording",heights)).toBe(blocked)
 })
})

it("exports a one-source instrument layout through the real PDF schema and renderer",async()=>{
 const {renderToBuffer}=await import("@react-pdf/renderer")
 const {ReportPDFDocument}=await import("@/components/report/pdf/ReportPDFDocument")
 const {mockAnalysis,mockProject}=await import("@/lib/mockData")
 const {generatePdfRequestSchema}=await import("@/lib/validation/schemas")
 const project={...mockProject,goal:"instrument" as const,concern:"clarity" as const}
 const current=initialScene(project,mockAnalysis.roomDiagram.floorPlan)
 const parsed=generatePdfRequestSchema.parse({project,analysis:mockAnalysis,locale:"es",personalization:{layout:{current,proposal:current,moves,view:"current",source:"user",confirmed:true}}})
 const bytes=await renderToBuffer(ReportPDFDocument({...parsed,locale:parsed.locale??"es"}))
 expect(bytes.subarray(0,4).toString()).toBe("%PDF")
 expect(bytes.byteLength).toBeGreaterThan(1000)
})
