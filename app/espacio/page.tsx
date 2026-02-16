"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronLeft } from "lucide-react"

import { CenteredLayout } from "@/components/CenteredLayout"
import { PrimaryButton } from "@/components/PrimaryButton"
import { useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"

export default function EspacioPage() {
  const router = useRouter()
  const updateProject = useRoomStore((s) => s.updateProject)
  const { t } = useT()
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
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        {t.common.back}
      </Link>

      <div className="space-y-3">
        <h1 className="text-base md:text-lg font-semibold text-foreground leading-snug">
          {t.espacio.title}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          {t.espacio.subtitle}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleContinue}>
        {/* Dimensiones */}
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground pb-1 border-b border-border">
            {t.espacio.dimensions}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="largo" className="block text-xs font-medium text-foreground mb-2">
                {t.espacio.length}
              </label>
              <input
                type="number"
                step="0.1"
                id="largo"
                name="largo"
                value={formData.largo}
                onChange={handleChange}
                placeholder={t.espacio.lengthPlaceholder}
                className="w-full border border-border rounded-lg px-3 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all touch-manipulation"
              />
            </div>

            <div>
              <label htmlFor="ancho" className="block text-xs font-medium text-foreground mb-2">
                {t.espacio.width}
              </label>
              <input
                type="number"
                step="0.1"
                id="ancho"
                name="ancho"
                value={formData.ancho}
                onChange={handleChange}
                placeholder={t.espacio.widthPlaceholder}
                className="w-full border border-border rounded-lg px-3 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all touch-manipulation"
              />
            </div>

            <div>
              <label htmlFor="altura" className="block text-xs font-medium text-foreground mb-2">
                {t.espacio.height}
              </label>
              <input
                type="number"
                step="0.1"
                id="altura"
                name="altura"
                value={formData.altura}
                onChange={handleChange}
                placeholder={t.espacio.heightPlaceholder}
                className="w-full border border-border rounded-lg px-3 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all touch-manipulation"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {t.common.tip} {t.espacio.dimensionsTip}
          </p>
        </div>

        {/* Materiales */}
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground pb-1 border-b border-border">
            {t.espacio.materials}
          </h2>

          <div>
            <label htmlFor="tipoPiso" className="block text-xs font-medium text-foreground mb-2">
              {t.espacio.floorType}
            </label>
            <select
              id="tipoPiso"
              name="tipoPiso"
              value={formData.tipoPiso}
              onChange={handleChange}
              className="w-full border border-border rounded-lg px-3 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer touch-manipulation"
            >
              <option value="">{t.espacio.selectPlaceholder}</option>
              <optgroup label={t.espacio.hardFloors}>
                <option value="ceramico">{t.espacio.ceramic}</option>
                <option value="madera">{t.espacio.wood}</option>
                <option value="vinilico">{t.espacio.vinyl}</option>
                <option value="concreto">{t.espacio.concrete}</option>
                <option value="marmol">{t.espacio.marble}</option>
              </optgroup>
              <optgroup label={t.espacio.softFloors}>
                <option value="alfombra">{t.espacio.carpet}</option>
                <option value="goma">{t.espacio.rubber}</option>
              </optgroup>
              <option value="otro">{t.espacio.otherFloor}</option>
            </select>
          </div>

          <div>
            <label htmlFor="tipoParedes" className="block text-xs font-medium text-foreground mb-2">
              {t.espacio.wallType}
            </label>
            <select
              id="tipoParedes"
              name="tipoParedes"
              value={formData.tipoParedes}
              onChange={handleChange}
              className="w-full border border-border rounded-lg px-3 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer touch-manipulation"
            >
              <option value="">{t.espacio.selectPlaceholder}</option>
              <optgroup label={t.espacio.hardWalls}>
                <option value="desnudas">{t.espacio.nakedWalls}</option>
                <option value="vidrio">{t.espacio.windowWalls}</option>
                <option value="ladrillo">{t.espacio.brickWalls}</option>
              </optgroup>
              <optgroup label={t.espacio.withElements}>
                <option value="cuadros">{t.espacio.framedWalls}</option>
                <option value="bibliotecas">{t.espacio.libraryWalls}</option>
                <option value="cortinas">{t.espacio.curtainWalls}</option>
                <option value="paneles_madera">{t.espacio.panelWalls}</option>
              </optgroup>
              <option value="mixto">{t.espacio.mixedWalls}</option>
            </select>
          </div>

          <div className="p-3 bg-muted rounded-xl">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">{t.common.info}</span> {t.espacio.materialsInfo}
            </p>
          </div>
        </div>

        <PrimaryButton type="submit">{t.common.next}</PrimaryButton>
      </form>
    </CenteredLayout>
  )
}
