"use client"

import { useState, useRef, useEffect } from "react"
import { Info } from "lucide-react"

interface InfoTooltipProps {
  text: string
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-muted-foreground/60 hover:text-muted-foreground transition-colors p-0.5 -m-0.5"
        aria-label="Más información"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1.5 right-0 w-64 p-3 rounded-xl bg-card border border-border card-shadow-lg text-xs text-muted-foreground leading-relaxed animate-in fade-in-0 zoom-in-95 duration-150">
          {text}
          <div className="absolute -top-1 right-3 w-2 h-2 bg-card border-l border-t border-border rotate-45" />
        </div>
      )}
    </div>
  )
}
