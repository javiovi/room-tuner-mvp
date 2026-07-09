"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { Button } from "@/components/Button"
import { OptionCard } from "@/components/OptionCard"
import { InfoCallout } from "@/components/InfoCallout"
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

  const handleContinue = () => {
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

      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground pb-1 border-b border-dotted border-border">
            {t.disposicion.speakerTitle}
          </h2>
          <div>
            {speakerOptions.map((option) => (
              <OptionCard
                key={option.value}
                variant="radio"
                selected={formData.ubicacionEquipo === option.value}
                onSelect={() => setFormData((prev) => ({ ...prev, ubicacionEquipo: option.value }))}
                title={option.label}
                description={option.desc}
              />
            ))}
          </div>

          <InfoCallout label={t.common.tip}>{t.disposicion.speakerTip}</InfoCallout>
        </div>

        <div className="space-y-2">
          <h2 className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground pb-1 border-b border-dotted border-border">
            {t.disposicion.listeningTitle}
          </h2>
          <div>
            {listeningOptions.map((option) => (
              <OptionCard
                key={option.value}
                variant="radio"
                selected={formData.dondeSientas === option.value}
                onSelect={() => setFormData((prev) => ({ ...prev, dondeSientas: option.value }))}
                title={option.label}
                description={option.desc}
              />
            ))}
          </div>

          <InfoCallout label={t.common.info}>{t.disposicion.listeningInfo}</InfoCallout>
        </div>

        <Button onClick={handleContinue} className="w-full">{t.common.next}</Button>
      </div>
    </CenteredLayout>
  )
}
