"use client"

import type { ButtonHTMLAttributes } from "react"

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function PrimaryButton({ className, children, style, ...props }: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "w-full bg-primary text-primary-foreground py-3.5 px-6 font-semibold text-center text-sm",
        "rounded-xl",
        "hover:opacity-90 active:scale-[0.98] transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </button>
  )
}
