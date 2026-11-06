import type { RoomDiagram, RoomProject } from "@/app/types/room"

export type Layout = RoomDiagram["floorPlan"]
export type MoveConstraints = { speakers: boolean; listening: boolean; furniture: boolean }
export const DEFAULT_MOVES: MoveConstraints = { speakers: true, listening: true, furniture: true }
export const ROOM_SIZES = { small: 12, medium: 20, large: 32 } as const
export function approximateDimensions(size: keyof typeof ROOM_SIZES, shape: "square" | "rectangle") {
  const ratio = shape === "square" ? 1 : 1.5
  const width = Math.sqrt(ROOM_SIZES[size] / ratio)
  return { widthM: Math.round(width * 10) / 10, lengthM: Math.round(width * ratio * 10) / 10, heightM: 2.5 }
}

/** A schematic starting point from the answers, never a scan of the actual room. */
export function initialLayout(project: RoomProject, diagram: Layout): Layout {
  const speakers = project.speakerPlacement === "esquina" ? [{ x: .12, y: .12 }, { x: .28, y: .12 }]
    : project.speakerPlacement === "pared-lateral" ? [{ x: .12, y: .3 }, { x: .12, y: .65 }]
    : project.speakerPlacement === "pared-larga-centrado" ? [{ x: .12, y: .3 }, { x: .12, y: .7 }]
    : [{ x: .3, y: .12 }, { x: .7, y: .12 }]
  const listening = project.listeningPosition === "sillon-pared-posterior" ? { x: .5, y: .85 }
    : project.listeningPosition === "escritorio-pared" ? { x: .5, y: .2 }
    : project.listeningPosition === "esquina" ? { x: .85, y: .85 } : { x: .5, y: .5 }
  return { ...diagram, speakerPositions: speakers, listeningPosition: listening }
}

export function clampPoint(point: { x: number; y: number }, width = .08, length = .08) {
  const marginX = Math.min(.49, width / 2)
  const marginY = Math.min(.49, length / 2)
  return { x: Math.max(marginX, Math.min(1 - marginX, point.x)), y: Math.max(marginY, Math.min(1 - marginY, point.y)) }
}

export function proposeLayout(current: Layout, moves: MoveConstraints): Layout {
  const occupied = (p: { x: number; y: number }) => current.furnitureLayout.some(f => Math.abs(p.x - f.x) < f.width / 2 + .04 && Math.abs(p.y - f.y) < f.length / 2 + .04)
  const free = (candidates: Array<{ x: number; y: number }>, fallback: { x: number; y: number }) => candidates.map(p => clampPoint(p)).find(p => !occupied(p)) ?? fallback
  const listening = moves.listening ? free([{ x: .5, y: .38 }, { x: .5, y: .62 }, { x: .5, y: .7 }], current.listeningPosition) : current.listeningPosition
  const speakers = moves.speakers ? current.speakerPositions.map((speaker, i) => free([
    { x: listening.x + (i === 0 ? -.2 : .2), y: .12 },
    { x: listening.x + (i === 0 ? -.25 : .25), y: .2 },
  ], speaker)) : current.speakerPositions
  return { ...current, speakerPositions: speakers, listeningPosition: listening }
}
