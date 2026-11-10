"use client"

import { useEffect, useState } from "react"
import { trackPilot } from "@/lib/analytics"
import { useRoomStore } from "@/lib/roomStore"
import { experimentCatalog, getReportExperiments, type ExperimentRecord, type ExperimentRecords } from "@/lib/reportExperiments"
import type { RoomProject, RoomDiagram } from "@/app/types/room"
import { useT } from "@/lib/i18n"
import { RoomPhoto } from "./RoomPhoto"
import { NoiseOptions } from "./NoiseOptions"
import { LayoutTrial } from "./LayoutTrial"

const EMPTY: ExperimentRecords = {}
export function TodayExperiments({ reportKey, project, diagram, roomCharacter }: {
  reportKey: string; project: RoomProject; diagram: RoomDiagram; roomCharacter: "viva" | "equilibrada" | "seca"
}) {
  const { t } = useT()
  const records = useRoomStore(s => s.reportPersonalization.experiments) ?? EMPTY
  const setRecords = useRoomStore(s => s.setReportExperiments)
  const items = getReportExperiments(project, roomCharacter, t.experiments)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const key = `roomtuner-experiments-v1:${reportKey}`
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed: unknown = JSON.parse(raw), valid: ExperimentRecords = {}
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          for (const [id, value] of Object.entries(parsed)) {
            if (!value || typeof value !== "object") continue
            const entry = value as Partial<ExperimentRecord>
            if (typeof entry.tried !== "boolean" || typeof entry.note !== "string") continue
            const outcome = ["better", "same", "worse", "unable"].includes(entry.outcome ?? "") ? entry.outcome : undefined
            valid[id] = { tried: outcome === "unable" ? false : entry.tried, outcome, note: entry.note.slice(0, 500) }
          }
        }
        setRecords(valid)
      }
      setActiveId(localStorage.getItem(`roomtuner-active-trial:${reportKey}`))
    } catch { setError(true) }
    setReady(true)
  }, [key, reportKey, setRecords])
  const index = Math.max(0, items.findIndex(item => item.id === activeId))
  const experiment = items[index]
  const entry = experiment ? records[experiment.id] : undefined
  const labels = { better: t.experiments.better, same: t.experiments.same, worse: t.experiments.worse, unable: t.journey.unable }
  const update = (patch: Partial<ExperimentRecord>) => {
    if (!experiment) return
    const next = { ...records, [experiment.id]: { ...(entry ?? { tried: false, note: "" }), ...patch } }
    setRecords(next)
    if (patch.outcome) trackPilot("trial_result", { trial: experiment.id, outcome: patch.outcome })
    try { localStorage.setItem(key, JSON.stringify(next)); setError(false) } catch { setError(true) }
  }
  const choose = (id: string) => {
    setActiveId(id)
    try { localStorage.setItem(`roomtuner-active-trial:${reportKey}`, id) } catch { setError(true) }
  }
  return <section className="space-y-4" aria-label={t.journey.start}>
    <p className="text-xs text-muted-foreground">{t.journey.problem}: <span className="text-foreground">{t.layoutTrial[project.concern ?? "clarity"]}</span></p>
    {experiment ? <article className="border border-primary/40 bg-card rounded-sm p-4 space-y-4">
      <h2 className="text-lg font-semibold">{experiment.title}</h2>
      <p className="text-base leading-relaxed">{experiment.action}</p>
      <p className="text-sm text-muted-foreground">{experiment.why}</p>
      <div className="border-l-2 border-primary pl-3 space-y-1"><h3 className="text-sm font-medium">{t.journey.check}</h3><p className="text-sm">{experiment.check}</p></div>
      {(["position", "symmetry"].includes(experiment.id)) && <details className="border-t border-border pt-2" key={experiment.id}>
        <summary className="cursor-pointer min-h-11 text-sm text-primary">{t.journey.plan}</summary>
        <LayoutTrial reportKey={reportKey} project={project} diagram={diagram} roomCharacter={roomCharacter} experimentId={experiment.id} />
      </details>}
      <fieldset disabled={!ready} className="space-y-2"><legend className="text-sm font-medium mb-2">{t.journey.result}</legend>
        <div className="grid grid-cols-2 gap-2">{(["better", "same", "worse", "unable"] as const).map(outcome => <label key={outcome} className={`min-h-11 flex gap-2 items-center text-sm border p-2 rounded-sm cursor-pointer ${entry?.outcome === outcome ? "border-primary text-primary" : "border-border"}`}><input type="radio" name={`result-${reportKey}`} checked={entry?.outcome === outcome} onChange={() => update({ tried: outcome !== "unable", outcome })} />{labels[outcome]}</label>)}</div>
      </fieldset>
      {entry?.outcome && <div className="space-y-3">
        <p role="status" className="text-sm">{entry.outcome === "better" ? t.journey.done : entry.outcome === "unable" ? t.journey.unableNext : t.journey.retry}</p>
        <label className="block text-xs space-y-2"><span>{t.experiments.note}</span><textarea maxLength={500} rows={2} className="block w-full bg-background border border-border p-2 text-sm" value={entry.note} onChange={e=>update({note:e.target.value})} /></label>
        {index+1 < items.length ? <button className="border border-primary text-primary px-3 min-h-11 text-sm" type="button" onClick={()=>choose(items[index+1].id)}>{t.journey.next}</button> : entry.outcome !== "better" && <p className="text-xs text-muted-foreground">{t.journey.exhausted}</p>}
      </div>}
      {index > 0 && <button type="button" className="text-xs underline min-h-11" onClick={()=>choose(items[index-1].id)}>{t.journey.previous}</button>}
    </article> : <p className="border border-border p-4 text-sm">{t.journey.noTrial}</p>}
    {project.concern === "noise" && project.noiseSource !== "inside" && <NoiseOptions project={project} />}
    {project.concern === "noise" && project.noiseSource !== "inside" && <RoomPhoto key={reportKey} reportKey={reportKey} goal={project.goal ?? "work"} />}
    <details className="text-xs text-muted-foreground"><summary className="cursor-pointer min-h-11">{t.journey.why}</summary><p>{t.journey.basis}</p><p className="mt-2">{t.experiments.protocol}</p></details>
    {Object.keys(records).length>0 && <details><summary className="cursor-pointer min-h-11 text-sm">{t.journey.history}</summary><ul className="space-y-3 text-sm">{Object.entries(records).map(([id, record]) => <li key={id} className="border-t border-border pt-2"><p>{experimentCatalog(t.experiments).find(item=>item.id === id)?.title ?? id}: {record.outcome ? labels[record.outcome] : t.experiments.tried}</p>{record.note && <p className="text-muted-foreground">{record.note}</p>}</li>)}</ul></details>}
    <p role="status" className="text-xs text-muted-foreground">{error ? t.experiments.storageError : t.journey.storage}</p>
  </section>
}
