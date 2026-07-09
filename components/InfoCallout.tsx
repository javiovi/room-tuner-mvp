import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface InfoCalloutProps {
  children: ReactNode
  label?: string
  className?: string
}

/** Blueprint grammar: a reference-point dot instead of a filled/tinted box — an annotation,
 * not a card. Replaces the `bg-muted rounded-xl p-3` pattern duplicated across the wizard. */
export function InfoCallout({ children, label = "Nota", className }: InfoCalloutProps) {
  return (
    <div className={cn("flex items-start gap-2.5 py-1", className)}>
      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full border border-primary" />
      <div className="text-xs text-muted-foreground leading-relaxed">
        {label && <span className="mr-1.5 font-mono text-[10px] uppercase tracking-wide text-primary">{label}</span>}
        {children}
      </div>
    </div>
  )
}
