"use client"

import type { RecommendationBlock } from "@/app/types/room"
import { Check, ArrowRight } from "lucide-react"
import { useT } from "@/lib/i18n"
import { InfoCallout } from "@/components/InfoCallout"

interface RecommendationSectionProps {
  recommendations: RecommendationBlock
  icon?: "check" | "arrow"
}

export function RecommendationSection({
  recommendations,
  icon = "check",
}: RecommendationSectionProps) {
  const { title, items } = recommendations
  const { t } = useT()

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="bg-card border border-border rounded-sm p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3 group">
            <div className="flex-shrink-0 mt-0.5">
              {icon === "check" ? (
                <div className="w-4 h-4 border border-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />
                </div>
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
              )}
            </div>
            <p className="text-xs md:text-sm text-foreground leading-relaxed flex-1">{item}</p>
          </div>
        ))}
      </div>

      <InfoCallout label={t.report.recommendations.tipLabel}>{t.report.recommendations.tipText}</InfoCallout>
    </div>
  )
}
