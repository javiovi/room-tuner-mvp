"use client"

import Link from "next/link"
import { CenteredLayout } from "@/components/CenteredLayout"

export default function MedicionPage() {
  return (
    <CenteredLayout>
      <div className="space-y-3 text-center">
        <h1 className="text-lg md:text-xl font-bold text-primary glow-text font-mono">
          {"> "}¿Querés medir el ruido ambiente?
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {"// "}Podemos usar el micrófono de tu dispositivo para tener una idea del nivel de ruido.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <Link
          href="/analizando"
          className="block w-full bg-primary text-primary-foreground py-3 px-6 font-semibold text-center uppercase text-sm tracking-wide border-black hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
          style={{ borderWidth: "3px", borderStyle: "solid", boxShadow: "4px 4px 0 0 rgba(0,0,0,1)" }}
        >
          [SÍ, MEDIR AHORA]
        </Link>
        <Link
          href="/analizando"
          className="block w-full bg-muted text-foreground py-3 px-6 font-semibold text-center uppercase text-sm tracking-wide border-primary/30 hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          style={{ borderWidth: "3px", borderStyle: "solid", boxShadow: "3px 3px 0 0 rgba(0,255,156,0.2)" }}
        >
          [NO, SALTEAR]
        </Link>
      </div>

      <div className="pt-2 text-center">
        <Link
          href="/muebles"
          className="text-xs text-accent hover:text-primary transition-colors uppercase tracking-wide"
        >
          {"<"} VOLVER
        </Link>
      </div>
    </CenteredLayout>
  )
}
