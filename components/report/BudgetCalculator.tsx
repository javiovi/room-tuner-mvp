"use client"

import { useState } from "react"
import type { ProductRecommendation } from "@/app/types/room"
import { Plus, Minus, DollarSign } from "lucide-react"

interface BudgetCalculatorProps {
  lowBudgetProducts: ProductRecommendation[]
  advancedProducts: ProductRecommendation[]
  currency?: "USD" | "ARS"
}

export function BudgetCalculator({ lowBudgetProducts, advancedProducts, currency = "ARS" }: BudgetCalculatorProps) {
  const allProducts = [...lowBudgetProducts, ...advancedProducts]
  const [selected, setSelected] = useState<Map<string, number>>(new Map())
  const [activeCurrency, setActiveCurrency] = useState<"USD" | "ARS">(currency)

  const handleQuantityChange = (productId: string, delta: number) => {
    setSelected(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(productId) || 0
      const newQty = Math.max(0, current + delta)
      if (newQty === 0) { newMap.delete(productId) } else { newMap.set(productId, newQty) }
      return newMap
    })
  }

  const selectedProducts = allProducts
    .filter(p => selected.has(p.productId))
    .map(p => ({ ...p, selectedQuantity: selected.get(p.productId) || 0 }))

  const total = selectedProducts.reduce((sum, p) => sum + (p.unitPrice * p.selectedQuantity), 0)

  return (
    <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Calculadora de presupuesto</h2>
          <p className="text-xs text-muted-foreground mt-1">Seleccioná productos y ajustá cantidades</p>
        </div>
        <div className="flex bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setActiveCurrency("ARS")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeCurrency === "ARS" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ARS
          </button>
          <button
            onClick={() => setActiveCurrency("USD")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeCurrency === "USD" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            USD
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {allProducts.map((product) => {
          const qty = selected.get(product.productId) || 0
          const isSelected = qty > 0
          return (
            <div key={product.productId} className={`rounded-xl border p-3 transition-all ${
              isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/30"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-foreground truncate">{product.product}</h4>
                  <p className="text-xs text-muted-foreground">
                    {activeCurrency === "USD" ? "$" : "ARS $"}{product.unitPrice.toLocaleString()} c/u
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleQuantityChange(product.productId, -1)} disabled={qty === 0}
                    className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center disabled:opacity-30 hover:bg-primary/10 transition-colors">
                    <Minus className="w-3 h-3" strokeWidth={3} />
                  </button>
                  <span className="text-xs font-mono font-semibold text-foreground w-6 text-center">{qty}</span>
                  <button onClick={() => handleQuantityChange(product.productId, 1)}
                    className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                    <Plus className="w-3 h-3" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedProducts.length > 0 && (
        <div className="border-t border-border pt-4 space-y-2">
          <h3 className="text-xs font-medium text-foreground">Productos seleccionados:</h3>
          <div className="space-y-1">
            {selectedProducts.map(p => (
              <div key={p.productId} className="flex justify-between text-xs">
                <span className="text-muted-foreground truncate flex-1 mr-2">{p.selectedQuantity}x {p.product}</span>
                <span className="font-mono text-foreground">
                  {activeCurrency === "USD" ? "$" : "ARS $"}{(p.unitPrice * p.selectedQuantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Total estimado:</span>
          <div className="text-right">
            <div className="text-2xl font-semibold text-foreground font-mono flex items-center gap-1">
              <DollarSign className="w-5 h-5" />{total.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">{activeCurrency} · {selectedProducts.length} productos</div>
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="p-3 bg-muted rounded-xl text-xs text-muted-foreground">
          <span className="text-foreground font-medium">Nota:</span> Este es un presupuesto estimado. Los precios pueden variar según proveedor y ubicación.
        </div>
      )}
    </div>
  )
}
