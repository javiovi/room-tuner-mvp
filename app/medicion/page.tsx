"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"

export default function MedicionPage() {
  return (
    <CenteredLayout>
      <div className="space-y-3 text-center">
        <h1 className="text-lg md:text-xl font-semibold text-foreground">
          Querés medir el ruido ambiente?
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Podemos usar el micrófono de tu dispositivo para tener una idea del nivel de ruido.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <Link
          href="/analizando"
          className="block w-full bg-primary text-primary-foreground py-3.5 px-6 font-semibold text-center text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-150"
        >
          Sí, medir ahora
        </Link>
        <Link
          href="/analizando"
          className="block w-full bg-secondary text-secondary-foreground py-3.5 px-6 font-semibold text-center text-sm rounded-xl hover:bg-secondary/80 active:scale-[0.98] transition-all duration-150"
        >
          No, saltear
        </Link>
      </div>

      <div className="pt-2 text-center">
        <Link
          href="/muebles"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>
    </CenteredLayout>
  )
}
