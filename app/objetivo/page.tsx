"use client"

import { useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"

export default function ObjetivoPage() {
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null)
  const setGoal = useRoomStore((s) => s.setGoal)
  const { t } = useT()

  const objectives = [
    { id: "music", title: t.objetivo.musicTitle, description: t.objetivo.musicDesc },
    { id: "instrument", title: t.objetivo.instrumentTitle, description: t.objetivo.instrumentDesc },
    { id: "work", title: t.objetivo.workTitle, description: t.objetivo.workDesc },
  ]

  return (
    <CenteredLayout>
      <div className="space-y-3 text-center">
        <h1 className="text-lg md:text-xl font-semibold text-foreground leading-snug">
          {t.objetivo.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.objetivo.subtitle}</p>
      </div>

      <div className="space-y-3">
        {objectives.map((objective, index) => (
          <button
            key={objective.id}
            type="button"
            onClick={() => {
              setSelectedObjectiveId(objective.id)
              setGoal(objective.id as "music" | "instrument" | "work")
            }}
            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
              selectedObjectiveId === objective.id
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border bg-card hover:border-primary/50 card-shadow"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">{index + 1}.</span>
                  <h3 className="font-medium text-foreground text-sm">{objective.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-5">{objective.description}</p>
              </div>
              {selectedObjectiveId === objective.id && (
                <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <Link
        href="/espacio"
        className={`block w-full py-3.5 px-6 font-semibold text-center text-sm rounded-xl transition-all duration-150 ${
          selectedObjectiveId
            ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
            : "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
        }`}
      >
        {t.common.next}
      </Link>
    </CenteredLayout>
  )
}
