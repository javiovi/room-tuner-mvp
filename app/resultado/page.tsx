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
import { InfoTooltip } from "@/components/InfoTooltip"
import { useT } from "@/lib/i18n"

export default function ResultadoPage() {
  const analysis = useRoomStore((s) => s.analysis)
  const project = useRoomStore((s) => s.project)
  const updatePositions = useRoomStore((s) => s.updatePositions)
  const [pdfLoading, setPdfLoading] = useState(false)
  const { t } = useT()

  if (!analysis) {
    return (
      <CenteredLayout>
        <div className="space-y-4 text-center">
          <h1 className="text-lg md:text-xl font-semibold text-foreground leading-snug">
            {t.resultado.noAnalysisTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.resultado.noAnalysisDesc}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.common.backToHome}
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
      alert(t.resultado.pdfError)
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

  const goalLabels: Record<string, string> = {
    music: t.resultado.goalMusic,
    instrument: t.resultado.goalInstrument,
    work: t.resultado.goalWork,
  }

  const tabs = [
    {
      id: "resumen",
      label: t.resultado.tabSummary,
      badge: totalIssues > 0 ? totalIssues : undefined,
      content: (
        <div className="space-y-4">
          {/* Priority Score Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {priorityScore.critical > 0 && (
              <div className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                {priorityScore.critical} {priorityScore.critical > 1 ? t.resultado.criticalPlural : t.resultado.criticalSingular}
              </div>
            )}
            {priorityScore.improvements > 0 && (
              <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
                {priorityScore.improvements} {priorityScore.improvements > 1 ? t.resultado.improvementPlural : t.resultado.improvementSingular}
              </div>
            )}
            {priorityScore.optimizations > 0 && (
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {priorityScore.optimizations} {priorityScore.optimizations > 1 ? t.resultado.optimizationPlural : t.resultado.optimizationSingular}
              </div>
            )}
          </div>

          {/* Executive Summary */}
          <div className="bg-card rounded-2xl card-shadow border border-border/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                {t.resultado.diagnosisTitle}
              </h2>
              <InfoTooltip text={t.tooltips.diagnosis} />
            </div>
            <p className="text-foreground text-sm leading-relaxed">{summary}</p>
            <div className="flex items-center justify-between text-xs border-t border-border pt-2 mt-2 flex-wrap gap-2">
              <span className="text-muted-foreground">
                {t.resultado.goalLabel}{" "}
                <span className="text-foreground font-medium">
                  {goalLabels[project.goal ?? ""] ?? t.resultado.goalUndefined}
                </span>
              </span>
              <span className="text-muted-foreground inline-flex items-center gap-1">
                {t.resultado.characterLabel}{" "}
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
                <InfoTooltip text={t.tooltips.character} />
              </span>
            </div>
          </div>

          {/* Room Metrics */}
          <RoomMetricsCard metrics={roomMetrics} roomCharacter={roomCharacter} />

          {/* Next Steps */}
          <div className="bg-card rounded-2xl card-shadow border border-border/50 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">
              {t.resultado.nextStepsTitle}
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="text-primary font-semibold">1.</span>
                <span>{t.resultado.nextStep1}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-semibold">2.</span>
                <span>{t.resultado.nextStep2}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-semibold">3.</span>
                <span>{t.resultado.nextStep3}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "analisis",
      label: t.resultado.tabAnalysis,
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
      label: t.resultado.tabDiagram,
      content: (
        <div className="space-y-4">
          <InteractiveRoomDiagram
            diagram={roomDiagram}
            onPositionsChange={(positions) => {
              updatePositions(
                { speakers: positions.speakers, listeningPosition: positions.listeningPosition },
                positions.furnitureLayout
              )
            }}
          />
        </div>
      ),
    },
    {
      id: "cambios-gratis",
      label: t.resultado.tabFree,
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
      label: t.resultado.tabProducts,
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
      label: t.resultado.tabBudget,
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
      label: t.resultado.tabPlan,
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
        <h1 className="text-lg md:text-xl font-semibold text-foreground leading-snug">
          {t.resultado.title}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t.resultado.subtitle}
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
          {pdfLoading ? t.resultado.generatingPdf : t.resultado.downloadPdf}
        </PrimaryButton>

        <div className="text-center pt-2 space-y-2">
          <Link
            href="/objetivo"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t.common.analyzeAnother}
          </Link>
          <Link
            href="/"
            className="inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors items-center gap-1 justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.common.backToHome}
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
        <p>{t.resultado.generatedAt} {new Date(analysis.generatedAt).toLocaleString("es-AR")}</p>
        <p className="mt-1">
          {t.resultado.disclaimer}
        </p>
      </div>
    </CenteredLayout>
  )
}
