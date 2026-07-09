"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CenteredLayout } from "@/components/CenteredLayout"
import { StandingWaveMotif } from "@/components/motifs/StandingWaveMotif"
import { useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"

export default function AnalizandoPage() {
  const router = useRouter()
  const project = useRoomStore((s) => s.project)
  const setAnalysis = useRoomStore((s) => s.setAnalysis)
  const { t } = useT()

  const tips = [t.analizando.tip1, t.analizando.tip2, t.analizando.tip3]

  const room =
    project.lengthM && project.widthM && project.heightM
      ? { length: project.lengthM, width: project.widthM, height: project.heightM }
      : undefined

  useEffect(() => {
    const run = async () => {
      try {
        const locale = localStorage.getItem("locale") || "es"
        const res = await fetch("/api/analyze-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...project, locale }),
        })

        const data = await res.json()
        setAnalysis(data)
      } catch (_) {}
      router.push("/resultado")
    }

    run()
  }, [])

  return (
    <CenteredLayout>
      <div className="space-y-3 text-center">
        <h1 className="text-lg md:text-xl font-semibold text-foreground leading-snug">{t.analizando.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{t.analizando.subtitle}</p>
      </div>

      <StandingWaveMotif variant="hero" animated room={room} className="h-20 w-full py-2" />

      <div className="border border-border rounded-sm p-4 space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{t.analizando.usefulData}</p>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="text-xs text-muted-foreground flex gap-3">
              <span className="font-mono text-primary">{String(index + 1).padStart(2, "0")}</span>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </CenteredLayout>
  )
}
