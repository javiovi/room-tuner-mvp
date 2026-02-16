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

export default function DisposicionPage() {
  const router = useRouter()
  const updateProject = useRoomStore((s) => s.updateProject)
  const { t } = useT()
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

  const speakerOptions = [
    { value: "pared-larga-centrado", label: t.disposicion.longWall, desc: t.disposicion.longWallDesc },
    { value: "pared-corta-centrado", label: t.disposicion.shortWall, desc: t.disposicion.shortWallDesc },
    { value: "esquina", label: t.disposicion.corner, desc: t.disposicion.cornerDesc },
    { value: "pared-lateral", label: t.disposicion.sideWall, desc: t.disposicion.sideWallDesc },
    { value: "indefinido", label: t.disposicion.undecided, desc: t.disposicion.undecidedDesc },
  ]

  const listeningOptions = [
    { value: "centro-sala", label: t.disposicion.centerRoom, desc: t.disposicion.centerRoomDesc },
    { value: "escritorio-pared", label: t.disposicion.deskWall, desc: t.disposicion.deskWallDesc },
    { value: "sillon-pared-posterior", label: t.disposicion.sofaBack, desc: t.disposicion.sofaBackDesc },
    { value: "esquina", label: t.disposicion.cornerListen, desc: t.disposicion.cornerListenDesc },
    { value: "variable", label: t.disposicion.variable, desc: t.disposicion.variableDesc },
  ]

  return (
    <CenteredLayout>
      <Link
        href="/espacio"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        {t.common.back}
      </Link>

      <div className="space-y-3">
        <h1 className="text-base md:text-lg font-semibold text-foreground leading-snug">{t.disposicion.title}</h1>
        <p className="text-xs md:text-sm text-muted-foreground">{t.disposicion.subtitle}</p>
      </div>

      <form className="space-y-8" onSubmit={handleContinue}>
        <div className="space-y-4">
          <h2 className="text-xs font-medium text-muted-foreground pb-1 border-b border-border">
            {t.disposicion.speakerTitle}
          </h2>
          <div className="space-y-2">
            {speakerOptions.map((option) => (
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
            {t.common.tip} {t.disposicion.speakerTip}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-medium text-muted-foreground pb-1 border-b border-border">
            {t.disposicion.listeningTitle}
          </h2>
          <div className="space-y-2">
            {listeningOptions.map((option) => (
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
              <span className="text-foreground font-medium">{t.common.info}</span> {t.disposicion.listeningInfo}
            </p>
          </div>
        </div>

        <PrimaryButton type="submit">{t.common.next}</PrimaryButton>
      </form>
    </CenteredLayout>
  )
}
