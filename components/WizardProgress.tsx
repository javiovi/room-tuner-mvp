"use client"

import { usePathname } from "next/navigation"
import { WIZARD_STEPS } from "@/lib/wizardSteps"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

/** Blueprint grammar: a dimension line with tick marks, not a segmented pill bar.
 * Renders nothing outside the wizard flow (analizando/resultado excluded on purpose). */
export function WizardProgress() {
  const pathname = usePathname()
  const { locale } = useT()
  const index = WIZARD_STEPS.findIndex((step) => step.path === pathname)

  if (index === -1) return null

  const total = WIZARD_STEPS.length

  return (
    <div className="pb-1">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {locale === "en" ? `Step ${index + 1} of ${total}` : `Paso ${index + 1} de ${total}`}
      </p>
      <div
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        className="relative h-3 border-t border-muted-foreground/30"
      >
        {WIZARD_STEPS.map((step, i) => {
          const left = (i / (total - 1)) * 100
          const isCurrent = i === index
          const isDone = i < index
          if (isCurrent) {
            return (
              <span
                key={step.path}
                aria-hidden
                style={{ left: `${left}%` }}
                className="absolute -top-[3px] h-1.5 w-1.5 -translate-x-1/2 rotate-45 border border-primary bg-primary"
              />
            )
          }
          return (
            <span
              key={step.path}
              aria-hidden
              style={{ left: `${left}%` }}
              className={cn(
                "absolute top-0 h-1.5 w-px -translate-x-1/2",
                isDone ? "bg-primary" : "bg-muted-foreground/40",
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
