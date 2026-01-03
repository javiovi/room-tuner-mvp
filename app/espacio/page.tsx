"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { CenteredLayout } from "@/components/CenteredLayout"
import { PrimaryButton } from "@/components/PrimaryButton"
import { useRoomStore } from "@/lib/roomStore"

export default function EspacioPage() {
  const router = useRouter()
  const updateProject = useRoomStore((s) => s.updateProject)
  const [formData, setFormData] = useState({
    largo: "",
    ancho: "",
    altura: "",
    tipoPiso: "",
    tipoParedes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()

    updateProject({
      lengthM: formData.largo ? Number(formData.largo) : undefined,
      widthM: formData.ancho ? Number(formData.ancho) : undefined,
      heightM: formData.altura ? Number(formData.altura) : undefined,
      floorType: formData.tipoPiso as any,
      wallType: formData.tipoParedes as any,
    })

    router.push("/disposicion")
  }

  return (
    <CenteredLayout>
      <Link
        href="/objetivo"
        className="text-xs text-accent hover:text-primary transition-colors inline-flex items-center gap-1 uppercase tracking-wide"
      >
        {"<"} VOLVER
      </Link>

      <div className="space-y-3">
        <h1 className="text-base md:text-lg font-bold text-primary glow-text font-mono">
          {"> "}Contanos sobre tu espacio
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          {"// "}No hace falta que las medidas sean perfectas
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleContinue}>
        {/* Dimensiones */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-accent uppercase tracking-wide border-b border-accent/30 pb-1">
            [DIMENSIONES]
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="largo" className="block text-[11px] font-semibold text-accent mb-2 uppercase tracking-wide">
                Largo (m)
              </label>
              <input
                type="number"
                step="0.1"
                id="largo"
                name="largo"
                value={formData.largo}
                onChange={handleChange}
                placeholder="ej: 5"
                className="w-full border-2 border-primary/50 px-3 py-3 text-sm bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono touch-manipulation"
              />
            </div>

            <div>
              <label htmlFor="ancho" className="block text-[11px] font-semibold text-accent mb-2 uppercase tracking-wide">
                Ancho (m)
              </label>
              <input
                type="number"
                step="0.1"
                id="ancho"
                name="ancho"
                value={formData.ancho}
                onChange={handleChange}
                placeholder="ej: 4"
                className="w-full border-2 border-primary/50 px-3 py-3 text-sm bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono touch-manipulation"
              />
            </div>

            <div>
              <label htmlFor="altura" className="block text-[11px] font-semibold text-accent mb-2 uppercase tracking-wide">
                Altura (m)
              </label>
              <input
                type="number"
                step="0.1"
                id="altura"
                name="altura"
                value={formData.altura}
                onChange={handleChange}
                placeholder="ej: 2.7"
                className="w-full border-2 border-primary/50 px-3 py-3 text-sm bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono touch-manipulation"
              />
            </div>
          </div>

          {/* Helper text */}
          <p className="text-[10px] text-muted-foreground">
            Tip: Si no tenés las medidas exactas, estimá usando pasos (1 paso ≈ 0.8m)
          </p>
        </div>

        {/* Materiales */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-accent uppercase tracking-wide border-b border-accent/30 pb-1">
            [MATERIALES]
          </h2>

          <div>
            <label htmlFor="tipoPiso" className="block text-[11px] font-semibold text-accent mb-2 uppercase tracking-wide">
              Tipo de piso
            </label>
            <select
              id="tipoPiso"
              name="tipoPiso"
              value={formData.tipoPiso}
              onChange={handleChange}
              className="w-full border-2 border-primary/50 px-3 py-3 text-sm bg-muted text-foreground focus:outline-none focus:border-primary transition-all appearance-none font-mono cursor-pointer touch-manipulation"
            >
              <option value="">{">"} Selecciona una opción</option>
              <optgroup label="Duros (más reflexivos)">
                <option value="ceramico">Cerámico / Porcelanato</option>
                <option value="madera">Madera / Parquet</option>
                <option value="vinilico">Vinílico / Flotante</option>
                <option value="concreto">Concreto / Cemento</option>
                <option value="marmol">Mármol / Piedra</option>
              </optgroup>
              <optgroup label="Blandos (más absorbentes)">
                <option value="alfombra">Alfombra / Moquette</option>
                <option value="goma">Goma / Caucho</option>
              </optgroup>
              <option value="otro">Otro / Mixto</option>
            </select>
          </div>

          <div>
            <label htmlFor="tipoParedes" className="block text-[11px] font-semibold text-accent mb-2 uppercase tracking-wide">
              Tipo de paredes
            </label>
            <select
              id="tipoParedes"
              name="tipoParedes"
              value={formData.tipoParedes}
              onChange={handleChange}
              className="w-full border-2 border-primary/50 px-3 py-3 text-sm bg-muted text-foreground focus:outline-none focus:border-primary transition-all appearance-none font-mono cursor-pointer touch-manipulation"
            >
              <option value="">{">"} Selecciona una opción</option>
              <optgroup label="Duras (más reflexivas)">
                <option value="desnudas">Paredes desnudas / Pintadas</option>
                <option value="vidrio">Con ventanas grandes / Vidrio</option>
                <option value="ladrillo">Ladrillo a la vista</option>
              </optgroup>
              <optgroup label="Con elementos">
                <option value="cuadros">Con cuadros / Decoración</option>
                <option value="bibliotecas">Con bibliotecas / Muebles</option>
                <option value="cortinas">Con cortinas gruesas</option>
                <option value="paneles_madera">Paneles de madera</option>
              </optgroup>
              <option value="mixto">Mixto (combinación)</option>
            </select>
          </div>

          {/* Info sobre materiales */}
          <div className="p-2 border border-accent/20 bg-accent/5">
            <p className="text-[10px] text-muted-foreground">
              <span className="text-accent font-bold">Info:</span> Materiales duros reflejan más sonido (espacio más vivo),
              materiales blandos absorben (espacio más seco).
            </p>
          </div>
        </div>

        <PrimaryButton type="submit">[CONTINUAR]</PrimaryButton>
      </form>
    </CenteredLayout>
  )
}
