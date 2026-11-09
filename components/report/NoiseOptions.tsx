"use client"
import { noiseGuidance } from "@/lib/noiseGuidance"
import type { RoomProject } from "@/app/types/room"
import { useT } from "@/lib/i18n"

export function NoiseOptions({ project }: { project: RoomProject }) {
  const { t } = useT()
  return <details className="border border-border rounded-sm p-4">
    <summary className="cursor-pointer min-h-11 text-sm font-medium">{t.noise.options}</summary>
    <div className="space-y-4 pt-3">
      <p className="text-xs text-muted-foreground">{t.noise.basis}</p>
      {noiseGuidance(project, t.noise).map(item=><section key={item.title}><h3 className="text-sm font-medium">{item.title}</h3><p className="mt-1 text-sm text-muted-foreground">{item.body}</p></section>)}
      <p className="text-sm">{t.noise.verify}</p>
      <p className="text-xs text-muted-foreground">{t.noise.limit}</p>
      <p className="text-xs">{t.noise.sources}: <a className="underline" href="https://www.yourhome.gov.au/live-adapt/noise-control" target="_blank" rel="noreferrer">YourHome</a>, <a className="underline" href="https://www.building.govt.nz/getting-started/smarter-homes-guides/design/reducing-noise" target="_blank" rel="noreferrer">Building Performance</a></p>
    </div>
  </details>
}
