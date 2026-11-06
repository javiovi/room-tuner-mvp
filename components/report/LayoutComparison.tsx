"use client"

import type { Layout } from "@/lib/layoutTrial"
import { compareLayoutGeometry } from "@/lib/layoutGeometry"
import { useT } from "@/lib/i18n"

export function LayoutComparison({ current, proposal, approximate, preview = false }: { current: Layout; proposal: Layout; approximate: boolean; preview?: boolean }) {
  const { t, locale } = useT()
  const c = t.layoutTrial
  const geometry = compareLayoutGeometry(current, proposal)
  const format = (distance: number) => `${new Intl.NumberFormat(locale === "en" ? "en-US" : "es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(distance)} m`
  const objectLabels = [c.left, c.right, c.listening]
  const wallLabels = { left: c.wallLeft, right: c.wallRight, top: c.wallTop, bottom: c.wallBottom }
  if (!geometry) return <p role="status" className="text-xs text-muted-foreground">{c.measurementsMissing}</p>

  return <section aria-label={c.comparison} className="space-y-3 border-t border-border pt-4">
    <h3 className="text-sm font-semibold">{c.comparison}</h3>
    <p className="text-xs text-muted-foreground">{approximate ? c.approximateGeometry : c.geometryNote}</p>
    {preview && <p className="text-xs text-primary">{c.previewComparison}</p>}
    <div className="space-y-3">
      {([{ id: "left", label: c.leftDistance }, { id: "right", label: c.rightDistance }, { id: "separation", label: c.speakerSeparation }] as const).map(metric => <div key={metric.id} data-geometry={metric.id} className="space-y-1.5">
        <p className="text-xs font-medium">{metric.label}</p>
        {(["current", "proposal"] as const).map(view => <div key={view} className={`grid items-center gap-2 text-[11px] ${approximate ? "grid-cols-[64px_1fr]" : "grid-cols-[64px_1fr_60px]"}`}>
          <span className="text-muted-foreground">{c[view]}</span>
          <div className="h-2.5 bg-secondary rounded-sm overflow-hidden" aria-hidden="true"><div className={`h-full rounded-sm ${view === "current" ? "bg-muted-foreground/70" : "bg-primary"}`} style={{ width: `${geometry[view][metric.id] / geometry.diagonal * 100}%` }} /></div>
          {!approximate && <span data-case={view} className="font-mono text-right tabular-nums">{format(geometry[view][metric.id])}</span>}
        </div>)}
      </div>)}
    </div>
    <p className="text-[10px] text-muted-foreground">{c.scaleNote}{!approximate && ` (${format(geometry.diagonal)})`}.</p>
    {!approximate && <>
      <div className="rounded-sm bg-secondary/50 p-3 space-y-1" data-geometry="difference">
        <p className="text-xs font-medium">{c.distanceDifference}</p>
        <div className="grid grid-cols-2 gap-3 font-mono text-sm tabular-nums">{(["current", "proposal"] as const).map(view => <p key={view} data-case={view} className={view === "proposal" ? "text-primary" : ""}><span className="block text-[11px]">{c[view]}</span>{format(geometry[view].difference)}</p>)}</div>
        <p className="text-[11px] text-muted-foreground">{c.differenceNote}</p>
      </div>
      <details className="border border-border rounded-sm p-3">
        <summary className="cursor-pointer text-xs min-h-8">{c.wallComparison}</summary>
        <div className="pt-2 space-y-3">
          <table className="w-full table-fixed text-[11px]" aria-label={c.closestWall}>
            <thead><tr className="border-b border-border text-muted-foreground"><th scope="col" className="w-[40%] text-left font-medium py-2">{c.closestWall}</th><th scope="col" className="font-medium">{c.current}</th><th scope="col" className="font-medium text-primary">{c.proposal}</th></tr></thead>
            <tbody>{objectLabels.map((label, i) => <tr key={label} className="border-b border-border" data-wall-object={i}><th scope="row" className="text-left font-normal py-2 pr-1">{label}</th>{(["current", "proposal"] as const).map(view => <td key={view} data-case={view} className="text-center py-2"><span className="font-mono tabular-nums">{format(geometry[view].walls[i].distance)}</span><span className="block text-muted-foreground">{wallLabels[geometry[view].walls[i].wall]}</span></td>)}</tr>)}</tbody>
          </table>
          <p className="text-[10px] text-muted-foreground">{c.wallNote}</p>
          <table className="w-full table-fixed text-[11px]" aria-label={c.displacement}>
            <thead><tr className="border-b border-border text-muted-foreground"><th scope="col" className="w-1/2 text-left font-medium py-2">{c.objectColumn}</th><th scope="col" className="text-right font-medium">{c.displacement}</th></tr></thead>
            <tbody>{geometry.movements.filter(m => !m.id.startsWith("furniture") || m.distance >= .005).map(movement => {
              const label = movement.id === "speaker-0" ? c.left : movement.id === "speaker-1" ? c.right : movement.id === "listening" ? c.listening : (() => { const type = current.furnitureLayout[Number(movement.id.split("-")[1])].type; return t.report.furniture[type as keyof typeof t.report.furniture] ?? type })()
              return <tr key={movement.id} data-movement={movement.id} className="border-b border-border"><th scope="row" className="text-left font-normal py-2 pr-1">{label}</th><td className="text-right font-mono tabular-nums py-2">{movement.distance < .005 ? c.unchanged : format(movement.distance)}</td></tr>
            })}</tbody>
          </table>
        </div>
      </details>
    </>}
  </section>
}
