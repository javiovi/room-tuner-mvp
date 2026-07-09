// Sound pressure distribution heatmap calculations
// Computes a 2D grid of relative SPL values based on room modes

import type { RoomMode } from '@/app/types/room'

export interface HeatmapCell {
  x: number       // normalized 0-1
  y: number       // normalized 0-1
  pressure: number // normalized 0-1 (after normalization)
}

export interface HeatmapGrid {
  cells: HeatmapCell[]
  resolution: number
  minPressure: number
  maxPressure: number
}

export interface HeatmapConfig {
  resolution?: number          // grid cells per dimension, default 20
  maxModes?: number           // top N modes to consider, default 10
  frequencyRange?: [number, number] // Hz range, default [20, 300]
}

const severityWeight: Record<string, number> = {
  high: 1.0,
  medium: 0.5,
  low: 0.25,
}

/**
 * Calculate a 2D sound pressure heatmap based on room modes.
 * Uses standing wave patterns: P(x) = |cos(n * π * x)| for each mode.
 */
export function calculateHeatmap(
  roomLength: number,
  roomWidth: number,
  modes: RoomMode[],
  config: HeatmapConfig = {}
): HeatmapGrid {
  const resolution = config.resolution ?? 20
  const maxModes = config.maxModes ?? 10
  const [fMin, fMax] = config.frequencyRange ?? [20, 300]

  // Filter and sort modes by significance
  const relevantModes = modes
    .filter(m => m.frequency >= fMin && m.frequency <= fMax)
    .sort((a, b) => (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0))
    .slice(0, maxModes)

  if (relevantModes.length === 0) {
    // Return uniform grid
    const cells: HeatmapCell[] = []
    for (let gy = 0; gy < resolution; gy++) {
      for (let gx = 0; gx < resolution; gx++) {
        cells.push({ x: (gx + 0.5) / resolution, y: (gy + 0.5) / resolution, pressure: 0.5 })
      }
    }
    return { cells, resolution, minPressure: 0.5, maxPressure: 0.5 }
  }

  const cells: HeatmapCell[] = []
  const pressureValues: number[] = []

  for (let gy = 0; gy < resolution; gy++) {
    for (let gx = 0; gx < resolution; gx++) {
      const nx = (gx + 0.5) / resolution // 0 to 1 (width axis)
      const ny = (gy + 0.5) / resolution // 0 to 1 (length axis)

      let totalPressure = 0

      for (const mode of relevantModes) {
        const weight = severityWeight[mode.severity] || 0.25
        let p = 0

        if (mode.type === 'axial') {
          if (mode.dimension === 'length' && mode.nx) {
            p = Math.abs(Math.cos(mode.nx * Math.PI * ny))
          } else if (mode.dimension === 'width' && mode.ny) {
            p = Math.abs(Math.cos(mode.ny * Math.PI * nx))
          } else if (mode.dimension === 'height') {
            // Height modes are uniform in 2D top-down view
            p = 0.5
          }
        } else if (mode.type === 'tangential' || mode.type === 'oblique') {
          const modeNx = mode.nx ?? 0
          const modeNy = mode.ny ?? 0
          const px = modeNx > 0 ? Math.abs(Math.cos(modeNx * Math.PI * nx)) : 1
          const py = modeNy > 0 ? Math.abs(Math.cos(modeNy * Math.PI * ny)) : 1
          p = px * py
        }

        totalPressure += p * weight
      }

      pressureValues.push(totalPressure)
      cells.push({ x: nx, y: ny, pressure: totalPressure })
    }
  }

  // Normalize to 0-1
  const minP = Math.min(...pressureValues)
  const maxP = Math.max(...pressureValues)
  const range = maxP - minP || 1

  for (const cell of cells) {
    cell.pressure = (cell.pressure - minP) / range
  }

  return { cells, resolution, minPressure: minP, maxPressure: maxP }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  const value = parseInt(clean, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

/**
 * Map a pressure value (0-1) to a color string, interpolated between the app's own
 * chartTheme low/high tones (see lib/chartTheme.ts) — a two-stop diverging scale
 * instead of a generic rainbow, so the heatmap reads as part of the same instrument.
 */
export function pressureToColor(
  pressure: number,
  opacity: number = 0.4,
  lowColor: string = "#0284c7",
  highColor: string = "#d93a2b",
): string {
  const t = Math.max(0, Math.min(1, pressure))
  const [r1, g1, b1] = hexToRgb(lowColor)
  const [r2, g2, b2] = hexToRgb(highColor)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
