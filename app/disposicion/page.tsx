"use client"

import { instrumentCopy } from "@/lib/acoustics/instrumentCopy"
import { DEFAULT_MOVES } from "@/lib/layoutTrial"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ChevronLeft } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { Button } from "@/components/Button"
import { OptionCard } from "@/components/OptionCard"
import { InfoCallout } from "@/components/InfoCallout"
import { useRoomHydrated, useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"
import type { RoomProject } from "@/app/types/room"

export default function DisposicionPage() {
  const router = useRouter()
  const updateProject = useRoomStore((s) => s.updateProject)
  const project = useRoomStore((s) => s.project)
  const hydrated = useRoomHydrated()
  const { t,locale } = useT()
  const instrument=project.goal==="instrument",ic=instrumentCopy[locale]
  const [moves, setMoves] = useState(DEFAULT_MOVES)
  const [formData, setFormData] = useState({
    ubicacionEquipo: "",
    dondeSientas: "",
  })

  // Seed the selection from the restored store — see the same pattern in /espacio.
  const seeded = useRef(false)
  useEffect(() => {
    if (!hydrated || seeded.current) return
    seeded.current = true
    setMoves(project.moveConstraints ?? DEFAULT_MOVES)
    setFormData((prev) => ({
      ubicacionEquipo: project.speakerPlacement ?? prev.ubicacionEquipo,
      dondeSientas: project.listeningPosition ?? prev.dondeSientas,
    }))
  }, [hydrated, project])

  const isValid = formData.ubicacionEquipo !== "" && formData.dondeSientas !== ""

  const handleContinue = () => {
    if (!isValid) return

    updateProject({
      moveConstraints: moves,
      speakerPlacement: formData.ubicacionEquipo as RoomProject["speakerPlacement"],
      listeningPosition: formData.dondeSientas as RoomProject["listeningPosition"],
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
        <h1 className="text-base md:text-lg font-semibold text-foreground leading-snug">{instrument?ic.placementTitle:t.disposicion.title}</h1>
        <p className="text-xs md:text-sm text-muted-foreground">{t.disposicion.subtitle}</p>
      </div>

      <fieldset className="border border-border p-4 space-y-2">
        <legend className="text-sm font-medium">{t.layoutTrial.restrictions}</legend>
        {(["speakers", "listening", "furniture"] as const).map(key => <label key={key} className="flex items-center gap-2 min-h-10 text-sm"><input type="checkbox" checked={moves[key]} onChange={e => setMoves(prev => ({ ...prev, [key]: e.target.checked }))} />{instrument?(key==="speakers"?ic.source:key==="listening"?ic.receiver:t.layoutTrial[key]):t.layoutTrial[key]}</label>)}
        <p className="text-xs text-muted-foreground">{t.layoutTrial.constraintsHint}</p>
      </fieldset>
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground pb-1 border-b border-dotted border-border">
            {instrument?ic.sourceTitle:t.disposicion.speakerTitle}
          </h2>
          <div>
            {speakerOptions.map((option) => (
              <OptionCard
                key={option.value}
                variant="radio"
                selected={formData.ubicacionEquipo === option.value}
                onSelect={() => setFormData((prev) => ({ ...prev, ubicacionEquipo: option.value }))}
                title={option.label}
                description={instrument?ic.sourceHint:option.desc}
              />
            ))}
          </div>

          <InfoCallout label={t.common.tip}>{t.disposicion.speakerTip}</InfoCallout>
        </div>

        <div className="space-y-2">
          <h2 className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground pb-1 border-b border-dotted border-border">
            {instrument?ic.receiverTitle:t.disposicion.listeningTitle}
          </h2>
          <div>
            {listeningOptions.map((option) => (
              <OptionCard
                key={option.value}
                variant="radio"
                selected={formData.dondeSientas === option.value}
                onSelect={() => setFormData((prev) => ({ ...prev, dondeSientas: option.value }))}
                title={option.label}
                description={instrument?ic.receiverHint:option.desc}
              />
            ))}
          </div>

          <InfoCallout label={t.common.info}>{instrument?ic.receiverHint:t.disposicion.listeningInfo}</InfoCallout>
        </div>

        <Button onClick={handleContinue} disabled={!isValid} className="w-full">{t.common.next}</Button>
      </div>
    </CenteredLayout>
  )
}
