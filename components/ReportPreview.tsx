"use client"

import { mockAnalysis, mockProject } from "@/lib/mockData"
import { Check, TrendingUp, Package } from "lucide-react"
import { useT } from "@/lib/i18n"
import { Tabs, type Tab } from "@/components/Tabs"

export function ReportPreview() {
  const { t } = useT()

  const { summary, roomCharacter, priorityScore, roomMetrics, lowBudgetChanges, freeChanges } =
    mockAnalysis

  const totalIssues = priorityScore.critical + priorityScore.improvements

  const resumenContent = (
    <div className="space-y-4">
      {/* Priority Badges */}
      <div className="flex items-center justify-center gap-2 text-[10px] flex-wrap">
        {priorityScore.critical > 0 && (
          <span className="px-2.5 py-1 border border-destructive/30 text-destructive font-medium">
            {priorityScore.critical} {priorityScore.critical > 1 ? t.reportPreview.criticalPlural : t.reportPreview.criticalSingular}
          </span>
        )}
        {priorityScore.improvements > 0 && (
          <span className="px-2.5 py-1 border border-warning/30 text-warning font-medium">
            {priorityScore.improvements} {priorityScore.improvements > 1 ? t.reportPreview.improvementPlural : t.reportPreview.improvementSingular}
          </span>
        )}
        {priorityScore.optimizations > 0 && (
          <span className="px-2.5 py-1 border border-primary/30 text-primary font-medium">
            {priorityScore.optimizations} {priorityScore.optimizations > 1 ? t.reportPreview.optimizationPlural : t.reportPreview.optimizationSingular}
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="border border-border p-3 space-y-3">
        <h3 className="text-xs font-semibold text-foreground">{t.reportPreview.diagnosis}</h3>
        <p className="text-foreground text-xs leading-relaxed">{summary}</p>
        <div className="flex items-center justify-between text-[10px] border-t border-dotted border-border pt-2 mt-2 flex-wrap gap-2">
          <span className="text-muted-foreground">
            {t.reportPreview.goalLabel} <span className="text-primary font-medium">{t.reportPreview.goalMusic}</span>
          </span>
          <span className="text-muted-foreground">
            {t.reportPreview.characterLabel}{" "}
            <span
              className={`font-medium ${
                roomCharacter === "viva"
                  ? "text-warning"
                  : roomCharacter === "equilibrada"
                    ? "text-primary"
                    : "text-chart-3"
              }`}
            >
              {roomCharacter.charAt(0).toUpperCase() + roomCharacter.slice(1)}
            </span>
          </span>
        </div>
      </div>

      {/* Room Metrics */}
      <div className="grid grid-cols-2 gap-px bg-border border border-border">
        {[
          { label: t.reportPreview.volume, value: `${roomMetrics.volume.toFixed(1)} m³` },
          { label: t.reportPreview.floorArea, value: `${roomMetrics.floorArea.toFixed(1)} m²` },
          { label: t.reportPreview.rt60Mid, value: `${roomMetrics.rt60Estimate.mid.toFixed(2)}s` },
          { label: t.reportPreview.absorption, value: `${roomMetrics.totalAbsorption.toFixed(1)} sabins` },
        ].map((metric) => (
          <div key={metric.label} className="bg-card p-2.5">
            <p className="text-[10px] text-muted-foreground">{metric.label}</p>
            <p className="text-sm font-semibold text-foreground font-mono">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Free Changes Preview */}
      <div className="border border-primary/25 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
          <h3 className="text-xs font-semibold text-foreground">
            {t.reportPreview.freeChanges} ({freeChanges.items.length})
          </h3>
        </div>
        <ul className="space-y-1.5">
          {freeChanges.items.slice(0, 3).map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[11px] text-foreground">
              <span className="text-primary font-semibold font-mono">{idx + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {freeChanges.items.length > 3 && (
          <p className="text-[10px] text-muted-foreground pt-1">
            + {freeChanges.items.length - 3} {t.reportPreview.moreChanges}
          </p>
        )}
      </div>
    </div>
  )

  const analisisContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t.reportPreview.analysisHeading}</h3>
      </div>

      {/* RT60 */}
      <div className="border border-border p-3 space-y-2">
        <h4 className="text-xs font-semibold text-foreground">
          {t.reportPreview.rt60Title}
        </h4>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{t.reportPreview.rt60Bass}</span>
            <span
              className={`font-semibold font-mono ${roomMetrics.rt60Estimate.low > 0.6 ? "text-destructive" : "text-foreground"}`}
            >
              {roomMetrics.rt60Estimate.low.toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{t.reportPreview.rt60Mid2}</span>
            <span
              className={`font-semibold font-mono ${roomMetrics.rt60Estimate.mid > 0.5 ? "text-destructive" : "text-foreground"}`}
            >
              {roomMetrics.rt60Estimate.mid.toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{t.reportPreview.rt60Treble}</span>
            <span className="font-semibold font-mono text-foreground">
              {roomMetrics.rt60Estimate.high.toFixed(2)}s
            </span>
          </div>
        </div>
      </div>

      {/* Room Modes */}
      <div className="border border-border p-3 space-y-2">
        <h4 className="text-xs font-semibold text-foreground">
          {t.reportPreview.roomModesTitle}
        </h4>
        <div className="space-y-1">
          {roomMetrics.roomModes.slice(0, 5).map((mode, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-[11px] py-1.5 border-b border-dotted border-border last:border-0"
            >
              <span className="font-semibold text-foreground font-mono">{mode.frequency.toFixed(0)} Hz</span>
              <span className="text-muted-foreground capitalize">{mode.type}</span>
              <span className="text-muted-foreground capitalize">{mode.dimension}</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-medium border ${
                  mode.severity === "high"
                    ? "border-destructive/30 text-destructive"
                    : mode.severity === "medium"
                      ? "border-warning/30 text-warning"
                      : "border-primary/30 text-primary"
                }`}
              >
                {mode.severity === "high"
                  ? t.reportPreview.severityHigh
                  : mode.severity === "medium"
                    ? t.reportPreview.severityMedium
                    : t.reportPreview.severityLow}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info line */}
      <div className="flex items-start gap-2.5 py-1">
        <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full border border-primary" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="mr-1.5 font-mono text-[10px] uppercase tracking-wide text-primary">{t.common.tip}</span>
          {t.reportPreview.tip}
        </p>
      </div>
    </div>
  )

  const productosContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Package className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          {lowBudgetChanges.title}
        </h3>
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {lowBudgetChanges.items.map((product, idx) => (
          <div key={idx} className="border border-border p-3 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{product.product}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {product.category} · {product.placement}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground font-mono">
                  ${product.unitPrice.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">x{product.quantity}</p>
              </div>
            </div>

            {/* Impact & Installation */}
            <div className="flex items-center gap-2 text-[10px]">
              <span
                className={`px-2 py-0.5 font-medium border ${
                  product.impactLevel === "high" ? "border-primary/30 text-primary" : "border-warning/30 text-warning"
                }`}
              >
                {t.report.products.impactLabel} {product.impactLevel === "high" ? t.reportPreview.impactHigh : product.impactLevel === "medium" ? t.reportPreview.impactMedium : t.reportPreview.impactLow}
              </span>
              <span className="text-muted-foreground">
                {t.reportPreview.installation} {product.installation}
              </span>
            </div>

            {/* Total */}
            <div className="border-t border-dotted border-border pt-2 flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground">{t.reportPreview.total}</span>
              <span className="text-sm font-semibold text-foreground font-mono">
                ${product.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Summary */}
      <div className="border border-primary/25 p-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-foreground">
            {t.reportPreview.budgetTotal}
          </span>
          <span className="text-base font-semibold text-primary font-mono">
            ${lowBudgetChanges.totalEstimatedCost.min.toLocaleString()} -{" "}
            ${lowBudgetChanges.totalEstimatedCost.max.toLocaleString()}{" "}
            {lowBudgetChanges.totalEstimatedCost.currency}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          {t.reportPreview.priceSource}
        </p>
      </div>
    </div>
  )

  const tabs: Tab[] = [
    { id: "resumen", label: t.reportPreview.tabSummary, badge: totalIssues > 0 ? totalIssues : undefined, content: resumenContent },
    { id: "analisis", label: t.reportPreview.tabAnalysis, content: analisisContent },
    { id: "productos", label: t.reportPreview.tabProducts, badge: lowBudgetChanges.items.length, content: productosContent },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-5">
        <span className="inline-block border border-primary/30 text-primary px-3 py-1 text-xs font-mono uppercase tracking-wide mb-3">
          {t.reportPreview.badge}
        </span>
        <p className="text-xs text-muted-foreground font-mono">
          {t.reportPreview.example} {mockProject.lengthM}m x {mockProject.widthM}m x{" "}
          {mockProject.heightM}m
        </p>
      </div>

      <div className="border border-border bg-card p-4 md:p-6">
        <Tabs tabs={tabs} defaultTab="resumen" />
      </div>

      {/* Footer Note */}
      <div className="text-center mt-4">
        <p className="text-[10px] text-muted-foreground">
          {t.reportPreview.footerNote}
        </p>
      </div>
    </div>
  )
}
