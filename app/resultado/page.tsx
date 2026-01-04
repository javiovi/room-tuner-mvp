"use client"

import Link from "next/link"
import { CenteredLayout } from "@/components/CenteredLayout"
import { PrimaryButton } from "@/components/PrimaryButton"
import { RetroTabs } from "@/components/RetroTabs"
import { useRoomStore } from "@/lib/roomStore"
import { RoomMetricsCard } from "@/components/report/RoomMetricsCard"
import { FrequencyResponseChart } from "@/components/report/FrequencyResponseChart"
import { RoomModesChart } from "@/components/report/RoomModesChart"
import { ProductTable } from "@/components/report/ProductTable"
import { InteractiveRoomDiagram } from "@/components/report/InteractiveRoomDiagram"
import { RecommendationSection } from "@/components/report/RecommendationSection"
import { BudgetCalculator } from "@/components/report/BudgetCalculator"
import { ActionPlan } from "@/components/report/ActionPlan"

export default function ResultadoPage() {
  const analysis = useRoomStore((s) => s.analysis)
  const project = useRoomStore((s) => s.project)

  // 🛡️ Si no hay análisis, mostramos un fallback
  if (!analysis) {
    return (
      <CenteredLayout>
        <div className="space-y-4 text-center">
          <h1 className="text-lg md:text-xl font-bold text-primary glow-text font-mono">
            {"> "}Aún no hay análisis
          </h1>
          <p className="text-sm text-muted-foreground">
            No pudimos cargar el resultado de tu espacio. Probá volver a ejecutar el análisis o regresar al inicio.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="text-xs text-accent hover:text-primary transition-colors uppercase tracking-wide"
            >
              {"<"} VOLVER AL INICIO
            </Link>
          </div>
        </div>
      </CenteredLayout>
    )
  }

  const {
    summary,
    roomCharacter,
    priorityScore,
    roomMetrics,
    frequencyResponse,
    freeChanges,
    lowBudgetChanges,
    advancedChanges,
    roomDiagram,
  } = analysis

  // Calculate total issues for badge
  const totalIssues = priorityScore.critical + priorityScore.improvements

  // Define tabs content
  const tabs = [
    {
      id: "resumen",
      label: "Resumen",
      badge: totalIssues > 0 ? totalIssues : undefined,
      content: (
        <div className="space-y-4">
          {/* Priority Score Badges */}
          <div className="flex items-center justify-center gap-3 text-[10px] font-mono flex-wrap">
            {priorityScore.critical > 0 && (
              <div className="px-3 py-1 border-2 border-destructive text-destructive bg-destructive/10">
                {priorityScore.critical} CRÍTICO{priorityScore.critical > 1 ? "S" : ""}
              </div>
            )}
            {priorityScore.improvements > 0 && (
              <div className="px-3 py-1 border-2 border-accent text-accent bg-accent/10">
                {priorityScore.improvements} MEJORA{priorityScore.improvements > 1 ? "S" : ""}
              </div>
            )}
            {priorityScore.optimizations > 0 && (
              <div className="px-3 py-1 border-2 border-primary text-primary bg-primary/10">
                {priorityScore.optimizations} OPTIMIZACION{priorityScore.optimizations > 1 ? "ES" : ""}
              </div>
            )}
          </div>

          {/* Executive Summary */}
          <div
            className="border-primary bg-card p-4 space-y-3 glow-border"
            style={{ borderWidth: "3px", borderStyle: "solid" }}
          >
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">
              [DIAGNÓSTICO GENERAL]
            </h2>
            <p className="text-foreground text-sm leading-relaxed">{summary}</p>
            <div className="flex items-center justify-between text-xs border-t border-muted-foreground/30 pt-2 mt-2 flex-wrap gap-2">
              <span className="text-muted-foreground">
                Objetivo:{" "}
                <span className="text-accent">
                  {project.goal === "music"
                    ? "Escuchar música"
                    : project.goal === "instrument"
                      ? "Tocar instrumento"
                      : project.goal === "work"
                        ? "Trabajar / concentrarme"
                        : "Sin objetivo definido"}
                </span>
              </span>
              <span className="text-muted-foreground">
                Carácter:{" "}
                <span
                  className={
                    roomCharacter === "viva"
                      ? "text-yellow-400"
                      : roomCharacter === "equilibrada"
                        ? "text-primary"
                        : "text-blue-400"
                  }
                >
                  {roomCharacter.toUpperCase()}
                </span>
              </span>
            </div>
          </div>

          {/* Room Metrics */}
          <RoomMetricsCard metrics={roomMetrics} roomCharacter={roomCharacter} />

          {/* Next Steps */}
          <div
            className="border-primary bg-card p-4 space-y-3"
            style={{ borderWidth: "3px", borderStyle: "solid" }}
          >
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">
              [PRÓXIMOS PASOS]
            </h2>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary font-bold">[1]</span>
                <span>Comenzar con cambios gratuitos esta semana</span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold">[2]</span>
                <span>Revisar recomendaciones de productos</span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold">[3]</span>
                <span>Implementar mejoras de forma gradual</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "analisis",
      label: "Análisis",
      badge: roomMetrics.roomModes.filter((m) => m.severity === "high" && m.frequency < 300).length,
      content: (
        <div className="space-y-4">
          <FrequencyResponseChart data={frequencyResponse} />
          <RoomModesChart modes={roomMetrics.roomModes} />
        </div>
      ),
    },
    {
      id: "diagrama",
      label: "Diagrama",
      content: (
        <div className="space-y-4">
          <InteractiveRoomDiagram
            diagram={roomDiagram}
            onPositionsChange={(positions) => {
              console.log('Positions changed:', positions)
              // TODO: Recalcular métricas acústicas en tiempo real
            }}
          />
        </div>
      ),
    },
    {
      id: "cambios-gratis",
      label: "Gratis",
      badge: freeChanges.items.length,
      content: (
        <div className="space-y-4">
          <RecommendationSection
            recommendations={freeChanges}
            icon="check"
            accentColor="accent"
          />
        </div>
      ),
    },
    {
      id: "productos",
      label: "Productos",
      badge: lowBudgetChanges.items.length + advancedChanges.items.length,
      content: (
        <div className="space-y-6">
          {/* Low Budget */}
          <ProductTable recommendations={lowBudgetChanges} />

          {/* Advanced */}
          <ProductTable recommendations={advancedChanges} />
        </div>
      ),
    },
    {
      id: "presupuesto",
      label: "Presupuesto",
      content: (
        <div className="space-y-4">
          <BudgetCalculator
            lowBudgetProducts={lowBudgetChanges.items}
            advancedProducts={advancedChanges.items}
            currency="ARS"
          />
        </div>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <div className="space-y-4">
          <ActionPlan
            roomCharacter={roomCharacter}
            hasBudget={true}
          />
        </div>
      ),
    },
  ]

  return (
    <CenteredLayout>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-lg md:text-xl font-bold text-primary glow-text font-mono">
          {"> "}Análisis Completo
        </h1>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {"// "}Reporte con cálculos acústicos reales
        </p>
      </div>

      {/* Tabs */}
      <RetroTabs tabs={tabs} defaultTab="resumen" />

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t border-muted-foreground/20">
        <PrimaryButton type="button" onClick={() => window.print()}>
          [IMPRIMIR / GUARDAR PDF]
        </PrimaryButton>

        <div className="text-center pt-2 space-y-2">
          <Link
            href="/objetivo"
            className="block text-xs text-primary hover:text-accent transition-colors uppercase tracking-wide"
          >
            {"↻"} ANALIZAR OTRO ESPACIO
          </Link>
          <Link
            href="/"
            className="block text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide"
          >
            {"<"} VOLVER AL INICIO
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center text-[10px] text-muted-foreground pt-4 border-t border-muted-foreground/20">
        <p>Análisis generado: {new Date(analysis.generatedAt).toLocaleString("es-AR")}</p>
        <p className="mt-1">
          Análisis estimado. Para resultados profesionales, considerar medición especializada.
        </p>
      </div>
    </CenteredLayout>
  )
}
