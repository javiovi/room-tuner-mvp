"use client"

import Link from "next/link"
import { CenteredLayout } from "@/components/CenteredLayout"

export default function HomePage() {
  return (
    <CenteredLayout>
      <div className="flex justify-center">
        <span className="inline-flex items-center bg-black text-primary px-3 py-1 text-[10px] uppercase tracking-[0.2em] border-2 border-primary">
          ROOMTUNER // RETRO LAB
        </span>
      </div>

      <div className="space-y-5 text-center pt-4 pb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary glow-text leading-snug font-mono">
          Afina la acústica de tu sala
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
          Una herramienta experimento para ajustar tu espacio de escucha con vibra retro y análisis moderno.
        </p>
      </div>

      <Link
        href="/objetivo"
        className="inline-flex items-center justify-center w-full mt-4 bg-primary text-primary-foreground py-3 px-6 font-semibold uppercase text-xs tracking-wide border-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        style={{
          borderWidth: "3px",
          borderStyle: "solid",
          boxShadow: "3px 3px 0 0 rgba(0,0,0,1)",
        }}
      >
        Empezar análisis
      </Link>

      <p className="text-[11px] text-slate-400 text-center mt-3">
        Beta experimental. El primer análisis es aproximado, pero divertido.
      </p>
    </CenteredLayout>
  )
}
