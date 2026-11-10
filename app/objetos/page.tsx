"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CenteredLayout } from "@/components/CenteredLayout"
import { Button } from "@/components/Button"
import { LocalRoomImage } from "@/components/LocalRoomImage"
import { useRoomStore } from "@/lib/roomStore"
import { instrumentCopy } from "@/lib/acoustics/instrumentCopy"
import { loadEvidence, saveEvidence } from "@/lib/evidence/storage"
import { makeZone, type Zone } from "@/lib/evidence/model"
import { useT } from "@/lib/i18n"
import type { RoomProject } from "@/app/types/room"

function Choice({ label, value, options, onChange }: { label: string; value?: string; options: string[][]; onChange: (value: string) => void }) {
  return <label className="block text-sm">{label}
    <select className="block mt-2 w-full bg-background border border-border p-3" value={value ?? ""} onChange={e => onChange(e.target.value)}>
      {!value && <option value="">—</option>}
      {options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}
    </select>
  </label>
}

export default function ObjectsPage() {
  const router = useRouter()
  const { t, locale } = useT()
  const es = locale === "es"
  const { project, updateProject } = useRoomStore()
  const [draft, setDraft] = useState("")
  useEffect(() => { setDraft(sessionStorage.getItem("roomtuner-capture") ?? "") }, [])
  const concern = project.concern ?? "clarity"
  const furniture = project.furniture ?? []
  const instrument = project.goal === "instrument"
  const [mark, setMark] = useState<Zone>()
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)
  const entry = project.noiseEntry
  const canMark = concern === "noise" && project.noiseSource !== "inside" && entry && entry !== "unknown"
  async function finish(path: string) {
    setSaving(true)
    try {
      if (draft) {
        const evidence = await loadEvidence(draft)
        if (evidence) await saveEvidence({ ...evidence, zones: canMark && mark?.kind === entry && mark ? [mark] : [] })
      }
      router.push(path)
    } catch {
      setFailed(true)
      setSaving(false)
    }
  }
  return <CenteredLayout>
    <Link href="/medidas">{t.common.back}</Link>
    <h1 className="text-xl font-semibold">{es ? "Ubicá lo que importa en tu espacio" : "Locate what matters in your room"}</h1>

    <Choice label={t.journey.problem} value={concern} options={(["clarity","echo","bass","noise"] as const).map(id => [id,t.layoutTrial[id]])} onChange={value => updateProject({ concern: value as RoomProject["concern"] })}/>
    {concern === "noise" ? <>
      <Choice label={t.noise.source} value={project.noiseSource ?? "unknown"} options={(["unknown","inside","outside","neighbors"] as const).map(id => [id,t.noise[id]])} onChange={value => updateProject({noiseSource: value as RoomProject["noiseSource"], noiseEntry: undefined})}/>
      {project.noiseSource !== "inside" && <Choice label={t.noise.entry} value={project.noiseEntry ?? "unknown"} options={(["unknown","window","door","wall"] as const).map(id => [id,t.noise[id]])} onChange={value => updateProject({noiseEntry: value as RoomProject["noiseEntry"]})}/>}
    </> : project.goal !== "work" && <Choice label={instrument ? instrumentCopy[locale].sourceTitle : t.disposicion.speakerTitle} value={project.speakerPlacement} options={[["pared-larga-centrado",t.disposicion.longWall],["pared-corta-centrado",t.disposicion.shortWall],["esquina",t.disposicion.corner],["pared-lateral",t.disposicion.sideWall],["indefinido",t.disposicion.undecided]]} onChange={value => updateProject({speakerPlacement: value as RoomProject["speakerPlacement"]})}/>}
    {draft && <>
      {canMark && <p className="text-sm">{es ? "Tocá en la foto la entrada de ruido que querés comprobar." : "Tap the suspected noise entry you want to check."}</p>}
      <LocalRoomImage reportKey={draft} mark={canMark && mark?.kind === entry ? mark : undefined} onMark={canMark ? point => setMark(makeZone(entry, point.x, point.y)) : undefined}/>
    </>}
    <Choice label={instrument ? instrumentCopy[locale].receiverTitle : t.disposicion.listeningTitle} value={project.listeningPosition} options={[["centro-sala",t.disposicion.centerRoom],["escritorio-pared",t.disposicion.deskWall],["sillon-pared-posterior",t.disposicion.sofaBack],["esquina",t.disposicion.cornerListen],["variable",t.disposicion.variable]]} onChange={value => updateProject({listeningPosition: value as RoomProject["listeningPosition"]})}/>
    <details><summary className="cursor-pointer min-h-11">{t.muebles.title}</summary>
      {Object.entries({sofa:t.muebles.sofa, escritorio:t.muebles.desk, estanteria:t.muebles.shelving, cama:t.muebles.bed, alfombra:t.muebles.thickRug}).map(([id,label]) => <label key={id} className="flex items-center gap-2 min-h-10"><input type="checkbox" checked={furniture.includes(id)} onChange={e => updateProject({furniture: e.target.checked ? [...furniture,id] : furniture.filter(item => item !== id)})}/>{label}</label>)}
    </details>
    <Button disabled={saving || !project.goal || !project.lengthM} onClick={() => finish("/analizando")} className="w-full">{t.muebles.analyzeButton}</Button>
    {failed && <p role="alert">{es ? "No se pudo guardar la marca. Volvé a intentar." : "Could not save the marker. Try again."}</p>}
    <button disabled={saving || !project.goal} className="text-sm underline" onClick={() => finish("/medicion")}>{es ? "Agregar una medición con micrófono" : "Add a microphone measurement"}</button>
  </CenteredLayout>
}
