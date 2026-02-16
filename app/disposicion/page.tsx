"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { PrimaryButton } from "@/components/PrimaryButton"
import { useRoomStore } from "@/lib/roomStore"

export default function DisposicionPage() {
  const router = useRouter()
  const updateProject = useRoomStore((s) => s.updateProject)
  const [formData, setFormData] = useState({
    ubicacionEquipo: "",
    dondeSientas: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()

    updateProject({
      speakerPlacement: formData.ubicacionEquipo as any,
      listeningPosition: formData.dondeSientas as any,
    })

    router.push("/muebles")
  }

  return (
    <CenteredLayout>
      <Link
        href="/espacio"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver
      </Link>

      <div className="space-y-3">
        <h1 className="text-base md:text-lg font-semibold text-foreground">Dónde está tu equipo?</h1>
        <p className="text-xs md:text-sm text-muted-foreground">Elegí la opción que más se parezca</p>
      </div>

      <form className="space-y-8" onSubmit={handleContinue}>
        <div className="space-y-4">
          <h2 className="text-xs font-medium text-muted-foreground pb-1 border-b border-border">
            Ubicación del equipo de sonido / parlantes
          </h2>
          <div className="space-y-2">
            {[
              { value: "pared-larga-centrado", label: "Centrado en pared larga", desc: "Mejor balance stereo" },
              { value: "pared-corta-centrado", label: "Centrado en pared corta", desc: "Más profundidad sonora" },
              { value: "esquina", label: "En una esquina", desc: "Maximiza graves (puede causar problemas)" },
              { value: "pared-lateral", label: "Sobre pared lateral", desc: "Setup no convencional" },
              { value: "indefinido", label: "Todavía no lo definí", desc: "Te sugeriremos la mejor opción" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all touch-manipulation ${
                  formData.ubicacionEquipo === option.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    formData.ubicacionEquipo === option.value ? "border-primary" : "border-muted-foreground/40"
                  }`}
                >
                  {formData.ubicacionEquipo === option.value && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                </div>
                <input
                  type="radio"
                  name="ubicacionEquipo"
                  value={option.value}
                  checked={formData.ubicacionEquipo === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="text-xs md:text-sm text-foreground font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: La pared larga es generalmente la mejor opción para distribución stereo balanceada.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-medium text-muted-foreground pb-1 border-b border-border">
            Dónde te sentás normalmente para escuchar
          </h2>
          <div className="space-y-2">
            {[
              { value: "centro-sala", label: "Cerca del centro del espacio", desc: "Óptimo - menor influencia de paredes" },
              {
                value: "escritorio-pared",
                label: "En escritorio contra la pared",
                desc: "Común en home studios - puede necesitar tratamiento",
              },
              {
                value: "sillon-pared-posterior",
                label: "Sillón/sofá pegado a pared posterior",
                desc: "Puede generar reflexiones tempranas",
              },
              { value: "esquina", label: "En una esquina", desc: "Aumenta graves - no ideal" },
              {
                value: "variable",
                label: "Voy cambiando de posición",
                desc: "Dificulta optimización - recomendamos punto fijo",
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all touch-manipulation ${
                  formData.dondeSientas === option.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    formData.dondeSientas === option.value ? "border-primary" : "border-muted-foreground/40"
                  }`}
                >
                  {formData.dondeSientas === option.value && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                </div>
                <input
                  type="radio"
                  name="dondeSientas"
                  value={option.value}
                  checked={formData.dondeSientas === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="text-xs md:text-sm text-foreground font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="p-3 bg-muted rounded-xl">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">Info:</span> El punto de escucha ideal forma un triángulo equilátero con
              los parlantes. Evitá paredes cercanas a tu espalda.
            </p>
          </div>
        </div>

        <PrimaryButton type="submit">Continuar</PrimaryButton>
      </form>
    </CenteredLayout>
  )
}
