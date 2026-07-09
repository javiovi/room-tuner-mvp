"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface OptionCardProps {
  variant?: "radio" | "checkbox"
  selected: boolean
  onSelect: () => void
  title: string
  description?: string
  icon?: LucideIcon
  className?: string
}

/** Blueprint grammar: drafted checkbox/radio square with a hand-tick, selected rows get a
 * dimension-tick left border instead of a filled/tinted background. */
export function OptionCard({ variant = "radio", selected, onSelect, title, description, icon: Icon, className }: OptionCardProps) {
  return (
    <button
      type="button"
      role={variant === "radio" ? "radio" : "checkbox"}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-3 py-3 border-b border-dotted border-border text-left transition-[padding] duration-100",
        selected && "border-l border-primary pl-2.5",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center border font-mono text-[9px] leading-none",
          selected ? "border-primary text-primary" : "border-muted-foreground text-transparent",
        )}
      >
        {variant === "checkbox" ? "✓" : selected ? "●" : ""}
      </span>
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      <span className="flex flex-col gap-0.5">
        <span className="text-sm text-foreground">{title}</span>
        {description && <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>}
      </span>
    </button>
  )
}
