"use client"

import { useState } from "react"
import Link from "next/link"
import { CenteredLayout } from "@/components/CenteredLayout"

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

  return (
    <CenteredLayout>
      <div className="space-y-3 text-center">
        <h1 className="text-lg md:text-xl font-bold text-primary glow-text font-mono">
          {"> "}¿Para qué querés optimizar tu sala?
        </h1>
        <p className="text-sm text-muted-foreground">{"// "}Elegí el objetivo principal</p>
      </div>

      <div className="space-y-3">
        {objectives.map((objective, index) => (
          <button
            key={objective.id}
            type="button"
            onClick={() => setSelectedObjectiveId(objective.id)}
            className={`w-full text-left p-4 transition-all cursor-pointer relative ${
              selectedObjectiveId === objective.id
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/30 bg-card hover:border-primary/50"
            }`}
            style={{
              borderWidth: "3px",
              borderStyle: "solid",
              boxShadow:
                selectedObjectiveId === objective.id
                  ? "4px 4px 0 0 rgba(0,255,156,0.5)"
                  : "3px 3px 0 0 rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-accent text-xs">[{String(index + 1).padStart(2, "0")}]</span>
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">{objective.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{objective.description}</p>
              </div>
              {selectedObjectiveId === objective.id && (
                <div className="flex-shrink-0 w-5 h-5 bg-primary border-2 border-black flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">✓</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <Link
        href="/sala"
        className={`block w-full py-3 px-6 font-semibold text-center uppercase text-sm tracking-wide transition-all ${
          selectedObjectiveId
            ? "border-black bg-primary text-primary-foreground hover:translate-x-0.5 hover:translate-y-0.5"
            : "border-muted-foreground/30 bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
        }`}
        style={{
          borderWidth: "3px",
          borderStyle: "solid",
          boxShadow: selectedObjectiveId ? "4px 4px 0 0 rgba(0,0,0,1)" : "none",
        }}
      >
        [CONTINUAR]
      </Link>
    </CenteredLayout>
  )
}
