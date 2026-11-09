"use client"

import { approximateDimensions } from "@/lib/layoutTrial"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ChevronLeft } from "lucide-react"

import { CenteredLayout } from "@/components/CenteredLayout"
import { Button } from "@/components/Button"
import { InfoCallout } from "@/components/InfoCallout"
import { useRoomHydrated, useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"
import type { RoomProject } from "@/app/types/room"

export default function EspacioPage() {
  const router = useRouter()
  const updateProject = useRoomStore((s) => s.updateProject)
  const project = useRoomStore((s) => s.project)
  const hydrated = useRoomHydrated()
  const { t } = useT()
  const [concern, setConcern] = useState<"clarity" | "echo" | "bass" | "noise">("clarity")
  const [mode, setMode] = useState<"measured" | "approximate">("measured")
  const [size, setSize] = useState<"small" | "medium" | "large">("medium")
  const [shape, setShape] = useState<"square" | "rectangle">("rectangle")
  const [formData, setFormData] = useState({
    largo: "",
    ancho: "",
    altura: "",
    tipoPiso: "",
    tipoParedes: "",
  })

  // The form lives in local state, so restoring the store isn't enough — seed the inputs
  // from it once, after a refresh or a restored tab brings the previous answers back.
  const seeded = useRef(false)
  useEffect(() => {
    if (!hydrated || seeded.current) return
    seeded.current = true
    setConcern(project.concern ?? "clarity")
    setMode(new URLSearchParams(window.location.search).get("precision") === "1" ? "measured" : project.dimensionSource ?? "measured")
    setSize(project.roomSize ?? "medium")
    setShape(project.roomShape ?? "rectangle")
    setFormData((prev) => ({
      largo: project.dimensionSource === "approximate" ? "" : project.lengthM?.toString() ?? prev.largo,
      ancho: project.dimensionSource === "approximate" ? "" : project.widthM?.toString() ?? prev.ancho,
      altura: project.dimensionSource === "approximate" ? "" : project.heightM?.toString() ?? prev.altura,
      tipoPiso: project.floorType ?? prev.tipoPiso,
      tipoParedes: project.wallType ?? prev.tipoParedes,
    }))
  }, [hydrated, project])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const largoNum = parseFloat(formData.largo)
  const anchoNum = parseFloat(formData.ancho)
  const alturaNum = parseFloat(formData.altura)
  const isValid = (mode === "approximate" || (
    formData.largo !== "" && largoNum > 0 &&
    formData.ancho !== "" && anchoNum > 0 &&
    formData.altura !== "" && alturaNum > 0)) &&
    formData.tipoPiso !== "" &&
    formData.tipoParedes !== ""

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    updateProject({
      concern, dimensionSource: mode, roomSize: size, roomShape: shape,
      lengthM: formData.largo ? Number(formData.largo) : undefined,
      widthM: formData.ancho ? Number(formData.ancho) : undefined,
      heightM: formData.altura ? Number(formData.altura) : undefined,
      floorType: formData.tipoPiso as RoomProject["floorType"],
      wallType: formData.tipoParedes as RoomProject["wallType"],
      ...(mode === "approximate" ? approximateDimensions(size, shape) : {}),
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
        <label className="block text-sm">{t.layoutTrial.problem}<select className="block w-full border border-border bg-background p-3 mt-2" value={concern} onChange={e => setConcern(e.target.value as typeof concern)}>{(["clarity", "echo", "bass", "noise"] as const).map(value => <option key={value} value={value}>{t.layoutTrial[value]}</option>)}</select></label>
        <div className="flex gap-2" role="group" aria-label={t.espacio.dimensions}>
          {(["measured", "approximate"] as const).map(value => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={`flex-1 border p-3 rounded-sm text-sm ${mode === value ? "border-primary text-primary" : "border-border"}`}>{value === "measured" ? t.layoutTrial.exact : t.layoutTrial.quick}</button>)}
        </div>
        {mode === "approximate" ? <div className="space-y-3">
          <label className="block text-sm">{t.layoutTrial.size}<select className="block w-full border border-border bg-background p-3 mt-2" value={size} onChange={e => setSize(e.target.value as typeof size)}>{(["small", "medium", "large"] as const).map(value => <option key={value} value={value}>{t.layoutTrial[value]}</option>)}</select></label>
          <label className="block text-sm">{t.layoutTrial.shape}<select className="block w-full border border-border bg-background p-3 mt-2" value={shape} onChange={e => setShape(e.target.value as typeof shape)}>{(["square", "rectangle"] as const).map(value => <option key={value} value={value}>{t.layoutTrial[value]}</option>)}</select></label>
          <p className="text-xs text-muted-foreground">{t.layoutTrial.assumptions}</p>
        </div> : <>
        {/* Dimensiones */}
        <div className="space-y-3">
          <h2 className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground pb-1 border-b border-dotted border-border">
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
                className="w-full border border-border rounded-sm px-3 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all touch-manipulation"
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
                className="w-full border border-border rounded-sm px-3 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all touch-manipulation"
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
                className="w-full border border-border rounded-sm px-3 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all touch-manipulation"
              />
            </div>
          </div>

          <InfoCallout label={t.common.tip}>{t.espacio.dimensionsTip}</InfoCallout>
        </div>

        </>}
        {/* Materiales */}
        <div className="space-y-3">
          <h2 className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground pb-1 border-b border-dotted border-border">
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
              className="w-full border border-border rounded-sm px-3 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer touch-manipulation"
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
              className="w-full border border-border rounded-sm px-3 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer touch-manipulation"
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

          <InfoCallout label={t.common.info}>{t.espacio.materialsInfo}</InfoCallout>
        </div>

        <Button type="submit" disabled={!isValid} className="w-full">{t.common.next}</Button>
      </form>
    </CenteredLayout>
  )
}
