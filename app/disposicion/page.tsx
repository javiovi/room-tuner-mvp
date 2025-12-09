"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { CenteredLayout } from "@/components/CenteredLayout"

export default function DisposicionPage() {
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

  return (
    <CenteredLayout>
      <Link
        href="/sala"
        className="text-xs text-accent hover:text-primary transition-colors inline-flex items-center gap-1 uppercase tracking-wide"
      >
        {"<"} VOLVER
      </Link>

      <div className="space-y-3">
        <h1 className="text-lg md:text-xl font-bold text-primary glow-text font-mono">{"> "}¿Dónde está tu equipo?</h1>
        <p className="text-sm text-muted-foreground">{"// "}Elegí la opción que más se parezca</p>
      </div>

      <form className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-accent uppercase tracking-wide">
            [01] Ubicación del equipo de sonido
          </h2>
          <div className="space-y-2">
            {["Frente a la pared larga", "Frente a la pared corta", "Todavía no lo definí"].map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 cursor-pointer p-3 border-2 transition-all ${
                  formData.ubicacionEquipo === option
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 bg-card hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-4 h-4 border-2 flex items-center justify-center ${
                    formData.ubicacionEquipo === option ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}
                >
                  {formData.ubicacionEquipo === option && <div className="w-2 h-2 bg-primary-foreground"></div>}
                </div>
                <input
                  type="radio"
                  name="ubicacionEquipo"
                  value={option}
                  checked={formData.ubicacionEquipo === option}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-sm text-foreground">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-accent uppercase tracking-wide">
            [02] Dónde te sentás normalmente
          </h2>
          <div className="space-y-2">
            {["Cerca del centro de la sala", "Pegado a una pared", "En una esquina", "Voy cambiando bastante"].map(
              (option) => (
                <label
                  key={option}
                  className={`flex items-center gap-3 cursor-pointer p-3 border-2 transition-all ${
                    formData.dondeSientas === option
                      ? "border-primary bg-primary/10"
                      : "border-muted-foreground/30 bg-card hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`w-4 h-4 border-2 flex items-center justify-center ${
                      formData.dondeSientas === option ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}
                  >
                    {formData.dondeSientas === option && <div className="w-2 h-2 bg-primary-foreground"></div>}
                  </div>
                  <input
                    type="radio"
                    name="dondeSientas"
                    value={option}
                    checked={formData.dondeSientas === option}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ),
            )}
          </div>
        </div>
      </form>

      <Link
        href="/muebles"
        className="block w-full bg-primary text-primary-foreground py-3 px-6 font-semibold text-center uppercase text-sm tracking-wide border-black hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
        style={{ borderWidth: "3px", borderStyle: "solid", boxShadow: "4px 4px 0 0 rgba(0,0,0,1)" }}
      >
        [CONTINUAR]
      </Link>
    </CenteredLayout>
  )
}
