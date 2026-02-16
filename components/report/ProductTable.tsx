"use client"

import type { ProductRecommendationBlock } from "@/app/types/room"

interface ProductTableProps {
  recommendations: ProductRecommendationBlock
  title?: string
}

export function ProductTable({ recommendations, title }: ProductTableProps) {
  const { items, totalEstimatedCost } = recommendations

  if (!items || items.length === 0) return null

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const categoryLabels: Record<string, string> = {
    absorber: "Paneles Absorbentes", bass_trap: "Trampas de Graves", diffuser: "Difusores",
    rug: "Alfombras", curtain: "Cortinas", misc: "Otros",
  }

  const impactColors = { high: "text-destructive", medium: "text-yellow-600 dark:text-yellow-400", low: "text-muted-foreground" }
  const impactLabels = { high: "Alta", medium: "Media", low: "Baja" }

  return (
    <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <h2 className="text-sm font-semibold text-foreground">{title || recommendations.title}</h2>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Costo estimado</div>
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
              {products.map((product, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-card p-3 hover:bg-muted/50 transition-colors">
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
                  <div className="text-xs text-muted-foreground mb-2">📍 {product.placement}</div>
                  <div className="flex items-center gap-3 flex-wrap text-xs">
                    <span className={`font-medium ${impactColors[product.impactLevel]}`}>Impacto: {impactLabels[product.impactLevel]}</span>
                    <span className="text-muted-foreground">
                      {product.installation === "easy" ? "✓ Fácil" : product.installation === "moderate" ? "⚡ Moderada" : "⚠ Profesional"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Total de {items.length} productos</div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Rango de inversión</div>
          <div className="text-xl font-semibold text-foreground font-mono">
            {totalEstimatedCost.currency === "USD" ? "$" : "ARS $"}{totalEstimatedCost.min.toLocaleString()} - {totalEstimatedCost.currency === "USD" ? "$" : "ARS $"}{totalEstimatedCost.max.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="p-3 bg-muted rounded-xl text-xs text-muted-foreground">
        <span className="text-foreground font-medium">Nota:</span> Los precios son estimados y pueden variar según proveedor y ubicación.
      </div>
    </div>
  )
}
