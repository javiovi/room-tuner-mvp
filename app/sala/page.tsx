"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { CenteredLayout } from "@/components/CenteredLayout"
import { PrimaryButton } from "@/components/PrimaryButton"

export default function SalaPage() {
  const router = useRouter()
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
        <h1 className="text-lg md:text-xl font-bold text-primary glow-text font-mono">{"> "}Contanos sobre tu sala</h1>
        <p className="text-sm text-muted-foreground">{"// "}No hace falta que las medidas sean perfectas</p>
      </div>

      <form className="space-y-5" onSubmit={handleContinue}>
        <div>
          <label htmlFor="largo" className="block text-xs font-semibold text-accent mb-2 uppercase tracking-wide">
            Largo (m)
          </label>
          <input
            type="text"
            id="largo"
            name="largo"
            value={formData.largo}
            onChange={handleChange}
            placeholder="ej: 5"
            className="w-full border-2 border-primary/50 px-4 py-3 text-sm bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
          />
        </div>

        <div>
          <label htmlFor="ancho" className="block text-xs font-semibold text-accent mb-2 uppercase tracking-wide">
            Ancho (m)
          </label>
          <input
            type="text"
            id="ancho"
            name="ancho"
            value={formData.ancho}
            onChange={handleChange}
            placeholder="ej: 4"
            className="w-full border-2 border-primary/50 px-4 py-3 text-sm bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
          />
        </div>

        <div>
          <label htmlFor="altura" className="block text-xs font-semibold text-accent mb-2 uppercase tracking-wide">
            Altura (m)
          </label>
          <input
            type="text"
            id="altura"
            name="altura"
            value={formData.altura}
            onChange={handleChange}
            placeholder="ej: 2.7"
            className="w-full border-2 border-primary/50 px-4 py-3 text-sm bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
          />
        </div>

        <div>
          <label htmlFor="tipoPiso" className="block text-xs font-semibold text-accent mb-2 uppercase tracking-wide">
            Tipo de piso
          </label>
          <select
            id="tipoPiso"
            name="tipoPiso"
            value={formData.tipoPiso}
            onChange={handleChange}
            className="w-full border-2 border-primary/50 px-4 py-3 text-sm bg-muted text-foreground focus:outline-none focus:border-primary transition-all appearance-none font-mono cursor-pointer"
          >
            <option value="">{">"} Selecciona una opción</option>
            <option value="madera">Madera</option>
            <option value="ceramico">Cerámico</option>
            <option value="alfombra">Alfombra</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label htmlFor="tipoParedes" className="block text-xs font-semibold text-accent mb-2 uppercase tracking-wide">
            Tipo de paredes
          </label>
          <select
            id="tipoParedes"
            name="tipoParedes"
            value={formData.tipoParedes}
            onChange={handleChange}
            className="w-full border-2 border-primary/50 px-4 py-3 text-sm bg-muted text-foreground focus:outline-none focus:border-primary transition-all appearance-none font-mono cursor-pointer"
          >
            <option value="">{">"} Selecciona una opción</option>
            <option value="desnudas">Desnudas</option>
            <option value="cuadros">Con cuadros</option>
            <option value="bibliotecas">Con bibliotecas</option>
            <option value="mixto">Mixto</option>
          </select>
        </div>

        <PrimaryButton type="submit">[CONTINUAR]</PrimaryButton>
      </form>
    </CenteredLayout>
  )
}
