"use client"

import { useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { useRoomStore } from "@/lib/roomStore"

const objectives = [
  {
    id: "music",
    title: "Escuchar música",
    description: "Optimizar para disfrutar de la mejor calidad de audio musical",
  },
  {
    id: "instrument",
    title: "Tocar instrumento",
    description: "Crear un entorno ideal para la práctica instrumental",
  },
  {
    id: "work",
    title: "Trabajar / concentrarme",
    description: "Mejorar la claridad del sonido y reducir distracciones",
  },
]

export default function ObjetivoPage() {
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null)
  const setGoal = useRoomStore((s) => s.setGoal)

  return (
    <CenteredLayout>
      <div className="space-y-3 text-center">
        <h1 className="text-lg md:text-xl font-semibold text-foreground">
          Para qué querés optimizar tu espacio?
        </h1>
        <p className="text-sm text-muted-foreground">Elegí el objetivo principal</p>
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
        Continuar
      </Link>
    </CenteredLayout>
  )
}
