"use client"

import type { EnhancedAnalysisResponse } from "@/app/types/room"
import { InfoTooltip } from "@/components/InfoTooltip"
import { useT } from "@/lib/i18n"

interface RoomMetricsCardProps {
  metrics: EnhancedAnalysisResponse["roomMetrics"]
  roomCharacter: "viva" | "equilibrada" | "seca"
}

export function RoomMetricsCard({ metrics, roomCharacter }: RoomMetricsCardProps) {
  const { t } = useT()

  const characterColors = {
    viva: "text-yellow-600 dark:text-yellow-400",
    equilibrada: "text-primary",
    seca: "text-blue-500 dark:text-blue-400",
  }

  const characterLabels = {
    viva: t.report.metrics.characterViva,
    equilibrada: t.report.metrics.characterEquilibrada,
    seca: t.report.metrics.characterSeca,
  }

  return (
    <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-semibold text-foreground">{t.report.metrics.title}</h2>
          <InfoTooltip text={t.tooltips.metricsCard} />
        </div>
        <span className={`text-xs font-medium ${characterColors[roomCharacter]}`}>
          {characterLabels[roomCharacter]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricItem label={t.report.metrics.volume} value={`${metrics.volume.toFixed(1)} m³`} />
        <MetricItem label={t.report.metrics.floorArea} value={`${metrics.floorArea.toFixed(1)} m²`} />
        <MetricItem label={t.report.metrics.wallArea} value={`${metrics.wallArea.toFixed(1)} m²`} />
        <MetricItem label={t.report.metrics.surfaceArea} value={`${metrics.surfaceArea.toFixed(1)} m²`} />
      </div>

      <div className="border-t border-border pt-3 mt-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-medium text-foreground">{t.report.metrics.rt60Title}</h3>
          <InfoTooltip text={t.tooltips.rt60} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <RT60Badge label={t.report.metrics.low} value={metrics.rt60Estimate.low} tooltip={t.tooltips.rt60Low} />
          <RT60Badge label={t.report.metrics.mid} value={metrics.rt60Estimate.mid} tooltip={t.tooltips.rt60Mid} />
          <RT60Badge label={t.report.metrics.high} value={metrics.rt60Estimate.high} tooltip={t.tooltips.rt60High} />
        </div>
        <EvaluationBadge evaluation={metrics.rt60Evaluation} />
      </div>

      <div className="border-t border-border pt-3 mt-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-medium text-foreground">{t.report.metrics.proportions}</h3>
          <InfoTooltip text={t.tooltips.proportions} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {(["lengthWidth", "lengthHeight", "widthHeight"] as const).map((key) => {
            const labels = { lengthWidth: "L:W", lengthHeight: "L:H", widthHeight: "W:H" }
            return (
              <div key={key} className="text-center bg-muted rounded-lg p-2">
                <div className="text-muted-foreground text-xs">{labels[key]}</div>
                <div className="text-foreground font-semibold font-mono">{metrics.ratios[key].toFixed(2)}</div>
              </div>
            )
          })}
        </div>
        <div className={`text-xs text-center mt-2 ${
          metrics.ratios.rating === "good" ? "text-primary" :
          metrics.ratios.rating === "acceptable" ? "text-yellow-600 dark:text-yellow-400" :
          "text-destructive"
        }`}>
          {metrics.ratios.message}
        </div>
      </div>

      {metrics.roomModes.filter(m => m.severity === "high" && m.frequency < 300).length > 0 && (
        <div className="border-t border-border pt-3 mt-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-medium text-destructive">{t.report.metrics.problematicModes}</h3>
            <InfoTooltip text={t.tooltips.problematicModes} />
          </div>
          <div className="space-y-1">
            {metrics.roomModes
              .filter(m => m.severity === "high" && m.frequency < 300)
              .slice(0, 5)
              .map((mode, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{mode.description}</span>
                  <span className="text-destructive font-medium font-mono">{mode.frequency.toFixed(0)} Hz</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold text-foreground font-mono">{value}</div>
    </div>
  )
}

function RT60Badge({ label, value, tooltip }: { label: string; value: number; tooltip?: string }) {
  const getColor = (rt60: number) => {
    if (rt60 < 0.2) return "text-blue-500 dark:text-blue-400"
    if (rt60 < 0.6) return "text-primary"
    if (rt60 < 0.8) return "text-yellow-600 dark:text-yellow-400"
    return "text-destructive"
  }

  return (
    <div className="text-center space-y-1 bg-muted rounded-lg p-2">
      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className={`text-sm font-semibold font-mono ${getColor(value)}`}>{value.toFixed(2)}s</div>
    </div>
  )
}

function EvaluationBadge({ evaluation }: { evaluation: { rating: string; message: string } }) {
  const colors = {
    good: "bg-primary/10 text-primary border-primary/20",
    acceptable: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    problematic: "bg-destructive/10 text-destructive border-destructive/20",
  }
  const icons = { good: "✓", acceptable: "!", problematic: "⚠" }
  const colorClass = colors[evaluation.rating as keyof typeof colors] || colors.acceptable

  return (
    <div className={`${colorClass} border rounded-xl p-2 text-center text-xs font-medium`}>
      <span className="mr-1">{icons[evaluation.rating as keyof typeof icons]}</span>
      {evaluation.message}
    </div>
  )
}
