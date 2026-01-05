"use client"

import { useState } from "react"
import { mockAnalysis, mockProject } from "@/lib/mockData"
import { Check, TrendingUp, Package } from "lucide-react"

/**
 * Interactive Report Preview Component
 * Shows a compact, functional preview of the analysis report on the landing page
 */
export function ReportPreview() {
  const [activeTab, setActiveTab] = useState<"resumen" | "analisis" | "productos">("resumen")

  const { summary, roomCharacter, priorityScore, roomMetrics, lowBudgetChanges, freeChanges } =
    mockAnalysis

  const totalIssues = priorityScore.critical + priorityScore.improvements

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-block border-3 border-primary bg-primary/10 px-4 py-2 mb-3">
          <p className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider">
            👁️ PREVIEW DEL INFORME
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Ejemplo con un espacio de {mockProject.lengthM}m × {mockProject.widthM}m ×{" "}
          {mockProject.heightM}m
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        <button
          onClick={() => setActiveTab("resumen")}
          className={`
            px-3 py-2 text-xs md:text-sm font-bold uppercase tracking-wide
            border-3 transition-colors font-mono
            ${
              activeTab === "resumen"
                ? "bg-primary text-background border-primary"
                : "bg-card text-foreground border-muted-foreground hover:border-primary"
            }
          `}
        >
          [RESUMEN]
          {totalIssues > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-destructive text-background text-[10px]">
              {totalIssues}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("analisis")}
          className={`
            px-3 py-2 text-xs md:text-sm font-bold uppercase tracking-wide
            border-3 transition-colors font-mono
            ${
              activeTab === "analisis"
                ? "bg-primary text-background border-primary"
                : "bg-card text-foreground border-muted-foreground hover:border-primary"
            }
          `}
        >
          [ANÁLISIS]
        </button>
        <button
          onClick={() => setActiveTab("productos")}
          className={`
            px-3 py-2 text-xs md:text-sm font-bold uppercase tracking-wide
            border-3 transition-colors font-mono
            ${
              activeTab === "productos"
                ? "bg-primary text-background border-primary"
                : "bg-card text-foreground border-muted-foreground hover:border-primary"
            }
          `}
        >
          [PRODUCTOS]
          <span className="ml-2 px-1.5 py-0.5 bg-accent text-background text-[10px]">
            {lowBudgetChanges.items.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="border-3 border-primary bg-card p-4 md:p-6 min-h-[400px]">
        {/* Resumen Tab */}
        {activeTab === "resumen" && (
          <div className="space-y-4">
            {/* Priority Badges */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-mono flex-wrap">
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
                  {priorityScore.optimizations} OPTIMIZACION
                  {priorityScore.optimizations > 1 ? "ES" : ""}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="border-2 border-primary bg-card p-3 space-y-3">
              <h3 className="text-xs font-semibold text-accent uppercase tracking-wide">
                [DIAGNÓSTICO GENERAL]
              </h3>
              <p className="text-foreground text-xs leading-relaxed">{summary}</p>
              <div className="flex items-center justify-between text-[10px] border-t border-muted-foreground/30 pt-2 mt-2 flex-wrap gap-2">
                <span className="text-muted-foreground">
                  Objetivo: <span className="text-accent">Escuchar música</span>
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
            <div className="grid grid-cols-2 gap-2">
              <div className="border-2 border-primary p-2">
                <p className="text-[10px] text-muted-foreground uppercase">Volumen</p>
                <p className="text-sm font-bold text-primary">{roomMetrics.volume.toFixed(1)} m³</p>
              </div>
              <div className="border-2 border-primary p-2">
                <p className="text-[10px] text-muted-foreground uppercase">Área Piso</p>
                <p className="text-sm font-bold text-primary">
                  {roomMetrics.floorArea.toFixed(1)} m²
                </p>
              </div>
              <div className="border-2 border-primary p-2">
                <p className="text-[10px] text-muted-foreground uppercase">RT60 Medios</p>
                <p className="text-sm font-bold text-primary">
                  {roomMetrics.rt60Estimate.mid.toFixed(2)}s
                </p>
              </div>
              <div className="border-2 border-primary p-2">
                <p className="text-[10px] text-muted-foreground uppercase">Absorción</p>
                <p className="text-sm font-bold text-primary">
                  {roomMetrics.totalAbsorption.toFixed(1)} sabins
                </p>
              </div>
            </div>

            {/* Free Changes Preview */}
            <div className="border-2 border-accent bg-accent/5 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                <h3 className="text-xs font-semibold text-accent uppercase">
                  Cambios Gratuitos ({freeChanges.items.length})
                </h3>
              </div>
              <ul className="space-y-1.5">
                {freeChanges.items.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] text-foreground">
                    <span className="text-accent font-bold">[{idx + 1}]</span>
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
              <TrendingUp className="w-5 h-5 text-primary" strokeWidth={3} />
              <h3 className="text-sm font-bold text-primary uppercase">Análisis Acústico</h3>
            </div>

            {/* RT60 */}
            <div className="border-2 border-primary p-3 space-y-2">
              <h4 className="text-xs font-semibold text-accent uppercase">
                Tiempo de Reverberación (RT60)
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Graves (63-250 Hz):</span>
                  <span
                    className={`font-bold ${roomMetrics.rt60Estimate.low > 0.6 ? "text-destructive" : "text-primary"}`}
                  >
                    {roomMetrics.rt60Estimate.low.toFixed(2)}s
                    {roomMetrics.rt60Estimate.low > 0.6 && " ⚠️"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Medios (500-2k Hz):</span>
                  <span
                    className={`font-bold ${roomMetrics.rt60Estimate.mid > 0.5 ? "text-destructive" : "text-primary"}`}
                  >
                    {roomMetrics.rt60Estimate.mid.toFixed(2)}s
                    {roomMetrics.rt60Estimate.mid > 0.5 && " ⚠️"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Agudos (4k-16k Hz):</span>
                  <span className="font-bold text-primary">
                    {roomMetrics.rt60Estimate.high.toFixed(2)}s ✓
                  </span>
                </div>
              </div>
            </div>

            {/* Room Modes */}
            <div className="border-2 border-primary p-3 space-y-2">
              <h4 className="text-xs font-semibold text-accent uppercase">
                Modos de Sala (Resonancias)
              </h4>
              <div className="space-y-1">
                {roomMetrics.roomModes.slice(0, 5).map((mode, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-[11px] py-1 border-b border-muted-foreground/20 last:border-0"
                  >
                    <span className="font-bold text-primary">{mode.frequency.toFixed(0)} Hz</span>
                    <span className="text-muted-foreground capitalize">{mode.type}</span>
                    <span className="text-muted-foreground capitalize">{mode.dimension}</span>
                    <span
                      className={
                        mode.severity === "high"
                          ? "text-destructive"
                          : mode.severity === "medium"
                            ? "text-accent"
                            : "text-primary"
                      }
                    >
                      {mode.severity === "high"
                        ? "🔴 Alta"
                        : mode.severity === "medium"
                          ? "🟡 Media"
                          : "🟢 Baja"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="border-2 border-accent bg-accent/5 p-3">
              <p className="text-[11px] text-foreground leading-relaxed">
                💡 <strong>Tip:</strong> Los modos debajo de 100Hz son los más problemáticos y
                difíciles de tratar. Las trampas de graves en esquinas son la solución más efectiva.
              </p>
            </div>
          </div>
        )}

        {/* Productos Tab */}
        {activeTab === "productos" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-primary" strokeWidth={3} />
              <h3 className="text-sm font-bold text-primary uppercase">
                {lowBudgetChanges.title}
              </h3>
            </div>

            {/* Products List */}
            <div className="space-y-3">
              {lowBudgetChanges.items.map((product, idx) => (
                <div key={idx} className="border-2 border-primary p-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">{product.product}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {product.category} • {product.placement}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-primary">
                        ${product.unitPrice.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">x{product.quantity}</p>
                    </div>
                  </div>

                  {/* Impact & Installation */}
                  <div className="flex items-center gap-2 text-[10px]">
                    <span
                      className={`px-2 py-0.5 border ${
                        product.impactLevel === "high"
                          ? "border-primary text-primary bg-primary/10"
                          : "border-accent text-accent bg-accent/10"
                      }`}
                    >
                      Impacto: {product.impactLevel.toUpperCase()}
                    </span>
                    <span className="text-muted-foreground">
                      Instalación: {product.installation}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="border-t border-muted-foreground/20 pt-2 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase">Total</span>
                    <span className="text-sm font-bold text-primary">
                      ${product.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Budget Summary */}
            <div className="border-3 border-accent bg-accent/10 p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-accent uppercase">
                  Presupuesto Total
                </span>
                <span className="text-base font-bold text-accent">
                  ${lowBudgetChanges.totalEstimatedCost.min.toLocaleString()} -{" "}
                  ${lowBudgetChanges.totalEstimatedCost.max.toLocaleString()}{" "}
                  {lowBudgetChanges.totalEstimatedCost.currency}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                🔗 Precios reales de MercadoLibre Argentina actualizados
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
