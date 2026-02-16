"use client"

import { ArrowRight, Clock } from "lucide-react"
import { InfoTooltip } from "@/components/InfoTooltip"
import { useT } from "@/lib/i18n"

interface ActionItem {
  title: string
  description: string
  priority: "high" | "medium" | "low"
  cost: string
  impact: string
}

interface ActionPlanProps {
  roomCharacter: "viva" | "equilibrada" | "seca"
  hasBudget?: boolean
}

export function ActionPlan({ roomCharacter, hasBudget = false }: ActionPlanProps) {
  const { t } = useT()
  const ap = t.report.actionPlan

  const quickWins: ActionItem[] = [
    { title: ap.optimizeListening, description: ap.optimizeListeningDesc, priority: "high", cost: ap.costFree, impact: ap.optimizeListeningImpact },
    { title: ap.adjustSpeakers, description: ap.adjustSpeakersDesc, priority: "high", cost: ap.costFree, impact: ap.adjustSpeakersImpact },
  ]
  if (roomCharacter === "viva") {
    quickWins.push({ title: ap.addRug, description: ap.addRugDesc, priority: "high", cost: "~ARS $50k", impact: ap.addRugImpact })
  }

  const mediumTerm: ActionItem[] = []
  if (roomCharacter === "viva") {
    mediumTerm.push(
      { title: ap.installAbsorbers, description: ap.installAbsorbersDesc, priority: "high", cost: "~ARS $60-90k", impact: ap.installAbsorbersImpact },
      { title: ap.bassTraps, description: ap.bassTrapsDesc, priority: "high", cost: "~ARS $120-240k", impact: ap.bassTrapsImpact },
    )
  } else if (roomCharacter === "equilibrada") {
    mediumTerm.push(
      { title: ap.selectiveTreatment, description: ap.selectiveTreatmentDesc, priority: "medium", cost: "~ARS $30-60k", impact: ap.selectiveTreatmentImpact },
      { title: ap.bassTrapsCorners, description: ap.bassTrapsCornersDesc, priority: "medium", cost: "~ARS $120k", impact: ap.bassTrapsCornersImpact },
    )
  } else {
    mediumTerm.push({ title: ap.addDiffusion, description: ap.addDiffusionDesc, priority: "medium", cost: "~ARS $80-150k", impact: ap.addDiffusionImpact })
  }

  const longTerm: ActionItem[] = [
    { title: ap.measurement, description: ap.measurementDesc, priority: "medium", cost: "~ARS $80k", impact: ap.measurementImpact },
  ]
  if (hasBudget) {
    longTerm.push(
      { title: ap.proTreatment, description: ap.proTreatmentDesc, priority: "low", cost: "~USD $1000-2000", impact: ap.proTreatmentImpact },
      { title: ap.ceilingClouds, description: ap.ceilingCloudsDesc, priority: "low", cost: "~USD $300-600", impact: ap.ceilingCloudsImpact },
    )
  }

  return (
    <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{ap.title}</h2>
          <InfoTooltip text={t.tooltips.actionPlan} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{ap.description}</p>
      </div>

      <div className="space-y-6">
        <TimelineSection title={ap.week1} subtitle={ap.week1Sub} items={quickWins} t={t} />
        <TimelineSection title={ap.month1_3} subtitle={ap.month1_3Sub} items={mediumTerm} t={t} />
        <TimelineSection title={ap.month6} subtitle={ap.month6Sub} items={longTerm} t={t} />
      </div>

      <div className="border-t border-border pt-4">
        <div className="p-3 bg-muted rounded-xl">
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{t.common.recommendation}</span> {ap.recommendationText}
          </p>
        </div>
      </div>

      {/* Glossary */}
      <div className="border-t border-border pt-4">
        <h3 className="text-xs font-semibold text-foreground mb-2">{ap.glossaryTitle}</h3>
        <div className="grid grid-cols-1 gap-y-1.5 text-xs text-muted-foreground">
          <GlossaryItem term={ap.glossary.equilateralTriangle} definition={ap.glossary.equilateralTriangleDef} />
          <GlossaryItem term={ap.glossary.stereoImage} definition={ap.glossary.stereoImageDef} />
          <GlossaryItem term={ap.glossary.firstReflection} definition={ap.glossary.firstReflectionDef} />
          <GlossaryItem term={ap.glossary.bassTraps} definition={ap.glossary.bassTrapsDef} />
          <GlossaryItem term={ap.glossary.absorbers} definition={ap.glossary.absorbersDef} />
          <GlossaryItem term={ap.glossary.diffusers} definition={ap.glossary.diffusersDef} />
          <GlossaryItem term={ap.glossary.ceilingClouds} definition={ap.glossary.ceilingCloudsDef} />
          <GlossaryItem term={ap.glossary.rew} definition={ap.glossary.rewDef} />
        </div>
      </div>
    </div>
  )
}

function TimelineSection({ title, subtitle, items, t }: { title: string; subtitle: string; items: ActionItem[]; t: any }) {
  if (items.length === 0) return null
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="ml-10 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="border-l border-border pl-4 pb-3 last:pb-0">
            <div className="flex items-start gap-2">
              <ArrowRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-medium text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                <div className="flex items-center gap-3 text-xs mt-1 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    item.priority === "high" ? "bg-destructive/10 text-destructive" :
                    item.priority === "medium" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {item.priority === "high" ? t.report.actionPlan.priorityHigh : item.priority === "medium" ? t.report.actionPlan.priorityMedium : t.report.actionPlan.priorityLow}
                  </span>
                  <span className="text-muted-foreground">{t.common.cost} <span className="text-foreground font-mono">{item.cost}</span></span>
                  <span className="text-muted-foreground">{item.impact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GlossaryItem({ term, definition }: { term: string; definition: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-foreground font-medium whitespace-nowrap">{term}:</span>
      <span>{definition}</span>
    </div>
  )
}
