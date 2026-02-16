"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CenteredLayout } from "@/components/CenteredLayout"
import { useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"

export default function AnalizandoPage() {
  const router = useRouter()
  const project = useRoomStore((s) => s.project)
  const setAnalysis = useRoomStore((s) => s.setAnalysis)
  const { t } = useT()

  const tips = [t.analizando.tip1, t.analizando.tip2, t.analizando.tip3]

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

      <div className="flex justify-center py-6">
        <div className="flex gap-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "450ms" }}></div>
        </div>
      </div>

      <div className="bg-muted rounded-2xl p-4 space-y-4">
        <p className="text-xs font-medium text-foreground">{t.analizando.usefulData}</p>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="text-xs text-muted-foreground flex gap-3">
              <span className="text-primary font-semibold flex-shrink-0">{index + 1}.</span>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </CenteredLayout>
  )
}
