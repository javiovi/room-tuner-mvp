"use client"

import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "secondary" | "ghost"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "border-primary text-primary hover:bg-primary/5 active:bg-primary/10",
  secondary: "border-border text-foreground hover:bg-muted active:bg-muted",
  ghost: "border-transparent text-muted-foreground hover:text-foreground active:text-foreground",
}

/** Blueprint grammar: outline button, no fill, no shadow, no scale-on-press. Corner
 * registration marks on the primary variant stand in for elevation. */
export function Button({ className, children, style, variant = "primary", disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "relative py-3 px-5 text-center text-xs font-medium uppercase tracking-wider",
        "rounded-sm border transition-colors duration-100",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        VARIANT_CLASSES[variant],
        className,
      )}
      style={style}
      disabled={disabled}
      {...props}
    >
      {variant === "primary" && !disabled && (
        <>
          <span aria-hidden className="pointer-events-none absolute -top-[3px] -left-[3px] h-1.5 w-1.5 border-t border-l border-primary" />
          <span aria-hidden className="pointer-events-none absolute -bottom-[3px] -right-[3px] h-1.5 w-1.5 border-b border-r border-primary" />
        </>
      )}
      {children}
    </button>
  )
}
