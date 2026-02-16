"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, RefreshCw, Download } from "lucide-react"
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
  const [pdfLoading, setPdfLoading] = useState(false)

  if (!analysis) {
    return (
      <CenteredLayout>
        <div className="space-y-4 text-center">
          <h1 className="text-lg md:text-xl font-semibold text-foreground">
            Aún no hay análisis
          </h1>
          <p className="text-sm text-muted-foreground">
            No pudimos cargar el resultado de tu espacio. Probá volver a ejecutar el análisis o regresar al inicio.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </CenteredLayout>
    )
  }

  const handleDownloadPDF = async () => {
    if (!analysis || !project) return

    setPdfLoading(true)
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project,
          analysis,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `roomtuner-reporte-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error al generar el PDF. Por favor intenta nuevamente.')
    } finally {
      setPdfLoading(false)
    }
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

  const totalIssues = priorityScore.critical + priorityScore.improvements

  const tabs = [
    {
      id: "resumen",
      label: "Resumen",
      badge: totalIssues > 0 ? totalIssues : undefined,
      content: (
        <div className="space-y-4">
          {/* Priority Score Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {priorityScore.critical > 0 && (
              <div className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                {priorityScore.critical} crítico{priorityScore.critical > 1 ? "s" : ""}
              </div>
            )}
            {priorityScore.improvements > 0 && (
              <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
                {priorityScore.improvements} mejora{priorityScore.improvements > 1 ? "s" : ""}
              </div>
            )}
            {priorityScore.optimizations > 0 && (
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {priorityScore.optimizations} optimizacion{priorityScore.optimizations > 1 ? "es" : ""}
              </div>
            )}
          </div>

          {/* Executive Summary */}
          <div className="bg-card rounded-2xl card-shadow border border-border/50 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">
              Diagnóstico general
            </h2>
            <p className="text-foreground text-sm leading-relaxed">{summary}</p>
            <div className="flex items-center justify-between text-xs border-t border-border pt-2 mt-2 flex-wrap gap-2">
              <span className="text-muted-foreground">
                Objetivo:{" "}
                <span className="text-foreground font-medium">
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
                      ? "text-yellow-600 dark:text-yellow-400"
                      : roomCharacter === "equilibrada"
                        ? "text-primary"
                        : "text-blue-500 dark:text-blue-400"
                  }
                >
                  {roomCharacter.charAt(0).toUpperCase() + roomCharacter.slice(1)}
                </span>
              </span>
            </div>
          </div>

          {/* Room Metrics */}
          <RoomMetricsCard metrics={roomMetrics} roomCharacter={roomCharacter} />

          {/* Next Steps */}
          <div className="bg-card rounded-2xl card-shadow border border-border/50 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">
              Próximos pasos
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="text-primary font-semibold">1.</span>
                <span>Comenzar con cambios gratuitos esta semana</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-semibold">2.</span>
                <span>Revisar recomendaciones de productos</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-semibold">3.</span>
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
          <ProductTable recommendations={lowBudgetChanges} />
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
        <h1 className="text-lg md:text-xl font-semibold text-foreground">
          Análisis Completo
        </h1>
        <p className="text-xs text-muted-foreground">
          Reporte con cálculos acústicos reales
        </p>
      </div>

      {/* Tabs */}
      <RetroTabs tabs={tabs} defaultTab="resumen" />

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t border-border">
        <PrimaryButton
          type="button"
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          {pdfLoading ? 'Generando PDF...' : 'Descargar PDF'}
        </PrimaryButton>

        <div className="text-center pt-2 space-y-2">
          <Link
            href="/objetivo"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Analizar otro espacio
          </Link>
          <Link
            href="/"
            className="inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors items-center gap-1 justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
        <p>Análisis generado: {new Date(analysis.generatedAt).toLocaleString("es-AR")}</p>
        <p className="mt-1">
          Análisis estimado. Para resultados profesionales, considerar medición especializada.
        </p>
      </div>
    </CenteredLayout>
  )
}
