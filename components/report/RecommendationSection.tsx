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
}: RecommendationSectionProps) {
  const { title, items } = recommendations

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3 group">
            <div className="flex-shrink-0 mt-0.5">
              {icon === "check" ? (
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                </div>
              ) : (
                <span className="text-sm font-medium text-primary">→</span>
              )}
            </div>
            <p className="text-xs md:text-sm text-foreground leading-relaxed flex-1">{item}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-muted rounded-xl">
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">Tip:</span> Implementá estos cambios de forma progresiva y medí el impacto antes de hacer más ajustes.
        </p>
      </div>
    </div>
  )
}
