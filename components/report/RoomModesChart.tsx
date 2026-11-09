"use client"

import type { RoomMode } from "@/app/types/room"
import { useT } from "@/lib/i18n"

export function RoomModesChart({ modes }: { modes: RoomMode[] }) {
  const { t, locale } = useT()
  const es = locale === "es"
  return <section className="border border-border rounded-sm p-4 space-y-3">
    <h2 className="text-sm font-semibold">{t.report.modes.title}</h2>
    <p className="text-sm text-muted-foreground">{es ? "Frecuencias teóricas calculadas con las dimensiones ingresadas. No indican cuánto se escuchan en tu asiento ni si necesitás tratamiento." : "Theoretical frequencies calculated from entered dimensions. They do not show how strong they are at your seat or whether treatment is needed."}</p>
    <details><summary className="cursor-pointer min-h-11 text-sm">{es ? "Ver frecuencias del modelo" : "Show model frequencies"}</summary>
      <ul className="space-y-2 text-xs">{modes.filter(mode=>mode.frequency<300).slice(0,25).map((mode,i)=><li key={i} className="flex justify-between gap-3 border-b border-border py-2"><span>{mode.description}</span><span className="font-mono whitespace-nowrap">{Math.round(mode.frequency)} Hz</span></li>)}</ul>
    </details>
  </section>
}
