"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { z } from "zod"
import type { RoomProject, RoomDiagram } from "@/app/types/room"
import { DEFAULT_MOVES, clampPoint, initialLayout, type Layout, type MoveConstraints } from "@/lib/layoutTrial"
import { firstReflections, smallStereoTrial, stereoMismatch, type Wall, type Heights } from "@/lib/acoustics/reflections"
import { acousticCopy } from "@/lib/acoustics/copy"
import { roomDiagramSchema } from "@/lib/validation/schemas"
import { useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"
import { PlanObject } from "./PlanObject"
import { ReflectionPhoto } from "./ReflectionPhoto"

const layoutSchema=roomDiagramSchema.shape.floorPlan.refine(p=>p.width>0&&p.length>0&&p.speakerPositions.length===2&&[...p.speakerPositions,p.listeningPosition].every(v=>v.x>0&&v.x<1&&v.y>0&&v.y<1))
const storedSchema=z.object({current:layoutSchema,confirmed:z.boolean(),heights:z.object({room:z.number().positive(),speaker:z.number().positive(),ear:z.number().positive()}),heightsConfirmed:z.boolean(),moves:z.object({speakers:z.boolean(),listening:z.boolean(),furniture:z.boolean()}),feedback:z.record(z.enum(["better","same","worse"])),undoLayout:layoutSchema.optional()})
type Outcome="better"|"same"|"worse"
export function AcousticWorkspace({reportKey,project,diagram}:{reportKey:string;project:RoomProject;diagram:RoomDiagram}) {
 const {locale,t}=useT(),c=acousticCopy[locale]
 const setReportLayout=useRoomStore(s=>s.setReportLayout)
 const [current,setCurrent]=useState<Layout>(()=>initialLayout(project,{...diagram.floorPlan,width:project.widthM??diagram.floorPlan.width,length:project.lengthM??diagram.floorPlan.length}))
 const [undoLayout,setUndoLayout]=useState<Layout>()
 const [confirmed,setConfirmed]=useState(false),[ready,setReady]=useState(false),[storageError,setStorageError]=useState(false)
 const [heights,setHeights]=useState<Heights>({room:project.heightM??2.5,speaker:1.2,ear:1.2}),[heightsConfirmed,setHeightsConfirmed]=useState(false)
 const [moves,setMoves]=useState<MoveConstraints>(project.moveConstraints??DEFAULT_MOVES)
 const [view,setView]=useState<"current"|"trial">("current"),[wall,setWall]=useState<Wall>("left"),[patch,setPatch]=useState(false)
 const [selected,setSelected]=useState("listening"),[feedback,setFeedback]=useState<Record<string,Outcome>>({})
 const svg=useRef<SVGSVGElement>(null),drag=useRef<string|null>(null)
 const storageKey=`roomtuner-acoustic-workspace-v1:${reportKey}:${project.widthM??diagram.floorPlan.width}:${project.lengthM??diagram.floorPlan.length}:${project.dimensionSource??"measured"}`
 const proposal=useMemo(()=>smallStereoTrial(current,moves,heights),[current,moves,heights])
 const hasMove=proposal!==current
 const shown=view==="trial"?proposal:current
 const reflections=useMemo(()=>firstReflections(shown,heights),[shown,heights])
 const selectedPaths=reflections.filter(r=>r.wall===wall)
 const valid=reflections.length>0&&current.speakerPositions.length===2
 const approximate=project.dimensionSource==="approximate"
 const fingerprint=JSON.stringify([current.speakerPositions,current.listeningPosition,current.furnitureLayout,heights,wall,view,view==="trial"?proposal:null])
 const outcome=feedback[fingerprint]
 useEffect(()=>{
  try{const result=storedSchema.safeParse(JSON.parse(localStorage.getItem(storageKey)??"null"));if(result.success){setCurrent(result.data.current);setConfirmed(result.data.confirmed);setHeights(result.data.heights);setHeightsConfirmed(result.data.heightsConfirmed);setMoves(result.data.moves);setFeedback(result.data.feedback);setUndoLayout(result.data.undoLayout)}}catch{setStorageError(true)}
  setReady(true)
 },[storageKey])
 useEffect(()=>{
  if(!ready)return
  try{localStorage.setItem(storageKey,JSON.stringify({current,confirmed,heights,heightsConfirmed,moves,feedback,undoLayout}));setStorageError(false)}catch{setStorageError(true)}
  setReportLayout({current,proposal,moves,confirmed:confirmed&&valid,view:view==="trial"?"proposal":"current",source:confirmed?"user":"schematic"})
 },[ready,storageKey,current,proposal,confirmed,valid,heights,heightsConfirmed,moves,feedback,undoLayout,view,setReportLayout])
 const objects:Array<{id:string;label:string;kind:string;type?:string;x:number;y:number;width?:number;length?:number}>=[...shown.speakerPositions.map((p,i)=>({id:`speaker-${i}`,label:i===0?c.speaker0:c.speaker1,kind:"speaker",...p})),{id:"listening",label:c.listener,kind:"listening",...shown.listeningPosition},...shown.furnitureLayout.map((f,i)=>({...f,id:`furniture-${i}`,label:t.report.furniture[f.type as keyof typeof t.report.furniture]??f.type,kind:"furniture"}))]
 const active=objects.find(o=>o.id===selected)??objects[objects.length-1]
 const move=(id:string,p:{x:number;y:number})=>{
  if(!ready||view!=="current")return
  const furniture=id.startsWith("furniture-")?current.furnitureLayout[Number(id.split("-")[1])]:undefined
  const point=clampPoint(p,furniture?.width??Math.min(.06,.1/current.width),furniture?.length??Math.min(.06,.1/current.length))
  setUndoLayout(undefined)
  setCurrent(prev=>id==="listening"?{...prev,listeningPosition:point}:furniture?{...prev,furnitureLayout:prev.furnitureLayout.map((f,i)=>id===`furniture-${i}`?{...f,...point}:f)}:{...prev,speakerPositions:prev.speakerPositions.map((s,i)=>id===`speaker-${i}`?point:s)})
 }
 const scale=Math.min(280/current.width,340/current.length),w=current.width*scale,h=current.length*scale,pad=27
 const sx=(x:number)=>pad+x/current.width*w,sy=(y:number)=>pad+y/current.length*h
 const control="min-h-11 border border-border bg-background px-3 rounded-sm text-sm disabled:opacity-40"
 const fmt=(n:number,d=1)=>new Intl.NumberFormat(locale==="es"?"es-AR":"en-US",{maximumFractionDigits:d}).format(n)
 const movement=Math.max(...current.speakerPositions.map((s,i)=>Math.hypot((s.x-proposal.speakerPositions[i].x)*current.width,(s.y-proposal.speakerPositions[i].y)*current.length)),Math.hypot((current.listeningPosition.x-proposal.listeningPosition.x)*current.width,(current.listeningPosition.y-proposal.listeningPosition.y)*current.length))
 return <section className="space-y-4 border border-primary/40 rounded-sm bg-card p-4" aria-label={c.title}>
  <div className="space-y-1"><h2 className="text-lg font-semibold">{c.title}</h2><p className="text-sm text-muted-foreground">{c.intro}</p></div>
  {approximate&&<div className="border-l-2 border-primary pl-3 text-xs space-y-1"><p>{c.approximate}</p><Link href="/espacio?precision=1" className="inline-flex items-center underline text-primary min-h-11">{c.refine}</Link></div>}
  <div className="flex gap-2"><button type="button" className={`${control} flex-1 ${view==="current"?"border-primary text-primary":""}`} aria-pressed={view==="current"} onClick={()=>{drag.current=null;setView("current")}}>{c.before}</button><button type="button" className={`${control} flex-1 ${view==="trial"?"border-primary text-primary":""}`} disabled={!confirmed||!valid||!hasMove} aria-pressed={view==="trial"} onClick={()=>{drag.current=null;setView("trial");setPatch(false)}}>{c.after}</button></div>
  {undoLayout&&<button type="button" className="text-xs underline min-h-11" onClick={()=>{setCurrent(undoLayout);setUndoLayout(undefined);setView("current")}}>{c.undo}</button>}
  <svg ref={svg} role="img" aria-label={c.title} viewBox={`0 0 ${w+pad*2} ${h+pad*2}`} className="w-full bg-secondary/20 rounded-sm touch-none" data-testid="live-room-plan" onPointerMove={e=>{if(!drag.current||!svg.current)return;const m=svg.current.getScreenCTM();if(!m)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());move(drag.current,{x:(p.x-pad)/w,y:(p.y-pad)/h})}} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}>
   <text x={pad+w/2} y={14} textAnchor="middle" fontSize="9" className="fill-muted-foreground">{c.front}</text>
   <text x={pad+w/2} y={pad+h+19} textAnchor="middle" fontSize="9" className="fill-muted-foreground">{c.back}</text>
   <rect x={pad} y={pad} width={w} height={h} fill="none" className="stroke-muted-foreground" strokeWidth="2"/>

   {confirmed&&valid&&selectedPaths.map(r=><g key={r.id} pointerEvents="none">
    <path data-reflection-path={r.id} d={`M${sx(r.source.x)} ${sy(r.source.y)} L${sx(r.point.x)} ${sy(r.point.y)} L${sx(r.receiver.x)} ${sy(r.receiver.y)}`} fill="none" className="stroke-primary" strokeWidth="1.5" strokeDasharray={r.speaker===0?"none":"4 3"}/>
    {patch&&wall!=="ceiling"&&<rect data-treatment-site={r.id} x={sx(r.point.x)-(wall==="left"||wall==="right"?3:Math.min(20,.3*scale))} y={sy(r.point.y)-(wall==="front"||wall==="back"?3:Math.min(20,.3*scale))} width={wall==="left"||wall==="right"?6:Math.min(40,.6*scale)} height={wall==="front"||wall==="back"?6:Math.min(40,.6*scale)} className="fill-primary/30 stroke-primary"/>}
    <circle data-reflection-site={r.id} data-x={r.point.x} data-y={r.point.y} cx={sx(r.point.x)} cy={sy(r.point.y)} r="7" className="fill-background stroke-primary" strokeWidth="2"/>
    <text x={sx(r.point.x)} y={sy(r.point.y)+3} textAnchor="middle" fontSize="8" className="fill-primary">{r.speaker===0?"L":"R"}</text>
   </g>)}
   {view==="trial"&&objects.map(o=>{const old=o.id.startsWith("speaker-")?current.speakerPositions[Number(o.id.split("-")[1])]:o.id==="listening"?current.listeningPosition:current.furnitureLayout[Number(o.id.split("-")[1])];if(Math.hypot(old.x-o.x,old.y-o.y)<.001)return null;return <g key={`old-${o.id}`} pointerEvents="none"><circle cx={pad+old.x*w} cy={pad+old.y*h} r="11" fill="none" className="stroke-muted-foreground" strokeDasharray="3 3"/><line x1={pad+old.x*w} y1={pad+old.y*h} x2={pad+o.x*w} y2={pad+o.y*h} className="stroke-primary" strokeWidth="2"/></g>})}
   {([{wall:"left",x1:pad,y1:pad,x2:pad,y2:pad+h},{wall:"right",x1:pad+w,y1:pad,x2:pad+w,y2:pad+h},{wall:"front",x1:pad,y1:pad,x2:pad+w,y2:pad},{wall:"back",x1:pad,y1:pad+h,x2:pad+w,y2:pad+h}] as const).map(edge=><line key={edge.wall} data-wall-hit={edge.wall} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} stroke="transparent" strokeWidth="18" className="cursor-pointer" onPointerDown={e=>{e.stopPropagation();setWall(edge.wall);setPatch(false)}}><title>{c[edge.wall]}</title></line>)}
   {objects.map(o=><g key={o.id} data-live-object={o.id} data-x={o.x} data-y={o.y} transform={`translate(${pad+o.x*w},${pad+o.y*h})`} className={view==="current"?"cursor-grab":""} onPointerDown={e=>{setSelected(o.id);if(view!=="current")return;drag.current=o.id;svg.current?.setPointerCapture(e.pointerId)}}><title>{o.label}</title><PlanObject kind={o.kind} type={o.type} width={o.width?o.width*w:16} height={o.length?o.length*h:16}/><circle r="20" fill="transparent"/>{active?.id===o.id&&<circle r="20" fill="none" className="stroke-primary" strokeDasharray="3 3"/>}</g>)}
  </svg>
  <p className="text-[10px] text-muted-foreground">{c.legend}</p><p className="text-xs text-muted-foreground">{c.estimated}</p>
  <details className="space-y-3"><summary className="cursor-pointer min-h-11 text-sm text-primary">{c.settings}</summary>
   <p className="text-xs text-muted-foreground">{c.hint}</p>
   <label className="block text-sm">{c.object}<select className={`${control} block w-full mt-2`} value={active?.id} onChange={e=>setSelected(e.target.value)}>{objects.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}</select></label>
   {active&&<div className="grid grid-cols-2 gap-2">{([{axis:"x",label:c.fromLeft,size:current.width},{axis:"y",label:c.fromFront,size:current.length}] as const).map(({axis,label,size})=><MetreInput key={`${active.id}-${axis}`} label={label} value={active[axis]*size} min={.05} max={size-.05} disabled={view!=="current"} onCommit={value=>move(active.id,{x:active.x,y:active.y,[axis]:value/size})}/>)}</div>}
   {active?.kind==="furniture"&&<div className="grid grid-cols-2 gap-2">{([{key:"width",label:c.objectWidth,size:current.width},{key:"length",label:c.objectLength,size:current.length}] as const).map(({key,label,size})=><MetreInput key={`${active.id}-${key}`} label={label} value={(active[key]??.1)*size} min={.1} max={size*.9} disabled={view!=="current"} onCommit={value=>{const dimension=Math.min(.9,Math.max(.1/size,value/size));setUndoLayout(undefined);setCurrent(prev=>({...prev,furnitureLayout:prev.furnitureLayout.map((f,i)=>{if(active.id!==`furniture-${i}`)return f;const next={...f,[key]:dimension};return {...next,...clampPoint(next,next.width,next.length)}})}))}}/>)}</div>}
   <div className="grid grid-cols-4 gap-2">{([{label:c.moveLeft,dx:-.1/current.width,dy:0,icon:"←"},{label:c.up,dx:0,dy:-.1/current.length,icon:"↑"},{label:c.down,dx:0,dy:.1/current.length,icon:"↓"},{label:c.moveRight,dx:.1/current.width,dy:0,icon:"→"}]).map(b=><button key={b.label} type="button" aria-label={b.label} className={control} disabled={!ready||view!=="current"} onClick={()=>active&&move(active.id,{x:active.x+b.dx,y:active.y+b.dy})}>{b.icon}</button>)}</div>
   <p className="text-xs">{c.heightHint}</p>
   <div className="space-y-2">{([{key:"room",label:c.roomHeight},{key:"speaker",label:c.speakerHeight},{key:"ear",label:c.earHeight}] as const).map(({key,label})=><MetreInput key={key} label={label} value={heights[key]} min={.1} max={key==="room"?10:heights.room} disabled={false} onCommit={value=>{setHeightsConfirmed(false);setHeights({...heights,[key]:value})}}/>)}</div>
   <label className="flex gap-2 items-center min-h-11 text-sm"><input type="checkbox" checked={heightsConfirmed} disabled={!valid} onChange={e=>setHeightsConfirmed(e.target.checked)}/>{c.heightsConfirm}</label>
   <fieldset><legend className="text-xs">{c.restrictions}</legend>{([{key:"speakers",label:c.speakers},{key:"listening",label:c.seat}] as const).map(({key,label})=><label key={key} className="flex gap-2 items-center min-h-11 text-xs"><input type="checkbox" checked={moves[key]} onChange={e=>{setView("current");setMoves({...moves,[key]:e.target.checked})}}/>{label}</label>)}</fieldset>
  </details>
  {!valid&&<p role="alert" className="text-sm">{c.invalid}</p>}
  {!confirmed?<button type="button" className={`${control} border-primary text-primary w-full`} disabled={!ready||!valid} onClick={()=>setConfirmed(true)}>{c.confirm}</button>:<>
   <p className="text-xs text-primary">{c.confirmed}</p>
   <div className="grid grid-cols-2 gap-2" role="group" aria-label={c.calculated}>{(["left","right","front","back","floor","ceiling"] as const).map(s=><button key={s} type="button" className={`${control} text-xs ${wall===s?"border-primary text-primary":""}`} aria-pressed={wall===s} onClick={()=>{setWall(s);setPatch(false)}}>{c[s]}</button>)}</div>
   {view==="current"&&<div className="space-y-3 border-l-2 border-primary pl-3"><h3 className="text-sm font-medium">{c.calculated}: {c[wall]}</h3><p className="text-sm">{wall==="floor"?c.floorTest:wall==="ceiling"?c.ceilingTest:c.surfaceTest}</p>{wall!=="floor"&&wall!=="ceiling"&&<details><summary className="cursor-pointer min-h-11 text-xs text-primary">{locale==="es"?"Confirmar el punto con un espejo":"Check the site with a mirror"}</summary><p className="text-xs text-muted-foreground">{c.verify}</p></details>}{wall!=="ceiling"&&<button type="button" className={control} aria-pressed={patch} onClick={()=>setPatch(!patch)}>{patch?c.hidePatch:c.showPatch}</button>}</div>}
   {view==="trial"?<div className="text-xs border border-primary/30 p-3 space-y-2"><dl className="grid grid-cols-2 gap-2"><div><dt>{c.movement}</dt><dd className="text-primary font-mono text-lg">{approximate?"≤ 30 cm":`${fmt(movement*100,0)} ${c.cm}`}</dd></div><div><dt>{c.difference}</dt><dd className="font-mono">{approximate?"≈":`≈ ${fmt(stereoMismatch(current,heights)*100,0)} → ≈ ${fmt(stereoMismatch(proposal,heights)*100,0)} ${c.cm}`}</dd></div></dl><p className="text-muted-foreground">{c.trialNote}</p></div>:!hasMove&&<p className="text-xs text-muted-foreground">{c.noMove}</p>}
   <fieldset className="space-y-2"><legend className="text-sm mb-2">{c.result}</legend><div className="grid grid-cols-3 gap-2">{(["better","same","worse"] as const).map(result=><button type="button" key={result} aria-pressed={outcome===result} className={`${control} text-xs ${outcome===result?"border-primary text-primary":""}`} onClick={()=>setFeedback(prev=>Object.fromEntries([...Object.entries(prev).filter(([key])=>key!==fingerprint),[fingerprint,result]].slice(-20)))}>{c[result]}</button>)}</div></fieldset>
   {outcome&&<div role="status" className="text-sm space-y-2 border border-border p-3"><p>{outcome==="better"?c.keep:view==="trial"?c.retryMove:c.retry}</p>{outcome==="better"&&view==="trial"&&<button type="button" className={control} onClick={()=>{setUndoLayout(current);setCurrent(proposal);setView("current");setPatch(false)}}>{c.adopt}</button>}{outcome==="better"&&view==="current"&&wall!=="ceiling"&&<p className="text-xs text-muted-foreground">{c.buy}</p>}{outcome!=="better"&&<button type="button" className={control} onClick={()=>{setView("current");setWall(wall==="left"?"right":"left");setPatch(false)}}>{c.other}</button>}</div>}
   <ReflectionPhoto key={reportKey} reportKey={reportKey} reflections={reflections} allowed={confirmed&&valid&&!approximate&&heightsConfirmed} wall={wall==="floor"||wall==="ceiling"?"left":wall}/>
   <details className="text-xs text-muted-foreground space-y-2"><summary className="cursor-pointer min-h-11">{c.details}</summary><p>{c.notMeasured}</p>{!approximate&&heightsConfirmed&&<ul className="space-y-2">{selectedPaths.map(r=><li key={r.id} data-path-metric={r.id}>{r.speaker===0?"L":"R"} · {c.path}: ≈ {fmt(r.pathM,2)} m · {c.delay}: ≈ {fmt(r.excessMs,2)} ms</li>)}</ul>}<a className="block underline min-h-11" href="https://www.genelec.com/improving-room-acoustics" target="_blank" rel="noreferrer">{c.sources}: Genelec</a></details>
  </>}
  <p role="status" className="text-xs text-muted-foreground">{storageError?c.storageError:c.saved}</p>
 </section>
}

function MetreInput({label,value,min,max,disabled,onCommit}:{label:string;value:number;min:number;max:number;disabled:boolean;onCommit:(value:number)=>void}) {
 const [draft,setDraft]=useState(String(Number(value.toFixed(2))))
 useEffect(()=>setDraft(String(Number(value.toFixed(2)))),[value])
 return <label className="block text-xs">{label}<input type="number" min={min} max={max} step=".05" value={draft} disabled={disabled} className="min-h-11 border border-border bg-background px-3 rounded-sm text-sm block mt-1 w-full disabled:opacity-40" onChange={e=>setDraft(e.target.value)} onBlur={()=>{if(draft===String(Number(value.toFixed(2))))return;const next=Number(draft);if(!draft.trim()||!Number.isFinite(next)){setDraft(String(Number(value.toFixed(2))));return}onCommit(next)}} onKeyDown={e=>{if(e.key==="Enter")e.currentTarget.blur()}}/></label>
}
