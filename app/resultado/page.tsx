"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { ChevronLeft, RefreshCw, Download, Lock, BarChart3, Layout, ShoppingCart, Calculator, ListChecks, FileDown, Activity } from "lucide-react"
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
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [unlockNotice, setUnlockNotice] = useState(false)
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
          locale: localStorage.getItem("locale") || "es",
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const loc = localStorage.getItem("locale") || "es"
      a.download = `roomtuner-${loc === "en" ? "report" : "reporte"}-${new Date().toISOString().split('T')[0]}.pdf`
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

  // ── Measurement quality helper ──
  const getMeasurementQuality = (): "high" | "medium" | "low" => {
    const measured = roomMetrics.measuredRT60
    if (measured?.confidence === "high") return "high"
    if (measured?.confidence === "medium") return "medium"
    if (measured?.confidence === "low") return "low"
    if (measured || project.noiseMeasurement?.taken || project.measuredRT60) return "medium"
    return "low"
  }
  const measurementQuality = getMeasurementQuality()

  // ── Analytics helper ──
  const track = (event: string, props?: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const va = (window as any).va
    if (typeof va?.track === "function") {
      va.track(event, props)
    }
    console.debug("[analytics]", event, props)
  }

  // ── PAYWALL FLAG ──
  // Sprint 1: forceUnlock for dev/testing. Sprint 2: replace with real unlock check.
  const forceUnlock = useMemo(() => {
    if (process.env.NEXT_PUBLIC_FORCE_UNLOCK === "true") return true
    if (typeof window !== "undefined") {
      if (new URLSearchParams(window.location.search).get("unlock") === "1") return true
      if (localStorage.getItem("roomtuner_force_unlock") === "true") return true
    }
    return false
  }, [])
  const isUnlocked = forceUnlock

  // ── Track view_result_preview (once) ──
  const trackedView = useRef(false)
  useEffect(() => {
    if (!isUnlocked && analysis && !trackedView.current) {
      trackedView.current = true
      track("view_result_preview", {
        goal: project?.goal ?? "unknown",
        locale: localStorage.getItem("locale") || "es",
        issues_total: priorityScore.critical + priorityScore.improvements,
        has_budget_teaser: hasBudgetTeaser,
      })
    }
  })

  const handleUnlock = (source: "locked_tab" | "budget_teaser" | "pdf_locked" | "other" = "other") => {
    track("click_unlock_report", {
      source,
      goal: project?.goal ?? "unknown",
    })
    setUnlockNotice(true)
    setTimeout(() => setUnlockNotice(false), 3500)
  }

  const totalIssues = priorityScore.critical + priorityScore.improvements

  const goalLabels: Record<string, string> = {
    music: t.resultado.goalMusic,
    instrument: t.resultado.goalInstrument,
    work: t.resultado.goalWork,
  }

  // ── Budget teaser: compute range in local currency only ──
  const userLocale = typeof window !== "undefined" ? localStorage.getItem("locale") || "es" : "es"
  const localCurrency: "ARS" | "USD" = userLocale === "en" ? "USD" : "ARS"

  const allProducts = [...lowBudgetChanges.items, ...advancedChanges.items]
  const localProducts = allProducts.filter((p) => p.currency === localCurrency)

  const teaserMin = localProducts.reduce((sum, p) => sum + p.totalPrice, 0)
  const teaserMax = Math.round(teaserMin * 1.3) // +30% margen estimado
  const hasBudgetTeaser = localProducts.length > 0 && teaserMin > 0

  const formatBudget = (value: number) => {
    if (localCurrency === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
    }
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value)
  }

  // ── Resumen tab content (shared between free and pro) ──
  const resumenContent = (
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

      {/* Measurement Quality */}
      <div className="bg-card rounded-2xl card-shadow border border-border/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              {t.resultado.measurementQualityTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
              measurementQuality === "high"
                ? "bg-primary/10 text-primary"
                : measurementQuality === "medium"
                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  : "bg-destructive/10 text-destructive"
            }`}>
              {measurementQuality === "high"
                ? t.resultado.measurementQualityHighLabel
                : measurementQuality === "medium"
                  ? t.resultado.measurementQualityMediumLabel
                  : t.resultado.measurementQualityLowLabel}
            </span>
            <InfoTooltip text={t.resultado.measurementQualityTooltip} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {measurementQuality === "high"
            ? t.resultado.measurementQualityHighDesc
            : measurementQuality === "medium"
              ? t.resultado.measurementQualityMediumDesc
              : t.resultado.measurementQualityLowDesc}
        </p>
        <ul className="space-y-1.5 text-xs text-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            {measurementQuality === "high"
              ? t.resultado.measurementQualityHighTip1
              : measurementQuality === "medium"
                ? t.resultado.measurementQualityMediumTip1
                : t.resultado.measurementQualityLowTip1}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            {measurementQuality === "high"
              ? t.resultado.measurementQualityHighTip2
              : measurementQuality === "medium"
                ? t.resultado.measurementQualityMediumTip2
                : t.resultado.measurementQualityLowTip2}
          </li>
        </ul>
      </div>

      {/* Budget Teaser (free only) */}
      {!isUnlocked && hasBudgetTeaser && (
        <div className="bg-card rounded-2xl card-shadow border border-border/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {t.resultado.budgetTeaserLabel}
            </h2>
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground text-center py-2">
            {t.resultado.budgetTeaserRange
              .replace("{min}", formatBudget(teaserMin))
              .replace("{max}", formatBudget(teaserMax))}
          </p>
          <p className="text-[10px] text-muted-foreground text-center">
            {t.resultado.budgetTeaserDisclaimer.replace("{currency}", localCurrency)}
          </p>
          <button
            onClick={() => handleUnlock("budget_teaser")}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border-2 border-primary text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3 h-3" />
            {t.resultado.budgetTeaserCta}
          </button>
        </div>
      )}

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
  )

  // ── Locked "Informe completo" tab content ──
  const lockedReportContent = (
    <div className="space-y-6">
      {/* Blurred teaser cards */}
      <div className="relative">
        <div className="space-y-3 blur-[6px] select-none pointer-events-none" aria-hidden>
          <div className="bg-card rounded-2xl border border-border/50 p-4 h-24" />
          <div className="bg-card rounded-2xl border border-border/50 p-4 h-32" />
          <div className="bg-card rounded-2xl border border-border/50 p-4 h-20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-card rounded-2xl card-shadow border-2 border-primary/20 p-6 max-w-sm w-full mx-4 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {t.resultado.lockedTitle}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t.resultado.lockedSubtitle}
            </p>
            <ul className="space-y-2 text-left">
              {[
                { icon: BarChart3, text: t.resultado.lockedBullet1 },
                { icon: Layout, text: t.resultado.lockedBullet2 },
                { icon: ShoppingCart, text: t.resultado.lockedBullet3 },
                { icon: Calculator, text: t.resultado.lockedBullet4 },
                { icon: ListChecks, text: t.resultado.lockedBullet5 },
                { icon: FileDown, text: t.resultado.lockedBullet6 },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <item.icon className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" strokeWidth={2} />
                  {item.text}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUnlock("locked_tab")}
              className="w-full py-3 px-4 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              {t.resultado.lockedCta}
            </button>
            <p className="text-[10px] text-muted-foreground">
              {t.resultado.lockedPrice}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Pro tabs (all original tabs) ──
  const proTabs = [
    {
      id: "resumen",
      label: t.resultado.tabSummary,
      badge: totalIssues > 0 ? totalIssues : undefined,
      content: resumenContent,
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
            roomModes={roomMetrics.roomModes}
            showHeatmap={showHeatmap}
            onToggleHeatmap={() => setShowHeatmap(prev => !prev)}
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

  // ── Free tabs (limited) ──
  const freeTabs = [
    {
      id: "resumen",
      label: t.resultado.tabSummary,
      badge: totalIssues > 0 ? totalIssues : undefined,
      content: resumenContent,
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
      id: "informe-completo",
      label: t.resultado.tabFullReport,
      badge: "PRO",
      content: lockedReportContent,
    },
  ]

  const tabs = isUnlocked ? proTabs : freeTabs

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
        {forceUnlock && process.env.NODE_ENV !== "production" && (
          <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-yellow-400/20 text-yellow-600 border border-yellow-400/40">
            DEV UNLOCK
          </span>
        )}
      </div>

      {/* Tabs */}
      <RetroTabs tabs={tabs} defaultTab="resumen" />

      {/* Unlock notice banner */}
      {unlockNotice && (
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground flex-1">
            {t.landing.paidComingSoon}
          </p>
          <button
            onClick={() => setUnlockNotice(false)}
            className="text-muted-foreground hover:text-foreground text-xs shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t border-border">
        {isUnlocked ? (
          <PrimaryButton
            type="button"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {pdfLoading ? t.resultado.generatingPdf : t.resultado.downloadPdf}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            type="button"
            onClick={() => {
              track("click_pdf_locked", { goal: project?.goal ?? "unknown" })
              handleUnlock("pdf_locked")
            }}
            className="flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {t.resultado.pdfLocked}
          </PrimaryButton>
        )}

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
