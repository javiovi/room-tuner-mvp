"use client"

import { useEffect, useRef, useState } from "react"
import { useT } from "@/lib/i18n"
import { acousticCopy } from "@/lib/acoustics/copy"
import { wallProjection, type ImagePoint } from "@/lib/acoustics/projection"
import type { Reflection } from "@/lib/acoustics/reflections"
import type { RoomEvidence } from "@/lib/evidence/model"
import { preparePhoto } from "@/lib/evidence/photos"
import { loadEvidence, saveEvidence, deleteEvidence } from "@/lib/evidence/storage"

type PhotoWall = "left"|"right"|"front"|"back"
export function ReflectionPhoto({reportKey,reflections,allowed,wall,goal="music",mono=false}:{reportKey:string;reflections:Reflection[];allowed:boolean;wall:PhotoWall;goal?:string;mono?:boolean}) {
 const {locale}=useT(),c=acousticCopy[locale]
 const [data,setData]=useState<RoomEvidence>(),[url,setUrl]=useState(""),[busy,setBusy]=useState(true),[error,setError]=useState(false)
 const [corners,setCorners]=useState<ImagePoint[]>([]),[photoWall,setPhotoWall]=useState<PhotoWall>(wall),[point,setPoint]=useState({x:.5,y:.5})
 const alive=useRef(true),initialWall=useRef(wall)
 useEffect(()=>{alive.current=true;loadEvidence(reportKey).then(d=>{if(alive.current){setData(d);setCorners(d?.projection?.corners??[]);setPhotoWall(d?.projection?.wall??initialWall.current)}}).catch(()=>{if(alive.current)setError(true)}).finally(()=>{if(alive.current)setBusy(false)});return()=>{alive.current=false}},[reportKey])
 useEffect(()=>{if(!data?.photo){setUrl("");return}const u=URL.createObjectURL(data.photo);setUrl(u);return()=>URL.revokeObjectURL(u)},[data?.photo])
 const save=async(d:RoomEvidence)=>{setBusy(true);setError(false);try{await saveEvidence(d);if(alive.current)setData(d)}catch{if(alive.current)setError(true)}finally{if(alive.current)setBusy(false)}}
 const upload=async(file?:File)=>{if(!file||busy)return;setBusy(true);setError(false);try{const photo=await preparePhoto(file);await save({version:1,reportKey,goal,photo,zones:[],updatedAt:new Date().toISOString()});setCorners([])}catch{if(alive.current){setError(true);setBusy(false)}}}
 const add=async(p:ImagePoint)=>{if(!data||busy||corners.length>=4)return;const next=[...corners,p];setCorners(next);await save({...data,projection:{wall:photoWall,corners:next},updatedAt:new Date().toISOString()})}
 const reset=async(nextWall=photoWall)=>{setCorners([]);setPhotoWall(nextWall);if(data)await save({...data,projection:{wall:nextWall,corners:[]},updatedAt:new Date().toISOString()})}
 const projection=wallProjection(corners),labels=[c.cornerA,c.cornerB,c.cornerC,c.cornerD]
 const markers=allowed&&projection ? reflections.filter(r=>r.wall===photoWall).flatMap(r=>{const p=projection(r.u,r.v);return p?[{...r,...p}]:[]}):[]
 const control="min-h-11 border border-border bg-background rounded-sm px-3 text-sm"
 return <details className="border border-border rounded-sm p-3 space-y-3" data-testid="reflection-photo-panel">
  <summary className="cursor-pointer min-h-11 text-sm text-primary">{c.photo}</summary>
  <p className="text-xs text-muted-foreground">{c.photoPrivacy}</p>
  {!allowed ? <p className="text-sm">{c.photoGate}</p>:<>
   <p className="text-sm">{c.photoIntro}</p>
   {!data?<label className="block text-sm">{c.upload}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="block w-full mt-2 text-xs" onChange={async e=>{const input=e.currentTarget;await upload(input.files?.[0]);input.value=""}}/></label>:<fieldset disabled={busy} className="min-w-0 space-y-3">
    <label className="block text-sm">{c.calculated}<select aria-label={locale==="es"?"Pared de la foto":"Photo wall"} value={photoWall} onChange={e=>void reset(e.target.value as PhotoWall)} className={`${control} block w-full mt-2`}>{(["left","right","front","back"] as const).map(w=><option key={w} value={w}>{c[w]}</option>)}</select></label>
    <p className="text-xs">{photoWall==="left"||photoWall==="right"?c.sideAB:c.endAB}</p>
    {corners.length<4&&<p className="text-sm text-primary">{c.nextCorner} {corners.length+1}/4: {labels[corners.length]}</p>}
    <div className="relative overflow-hidden border border-border" data-testid="reflection-photo" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();void add({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height})}}>
     {/* eslint-disable-next-line @next/next/no-img-element */}
     {url&&<img src={url} alt={c.photoAlt} className="block w-full h-auto" draggable={false}/>}
     <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{corners.length>1&&<polygon points={corners.map(p=>`${p.x*100},${p.y*100}`).join(" ")} className="fill-primary/10 stroke-primary" strokeWidth=".5"/>}</svg>
     {corners.map((p,i)=><span key={i} className="absolute -translate-x-1/2 -translate-y-1/2 bg-background text-primary border border-primary px-1 text-xs" style={{left:`${p.x*100}%`,top:`${p.y*100}%`}}>{i+1}</span>)}
     {markers.map(m=><span key={m.id} data-reflection-photo={m.id} className="absolute -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full border-2 border-primary bg-background text-primary flex items-center justify-center text-xs" style={{left:`${m.x*100}%`,top:`${m.y*100}%`}} title={c.calculated}>{mono?"S":m.speaker===0?"L":"R"}</span>)}
    </div>
    {corners.length<4&&<div className="grid grid-cols-2 gap-2 text-xs"><label>X (%)<input aria-label="X (%)" type="number" min="0" max="100" value={Math.round(point.x*100)} onChange={e=>setPoint({...point,x:Math.max(0,Math.min(1,Number(e.target.value)/100))})} className={`${control} w-full`}/></label><label>Y (%)<input aria-label="Y (%)" type="number" min="0" max="100" value={Math.round(point.y*100)} onChange={e=>setPoint({...point,y:Math.max(0,Math.min(1,Number(e.target.value)/100))})} className={`${control} w-full`}/></label><button type="button" className={`${control} col-span-2`} onClick={()=>void add(point)}>{c.nextCorner} {labels[corners.length]}</button></div>}
    {corners.length===4&&<p role="status" className="text-xs">{projection?c.photoApprox:c.invalidPhoto}</p>}
    <div className="flex gap-2 flex-wrap"><button type="button" className={control} onClick={()=>void reset()}>{c.resetPhoto}</button><button type="button" className={control} onClick={async()=>{setBusy(true);try{await deleteEvidence(reportKey);if(alive.current){setData(undefined);setCorners([])}}catch{setError(true)}finally{if(alive.current)setBusy(false)}}}>{c.photoDelete}</button></div>
   </fieldset>}
  </>}
  <p role="status" className="text-xs text-muted-foreground">{busy?c.loading:error?c.photoError:data?c.saved:""}</p>
 </details>
}
