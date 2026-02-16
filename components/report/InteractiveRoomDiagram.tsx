"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { DndContext, DragEndEvent, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Plus, X } from "lucide-react"
import type { RoomDiagram as RoomDiagramType } from "@/app/types/room"
import { useT } from "@/lib/i18n"

type FurnitureItem = {
  type: string
  x: number
  y: number
  width: number
  length: number
}

interface InteractiveRoomDiagramProps {
  diagram: RoomDiagramType
  onPositionsChange?: (positions: {
    speakers: { x: number; y: number }[]
    listeningPosition: { x: number; y: number }
    furnitureLayout?: FurnitureItem[]
  }) => void
}

interface DraggableItemProps {
  id: string
  x: number
  y: number
  children: React.ReactNode
}

function DraggableItem({ id, x, y, children }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? "grabbing" : "grab",
    opacity: isDragging ? 0.8 : 1,
  }
  return (
    <g ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </g>
  )
}

export function InteractiveRoomDiagram({ diagram, onPositionsChange }: InteractiveRoomDiagramProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { t } = useT()
  const { floorPlan, treatmentPlan } = diagram
  const { width, length } = floorPlan

  const [speakerPositions, setSpeakerPositions] = useState(floorPlan.speakerPositions)
  const [listeningPosition, setListeningPosition] = useState(floorPlan.listeningPosition)
  const [furniture, setFurniture] = useState<FurnitureItem[]>(floorPlan.furnitureLayout ?? [])

  const padding = 40
  const scale = 50
  const svgWidth = width * scale + padding * 2
  const svgHeight = length * scale + padding * 2

  const toSvgX = (normalizedX: number) => normalizedX * width * scale + padding
  const toSvgY = (normalizedY: number) => normalizedY * length * scale + padding
  const toNormalizedX = (svgX: number) => Math.max(0, Math.min(1, (svgX - padding) / (width * scale)))
  const toNormalizedY = (svgY: number) => Math.max(0, Math.min(1, (svgY - padding) / (length * scale)))

  const svgColors = {
    roomFill: isDark ? "#1C1C1E" : "#F2F2F7",
    roomStroke: isDark ? "#48484A" : "#C7C7CC",
    grid: isDark ? "#3A3A3C" : "#E5E5EA",
    dimText: isDark ? "#98989D" : "#8E8E93",
    primary: isDark ? "#BF5AF2" : "#AF52DE",
    listening: isDark ? "#64D2FF" : "#32ADE6",
  }

  const notifyChange = (
    speakers: { x: number; y: number }[],
    listening: { x: number; y: number },
    furn: FurnitureItem[]
  ) => {
    onPositionsChange?.({ speakers, listeningPosition: listening, furnitureLayout: furn })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    const id = active.id as string
    if (id === "speaker-left") {
      const newPos = { x: toNormalizedX(toSvgX(speakerPositions[0].x) + delta.x), y: toNormalizedY(toSvgY(speakerPositions[0].y) + delta.y) }
      const newSpeakers = [newPos, speakerPositions[1]]
      setSpeakerPositions(newSpeakers)
      notifyChange(newSpeakers, listeningPosition, furniture)
    } else if (id === "speaker-right") {
      const newPos = { x: toNormalizedX(toSvgX(speakerPositions[1].x) + delta.x), y: toNormalizedY(toSvgY(speakerPositions[1].y) + delta.y) }
      const newSpeakers = [speakerPositions[0], newPos]
      setSpeakerPositions(newSpeakers)
      notifyChange(newSpeakers, listeningPosition, furniture)
    } else if (id === "listening-position") {
      const newPos = { x: toNormalizedX(toSvgX(listeningPosition.x) + delta.x), y: toNormalizedY(toSvgY(listeningPosition.y) + delta.y) }
      setListeningPosition(newPos)
      notifyChange(speakerPositions, newPos, furniture)
    } else if (id.startsWith("furniture-")) {
      const idx = parseInt(id.replace("furniture-", ""), 10)
      const item = furniture[idx]
      if (!item) return
      const newPos = {
        ...item,
        x: toNormalizedX(toSvgX(item.x) + delta.x),
        y: toNormalizedY(toSvgY(item.y) + delta.y),
      }
      const newFurniture = [...furniture]
      newFurniture[idx] = newPos
      setFurniture(newFurniture)
      notifyChange(speakerPositions, listeningPosition, newFurniture)
    }
  }

  const addFurniture = (type: string) => {
    const defaults: Record<string, { width: number; length: number }> = {
      sofa: { width: 0.35, length: 0.15 },
      silla: { width: 0.08, length: 0.08 },
      puff: { width: 0.10, length: 0.10 },
      estanteria: { width: 0.30, length: 0.06 },
      armario: { width: 0.20, length: 0.10 },
      cajonera: { width: 0.12, length: 0.08 },
      escritorio: { width: 0.25, length: 0.12 },
      mesa: { width: 0.20, length: 0.20 },
      rack: { width: 0.25, length: 0.06 },
      cama: { width: 0.30, length: 0.40 },
      plantas: { width: 0.06, length: 0.06 },
      instrumentos: { width: 0.10, length: 0.10 },
      alfombra: { width: 0.40, length: 0.30 },
    }
    const size = defaults[type] ?? { width: 0.15, length: 0.15 }
    const newItem: FurnitureItem = { type, x: 0.5, y: 0.5, ...size }
    const newFurniture = [...furniture, newItem]
    setFurniture(newFurniture)
    notifyChange(speakerPositions, listeningPosition, newFurniture)
  }

  const removeFurniture = (idx: number) => {
    const newFurniture = furniture.filter((_, i) => i !== idx)
    setFurniture(newFurniture)
    notifyChange(speakerPositions, listeningPosition, newFurniture)
  }

  const furnitureColor = isDark ? "#636366" : "#AEAEB2"
  const furnitureLabels = t.report.furniture

  const treatmentColors = { absorber: svgColors.primary, diffuser: svgColors.listening, bass_trap: isDark ? "#FF453A" : "#FF3B30" }
  const priorityOpacity = { high: 1, medium: 0.7, low: 0.4 }

  return (
    <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t.report.diagram.interactiveTitle}</h2>
          <p className="text-xs text-muted-foreground mt-1">{t.report.diagram.interactiveDesc}</p>
        </div>
        <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full flex-shrink-0">{t.report.diagram.editableBadge}</span>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="w-full overflow-x-auto touch-manipulation">
          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="mx-auto" style={{ maxWidth: "100%" }}>
            <rect x={padding} y={padding} width={width * scale} height={length * scale} fill={svgColors.roomFill} stroke={svgColors.roomStroke} strokeWidth="1.5" />
            <g stroke={svgColors.grid} strokeWidth="0.5">
              {Array.from({ length: Math.ceil(width) + 1 }).map((_, i) => (
                <line key={`v${i}`} x1={padding + i * scale} y1={padding} x2={padding + i * scale} y2={padding + length * scale} />
              ))}
              {Array.from({ length: Math.ceil(length) + 1 }).map((_, i) => (
                <line key={`h${i}`} x1={padding} y1={padding + i * scale} x2={padding + width * scale} y2={padding + i * scale} />
              ))}
            </g>
            <text x={padding + (width * scale) / 2} y={padding - 10} textAnchor="middle" fill={svgColors.dimText} fontSize="12" fontFamily="monospace">{width.toFixed(1)}m</text>
            <text x={padding - 10} y={padding + (length * scale) / 2} textAnchor="middle" fill={svgColors.dimText} fontSize="12" fontFamily="monospace" transform={`rotate(-90, ${padding - 10}, ${padding + (length * scale) / 2})`}>{length.toFixed(1)}m</text>

            {/* Furniture (draggable) */}
            {furniture.map((item, idx) => {
              const fw = item.width * width * scale
              const fh = item.length * length * scale
              const fx = toSvgX(item.x) - fw / 2
              const fy = toSvgY(item.y) - fh / 2
              return (
                <DraggableItem key={`furniture-${idx}`} id={`furniture-${idx}`} x={toSvgX(item.x)} y={toSvgY(item.y)}>
                  <rect x={fx} y={fy} width={fw} height={fh} fill={furnitureColor} fillOpacity={0.18} stroke={furnitureColor} strokeWidth="1.5" strokeDasharray="3 2" rx={3} />
                  <text x={fx + fw / 2} y={fy + fh / 2 + 4} textAnchor="middle" fill={svgColors.dimText} fontSize="9" pointerEvents="none">{furnitureLabels[item.type as keyof typeof furnitureLabels] || item.type}</text>
                  <circle cx={toSvgX(item.x)} cy={toSvgY(item.y)} r={Math.max(fw, fh) / 2 + 4} fill="transparent" />
                </DraggableItem>
              )
            })}

            {treatmentPlan.map((treatment, idx) => {
              const x = toSvgX(treatment.position.x), y = toSvgY(treatment.position.y)
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r={8} fill={treatmentColors[treatment.type]} opacity={priorityOpacity[treatment.priority]} stroke={svgColors.roomStroke} strokeWidth="0.5" />
                  <text x={x} y={y + 3} textAnchor="middle" fill={isDark ? "#1C1C1E" : "#fff"} fontSize="10" fontWeight="bold">
                    {treatment.type === "bass_trap" ? "B" : treatment.type === "absorber" ? "A" : "D"}
                  </text>
                </g>
              )
            })}

            {speakerPositions.map((speaker, idx) => {
              const x = toSvgX(speaker.x), y = toSvgY(speaker.y)
              return (
                <DraggableItem key={`speaker-${idx}`} id={idx === 0 ? "speaker-left" : "speaker-right"} x={x} y={y}>
                  <polygon points={`${x},${y - 15} ${x - 10},${y + 10} ${x + 10},${y + 10}`} fill={svgColors.primary} stroke={svgColors.roomStroke} strokeWidth="1" />
                  <text x={x} y={y + 5} textAnchor="middle" fill={isDark ? "#1C1C1E" : "#fff"} fontSize="12" fontWeight="bold" pointerEvents="none">{idx === 0 ? "L" : "R"}</text>
                  <circle cx={x} cy={y} r={20} fill="transparent" stroke={svgColors.primary} strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
                </DraggableItem>
              )
            })}

            <DraggableItem id="listening-position" x={toSvgX(listeningPosition.x)} y={toSvgY(listeningPosition.y)}>
              <circle cx={toSvgX(listeningPosition.x)} cy={toSvgY(listeningPosition.y)} r={12} fill={svgColors.listening} stroke={svgColors.roomStroke} strokeWidth="1" />
              <circle cx={toSvgX(listeningPosition.x) - 8} cy={toSvgY(listeningPosition.y)} r={3} fill={isDark ? "#1C1C1E" : "#fff"} pointerEvents="none" />
              <circle cx={toSvgX(listeningPosition.x) + 8} cy={toSvgY(listeningPosition.y)} r={3} fill={isDark ? "#1C1C1E" : "#fff"} pointerEvents="none" />
              <circle cx={toSvgX(listeningPosition.x)} cy={toSvgY(listeningPosition.y)} r={20} fill="transparent" stroke={svgColors.listening} strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
            </DraggableItem>

            <path
              d={`M ${toSvgX(speakerPositions[0].x)},${toSvgY(speakerPositions[0].y)} L ${toSvgX(speakerPositions[1].x)},${toSvgY(speakerPositions[1].y)} L ${toSvgX(listeningPosition.x)},${toSvgY(listeningPosition.y)} Z`}
              fill="none" stroke={svgColors.listening} strokeWidth="1" strokeDasharray="4 4" opacity="0.5"
            />
          </svg>
        </div>
      </DndContext>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-border text-xs">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-sm"></div><span className="text-muted-foreground">{t.report.diagram.speakers}</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-sky-400 rounded-full"></div><span className="text-muted-foreground">{t.report.diagram.listeningPoint}</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 border border-muted-foreground/50 rounded-sm border-dashed"></div><span className="text-muted-foreground">{t.report.diagram.furnitureLegend}</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-destructive rounded-full"></div><span className="text-muted-foreground">{t.report.diagram.bassTrap}</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-full"></div><span className="text-muted-foreground">{t.report.diagram.absorber}</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-sky-400 rounded-full"></div><span className="text-muted-foreground">{t.report.diagram.diffuser}</span></div>
      </div>

      {/* Furniture panel */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-foreground">{t.report.diagram.furnitureTitle}</h3>

        {/* Current furniture list */}
        {furniture.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {furniture.map((item, idx) => (
              <button
                key={idx}
                onClick={() => removeFurniture(idx)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-xs text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group"
              >
                {furnitureLabels[item.type as keyof typeof furnitureLabels] || item.type}
                <X className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        )}

        {/* Add furniture buttons */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(furnitureLabels).map(([type, label]) => (
            <button
              key={type}
              onClick={() => addFurniture(type)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-muted rounded-xl text-xs text-muted-foreground space-y-1">
        <p><span className="text-foreground font-medium">{t.report.diagram.howToTitle}</span></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>{t.report.diagram.howTo1}</li>
          <li>{t.report.diagram.howTo2}</li>
          <li>{t.report.diagram.howTo3}</li>
          <li>{t.report.diagram.howTo4}</li>
        </ul>
      </div>
    </div>
  )
}
