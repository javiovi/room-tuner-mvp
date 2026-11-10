"use client"
import {useEffect,useState} from "react"
import Link from "next/link"
import type {RoomProject} from "@/app/types/room"
import {useT} from "@/lib/i18n"
import {reverbTrial,type SoftMaterial} from "@/lib/acoustics/reverbTrial"
import type {InstrumentMode} from "@/lib/acoustics/scene"
import {instrumentCopy} from "@/lib/acoustics/instrumentCopy"
export function ReverbComfort({reportKey,project,mode}:{reportKey:string;project:RoomProject;mode:InstrumentMode|null}) {
 const {locale}=useT(),c=instrumentCopy[locale]
 const [material,setMaterial]=useState<SoftMaterial>("none"),[area,setArea]=useState(2),[outcome,setOutcome]=useState<string>(),[error,setError]=useState(false),[loadedKey,setLoadedKey]=useState<string|null>(null)
 const key=`roomtuner-reverb-trial-v1:${JSON.stringify([reportKey,project.goal,mode,project.widthM,project.lengthM,project.heightM,project.floorType,project.wallType,project.furniture])}`
 const ready=loadedKey===key
 useEffect(()=>{setLoadedKey(null);setMaterial("none");setArea(2);setOutcome(undefined);try{const raw=JSON.parse(localStorage.getItem(key)??"null");if(raw&&["none","rug","curtain"].includes(raw.material)&&typeof raw.area==="number"&&Number.isFinite(raw.area)&&raw.area>=0&&raw.area<=1000){setMaterial(raw.material);setArea(raw.area);if(["better","same","worse"].includes(raw.outcome))setOutcome(raw.outcome)}}catch{setError(true)}setLoadedKey(key)},[key])
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(key,JSON.stringify({material,area,outcome}));setError(false)}catch{setError(true)}},[ready,key,material,area,outcome])
 const model=reverbTrial(project,material,area),max=model?Math.max(.1,...(["low","mid","high"] as const).flatMap(b=>[model.baseline[b],model.trial[b]])):1
 const format=(v:number)=>new Intl.NumberFormat(locale==="es"?"es-AR":"en-US",{maximumFractionDigits:2}).format(v)
 const control="min-h-11 border border-border rounded-sm bg-background px-3 text-sm"
 return <section aria-label={c.reverb} className="border border-border rounded-sm p-3 space-y-3">
  <h3 className="font-medium text-sm">{c.reverb}</h3><p className="text-xs text-muted-foreground">{project.goal==="music"?c.musicPurpose:mode==="recording"?c.recordPurpose:mode==="amplified"||mode==="reinforcement"?c.livePurpose:c.practicePurpose}</p>
  <details className="space-y-3"><summary className="min-h-11 cursor-pointer text-sm text-primary">{c.compare}</summary>
   {!model?<div className="text-xs space-y-2"><p>{c.missing}</p><Link href="/espacio?precision=1" className="underline text-primary min-h-11 inline-flex items-center">{locale==="es"?"Agregar medidas y materiales":"Add dimensions and materials"}</Link></div>:<>
    <fieldset disabled={!ready} className="space-y-3"><label className="block text-xs">{c.material}<select className={`${control} block mt-1 w-full`} value={material} onChange={e=>{setMaterial(e.target.value as SoftMaterial);setOutcome(undefined)}}>{(["none","rug","curtain"] as const).map(m=><option key={m} value={m}>{c[m]}</option>)}</select></label>
    {material!=="none"&&<label className="block text-xs">{c.area}<input className={`${control} block mt-1 w-full`} type="number" min="0" max={model.maxArea} step=".5" value={area} onChange={e=>{setArea(Math.max(0,Math.min(model.maxArea,Number(e.target.value))));setOutcome(undefined)}}/></label>}
    </fieldset>
    <div className="space-y-3" role="group" aria-label={c.reverb}>{(["low","mid","high"] as const).map(b=><div key={b} data-reverb-band={b} className="space-y-1"><p className="text-xs font-medium">{c[b]}</p>{(["baseline","trial"] as const).map(which=><div key={which} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center text-[10px]"><span>{which==="baseline"?c.current:c.trial}</span><div className="h-2 bg-secondary"><div className={`h-full ${which==="baseline"?"bg-muted-foreground/70":"bg-primary"}`} style={{width:`${model[which][b]/max*100}%`}}/></div><span className="font-mono" data-reverb-value={`${which}-${b}`}>≈ {format(model[which][b])} s</span></div>)}</div>)}</div>
    <p className="text-[10px] text-muted-foreground">{c.model}</p>
    {material!=="none"&&model.area>0&&<fieldset disabled={!ready} className="space-y-2"><legend className="text-xs mb-2">{c.outcome}</legend><div className="grid grid-cols-3 gap-2">{(["better","same","worse"] as const).map(result=><button type="button" key={result} aria-pressed={outcome===result} className={`${control} text-xs ${outcome===result?"border-primary text-primary":""}`} onClick={()=>setOutcome(result)}>{c[result]}</button>)}</div></fieldset>}
    {outcome&&<p role="status" className="text-xs">{outcome==="better"?c.keep:c.retry}</p>}
    {material!=="none"&&<button type="button" className={control} onClick={()=>{setMaterial("none");setOutcome(undefined)}}>{c.restore}</button>}
   </>}
   <p className="text-xs text-muted-foreground">{c.isolation}</p><p role="status" className="text-[10px] text-muted-foreground">{error?c.storage:c.saved}</p>
  </details>
 </section>
}
