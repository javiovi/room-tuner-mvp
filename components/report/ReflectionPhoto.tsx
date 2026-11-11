"use client"

import { useEffect, useRef, useState } from "react"
import { useT } from "@/lib/i18n"
import { acousticCopy } from "@/lib/acoustics/copy"
import { wallProjection, type ImagePoint } from "@/lib/acoustics/projection"
import type { Reflection } from "@/lib/acoustics/reflections"
import Link from "next/link"
import { makeZone, type RoomEvidence } from "@/lib/evidence/model"
import { preparePhoto } from "@/lib/evidence/photos"
import { loadEvidence, saveEvidence, deleteEvidence } from "@/lib/evidence/storage"

type PhotoWall = "left"|"right"|"front"|"back"
export function ReflectionPhoto({reportKey,reflections,allowed,wall,onSetup,setupLabel,approximate,goal="music",mono=false}:{reportKey:string;reflections:Reflection[];allowed:boolean;onSetup:()=>void;setupLabel:string;approximate:boolean;wall:PhotoWall;goal?:string;mono?:boolean}) {
 const {locale}=useT(),c=acousticCopy[locale]
 const [data,setData]=useState<RoomEvidence>(),[url,setUrl]=useState(""),[busy,setBusy]=useState(true),[error,setError]=useState(false)
 const [corners,setCorners]=useState<ImagePoint[]>([]),[photoWall,setPhotoWall]=useState<PhotoWall>(wall),[point,setPoint]=useState({x:.5,y:.5})
 const [open,setOpen]=useState(false),[windowMode,setWindowMode]=useState(false)
 const [wallChosen,setWallChosen]=useState(false)
 const alive=useRef(true),initialWall=useRef(wall)
 useEffect(()=>{alive.current=true;loadEvidence(reportKey).then(d=>{if(alive.current){setData(d);setOpen(!!d);setWallChosen(!!d?.projection);setCorners(d?.projection?.corners??[]);setPhotoWall(d?.projection?.wall??initialWall.current)}}).catch(()=>{if(alive.current)setError(true)}).finally(()=>{if(alive.current)setBusy(false)});return()=>{alive.current=false}},[reportKey])
 useEffect(()=>{if(!data?.photo){setUrl("");return}const u=URL.createObjectURL(data.photo);setUrl(u);return()=>URL.revokeObjectURL(u)},[data?.photo])
 const save=async(d:RoomEvidence)=>{setBusy(true);setError(false);try{await saveEvidence(d);if(alive.current)setData(d)}catch{if(alive.current)setError(true)}finally{if(alive.current)setBusy(false)}}
 const upload=async(file?:File)=>{if(!file||busy)return;setBusy(true);setError(false);try{const photo=await preparePhoto(file);await save({version:1,reportKey,goal,photo,zones:[],updatedAt:new Date().toISOString()});setCorners([])}catch{if(alive.current){setError(true);setBusy(false)}}}
 const add=async(p:ImagePoint)=>{if(!data||busy)return;if(windowMode){await save({...data,zones:[...data.zones.filter(z=>z.kind!=="window"),makeZone("window",p.x,p.y)]});setWindowMode(false);return}if(!wallChosen||corners.length>=4)return;const next=[...corners,p];setCorners(next);await save({...data,projection:{wall:photoWall,corners:next},updatedAt:new Date().toISOString()})}
 const reset=async(nextWall=photoWall)=>{setCorners([]);setWallChosen(true);setPhotoWall(nextWall);if(data)await save({...data,projection:{wall:nextWall,corners:[]},updatedAt:new Date().toISOString()})}
 const projection=wallProjection(corners),labels=[c.cornerA,c.cornerB,c.cornerC,c.cornerD]
 const markers=allowed&&projection ? reflections.filter(r=>r.wall===photoWall).flatMap(r=>{const p=projection(r.u,r.v);return p?[{...r,...p}]:[]}):[]
 const control="min-h-11 border border-border bg-background rounded-sm px-3 text-sm"
 return <details open={open} onToggle={e=>setOpen(e.currentTarget.open)} className="border border-border rounded-sm p-3 space-y-3" data-testid="reflection-photo-panel">
  <summary className="cursor-pointer min-h-11 text-sm text-primary">{c.photo}</summary>
  <p className="text-xs text-muted-foreground">{c.photoPrivacy}</p>
  {!allowed && <div className="space-y-2"><p className="text-sm">{c.photoGate}</p>{approximate ? <Link className={control} href="/espacio?precision=1">{locale==="es"?"Cargar medidas para la foto":"Enter dimensions for the photo"}</Link> : <button type="button" className={control} onClick={onSetup}>{setupLabel}</button>}</div>}
  <>
   <p className="text-sm">{c.photoIntro}</p>
   <p className="text-xs">{locale==="es"?"Si fotografiaste los parlantes desde el sillón, elegí la pared que está detrás de ellos en el plano. L y R sobre la foto indican dónde rebota el sonido de cada parlante. Al moverlos cambia ese cálculo.":"If you photographed the speakers from your seat, select the wall behind them on the plan. L and R on the photo mark where sound from each speaker reflects. Moving them updates that calculation."}</p>
   {!data?(allowed && <label className="block text-sm">{c.upload}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="block w-full mt-2 text-xs" onChange={async e=>{const input=e.currentTarget;await upload(input.files?.[0]);input.value=""}}/></label>):<fieldset disabled={busy} className="min-w-0 space-y-3">
    <label className="block text-sm">{c.calculated}<select aria-label={locale==="es"?"Pared de la foto":"Photo wall"} value={wallChosen?photoWall:""} onChange={e=>void reset(e.target.value as PhotoWall)} className={`${control} block w-full mt-2`}><option value="" disabled>{locale==="es"?"Elegí la pared que se ve en la foto":"Choose the wall visible in the photo"}</option>{(["left","right","front","back"] as const).map(w=><option key={w} value={w}>{c[w]}</option>)}</select></label>
    {wallChosen && <p className="text-xs">{photoWall==="left"||photoWall==="right"?c.sideAB:c.endAB}</p>}
    {wallChosen&&corners.length<4&&<p className="text-sm text-primary">{c.nextCorner} {corners.length+1}/4: {labels[corners.length]}</p>}
    <button type="button" className={control} aria-pressed={windowMode} onClick={()=>setWindowMode(!windowMode)}>{locale==="es"?"Marcar una ventana en la foto":"Mark a window in the photo"}</button>
    {windowMode&&<p className="text-sm">{locale==="es"?"Tocá el centro de la ventana visible. Queda como referencia visual.":"Tap the centre of the visible window to keep it as a visual reference."}</p>}
    <div className="relative overflow-hidden border border-border" data-testid="reflection-photo" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();void add({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height})}}>
     {/* eslint-disable-next-line @next/next/no-img-element */}
     {url&&<img src={url} alt={c.photoAlt} className="block w-full h-auto" draggable={false}/>}
     <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{corners.length>1&&<polygon points={corners.map(p=>`${p.x*100},${p.y*100}`).join(" ")} className="fill-primary/10 stroke-primary" strokeWidth=".5"/>}</svg>
     {corners.map((p,i)=><span key={i} className="absolute -translate-x-1/2 -translate-y-1/2 bg-background text-primary border border-primary px-1 text-xs" style={{left:`${p.x*100}%`,top:`${p.y*100}%`}}>{i+1}</span>)}
     {data.zones.filter(z=>z.kind==="window").map(z=><span key={z.id} className="absolute -translate-x-1/2 bg-background border px-1 text-xs pointer-events-none" style={{left:`${z.x*100}%`,top:`${z.y*100}%`}}>{locale==="es"?"Ventana":"Window"}</span>)}
     {markers.map(m=><span key={m.id} data-reflection-photo={m.id} className="absolute -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full border-2 border-primary bg-background text-primary flex items-center justify-center text-xs" style={{left:`${m.x*100}%`,top:`${m.y*100}%`}} title={c.calculated}>{mono?"S":m.speaker===0?"L":"R"}</span>)}
    </div>
    {wallChosen&&corners.length<4&&<div className="grid grid-cols-2 gap-2 text-xs"><label>X (%)<input aria-label="X (%)" type="number" min="0" max="100" value={Math.round(point.x*100)} onChange={e=>setPoint({...point,x:Math.max(0,Math.min(1,Number(e.target.value)/100))})} className={`${control} w-full`}/></label><label>Y (%)<input aria-label="Y (%)" type="number" min="0" max="100" value={Math.round(point.y*100)} onChange={e=>setPoint({...point,y:Math.max(0,Math.min(1,Number(e.target.value)/100))})} className={`${control} w-full`}/></label><button type="button" className={`${control} col-span-2`} onClick={()=>void add(point)}>{c.nextCorner} {labels[corners.length]}</button></div>}
    {corners.length===4&&<p role="status" className="text-xs">{projection?(allowed?c.photoApprox:c.photoGate):c.invalidPhoto}</p>}
    <div className="flex gap-2 flex-wrap"><button type="button" className={control} disabled={!wallChosen} onClick={()=>void reset()}>{c.resetPhoto}</button><button type="button" className={control} onClick={async()=>{setBusy(true);try{await deleteEvidence(reportKey);if(alive.current){setData(undefined);setCorners([]);setWallChosen(false);setWindowMode(false)}}catch{setError(true)}finally{if(alive.current)setBusy(false)}}}>{c.photoDelete}</button></div>
   </fieldset>}
  </>
  <p role="status" className="text-xs text-muted-foreground">{busy?c.loading:error?c.photoError:data?c.saved:""}</p>
 </details>
}
