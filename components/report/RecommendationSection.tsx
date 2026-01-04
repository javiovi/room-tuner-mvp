"use client"

import type { RecommendationBlock } from "@/app/types/room"
import { Check } from "lucide-react"

interface RecommendationSectionProps {
  recommendations: RecommendationBlock
  icon?: "check" | "arrow"
  accentColor?: "primary" | "accent" | "destructive"
}

export function RecommendationSection({
  recommendations,
  icon = "check",
  accentColor = "accent"
}: RecommendationSectionProps) {
  const { title, items } = recommendations

  if (!items || items.length === 0) {
    return null
  }

  const iconColorClass = {
    primary: "text-primary",
    accent: "text-accent",
    destructive: "text-destructive"
  }[accentColor]

  const borderColorClass = {
    primary: "border-primary/50",
    accent: "border-accent/50",
    destructive: "border-destructive/50"
  }[accentColor]

  return (
    <div
      className={`border-2 ${borderColorClass} bg-card p-5 space-y-4`}
    >
      {/* Header */}
      <h2 className={`text-sm font-bold ${iconColorClass} uppercase tracking-wide`}>
        {title}
      </h2>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3 group">
            {/* Icon */}
            <div className={`flex-shrink-0 mt-0.5 ${iconColorClass}`}>
              {icon === "check" ? (
                <div className="w-5 h-5 border-2 border-current flex items-center justify-center">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </div>
              ) : (
                <span className="text-sm font-bold">→</span>
              )}
            </div>

            {/* Text */}
            <p className="text-xs md:text-sm text-foreground leading-relaxed flex-1">
              {item}
            </p>
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div className={`mt-4 p-3 border ${borderColorClass} bg-${accentColor}/5`}>
        <p className="text-[10px] text-muted-foreground">
          <span className={`${iconColorClass} font-bold`}>Tip:</span> Implementá estos cambios de forma progresiva y medí el impacto antes de hacer más ajustes.
        </p>
      </div>
    </div>
  )
}
