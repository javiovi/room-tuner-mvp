import type { Layout } from "./layoutTrial"

type Point = { x: number; y: number }
export type Wall = "left" | "right" | "top" | "bottom"
const pointIsValid = (p: Point) => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1

/** Horizontal-plan geometry only; all distances use the same room dimensions. */
export function compareLayoutGeometry(current: Layout, proposal: Layout) {
  const { width, length } = current
  if (!(width > 0 && length > 0 && Number.isFinite(width) && Number.isFinite(length))) return null
  const valid = (layout: Layout) => layout.speakerPositions.length === 2 && [...layout.speakerPositions, layout.listeningPosition].every(pointIsValid)
  if (!valid(current) || !valid(proposal)) return null
  const distance = (a: Point, b: Point) => Math.hypot((a.x - b.x) * width, (a.y - b.y) * length)
  const nearestWall = (p: Point) => {
    const distances: Array<{ wall: Wall; distance: number }> = [
      { wall: "left", distance: p.x * width }, { wall: "right", distance: (1 - p.x) * width },
      { wall: "top", distance: p.y * length }, { wall: "bottom", distance: (1 - p.y) * length },
    ]
    return distances.reduce((nearest, candidate) => candidate.distance < nearest.distance ? candidate : nearest)
  }
  const metrics = (layout: Layout) => {
    const left = distance(layout.speakerPositions[0], layout.listeningPosition)
    const right = distance(layout.speakerPositions[1], layout.listeningPosition)
    return { left, right, separation: distance(layout.speakerPositions[0], layout.speakerPositions[1]), difference: Math.abs(left - right),
      walls: [...layout.speakerPositions, layout.listeningPosition].map(nearestWall) }
  }
  const movements = [...current.speakerPositions, current.listeningPosition].map((p, i) => ({
    id: i < 2 ? `speaker-${i}` : "listening", distance: distance(p, [...proposal.speakerPositions, proposal.listeningPosition][i]),
  }))
  current.furnitureLayout.forEach((f, i) => {
    const target = proposal.furnitureLayout[i]
    if (target && pointIsValid(f) && pointIsValid(target)) movements.push({ id: `furniture-${i}`, distance: distance(f, target) })
  })
  return { current: metrics(current), proposal: metrics(proposal), diagonal: Math.hypot(width, length), movements }
}
