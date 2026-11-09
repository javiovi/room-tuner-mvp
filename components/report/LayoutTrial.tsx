"use client"

import { trackPilot } from "@/lib/analytics"
import { useEffect, useId, useRef, useState } from "react"
import { z } from "zod"
import type { RoomProject, RoomDiagram } from "@/app/types/room"
import { DEFAULT_MOVES, clampPoint, initialLayout, proposeLayout, type Layout, type MoveConstraints } from "@/lib/layoutTrial"
import { roomDiagramSchema } from "@/lib/validation/schemas"
import { useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"
import { getReportExperiments } from "@/lib/reportExperiments"
import { PlanObject } from "./PlanObject"
import { LayoutComparison } from "./LayoutComparison"

const savedSchema = z.object({
  current: roomDiagramSchema.shape.floorPlan,
  proposal: roomDiagramSchema.shape.floorPlan,
  confirmed: z.boolean().optional(),
  moves: z.object({ speakers: z.boolean(), listening: z.boolean(), furniture: z.boolean() }),
})

export function LayoutTrial({ reportKey, project, diagram, roomCharacter = "equilibrada", experimentId }: { reportKey: string; project: RoomProject; diagram: RoomDiagram; roomCharacter?: "viva" | "equilibrada" | "seca"; experimentId?: string }) {
  const { t } = useT()
  const setReportLayout = useRoomStore(s => s.setReportLayout)
  const updateProject = useRoomStore(s => s.updateProject)
  const c = t.layoutTrial
  const arrowId = useId().replace(/:/g, "")
  const [confirmed, setConfirmed] = useState(false)
  const [previewRun, setPreviewRun] = useState(0)
  const [previewAtTarget, setPreviewAtTarget] = useState(false)
  const [seed] = useState(() => initialLayout(project, diagram.floorPlan))
  const [current, setCurrent] = useState<Layout>(seed)
  const [initialMoves] = useState(project.moveConstraints ?? DEFAULT_MOVES)
  const [moves, setMoves] = useState<MoveConstraints>(initialMoves)
  const [proposal, setProposal] = useState<Layout>(() => proposeLayout(seed, project.moveConstraints ?? DEFAULT_MOVES))
  const [source, setSource] = useState<"user" | "schematic">("schematic")
  const [view, setView] = useState<"current" | "proposal">("current")
  const [selected, setSelected] = useState("speaker-0")
  const [showDistances, setShowDistances] = useState(false)
  const [ready, setReady] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragRef = useRef<{ id: string; pointer: number } | null>(null)
  const storageKey = `roomtuner-layout-v1:${reportKey}:${diagram.floorPlan.width}:${diagram.floorPlan.length}:${project.dimensionSource ?? "measured"}:${project.speakerPlacement ?? ""}:${project.listeningPosition ?? ""}`

  useEffect(() => {
    try {
      const parsed = savedSchema.safeParse(JSON.parse(localStorage.getItem(storageKey) ?? "null"))
      if (parsed.success) {
        setConfirmed(parsed.data.confirmed === true)
        setCurrent(parsed.data.current)
        setProposal(parsed.data.proposal)
        setSource("user")
        setReportLayout({ ...parsed.data, view: "current", source: "user" })
        setMoves(parsed.data.moves)
        updateProject({ moveConstraints: parsed.data.moves })
      } else setReportLayout({ current: seed, proposal: proposeLayout(seed, initialMoves), moves: initialMoves, view: "current", source: "schematic" })
    } catch { setStorageError(true) }
    setReady(true)
  }, [storageKey, updateProject, setReportLayout, seed, initialMoves])

  useEffect(() => {
    if (!previewRun) return
    const timer = window.setTimeout(() => setPreviewAtTarget(true), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 80)
    return () => window.clearTimeout(timer)
  }, [previewRun])

  const available = getReportExperiments({ ...project, moveConstraints: moves }, roomCharacter, t.experiments)
  const experiment = available.find(item => item.id === experimentId) ?? available[0]
  const spatial = experiment?.id === "position" || experiment?.id === "symmetry"
  useEffect(() => { setPreviewRun(0); setPreviewAtTarget(false) }, [experimentId])
  const preview = previewRun > 0
  // Preview only the change described in this experiment. It never mutates saved layouts.
  const previewLayout = experiment?.id === "position" ? { ...current, listeningPosition: proposal.listeningPosition }
    : experiment?.id === "symmetry" ? { ...current, speakerPositions: proposal.speakerPositions } : current
  const startPreview = () => {
    dragRef.current = null
    setPreviewAtTarget(false)
    trackPilot("trial_started", { trial: experiment?.id })
    setPreviewRun(run => run + 1)
  }
  const save = (nextCurrent: Layout, nextProposal: Layout, nextMoves: MoveConstraints) => {
    const nextConfirmed = view === "proposal" && confirmed
    setConfirmed(nextConfirmed)
    setSource("user")
    setReportLayout({ current: nextCurrent, proposal: nextProposal, moves: nextMoves, view, source: "user", confirmed: nextConfirmed })
    updateProject({ moveConstraints: nextMoves })
    setCurrent(nextCurrent); setProposal(nextProposal); setMoves(nextMoves)
    try {
      localStorage.setItem(storageKey, JSON.stringify({ current: nextCurrent, proposal: nextProposal, moves: nextMoves, confirmed: nextConfirmed }))
      setStorageError(false)
    } catch { setStorageError(true) }
  }
  const shown = preview ? previewAtTarget ? previewLayout : current : view === "current" ? current : proposal
  const objects: Array<{ id: string; label: string; x: number; y: number; width: number; length: number; kind: string; type?: string }> = [
    ...shown.speakerPositions.map((p, i) => ({ id: `speaker-${i}`, label: i === 0 ? c.left : c.right, x: p.x, y: p.y, width: .09, length: .09, kind: "speaker" })),
    { id: "listening", label: c.listening, ...shown.listeningPosition, width: .09, length: .09, kind: "listening" },
    ...shown.furnitureLayout.map((f, i) => ({ ...f, type: f.type, id: `furniture-${i}`, label: t.report.furniture[f.type as keyof typeof t.report.furniture] ?? f.type, kind: "furniture" })),
  ]
  const canMove = (id: string) => view === "current" || (id.startsWith("speaker") ? moves.speakers : id === "listening" ? moves.listening : moves.furniture)
  const moveObject = (id: string, point: { x: number; y: number }) => {
    if (!ready || preview || !canMove(id)) return
    const item = objects.find(o => o.id === id)
    if (!item) return
    const p = clampPoint(point, item.width, item.length)
    const next = { ...shown, speakerPositions: [...shown.speakerPositions], furnitureLayout: [...shown.furnitureLayout] }
    if (id.startsWith("speaker-")) next.speakerPositions[Number(id.split("-")[1])] = p
    else if (id === "listening") next.listeningPosition = p
    else {
      const i = Number(id.split("-")[1])
      next.furnitureLayout[i] = { ...next.furnitureLayout[i], ...p }
    }
    if (view === "current") save(next, proposeLayout(next, moves), moves)
    else save(current, next, moves)
  }
  const width = 280
  const height = Math.max(180, Math.min(380, width * shown.length / shown.width))
  const pad = 25
  const active = objects.find(o => o.id === selected) ?? objects[0]
  const speakerChanged = JSON.stringify(current.speakerPositions) !== JSON.stringify(proposal.speakerPositions)
  const furnitureChanged = JSON.stringify(current.furnitureLayout) !== JSON.stringify(proposal.furnitureLayout)
  const listenerChanged = JSON.stringify(current.listeningPosition) !== JSON.stringify(proposal.listeningPosition)
  const previewHasMove = experiment?.id === "position" ? listenerChanged : experiment?.id === "symmetry" ? speakerChanged : false

  return (
    <section id="layout-trial" className="border border-primary/30 bg-card rounded-sm p-4 space-y-3" aria-label={c.title}>
      <h2 className="text-base font-semibold">{c.title}</h2>
      <p className="text-sm text-muted-foreground">{c.layoutIntro}</p>
      <p className="text-xs text-muted-foreground">{c.layoutNote}</p>
      {!confirmed ? <div className="space-y-2 border-l-2 border-primary pl-3">
        <p className="text-sm">{t.journey.confirmHint}</p>
        <button type="button" disabled={!ready} className="min-h-11 px-4 border border-primary text-primary" onClick={() => {
          setSource("user")
          setConfirmed(true)
          setReportLayout({ current, proposal, moves, view, source: "user", confirmed: true })
          try { localStorage.setItem(storageKey, JSON.stringify({ current, proposal, moves, confirmed: true })) } catch { setStorageError(true) }
        }}>{t.journey.confirm}</button>
      </div> : <p className="text-xs text-primary">{t.journey.confirmed}</p>}
      {confirmed && spatial && <button type="button" onClick={startPreview} className="min-h-11 px-4 bg-primary text-primary-foreground">{preview ? c.replay : c.showChange}</button>}
      <div role="group" aria-label={c.title} className="flex gap-2">
        {(["current", "proposal"] as const).filter(v=>v === "current" || spatial).map(v => <button type="button" key={v} disabled={!ready || (v === "proposal" && !confirmed)} aria-pressed={!preview && view === v} onClick={() => { setPreviewRun(0); setView(v); setReportLayout({ current, proposal, moves, view: v, source, confirmed }) }} className={`flex-1 min-h-11 border rounded-sm text-sm ${!preview && view === v ? "border-primary text-primary" : "border-border"}`}>{c[v]}</button>)}
      </div>
      {preview && <div className="flex gap-2 items-center justify-between"><span className="font-mono text-xs text-primary">{c.previewLabel}</span><button type="button" onClick={() => setPreviewRun(0)} className="text-xs underline min-h-11">{c.endPreview}</button></div>}
      <svg ref={svgRef} role="img" aria-label={`${c.title}: ${preview ? c.previewLabel : c[view]}`} viewBox={`0 0 ${width + pad * 2} ${height + pad * 2}`} className="w-full bg-secondary/20 rounded-sm touch-none"
        onPointerMove={e => {
          if (!dragRef.current || !svgRef.current) return
          const matrix = svgRef.current.getScreenCTM()
          if (!matrix) return
          const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse())
          moveObject(dragRef.current.id, { x: (point.x - pad) / width, y: (point.y - pad) / height })
        }}
        onPointerUp={() => { dragRef.current = null }} onPointerCancel={() => { dragRef.current = null }}>
        <defs><marker id={arrowId} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="none" className="stroke-primary" strokeWidth="1" /></marker></defs>
        {Array.from({ length: 9 }, (_, i) => <g key={i} className="stroke-border" strokeWidth=".5"><line x1={pad + width * (i + 1) / 10} y1={pad} x2={pad + width * (i + 1) / 10} y2={pad + height} /><line x1={pad} y1={pad + height * (i + 1) / 10} x2={pad + width} y2={pad + height * (i + 1) / 10} /></g>)}
        <rect x={pad} y={pad} width={width} height={height} fill="none" className="stroke-muted-foreground" strokeWidth="2" />
        {preview && ["echo", "dry"].includes(experiment?.id ?? "") && <rect x={pad + 5} y={pad + 5} width={width - 10} height={height - 10} fill="none" className="stroke-primary" strokeDasharray="6 5" strokeWidth="2" />}
        {project.dimensionSource !== "approximate" && <text x={pad + width / 2} y={17} textAnchor="middle" className="fill-muted-foreground" fontSize="11">{shown.width.toFixed(1)} × {shown.length.toFixed(1)} m</text>}
        {confirmed && showDistances && shown.speakerPositions.length === 2 && <path data-distance-triangle="true" d={`M${pad + shown.listeningPosition.x * width} ${pad + shown.listeningPosition.y * height} L${pad + shown.speakerPositions[0].x * width} ${pad + shown.speakerPositions[0].y * height} L${pad + shown.speakerPositions[1].x * width} ${pad + shown.speakerPositions[1].y * height} Z`} fill="none" className="stroke-success" strokeWidth="1.2" opacity=".7" pointerEvents="none" />}
        {(preview || view === "proposal") && objects.map(o => {
          const original = o.id.startsWith("speaker") ? current.speakerPositions[Number(o.id.split("-")[1])] : o.id === "listening" ? current.listeningPosition : current.furnitureLayout[Number(o.id.split("-")[1])]
          const target = preview ? o.id.startsWith("speaker") ? previewLayout.speakerPositions[Number(o.id.split("-")[1])] : o.id === "listening" ? previewLayout.listeningPosition : original : o
          if (Math.hypot(target.x - original.x, target.y - original.y) < .01) return null
          return <g key={`path-${o.id}`} pointerEvents="none"><circle cx={pad + original.x * width} cy={pad + original.y * height} r={10} className="fill-none stroke-primary/50" strokeDasharray="3 3" /><line x1={pad + original.x * width} y1={pad + original.y * height} x2={pad + target.x * width} y2={pad + target.y * height} className="stroke-primary" strokeDasharray="4 3" markerEnd={`url(#${arrowId})`} /></g>
        })}
        {[...objects.filter(o => o.kind === "furniture"), ...objects.filter(o => o.kind !== "furniture")].map(o => <g key={o.id} data-object={o.id} data-x={o.x} data-y={o.y}
          style={{ transform: `translate(${pad + o.x * width}px, ${pad + o.y * height}px)` }} className={`plan-object ${!preview && canMove(o.id) ? "cursor-grab" : ""} ${preview ? "plan-object-preview" : ""}`}
          onPointerDown={e => {
            setSelected(o.id)
            if (preview || !canMove(o.id) || !ready) return
            dragRef.current = { id: o.id, pointer: e.pointerId }
            svgRef.current?.setPointerCapture(e.pointerId)
          }}>
          <title>{o.label}</title>
          {preview && (experiment?.id === "symmetry" ? o.kind === "speaker" : !["echo", "dry"].includes(experiment?.id ?? "") && o.kind === "listening") && <circle cx={0} cy={0} r={23} className="fill-primary/10 stroke-primary" strokeWidth="1" pointerEvents="none" />}
          <PlanObject kind={o.kind} type={o.type} width={o.width * width} height={o.length * height} />
          {o.kind === "speaker" && <text x={0} y={-18} textAnchor="middle" fontSize="9" className="fill-primary" pointerEvents="none">{o.id === "speaker-0" ? "L" : "R"}</text>}
          <circle cx={0} cy={0} r={22} fill="transparent" />
          {!preview && active?.id === o.id && <circle cx={0} cy={0} r={24} fill="none" className="stroke-primary" strokeDasharray="3 3" pointerEvents="none" />}
        </g>)}
      </svg>
      <p className="text-[10px] font-mono text-muted-foreground">{c.legend}</p>
      <label className="flex items-center gap-2 text-xs min-h-11"><input type="checkbox" checked={showDistances} onChange={e => setShowDistances(e.target.checked)} />{c.triangle}</label>
      {showDistances && <p className="text-[10px] text-muted-foreground">{c.triangleNote}</p>}
      {preview && <div className="space-y-2 border-l-2 border-primary pl-3" role="status">
        <p className="text-sm">{experiment?.check}</p>
        {!previewHasMove && <p className="text-xs text-primary">{experiment?.id === "echo" ? c.textileHere : experiment?.id === "dry" ? c.dryHere : experiment?.id === "quiet" ? c.quietHere : c.noVisualMove}</p>}
        <p className="text-xs text-muted-foreground">{c.previewNote}</p>
      </div>}
      {confirmed && spatial && <details className="border-t border-border pt-3"><summary className="cursor-pointer min-h-11 text-sm">{t.journey.geometry}</summary><LayoutComparison current={current} proposal={preview ? previewLayout : proposal} approximate={project.dimensionSource === "approximate"} preview={preview} /></details>}
      <details className="border-t border-border pt-3">
      <summary className="cursor-pointer text-sm min-h-11">{c.editPlan}</summary>
      <div className="space-y-3 pb-2">
      <p className="text-xs text-muted-foreground">{view === "current" ? c.editCurrent : c.editProposal}</p>
      <label className="block text-xs">{c.object}<select value={active?.id} onChange={e => setSelected(e.target.value)} className="mt-2 block w-full border border-border p-2 bg-background">{objects.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select></label>
      <div className="grid grid-cols-4 gap-2">
        {([{ text: c.moveLeft, dx: -.05, dy: 0, icon: "←" }, { text: c.up, dx: 0, dy: -.05, icon: "↑" }, { text: c.down, dx: 0, dy: .05, icon: "↓" }, { text: c.moveRight, dx: .05, dy: 0, icon: "→" }]).map(b => <button type="button" key={b.text} aria-label={b.text} disabled={!ready || preview || !active || !canMove(active.id)} onClick={() => active && moveObject(active.id, { x: active.x + b.dx, y: active.y + b.dy })} className="border border-border rounded-sm min-h-11 disabled:opacity-40">{b.icon}</button>)}
      </div>
      <fieldset className="space-y-1">
        <legend className="text-xs font-medium">{c.restrictions}</legend>
        {(["speakers", "listening", "furniture"] as const).map(k => <label key={k} className="flex gap-2 items-center text-xs min-h-9"><input type="checkbox" disabled={!ready || preview} checked={moves[k]} onChange={e => { const next = { ...moves, [k]: e.target.checked }; save(current, proposeLayout(current, next), next) }} />{c[k]}</label>)}
      </fieldset>
      {view === "proposal" && <div className="space-y-2 text-xs" aria-live="polite">
        <h3 className="font-medium">{c.why}</h3>
        <p className="text-muted-foreground">{c.proposalNote}</p>
        {speakerChanged && <p>{c.speakerChange}</p>}
        {listenerChanged && <p>{c.listenerChange}</p>}
        {!speakerChanged && !listenerChanged && !furnitureChanged && <p>{!moves.speakers && !moves.listening ? c.noMoves : c.nothingChanged}</p>}
      </div>}
      <button type="button" disabled={!ready || preview} onClick={() => { save(seed, proposeLayout(seed, moves), moves); setView("current"); setReportLayout({ current: seed, proposal: proposeLayout(seed, moves), moves, view: "current", source: "user" }) }} className="text-xs underline min-h-11">{c.restore}</button>
      </div></details>
      <p role="status" className="text-xs text-muted-foreground">{storageError ? c.storageError : c.saved}</p>
    </section>
  )
}
