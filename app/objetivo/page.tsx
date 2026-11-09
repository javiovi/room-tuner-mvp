"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CenteredLayout } from "@/components/CenteredLayout"
import { OptionCard } from "@/components/OptionCard"
import { Button } from "@/components/Button"
import { useRoomHydrated, useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"



export default function ObjetivoPage() {
  const router = useRouter()
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null)
  const updateProject = useRoomStore(s => s.updateProject)
  const setGoal = useRoomStore((s) => s.setGoal)
  const project = useRoomStore((s) => s.project)
  const hydrated = useRoomHydrated()
  const { t } = useT()

  // Restore the previous choice after a refresh. Runs after the localStorage effect below,
  // so a mode just picked on the landing page still wins over an older stored goal.
  const seeded = useRef(false)
  useEffect(() => {
    if (!hydrated || seeded.current) return
    seeded.current = true
    if (project.goal) setSelectedObjectiveId((prev) => prev ?? project.goal)
  }, [hydrated, project])

  const objectives = [
    { id: "music", title: t.objetivo.musicTitle, description: t.objetivo.musicDesc },
    { id: "instrument", title: t.objetivo.instrumentTitle, description: t.objetivo.instrumentDesc },
    { id: "work", title: t.objetivo.workTitle, description: t.objetivo.workDesc },
  ]

  const handleContinue = () => {
    if (!selectedObjectiveId) return
    router.push("/espacio")
  }

  return (
    <CenteredLayout>
      <div className="space-y-3 text-center">
        <h1 className="text-lg md:text-xl font-semibold text-foreground leading-snug">
          {t.layoutTrial.problem}
        </h1>
        <p className="text-sm text-muted-foreground">{t.landing.step2Desc}</p>
      </div>

      <label className="block text-sm">{t.journey.problem}<select value={project.concern ?? "clarity"} onChange={e => updateProject({ concern: e.target.value as "clarity" | "echo" | "bass" | "noise" })} className="block w-full mt-2 border border-border bg-background p-3">{(["clarity", "echo", "bass", "noise"] as const).map(value => <option key={value} value={value}>{t.layoutTrial[value]}</option>)}</select></label>
      {project.concern === "noise" && <div className="space-y-3">
        <label className="block text-sm">{t.noise.source}<select className="block w-full mt-2 border border-border bg-background p-3" value={project.noiseSource ?? "unknown"} onChange={e => updateProject({ noiseSource: e.target.value as typeof project.noiseSource })}>{(["unknown", "outside", "inside", "neighbors"] as const).map(value=><option key={value} value={value}>{t.noise[value]}</option>)}</select></label>
        {project.noiseSource !== "inside" && <label className="block text-sm">{t.noise.entry}<select className="block w-full mt-2 border border-border bg-background p-3" value={project.noiseEntry ?? "unknown"} onChange={e=>updateProject({noiseEntry:e.target.value as typeof project.noiseEntry})}>{(["unknown", "window", "door", "wall"] as const).map(value=><option key={value} value={value}>{t.noise[value]}</option>)}</select></label>}
      </div>}
      <div>
        <h2 className="text-sm font-medium mb-3">{t.journey.context}</h2>
        {objectives.map((objective) => (
          <OptionCard
            key={objective.id}
            variant="radio"
            selected={selectedObjectiveId === objective.id}
            onSelect={() => {
              setSelectedObjectiveId(objective.id)
              setGoal(objective.id as "music" | "instrument" | "work")
            }}
            title={objective.title}
            description={objective.description}
          />
        ))}
      </div>

      <details className="border border-border p-3"><summary className="cursor-pointer min-h-11 text-sm">{t.layoutTrial.restrictions}</summary>
        <fieldset>{(["speakers", "listening", "furniture"] as const).map(key => <label key={key} className="flex gap-2 items-center min-h-11 text-sm"><input type="checkbox" checked={project.moveConstraints?.[key] ?? true} onChange={e => updateProject({ moveConstraints: { speakers: true, listening: true, furniture: true, ...project.moveConstraints, [key]: e.target.checked } })} />{t.layoutTrial[key]}</label>)}</fieldset>
      </details>
      <Button onClick={handleContinue} disabled={!selectedObjectiveId} className="w-full">
        {t.common.next}
      </Button>
    </CenteredLayout>
  )
}
