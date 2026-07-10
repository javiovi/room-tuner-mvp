"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { Button } from "@/components/Button"
import { StandingWaveMotif } from "@/components/motifs/StandingWaveMotif"
import { useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"

export default function AnalizandoPage() {
  const router = useRouter()
  const project = useRoomStore((s) => s.project)
  const setAnalysis = useRoomStore((s) => s.setAnalysis)
  const { t } = useT()
  const [status, setStatus] = useState<"loading" | "error">("loading")

  const tips = [t.analizando.tip1, t.analizando.tip2, t.analizando.tip3]

  const room =
    project.lengthM && project.widthM && project.heightM
      ? { length: project.lengthM, width: project.widthM, height: project.heightM }
      : undefined

  const run = useCallback(async () => {
    setStatus("loading")
    try {
      const locale = localStorage.getItem("locale") || "es"
      const res = await fetch("/api/analyze-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...project, locale }),
      })

      const data = await res.json()

      // A failed request can still return valid JSON (the API's own error payload) —
      // res.ok alone isn't enough, confirm the shape actually looks like an analysis
      // before trusting it and navigating away.
      if (!res.ok || !data || typeof data !== "object" || !data.roomMetrics) {
        setStatus("error")
        return
      }

      setAnalysis(data)
      router.push(data.projectId ? `/resultado?id=${data.projectId}` : "/resultado")
    } catch {
      setStatus("error")
    }
  }, [project, router, setAnalysis])

  useEffect(() => {
    run()
  }, [run])

  if (status === "error") {
    return (
      <CenteredLayout>
        <div className="space-y-3 text-center">
          <AlertTriangle className="w-6 h-6 text-destructive mx-auto" strokeWidth={1.5} />
          <h1 className="text-lg md:text-xl font-semibold text-foreground leading-snug">{t.analizando.errorTitle}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.analizando.errorDesc}</p>
        </div>
        <Button onClick={run} className="w-full">{t.analizando.retryButton}</Button>
      </CenteredLayout>
    )
  }

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
