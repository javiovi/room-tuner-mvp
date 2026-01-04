"use client"

import { useState } from "react"
import type { ProductRecommendation } from "@/app/types/room"
import { Plus, Minus, DollarSign } from "lucide-react"

interface BudgetCalculatorProps {
  lowBudgetProducts: ProductRecommendation[]
  advancedProducts: ProductRecommendation[]
  currency?: "USD" | "ARS"
}

interface SelectedProduct extends ProductRecommendation {
  selectedQuantity: number
}

export function BudgetCalculator({
  lowBudgetProducts,
  advancedProducts,
  currency = "ARS"
}: BudgetCalculatorProps) {
  const allProducts = [...lowBudgetProducts, ...advancedProducts]

  const [selected, setSelected] = useState<Map<string, number>>(new Map())
  const [activeCurrency, setActiveCurrency] = useState<"USD" | "ARS">(currency)

  const handleQuantityChange = (productId: string, delta: number) => {
    setSelected(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(productId) || 0
      const newQty = Math.max(0, current + delta)

      if (newQty === 0) {
        newMap.delete(productId)
      } else {
        newMap.set(productId, newQty)
      }

      return newMap
    })
  }

  const selectedProducts = allProducts
    .filter(p => selected.has(p.productId))
    .map(p => ({
      ...p,
      selectedQuantity: selected.get(p.productId) || 0
    }))

  const total = selectedProducts.reduce((sum, p) => {
    const price = activeCurrency === "USD" ? p.unitPrice : p.unitPrice
    return sum + (price * p.selectedQuantity)
  }, 0)

  return (
    <div
      className="border-2 border-primary bg-card p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-primary uppercase tracking-wide">
            [CALCULADORA DE PRESUPUESTO]
          </h2>
          <p className="text-[10px] text-muted-foreground mt-1">
            Seleccioná productos y ajustá cantidades
          </p>
        </div>

        {/* Currency Toggle */}
        <div className="flex border-2 border-primary">
          <button
            onClick={() => setActiveCurrency("ARS")}
            className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${
              activeCurrency === "ARS"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-primary hover:bg-primary/10"
            }`}
          >
            ARS
          </button>
          <button
            onClick={() => setActiveCurrency("USD")}
            className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors border-l-2 border-primary ${
              activeCurrency === "USD"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-primary hover:bg-primary/10"
            }`}
          >
            USD
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {allProducts.map((product) => {
          const qty = selected.get(product.productId) || 0
          const isSelected = qty > 0

          return (
            <div
              key={product.productId}
              className={`border-2 p-3 transition-all ${
                isSelected
                  ? "border-accent bg-accent/5"
                  : "border-muted-foreground/20 hover:border-accent/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-foreground truncate">
                    {product.product}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {activeCurrency === "USD" ? "$" : "ARS $"}
                    {product.unitPrice.toLocaleString()} c/u
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(product.productId, -1)}
                    disabled={qty === 0}
                    className="w-6 h-6 border-2 border-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Minus className="w-3 h-3" strokeWidth={3} />
                  </button>

                  <span className="text-xs font-mono font-bold text-primary w-6 text-center">
                    {qty}
                  </span>

                  <button
                    onClick={() => handleQuantityChange(product.productId, 1)}
                    className="w-6 h-6 border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Plus className="w-3 h-3" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Items Summary */}
      {selectedProducts.length > 0 && (
        <div className="border-t-2 border-primary pt-4 space-y-2">
          <h3 className="text-xs font-bold text-accent uppercase">
            Productos seleccionados:
          </h3>

          <div className="space-y-1">
            {selectedProducts.map(p => (
              <div key={p.productId} className="flex justify-between text-[10px]">
                <span className="text-muted-foreground truncate flex-1 mr-2">
                  {p.selectedQuantity}x {p.product}
                </span>
                <span className="font-mono text-foreground">
                  {activeCurrency === "USD" ? "$" : "ARS $"}
                  {(p.unitPrice * p.selectedQuantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="border-t-2 border-primary pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-accent uppercase tracking-wide">
            Total estimado:
          </span>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary font-mono flex items-center gap-1">
              <DollarSign className="w-5 h-5" />
              {total.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {activeCurrency} {selectedProducts.length} productos
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      {total > 0 && (
        <div className="p-3 border border-accent/30 bg-accent/5 text-[10px] text-muted-foreground">
          <span className="text-accent font-bold">Nota:</span> Este es un presupuesto estimado. Los precios pueden variar según proveedor y ubicación.
        </div>
      )}
    </div>
  )
}
