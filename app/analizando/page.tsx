"use client"

import Link from "next/link"
import { CenteredLayout } from "@/components/CenteredLayout"

const tips = [
  "La posición del punto de escucha puede cambiar muchísimo la percepción.",
  "Los muebles también ayudan a controlar reflexiones.",
  "Pequeños ajustes suelen generar grandes diferencias en el sonido.",
]

export default function AnalizandoPage() {
  return (
    <CenteredLayout>
      <div className="space-y-3 text-center">
        <h1 className="text-lg md:text-xl font-bold text-primary glow-text font-mono">{"> "}Analizando tu sala...</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{"// "}Procesando información acústica</p>
      </div>

      <div className="flex justify-center py-4">
        <div className="flex gap-2">
          <div className="w-4 h-4 bg-primary animate-pulse" style={{ animationDelay: "0ms" }}></div>
          <div className="w-4 h-4 bg-primary animate-pulse" style={{ animationDelay: "150ms" }}></div>
          <div className="w-4 h-4 bg-primary animate-pulse" style={{ animationDelay: "300ms" }}></div>
          <div className="w-4 h-4 bg-primary animate-pulse" style={{ animationDelay: "450ms" }}></div>
        </div>
      </div>

      <div className="border-accent/50 bg-card p-4 space-y-4" style={{ borderWidth: "3px", borderStyle: "solid" }}>
        <p className="text-xs font-semibold text-accent uppercase tracking-wide">{">"} Datos útiles:</p>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="text-xs text-muted-foreground flex gap-2">
              <span className="text-primary font-bold">[{String(index + 1).padStart(2, "0")}]</span>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/resultado"
        className="block w-full bg-primary text-primary-foreground py-3 px-6 font-semibold text-center uppercase text-sm tracking-wide border-black hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
        style={{ borderWidth: "3px", borderStyle: "solid", boxShadow: "4px 4px 0 0 rgba(0,0,0,1)" }}
      >
        [VER RESULTADOS]
      </Link>
    </CenteredLayout>
  )
}
