"use client"

import { trackPilot } from "@/lib/analytics"
import { useEffect, useState } from "react"
import { useRoomStore } from "@/lib/roomStore"
import { getReportExperiments } from "@/lib/reportExperiments"
import type { MoveConstraints } from "@/lib/layoutTrial"
import type { RoomGoal, RoomProject } from "@/app/types/room"
import { useT } from "@/lib/i18n"

type Outcome = "better" | "same" | "worse"
type RecordEntry = { tried: boolean; outcome?: Outcome; note: string }
type Records = Record<string, RecordEntry>
const EMPTY_RECORDS: Records = {}

export function TodayExperiments({ reportKey, goal, roomCharacter, constraints, concern }: {
  concern?: RoomProject["concern"]
  constraints?: MoveConstraints
  reportKey: string
  goal: RoomGoal | null
  roomCharacter: "viva" | "equilibrada" | "seca"
}) {
  const { t } = useT()
  const c = t.experiments
  const setReportExperiments = useRoomStore(s => s.setReportExperiments)
  const storageKey = `roomtuner-experiments-v1:${reportKey}`
  const records = useRoomStore(s => s.reportPersonalization.experiments) ?? EMPTY_RECORDS
  const [ready, setReady] = useState(false)
  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "{}")
      const valid: Records = {}
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        for (const [id, entry] of Object.entries(raw)) {
          if (!entry || typeof entry !== "object") continue
          const value = entry as Partial<RecordEntry>
          if (typeof value.tried !== "boolean" || typeof value.note !== "string") continue
          valid[id] = { tried: value.tried, note: value.note.slice(0, 500),
            outcome: value.tried && ["better", "same", "worse"].includes(value.outcome ?? "") ? value.outcome : undefined }
        }
      }
      setReportExperiments(valid)
    } catch { setStorageError(true) }
    setReady(true)
  }, [storageKey, setReportExperiments])

  const update = (id: string, patch: Partial<RecordEntry> | null) => {
    const next = { ...records }
    if (patch === null) delete next[id]
    else next[id] = { ...(next[id] ?? { tried: false, note: "" }), ...patch }
    setReportExperiments(next)
    if (patch?.tried === true) trackPilot("trial_started", { trial: id })
    if (patch?.outcome) trackPilot("trial_result", { trial: id, outcome: patch.outcome })
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
      setStorageError(false)
    } catch { setStorageError(true) }
  }

  const experiments = getReportExperiments({ goal, concern, moveConstraints: constraints }, roomCharacter, c)

  return (
    <section className="space-y-4" aria-label={c.actions}>
      <div className="space-y-2">
        <h2 className="text-base font-semibold">{c.actions}</h2>
        <p className="text-sm text-muted-foreground">{c.intro}</p>
        <p className="text-xs text-muted-foreground">{c.protocol}</p>
      </div>
      {experiments.map((experiment, index) => {
        const entry = records[experiment.id]
        return (
          <article key={experiment.id} className="border border-border bg-card rounded-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold"><span className="font-mono text-primary mr-2">0{index + 1}</span>{experiment.title}</h3>
            {index === 0 ? <p className="text-xs text-muted-foreground">{c.guidedRecord}</p> : <>
              <p className="text-sm">{experiment.action}</p>
              <p className="text-xs text-muted-foreground">{experiment.why}</p>
              <p className="text-xs border-l-2 border-primary pl-3">{experiment.check}</p>
            </>}
            <label className="flex items-center gap-2 text-sm min-h-11">
              <input type="checkbox" disabled={!ready} checked={entry?.tried ?? false}
                onChange={(event) => update(experiment.id, { tried: event.target.checked, outcome: undefined })} />
              {c.tried}
            </label>
            {entry?.tried && (
              <div className="space-y-3">
                <fieldset>
                  <legend className="text-xs mb-2">{c.result}</legend>
                  <div className="flex flex-wrap gap-2">
                    {(["better", "same", "worse"] as const).map((outcome) => (
                      <label key={outcome} className={`flex items-center gap-2 border rounded-sm px-3 min-h-11 text-xs cursor-pointer ${entry.outcome === outcome ? "border-primary text-primary" : "border-border"}`}>
                        <input type="radio" name={`outcome-${experiment.id}`} checked={entry.outcome === outcome}
                          onChange={() => update(experiment.id, { outcome })} />{c[outcome]}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="block text-xs space-y-2">
                  <span>{c.note}</span>
                  <textarea maxLength={500} value={entry.note} rows={2} className="block w-full border border-border bg-background p-2 rounded-sm text-sm"
                    onChange={(event) => update(experiment.id, { note: event.target.value })} />
                </label>
                <button type="button" onClick={() => update(experiment.id, null)} className="min-h-11 text-xs text-muted-foreground underline">{c.undo}</button>
              </div>
            )}
          </article>
        )
      })}
      <p role="status" className="text-xs text-muted-foreground">{storageError ? c.storageError : c.saved}</p>
    </section>
  )
}
