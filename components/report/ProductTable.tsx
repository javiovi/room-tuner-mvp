"use client"

import type { ProductRecommendationBlock } from "@/app/types/room"
import { useT } from "@/lib/i18n"
import { MapPin, CheckCircle2, Zap, AlertTriangle, type LucideIcon } from "lucide-react"
import { InfoCallout } from "@/components/InfoCallout"

interface ProductTableProps {
  recommendations: ProductRecommendationBlock
  title?: string
}

export function ProductTable({ recommendations, title }: ProductTableProps) {
  const { items, totalEstimatedCost } = recommendations
  const { t } = useT()

  if (!items || items.length === 0) return null

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const categoryLabels: Record<string, string> = {
    absorber: t.report.products.categoryAbsorber,
    bass_trap: t.report.products.categoryBassTrap,
    diffuser: t.report.products.categoryDiffuser,
    rug: t.report.products.categoryRug,
    curtain: t.report.products.categoryCurtain,
    misc: t.report.products.categoryOther,
  }

  const impactColors = { high: "text-destructive", medium: "text-warning", low: "text-muted-foreground" }
  const impactLabels = { high: t.report.products.impactHigh, medium: t.report.products.impactMedium, low: t.report.products.impactLow }
  const installIcons: Record<string, LucideIcon> = { easy: CheckCircle2, moderate: Zap, professional: AlertTriangle }
  const installTextLabels: Record<string, string> = {
    easy: t.report.products.installEasy,
    moderate: t.report.products.installModerate,
    professional: t.report.products.installProfessional,
  }

  return (
    <div className="bg-card border border-border rounded-sm p-5 space-y-4">
      <div className="flex items-start justify-between">
        <h2 className="text-sm font-semibold text-foreground">{title || recommendations.title}</h2>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{t.report.products.estimatedCost}</div>
          <div className="text-lg font-semibold text-foreground font-mono">
            {totalEstimatedCost.currency === "USD" ? "$" : "ARS $"}{totalEstimatedCost.min.toLocaleString()} - {totalEstimatedCost.max.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([category, products]) => (
          <div key={category} className="space-y-2">
            <div className="border-b border-border pb-1">
              <h3 className="text-xs font-medium text-foreground">{categoryLabels[category] || category}</h3>
            </div>
            <div className="space-y-2">
              {products.map((product, idx) => {
                const InstallIcon = installIcons[product.installation] ?? CheckCircle2
                const installLabel = installTextLabels[product.installation] ?? product.installation
                return (
                  <div key={idx} className="rounded-sm border border-border bg-card p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-foreground">{product.product}</h4>
                        {product.link && (
                          <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary/80 transition-colors mt-1 inline-block">
                            {product.supplier} →
                          </a>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-foreground font-mono">
                          {product.currency === "USD" ? "$" : "ARS $"}{product.totalPrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.quantity}x {product.currency === "USD" ? "$" : "ARS $"}{product.unitPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.5} /> {product.placement}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs">
                      <span className={`font-medium ${impactColors[product.impactLevel]}`}>{t.report.products.impactLabel} {impactLabels[product.impactLevel]}</span>
                      <span className="text-muted-foreground inline-flex items-center gap-1">
                        <InstallIcon className="w-3 h-3 shrink-0" strokeWidth={1.5} /> {installLabel}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{t.report.products.totalOf} {items.length} {t.report.products.products}</div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{t.report.products.investmentRange}</div>
          <div className="text-xl font-semibold text-foreground font-mono">
            {totalEstimatedCost.currency === "USD" ? "$" : "ARS $"}{totalEstimatedCost.min.toLocaleString()} - {totalEstimatedCost.currency === "USD" ? "$" : "ARS $"}{totalEstimatedCost.max.toLocaleString()}
          </div>
        </div>
      </div>

      <InfoCallout label={t.common.note}>{t.report.products.noteText}</InfoCallout>
    </div>
  )
}
