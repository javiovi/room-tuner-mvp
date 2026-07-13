"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CenteredLayout } from "@/components/CenteredLayout"
import { OptionCard } from "@/components/OptionCard"
import { Button } from "@/components/Button"
import { useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"

const VALID_MODES = ["music", "instrument", "work"] as const

export default function ObjetivoPage() {
  const router = useRouter()
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null)
  const setGoal = useRoomStore((s) => s.setGoal)
  const { t } = useT()

  // Pre-set goal from landing page mode selection (stored in localStorage)
  useEffect(() => {
    const stored = localStorage.getItem("roomtuner_mode")
    if (stored && (VALID_MODES as readonly string[]).includes(stored) && !selectedObjectiveId) {
      setSelectedObjectiveId(stored)
      setGoal(stored as "music" | "instrument" | "work")
      localStorage.removeItem("roomtuner_mode")
    }
    // Intentionally runs once on mount to consume a value set by the landing page;
    // `!selectedObjectiveId` is a guard against re-applying it, not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          {t.objetivo.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.objetivo.subtitle}</p>
      </div>

      <div>
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

      <Button onClick={handleContinue} disabled={!selectedObjectiveId} className="w-full">
        {t.common.next}
      </Button>
    </CenteredLayout>
  )
}
