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

/**
 * Map a pressure value (0-1) to a color string.
 * Blue(0) → Cyan(0.25) → Green(0.5) → Yellow(0.75) → Red(1.0)
 */
export function pressureToColor(pressure: number, opacity: number = 0.4): string {
  let r: number, g: number, b: number

  if (pressure < 0.25) {
    r = 0
    g = Math.round(pressure * 4 * 255)
    b = 255
  } else if (pressure < 0.5) {
    r = 0
    g = 255
    b = Math.round((1 - (pressure - 0.25) * 4) * 255)
  } else if (pressure < 0.75) {
    r = Math.round((pressure - 0.5) * 4 * 255)
    g = 255
    b = 0
  } else {
    r = 255
    g = Math.round((1 - (pressure - 0.75) * 4) * 255)
    b = 0
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
