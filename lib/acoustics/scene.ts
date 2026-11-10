import type {RoomProject,RoomDiagram} from "@/app/types/room"
import {initialLayout,type Layout,type MoveConstraints} from "@/lib/layoutTrial"
import type {Heights} from "./reflections"
export type InstrumentMode="acoustic"|"recording"|"amplified"|"reinforcement"
export function initialScene(project:RoomProject,plan:RoomDiagram["floorPlan"]):Layout {
 const base=initialLayout(project,{...plan,width:project.widthM??plan.width,length:project.lengthM??plan.length})
 if(project.goal!=="instrument")return base
 const count=base.speakerPositions.length||1
 return {...base,speakerPositions:[{x:base.speakerPositions.reduce((s,p)=>s+p.x,0)/count||.5,y:base.speakerPositions.reduce((s,p)=>s+p.y,0)/count||.2}]}
}
export function sourceDistance(layout:Layout,heights:Heights) {
 const s=layout.speakerPositions[0],r=layout.listeningPosition
 return s?Math.hypot((s.x-r.x)*layout.width,(s.y-r.y)*layout.length,heights.speaker-heights.ear):0
}
export function wallClearance(layout:Layout) {
 const p=layout.speakerPositions[0]
 return p?Math.min(p.x*layout.width,(1-p.x)*layout.width,p.y*layout.length,(1-p.y)*layout.length):0
}
/** Bounded geometric comparisons, not feedback-gain or audible-quality predictions. */
export function instrumentTrial(layout:Layout,moves:MoveConstraints,mode:InstrumentMode|null,heights:Heights):Layout {
 if(layout.speakerPositions.length!==1||!mode||!(layout.width>0&&layout.length>0))return layout
 const source=layout.speakerPositions[0],receiver=layout.listeningPosition
 const practice=mode==="acoustic"||mode==="amplified"
 if(practice&&wallClearance(layout)>=.5)return layout
 const metric=(p:Layout)=>practice?wallClearance(p):sourceDistance(p,heights)*(mode==="recording"?-1:1)
 let best=layout,score=metric(layout)
 const free=(p:{x:number;y:number})=>p.x*layout.width>=.05&&(1-p.x)*layout.width>=.05&&p.y*layout.length>=.05&&(1-p.y)*layout.length>=.05&&!layout.furnitureLayout.some(f=>Math.abs(p.x-f.x)<f.width/2+.04&&Math.abs(p.y-f.y)<f.length/2+.04)
 const targets=practice&&moves.speakers&&moves.listening?["pair"]:[...(moves.listening?["receiver"]:[]),...(moves.speakers?["source"]:[])]
 for(const target of targets)for(const step of [.1,.2,.3])for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
  const shift=(p:{x:number;y:number})=>({x:p.x+dx*step/layout.width,y:p.y+dy*step/layout.length})
  const s=target==="receiver"?source:shift(source),r=target==="source"?receiver:shift(receiver)
  if((s!==source&&!free(s))||(r!==receiver&&!free(r)))continue
  const candidate={...layout,speakerPositions:[s],listeningPosition:r}
  if(sourceDistance(candidate,heights)<.25)continue
  const next=metric(candidate)
  if(next>score+.005){best=candidate;score=next}
 }
 return score>metric(layout)+.02?best:layout
}
