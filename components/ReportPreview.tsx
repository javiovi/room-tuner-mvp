"use client"

import { useState } from "react"
import { mockAnalysis, mockProject } from "@/lib/mockData"
import { Check, TrendingUp, Package } from "lucide-react"

export function ReportPreview() {
  const [activeTab, setActiveTab] = useState<"resumen" | "analisis" | "productos">("resumen")

  const { summary, roomCharacter, priorityScore, roomMetrics, lowBudgetChanges, freeChanges } =
    mockAnalysis

  const totalIssues = priorityScore.critical + priorityScore.improvements

  const tabs = [
    { key: "resumen" as const, label: "Resumen", badge: totalIssues > 0 ? totalIssues : undefined, badgeColor: "bg-destructive text-white" },
    { key: "analisis" as const, label: "Análisis" },
    { key: "productos" as const, label: "Productos", badge: lowBudgetChanges.items.length, badgeColor: "bg-primary/10 text-primary" },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-5">
        <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-medium mb-3">
          Preview del informe
        </span>
        <p className="text-xs text-muted-foreground">
          Ejemplo con un espacio de {mockProject.lengthM}m x {mockProject.widthM}m x{" "}
          {mockProject.heightM}m
        </p>
      </div>

      {/* Segmented Tabs */}
      <div className="flex bg-muted rounded-xl p-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                activeTab === tab.key ? "bg-white/20 text-primary-foreground" : tab.badgeColor
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl card-shadow border border-border/50 bg-card p-4 md:p-6 min-h-[400px]">
        {/* Resumen Tab */}
        {activeTab === "resumen" && (
          <div className="space-y-4">
            {/* Priority Badges */}
            <div className="flex items-center justify-center gap-2 text-[10px] flex-wrap">
              {priorityScore.critical > 0 && (
                <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive font-medium">
                  {priorityScore.critical} Crítico{priorityScore.critical > 1 ? "s" : ""}
                </span>
              )}
              {priorityScore.improvements > 0 && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-medium">
                  {priorityScore.improvements} Mejora{priorityScore.improvements > 1 ? "s" : ""}
                </span>
              )}
              {priorityScore.optimizations > 0 && (
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {priorityScore.optimizations} Optimizaci{priorityScore.optimizations > 1 ? "ones" : "ón"}
                </span>
              )}
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-xl p-3 space-y-3">
              <h3 className="text-xs font-semibold text-foreground">Diagnóstico general</h3>
              <p className="text-foreground text-xs leading-relaxed">{summary}</p>
              <div className="flex items-center justify-between text-[10px] border-t border-border pt-2 mt-2 flex-wrap gap-2">
                <span className="text-muted-foreground">
                  Objetivo: <span className="text-primary font-medium">Escuchar música</span>
                </span>
                <span className="text-muted-foreground">
                  Carácter:{" "}
                  <span
                    className={`font-medium ${
                      roomCharacter === "viva"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : roomCharacter === "equilibrada"
                          ? "text-primary"
                          : "text-blue-500 dark:text-blue-400"
                    }`}
                  >
                    {roomCharacter.charAt(0).toUpperCase() + roomCharacter.slice(1)}
                  </span>
                </span>
              </div>
            </div>

            {/* Room Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Volumen", value: `${roomMetrics.volume.toFixed(1)} m³` },
                { label: "Área Piso", value: `${roomMetrics.floorArea.toFixed(1)} m²` },
                { label: "RT60 Medios", value: `${roomMetrics.rt60Estimate.mid.toFixed(2)}s` },
                { label: "Absorción", value: `${roomMetrics.totalAbsorption.toFixed(1)} sabins` },
              ].map((metric) => (
                <div key={metric.label} className="bg-muted rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground">{metric.label}</p>
                  <p className="text-sm font-semibold text-foreground font-mono">{metric.value}</p>
                </div>
              ))}
            </div>

            {/* Free Changes Preview */}
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                </div>
                <h3 className="text-xs font-semibold text-foreground">
                  Cambios gratuitos ({freeChanges.items.length})
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
                  + {freeChanges.items.length - 3} cambios más...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Análisis Tab */}
        {activeTab === "analisis" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Análisis acústico</h3>
            </div>

            {/* RT60 */}
            <div className="rounded-xl border border-border p-3 space-y-2">
              <h4 className="text-xs font-semibold text-foreground">
                Tiempo de reverberación (RT60)
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Graves (63-250 Hz):</span>
                  <span
                    className={`font-semibold font-mono ${roomMetrics.rt60Estimate.low > 0.6 ? "text-destructive" : "text-foreground"}`}
                  >
                    {roomMetrics.rt60Estimate.low.toFixed(2)}s
                    {roomMetrics.rt60Estimate.low > 0.6 && " ⚠️"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Medios (500-2k Hz):</span>
                  <span
                    className={`font-semibold font-mono ${roomMetrics.rt60Estimate.mid > 0.5 ? "text-destructive" : "text-foreground"}`}
                  >
                    {roomMetrics.rt60Estimate.mid.toFixed(2)}s
                    {roomMetrics.rt60Estimate.mid > 0.5 && " ⚠️"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Agudos (4k-16k Hz):</span>
                  <span className="font-semibold font-mono text-foreground">
                    {roomMetrics.rt60Estimate.high.toFixed(2)}s
                  </span>
                </div>
              </div>
            </div>

            {/* Room Modes */}
            <div className="rounded-xl border border-border p-3 space-y-2">
              <h4 className="text-xs font-semibold text-foreground">
                Modos de sala (Resonancias)
              </h4>
              <div className="space-y-1">
                {roomMetrics.roomModes.slice(0, 5).map((mode, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-[11px] py-1.5 border-b border-border last:border-0"
                  >
                    <span className="font-semibold text-foreground font-mono">{mode.frequency.toFixed(0)} Hz</span>
                    <span className="text-muted-foreground capitalize">{mode.type}</span>
                    <span className="text-muted-foreground capitalize">{mode.dimension}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        mode.severity === "high"
                          ? "bg-destructive/10 text-destructive"
                          : mode.severity === "medium"
                            ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      {mode.severity === "high"
                        ? "Alta"
                        : mode.severity === "medium"
                          ? "Media"
                          : "Baja"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-muted rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">Tip:</span> Los modos debajo de 100Hz son los más problemáticos y
                difíciles de tratar. Las trampas de graves en esquinas son la solución más efectiva.
              </p>
            </div>
          </div>
        )}

        {/* Productos Tab */}
        {activeTab === "productos" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {lowBudgetChanges.title}
              </h3>
            </div>

            {/* Products List */}
            <div className="space-y-3">
              {lowBudgetChanges.items.map((product, idx) => (
                <div key={idx} className="rounded-xl border border-border p-3 space-y-2 hover:bg-muted/50 transition-colors">
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
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        product.impactLevel === "high"
                          ? "bg-primary/10 text-primary"
                          : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      Impacto: {product.impactLevel === "high" ? "Alto" : product.impactLevel === "medium" ? "Medio" : "Bajo"}
                    </span>
                    <span className="text-muted-foreground">
                      Instalación: {product.installation}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="border-t border-border pt-2 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Total</span>
                    <span className="text-sm font-semibold text-foreground font-mono">
                      ${product.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Budget Summary */}
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-foreground">
                  Presupuesto total
                </span>
                <span className="text-base font-semibold text-primary font-mono">
                  ${lowBudgetChanges.totalEstimatedCost.min.toLocaleString()} -{" "}
                  ${lowBudgetChanges.totalEstimatedCost.max.toLocaleString()}{" "}
                  {lowBudgetChanges.totalEstimatedCost.currency}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Precios reales de MercadoLibre Argentina actualizados
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="text-center mt-4">
        <p className="text-[10px] text-muted-foreground">
          * Este es un ejemplo con datos mock. Tu informe será personalizado para tu espacio.
        </p>
      </div>
    </div>
  )
}
