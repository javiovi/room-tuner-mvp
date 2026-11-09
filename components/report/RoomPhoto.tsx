"use client"

import { useEffect, useRef, useState } from "react"
import { useT } from "@/lib/i18n"
import { evidenceCopy } from "@/lib/evidence/copy"
import { makeZone, position, type RoomEvidence, type Zone, type ZoneKind } from "@/lib/evidence/model"
import { preparePhoto } from "@/lib/evidence/photos"
import { deleteEvidence, loadEvidence, saveEvidence } from "@/lib/evidence/storage"

export function RoomPhoto({ reportKey, goal }: { reportKey: string; goal: string }) {
  const { locale } = useT(), c = evidenceCopy[locale]
  const [data, setData] = useState<RoomEvidence>(), [url, setUrl] = useState("")
  const [kind, setKind] = useState<ZoneKind>("window"), [busy, setBusy] = useState(true)
  const [error, setError] = useState(false), [dirty, setDirty] = useState(false)
  const mounted = useRef(true)
  const control = "min-h-11 border border-border rounded-sm bg-background px-3 text-sm"
  useEffect(()=>{
    mounted.current = true
    loadEvidence(reportKey).then(value=>{ if (mounted.current) setData(value) }).catch(()=>{ if (mounted.current) setError(true) }).finally(()=>{ if (mounted.current) setBusy(false) })
    return ()=>{ mounted.current = false }
  }, [reportKey])
  useEffect(()=>{
    if (!data?.photo) { setUrl(""); return }
    const next = URL.createObjectURL(data.photo)
    setUrl(next)
    return ()=>URL.revokeObjectURL(next)
  }, [data?.photo])
  useEffect(()=>{
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent)=>{ event.preventDefault(); event.returnValue = "" }
    window.addEventListener("beforeunload",warn)
    return ()=>window.removeEventListener("beforeunload",warn)
  }, [dirty])
  async function upload(file?: File) {
    if (!file || busy) return
    setBusy(true); setError(false)
    try {
      const photo = await preparePhoto(file)
      const value: RoomEvidence = { version: 1, reportKey, goal, photo, zones: [], updatedAt: new Date().toISOString() }
      await saveEvidence(value)
      if (mounted.current) { setData(value); setDirty(false) }
    } catch { if (mounted.current) setError(true) }
    finally { if (mounted.current) setBusy(false) }
  }
  function change(zones: Zone[]) { if (data) { setData({ ...data, zones }); setDirty(true) } }
  function add(x: number, y: number) { if (data && data.zones.length < 12 && !busy) change([...data.zones, makeZone(kind,x,y)]) }
  function update(id: string, patch: Partial<Zone>) { if (data) change(data.zones.map(z=>z.id===id ? { ...z, ...patch } : z)) }
  async function persist(remove = false) {
    if (!data || busy) return
    setBusy(true); setError(false)
    try {
      if (remove) await deleteEvidence(reportKey)
      else await saveEvidence({ ...data, updatedAt: new Date().toISOString() })
      if (mounted.current) { if (remove) setData(undefined); setDirty(false) }
    } catch { if (mounted.current) setError(true) }
    finally { if (mounted.current) setBusy(false) }
  }
  return <details className="border border-border bg-card rounded-sm p-4 space-y-3">
    <summary className="cursor-pointer min-h-11 text-primary font-medium">{c.title}</summary>
    <p className="text-sm">{c.intro}</p>
    <p className="text-xs text-muted-foreground">{c.privacy}</p>
    <p className="text-xs text-muted-foreground">{c.limitation}</p>
    {!data ? <fieldset disabled={busy} className="space-y-3">
      <label className="block text-sm">{c.upload}<input className="block mt-2 w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{ const input=e.currentTarget; await upload(input.files?.[0]); input.value="" }} /></label>
      <label className="block text-sm">{c.camera}<input className="block mt-2 w-full text-xs" type="file" accept="image/*" capture="environment" onChange={async e=>{ const input=e.currentTarget; await upload(input.files?.[0]); input.value="" }} /></label>
      <p className="text-xs text-muted-foreground">{c.formats}</p>
    </fieldset> : <fieldset disabled={busy} className="space-y-4 min-w-0">
      <p className="text-sm">{c.mark}</p>
      <label className="block text-sm">{c.add}<select className={`${control} block w-full mt-2`} value={kind} onChange={e=>setKind(e.target.value as ZoneKind)}>{Object.entries(c.kinds).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
      <div className="relative w-full overflow-hidden border border-border" data-testid="room-photo" onClick={e=>{ const r=e.currentTarget.getBoundingClientRect(); add((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height) }}>
        {/* A local blob URL never passes through the remote image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url && <img src={url} alt={c.alt} className="block w-full h-auto" draggable={false} />}
        {data.zones.map((zone,i)=><button key={zone.id} type="button" aria-label={`${i+1}. ${c.kinds[zone.kind]}`} title={c.mark} className="absolute w-11 h-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background text-primary font-mono focus:outline-2 focus:outline-primary" style={{ left:`${zone.x*100}%`,top:`${zone.y*100}%` }} onClick={e=>e.stopPropagation()} onKeyDown={e=>{
          const delta: Record<string, [number,number]> = { ArrowLeft:[-.02,0], ArrowRight:[.02,0], ArrowUp:[0,-.02], ArrowDown:[0,.02] }
          if (delta[e.key]) { e.preventDefault(); update(zone.id,{ x:position(zone.x+delta[e.key][0]), y:position(zone.y+delta[e.key][1]) }) }
        }}>{i+1}</button>)}
      </div>
      <button type="button" className={control} disabled={data.zones.length >= 12} onClick={()=>add(.5,.5)}>{c.add} ({data.zones.length}/12)</button>
      {data.zones.map((zone,i)=><section key={zone.id} className="border-t border-border pt-3 space-y-3" aria-label={`${i+1}. ${c.kinds[zone.kind]}`}>
        <h3 className="text-sm font-medium">{i+1}. {c.kinds[zone.kind]}</h3>
        <p className="text-sm text-muted-foreground">{c.checks[zone.kind]}</p>
        <label className="block text-sm">{c.note}<textarea className={`${control} block w-full mt-2 p-2`} maxLength={500} rows={2} value={zone.note} onChange={e=>update(zone.id,{ note:e.target.value })} /></label>
        <label className="block text-sm">{c.outcome}<select className={`${control} block w-full mt-2`} value={zone.outcome} onChange={e=>update(zone.id,{ outcome:e.target.value as Zone["outcome"] })}>{Object.entries(c.outcomes).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
        <button className="min-h-11 text-xs underline" type="button" onClick={()=>change(data.zones.filter(z=>z.id!==zone.id))}>{c.removeZone} {i+1}</button>
      </section>)}
      <div className="flex flex-wrap gap-3"><button className={`${control} text-primary border-primary`} type="button" disabled={!dirty} onClick={()=>void persist()}>{c.save}</button><button className={control} type="button" onClick={()=>void persist(true)}>{c.remove}</button></div>
    </fieldset>}
    <p role="status" className={`text-xs ${error ? "text-destructive" : "text-muted-foreground"}`}>{busy ? c.loading : error ? c.error : dirty ? c.unsaved : data ? c.saved : ""}</p>
  </details>
}
