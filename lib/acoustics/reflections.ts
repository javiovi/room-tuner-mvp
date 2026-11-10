import type { Layout, MoveConstraints } from "@/lib/layoutTrial"

export type Wall = "left" | "right" | "front" | "back" | "floor" | "ceiling"
export type Point3 = { x: number; y: number; z: number }
export type Heights = { room: number; speaker: number; ear: number }
export type Reflection = { id: string; speaker: number; wall: Wall; source: Point3; receiver: Point3; point: Point3; directM: number; pathM: number; excessMs: number; u: number; v: number }
const valid = (n: number)=>Number.isFinite(n) && n > 0
const distance = (a: Point3,b: Point3)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)

/** First-order image-source geometry in a rectangular room. No level/absorption or audible-severity prediction.
 * Allen & Berkley (1979), Image method for efficiently simulating small-room acoustics.
 */
export function firstReflections(layout: Layout, heights: Heights): Reflection[] {
  if (![layout.width,layout.length,heights.room,heights.speaker,heights.ear].every(valid) || heights.speaker >= heights.room || heights.ear >= heights.room) return []
  if ([...layout.speakerPositions,layout.listeningPosition].some(p=>![p.x,p.y].every(n=>Number.isFinite(n) && n>0 && n<1))) return []
  const receiver = { x:layout.listeningPosition.x*layout.width,y:layout.listeningPosition.y*layout.length,z:heights.ear }
  return layout.speakerPositions.flatMap((speaker,index)=>{
    const source = {x:speaker.x*layout.width,y:speaker.y*layout.length,z:heights.speaker}
    return ([{wall:"left",axis:"x",plane:0},{wall:"right",axis:"x",plane:layout.width},{wall:"front",axis:"y",plane:0},{wall:"back",axis:"y",plane:layout.length},{wall:"floor",axis:"z",plane:0},{wall:"ceiling",axis:"z",plane:heights.room}] as const).flatMap(({wall,axis,plane})=>{
      const image = {...source,[axis]:2*plane-source[axis]}
      const denominator = receiver[axis]-image[axis]
      if (Math.abs(denominator)<1e-9) return []
      const t = (plane-image[axis])/denominator
      if (t<=0 || t>=1) return []
      const point = {x:image.x+t*(receiver.x-image.x),y:image.y+t*(receiver.y-image.y),z:image.z+t*(receiver.z-image.z)}
      const pathM = distance(source,point)+distance(point,receiver), directM=distance(source,receiver)
      const u = wall==="left" || wall==="right" ? point.y/layout.length : point.x/layout.width
      const v = wall==="floor" || wall==="ceiling" ? point.y/layout.length : 1-point.z/heights.room
      return [{id:`${index}-${wall}`,speaker:index,wall,source,receiver,point,pathM,directM,excessMs:(pathM-directM)/343*1000,u,v}]
    })
  })
}

export function stereoMismatch(layout: Layout, heights?: Pick<Heights,"speaker"|"ear">): number {
  if (layout.speakerPositions.length!==2) return 0
  const d = (p:{x:number;y:number})=>Math.hypot((p.x-layout.listeningPosition.x)*layout.width,(p.y-layout.listeningPosition.y)*layout.length,(heights?.speaker??0)-(heights?.ear??0))
  return Math.abs(d(layout.speakerPositions[0])-d(layout.speakerPositions[1]))
}
/** A small reversible trial, not a global optimum: reduce path-length mismatch with a single <=30 cm move. */
export function smallStereoTrial(layout: Layout, moves: MoveConstraints, heights?: Pick<Heights,"speaker"|"ear">): Layout {
  if (layout.speakerPositions.length!==2 || !valid(layout.width) || !valid(layout.length)) return layout
  let best=layout, score=stereoMismatch(layout,heights)
  const occupied=(p:{x:number;y:number})=>layout.furnitureLayout.some(f=>Math.abs(p.x-f.x)<f.width/2+.05 && Math.abs(p.y-f.y)<f.length/2+.05)
  for (const target of ["listener","speaker-0","speaker-1"]) {
    if (target==="listener" ? !moves.listening : !moves.speakers) continue
    const index=target==="speaker-0" ? 0 : 1, origin=target==="listener" ? layout.listeningPosition : layout.speakerPositions[index]
    for (const cm of [10,20,30]) for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const p={x:origin.x+dx*cm/100/layout.width,y:origin.y+dy*cm/100/layout.length}
      if (p.x<.05 || p.x>.95 || p.y<.05 || p.y>.95 || occupied(p)) continue
      const candidate={...layout,speakerPositions:layout.speakerPositions.map((s,i)=>target!=="listener" && i===index ? p : s),listeningPosition:target==="listener" ? p : layout.listeningPosition}
      if (candidate.speakerPositions.some(s=>Math.hypot((s.x-candidate.listeningPosition.x)*layout.width,(s.y-candidate.listeningPosition.y)*layout.length)<.35)) continue
      if (Math.hypot((candidate.speakerPositions[0].x-candidate.speakerPositions[1].x)*layout.width,(candidate.speakerPositions[0].y-candidate.speakerPositions[1].y)*layout.length)<.35) continue
      const next=stereoMismatch(candidate,heights)
      if (next<score-.005) {best=candidate;score=next}
    }
  }
  return score < stereoMismatch(layout,heights)-.02 ? best : layout
}

/** Legacy diagram adapter: identify side-wall reflection sites, never prescribe corner products by default. */
export function reflectionSites(layout: Layout) {
  return firstReflections(layout,{room:2.5,speaker:1.2,ear:1.2}).filter(r=>r.wall==="left" || r.wall==="right").map(r=>({type:"absorber" as const,position:{x:r.point.x/layout.width,y:r.point.y/layout.length},wall:r.wall as "left"|"right",priority:"medium" as const}))
}
