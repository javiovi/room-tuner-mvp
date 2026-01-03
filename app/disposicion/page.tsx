"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
        className="text-xs text-accent hover:text-primary transition-colors inline-flex items-center gap-1 uppercase tracking-wide"
      >
        {"<"} VOLVER
      </Link>

      <div className="space-y-3">
        <h1 className="text-base md:text-lg font-bold text-primary glow-text font-mono">{"> "}¿Dónde está tu equipo?</h1>
        <p className="text-xs md:text-sm text-muted-foreground">{"// "}Elegí la opción que más se parezca</p>
      </div>

      <form className="space-y-8" onSubmit={handleContinue}>
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-accent uppercase tracking-wide border-b border-accent/30 pb-1">
            [01] Ubicación del equipo de sonido / parlantes
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
                className={`flex items-start gap-3 cursor-pointer p-3 border-2 transition-all touch-manipulation ${
                  formData.ubicacionEquipo === option.value
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 bg-card hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    formData.ubicacionEquipo === option.value ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}
                >
                  {formData.ubicacionEquipo === option.value && <div className="w-2.5 h-2.5 bg-primary-foreground"></div>}
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
                  <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Helper tip */}
          <p className="text-[10px] text-muted-foreground">
            Tip: La pared larga es generalmente la mejor opción para distribución stereo balanceada.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-accent uppercase tracking-wide border-b border-accent/30 pb-1">
            [02] Dónde te sentás normalmente para escuchar
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
                className={`flex items-start gap-3 cursor-pointer p-3 border-2 transition-all touch-manipulation ${
                  formData.dondeSientas === option.value
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 bg-card hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    formData.dondeSientas === option.value ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}
                >
                  {formData.dondeSientas === option.value && <div className="w-2.5 h-2.5 bg-primary-foreground"></div>}
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
                  <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Info box */}
          <div className="p-3 border border-accent/20 bg-accent/5">
            <p className="text-[10px] text-muted-foreground">
              <span className="text-accent font-bold">Info:</span> El punto de escucha ideal forma un triángulo equilátero con
              los parlantes. Evitá paredes cercanas a tu espalda.
            </p>
          </div>
        </div>

        <PrimaryButton type="submit">[CONTINUAR]</PrimaryButton>
      </form>
    </CenteredLayout>
  )
}
