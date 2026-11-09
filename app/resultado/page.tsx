"use client"

import { trackPilot } from "@/lib/analytics"
import { readLocale } from "@/lib/locale"

import { Suspense, useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, RefreshCw, Download, Lock, BarChart3, Layout, ShoppingCart, Calculator, ListChecks, FileDown, X, AlertTriangle } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { Button } from "@/components/Button"
import { Tabs } from "@/components/Tabs"
import { StandingWaveMotif } from "@/components/motifs/StandingWaveMotif"
import { useRoomHydrated, useRoomStore } from "@/lib/roomStore"
import { logError } from "@/lib/logger"
import { RoomMetricsCard } from "@/components/report/RoomMetricsCard"
import { FrequencyResponseChart } from "@/components/report/FrequencyResponseChart"
import { RoomModesChart } from "@/components/report/RoomModesChart"
import { ProductTable } from "@/components/report/ProductTable"
import { LayoutTrial } from "@/components/report/LayoutTrial"
import { TodayExperiments } from "@/components/report/TodayExperiments"
import { RecommendationSection } from "@/components/report/RecommendationSection"
import { BudgetCalculator } from "@/components/report/BudgetCalculator"
import { ActionPlan } from "@/components/report/ActionPlan"
import { InfoTooltip } from "@/components/InfoTooltip"
import { useT } from "@/lib/i18n"
import { PAYWALL_ENABLED } from "@/lib/paywall"

export default function ResultadoPage() {
  return <Suspense><ResultadoContent /></Suspense>
}

function ResultadoContent() {
  const requestedId = useSearchParams().get("id")
  const analysis = useRoomStore((s) => s.analysis)
  const project = useRoomStore((s) => s.project)
  const personalization = useRoomStore(s => s.reportPersonalization)
  const projectId = useRoomStore((s) => s.projectId)
  const analysisPersisted = useRoomStore((s) => s.analysisPersisted)
  const hydrated = useRoomHydrated()
  const replaceProject = useRoomStore((s) => s.replaceProject)
  const setAnalysis = useRoomStore((s) => s.setAnalysis)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [unlockNotice, setUnlockNotice] = useState(false)
  const [rehydrating, setRehydrating] = useState(false)
  const [rehydrateFailed, setRehydrateFailed] = useState(false)
  const { t, locale } = useT()

  // The URL identifies the report even if this tab has a different report cached.
  // Replace its answers rather than merging in fields from the previous room.
  useEffect(() => {
    if (!hydrated) return
    const cached = useRoomStore.getState()
    setRehydrateFailed(false)
    setRehydrating(false)
    if (!requestedId || (cached.analysis && cached.projectId === requestedId)) return
    const controller = new AbortController()
    setRehydrating(true)
    setRehydrateFailed(false)
    fetch(`/api/projects/${encodeURIComponent(requestedId)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`Report fetch: ${res.status}`))))
      .then((data) => {
        if (controller.signal.aborted) return
        replaceProject(data.project)
        setAnalysis(data.analysis, { projectId: requestedId, persisted: true })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        logError("resultado", "could not recover the saved report", error)
        setRehydrateFailed(true)
      })
      .finally(() => { if (!controller.signal.aborted) setRehydrating(false) })
    return () => controller.abort()
  }, [requestedId, hydrated, replaceProject, setAnalysis])

  const openedReport = useRef<string | null>(null)
  useEffect(() => {
    if (!hydrated || !analysis || rehydrating || rehydrateFailed || (requestedId && requestedId !== projectId)) return
    const key = projectId ?? analysis.generatedAt
    if (openedReport.current === key) return
    openedReport.current = key
    trackPilot("report_opened", { goal: project.goal ?? "unknown", mode: project.dimensionSource ?? "measured", persisted: analysisPersisted })
  }, [hydrated, analysis, rehydrating, rehydrateFailed, requestedId, projectId, project.goal, project.dimensionSource, analysisPersisted])

  // ── PAYWALL FLAG ──
  // Dormant on purpose (see lib/paywall.ts): while the app is in open testing every
  // visitor gets the full report. The gating below (freeTabs, budget teaser, locked
  // PDF) stays wired up so it switches back on with one env var.
  // Escape hatch from Sprint 1: unlocks the report even with the paywall on. When real
  // payment lands, this is the seam where the purchase check goes.
  const forceUnlock = useMemo(() => {
    if (process.env.NEXT_PUBLIC_FORCE_UNLOCK === "true") return true
    if (typeof window !== "undefined") {
      if (new URLSearchParams(window.location.search).get("unlock") === "1") return true
      try {
        if (localStorage.getItem("roomtuner_force_unlock") === "true") return true
      } catch { /* Storage may be disabled; the default access policy still applies. */ }
    }
    return false
  }, [])
  const isUnlocked = !PAYWALL_ENABLED || forceUnlock

  // ── Track view_result_preview (once) ──
  const trackedView = useRef(false)
  useEffect(() => {
    if (!isUnlocked && analysis && !trackedView.current) {
      trackedView.current = true
      const userLocale = readLocale()
      const localCurrency: "ARS" | "USD" = userLocale === "en" ? "USD" : "ARS"
      const allProducts = [...analysis.lowBudgetChanges.items, ...analysis.advancedChanges.items]
      const localProducts = allProducts.filter((p) => p.currency === localCurrency)
      const teaserMin = localProducts.reduce((sum, p) => sum + p.totalPrice, 0)
      const va = (window as unknown as { va?: (event: string, props?: Record<string, unknown>) => void }).va
      const payload = {
        goal: project?.goal ?? "unknown",
        locale: userLocale,
        issues_total: analysis.priorityScore.critical + analysis.priorityScore.improvements,
        has_budget_teaser: localProducts.length > 0 && teaserMin > 0,
      }
      if (typeof va === "function") va("view_result_preview", payload)
      console.debug("[analytics]", "view_result_preview", payload)
    }
  })

  if (!analysis || rehydrating || rehydrateFailed || (requestedId && requestedId !== projectId)) {
    if (!hydrated || rehydrating || (requestedId && requestedId !== projectId && !rehydrateFailed)) {
      return (
        <CenteredLayout>
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">{t.resultado.rehydrating}</p>
          </div>
        </CenteredLayout>
      )
    }

    return (
      <CenteredLayout>
        <div className="space-y-4 text-center">
          <h1 className="text-lg md:text-xl font-semibold text-foreground leading-snug">
            {rehydrateFailed ? t.resultado.rehydrateFailedTitle : t.resultado.noAnalysisTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {rehydrateFailed ? t.resultado.rehydrateFailedDesc : t.resultado.noAnalysisDesc}
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
          personalization,
          locale: readLocale(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const loc = readLocale()
      a.download = `roomtuner-${loc === "en" ? "report" : "reporte"}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      trackPilot("pdf_downloaded", { mode: project.dimensionSource ?? "measured" })

      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      logError("resultado", "the PDF download failed", error)
      alert(t.resultado.pdfError)
    } finally {
      setPdfLoading(false)
    }
  }

  const {
    summary,
    roomCharacter,
    roomMetrics,
    frequencyResponse,
    freeChanges,
    lowBudgetChanges,
    advancedChanges,
    roomDiagram,
  } = analysis

  // ── Analytics helper ──
  const track = (event: string, props?: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const va = (window as any).va
    if (typeof va?.track === "function") {
      va.track(event, props)
    }
    console.debug("[analytics]", event, props)
  }

  const handleUnlock = (source: "locked_tab" | "budget_teaser" | "pdf_locked" | "other" = "other") => {
    track("click_unlock_report", {
      source,
      goal: project?.goal ?? "unknown",
    })
    setUnlockNotice(true)
    setTimeout(() => setUnlockNotice(false), 3500)
  }

  const goalLabels: Record<string, string> = {
    music: t.resultado.goalMusic,
    instrument: t.resultado.goalInstrument,
    work: t.resultado.goalWork,
  }

  // ── Budget teaser: compute range in local currency only ──
  const userLocale = typeof window !== "undefined" ? readLocale() : "es"
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

  const room =
    project.lengthM && project.widthM && project.heightM
      ? { length: project.lengthM, width: project.widthM, height: project.heightM }
      : undefined

  // ── Resumen tab content (shared between free and pro) ──
  const approximate = project.dimensionSource === "approximate"
  const planner = <LayoutTrial key={`layout-${projectId ?? analysis.generatedAt}`} reportKey={projectId ?? analysis.generatedAt} project={project} diagram={roomDiagram} roomCharacter={roomCharacter} />
  const refine = <div className="space-y-3 border border-primary/30 p-4 rounded-sm"><p className="text-sm">{t.layoutTrial.needDimensions}</p><Link className="inline-block text-sm text-primary underline min-h-11" href="/espacio?precision=1">{t.layoutTrial.refine}</Link></div>

  const resumenContent = (
    <div className="space-y-4">
      {approximate && <div className="text-xs text-primary">{t.layoutTrial.approx}</div>}
      {planner}
      {approximate && refine}
      <TodayExperiments concern={project.concern} constraints={project.moveConstraints} key={`experiments-${projectId ?? analysis.generatedAt}`} reportKey={projectId ?? analysis.generatedAt} goal={project.goal} roomCharacter={roomCharacter} />
      {!approximate && <details className="border border-border rounded-sm p-4">
        <summary className="cursor-pointer text-sm font-medium">{t.experiments.details}</summary>
        <div className="space-y-4 pt-4">
      {/* Executive Summary */}
      <div className="bg-card border border-border rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            {t.resultado.diagnosisTitle}
          </h2>
          <InfoTooltip text={t.tooltips.diagnosis} />
        </div>
        <p className="text-foreground text-sm leading-relaxed">{summary}</p>
        <div className="flex items-center justify-between text-xs border-t border-dotted border-border pt-2 mt-2 flex-wrap gap-2">
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
                  ? "text-warning"
                  : roomCharacter === "equilibrada"
                    ? "text-primary"
                    : "text-chart-3"
              }
            >
              {roomCharacter.charAt(0).toUpperCase() + roomCharacter.slice(1)}
            </span>
            <InfoTooltip text={t.tooltips.character} />
          </span>
        </div>
      </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <h3 className="font-medium text-foreground">{t.experiments.sources}</h3>
          <p>{t.experiments.geometry}</p>
          {roomMetrics.measuredRT60 && <p>{t.experiments.clap}</p>}
          {project.noiseMeasurement?.taken && <p>{t.experiments.noise}</p>}
          {!roomMetrics.measuredRT60 && !project.noiseMeasurement?.taken && <p>{t.experiments.noAudio}</p>}
        </div>
        </div>
      </details>}
      {!approximate && <details className="border border-border rounded-sm p-4">
        <summary className="cursor-pointer text-sm font-medium">{t.experiments.more}</summary>
        <div className="pt-4"><RecommendationSection recommendations={freeChanges} /></div>
      </details>}

      {/* Budget Teaser (free only) */}
      {!isUnlocked && hasBudgetTeaser && (
        <div className="bg-card border border-border rounded-sm p-4 space-y-3">
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
          <Button onClick={() => handleUnlock("budget_teaser")} variant="secondary" className="w-full flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            {t.resultado.budgetTeaserCta}
          </Button>
        </div>
      )}


    </div>
  )

  // ── Locked "Informe completo" tab content ──
  const lockedReportContent = (
    <div className="space-y-6">
      {/* Blurred teaser cards */}
      <div className="relative">
        <div className="space-y-3 blur-[6px] select-none pointer-events-none" aria-hidden>
          <div className="bg-card border border-border rounded-sm p-4 h-24" />
          <div className="bg-card border border-border rounded-sm p-4 h-32" />
          <div className="bg-card border border-border rounded-sm p-4 h-20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative bg-card border-2 border-primary p-6 max-w-sm w-full mx-4 space-y-4 text-center">
            <span aria-hidden className="absolute -top-[3px] -left-[3px] h-2 w-2 border-t-2 border-l-2 border-primary" />
            <span aria-hidden className="absolute -bottom-[3px] -right-[3px] h-2 w-2 border-b-2 border-r-2 border-primary" />
            <Lock className="w-6 h-6 text-primary mx-auto" />
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
            <Button onClick={() => handleUnlock("locked_tab")} className="w-full flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              {t.resultado.lockedCta}
            </Button>
            <p className="text-[10px] text-muted-foreground">
              {t.resultado.lockedPrice}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: "resumen", label: t.experiments.today, content: resumenContent },
    { id: "diagrama", label: t.experiments.plan, content: planner },
    ...(approximate ? [] : isUnlocked ? [
      { id: "analisis", label: t.experiments.understand, content: approximate ? refine : (
        <div className="space-y-4">
          <RoomMetricsCard metrics={roomMetrics} roomCharacter={roomCharacter} />
          <RoomModesChart modes={roomMetrics.roomModes} />
          <details className="border border-border rounded-sm p-4">
            <summary className="cursor-pointer text-sm font-medium">{t.report.frequency.title}</summary>
            <div className="pt-4"><FrequencyResponseChart data={frequencyResponse} /></div>
          </details>
        </div>
      ) },
      { id: "mejoras", label: t.experiments.invest, content: approximate ? refine : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t.experiments.purchase}</p>
          <BudgetCalculator lowBudgetProducts={lowBudgetChanges.items} advancedProducts={advancedChanges.items} />
          <details className="border border-border rounded-sm p-4">
            <summary className="cursor-pointer text-sm font-medium">{t.experiments.products}</summary>
            <div className="space-y-4 pt-4"><ProductTable recommendations={lowBudgetChanges} /><ProductTable recommendations={advancedChanges} /></div>
          </details>
          <details className="border border-border rounded-sm p-4">
            <summary className="cursor-pointer text-sm font-medium">{t.experiments.timeline}</summary>
            <p className="text-xs text-muted-foreground py-3">{t.experiments.timelineNote}</p>
            <ActionPlan roomCharacter={roomCharacter} hasBudget={true} />
          </details>
        </div>
      ) },
    ] : [{ id: "informe-completo", label: t.resultado.tabFullReport, badge: "PRO", content: lockedReportContent }]),
  ]

  return (
    <CenteredLayout>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-lg md:text-xl font-semibold text-foreground leading-snug">
          {approximate ? t.layoutTrial.quickHeading : t.resultado.title}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t.resultado.subtitle}
        </p>
        {PAYWALL_ENABLED && forceUnlock && process.env.NODE_ENV !== "production" && (
          <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded-sm bg-warning/10 text-warning border border-warning/40">
            DEV UNLOCK
          </span>
        )}
      </div>

      <StandingWaveMotif variant="hero" room={room} className="h-16 w-full" />

      {analysisPersisted && <p className="text-xs text-muted-foreground">
        {locale === "en"
          ? "Anyone with this report link can read it. Layout edits and trial notes stay in this browser; include them in the PDF to share them."
          : "Quien tenga el enlace puede leer este informe. Los ajustes del plano y las notas quedan en este navegador; incluílos en el PDF para compartirlos."}
      </p>}

      {/* The report exists only in this tab — say so, instead of letting the user find out
          by opening the link on another device. */}
      {!analysisPersisted && (
        <div className="flex items-start gap-2.5 border border-warning/40 bg-warning/5 rounded-sm px-3 py-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" strokeWidth={2} />
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground">{t.resultado.notSavedTitle}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{approximate ? t.layoutTrial.unsavedDescription : t.resultado.notSavedDesc}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="resumen" />

      {/* Unlock notice banner */}
      {unlockNotice && (
        <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground flex-1">
            {t.landing.paidComingSoon}
          </p>
          <button
            onClick={() => setUnlockNotice(false)}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t border-border">
        {!approximate && (isUnlocked ? (
          <Button
            type="button"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {pdfLoading ? t.resultado.generatingPdf : t.resultado.downloadPdf}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => {
              track("click_pdf_locked", { goal: project?.goal ?? "unknown" })
              handleUnlock("pdf_locked")
            }}
            className="w-full flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {t.resultado.pdfLocked}
          </Button>
        ))}

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
