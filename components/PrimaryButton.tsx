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
        "w-full bg-primary text-primary-foreground py-3 px-6 font-semibold text-center uppercase text-sm tracking-wide border-black hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all",
        className,
      )}
      style={{
        borderWidth: "3px",
        borderStyle: "solid",
        boxShadow: "4px 4px 0 0 rgba(0,0,0,1)",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}
