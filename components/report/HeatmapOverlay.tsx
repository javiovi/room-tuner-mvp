"use client"

import { useMemo } from "react"
import type { HeatmapGrid } from "@/lib/heatmapCalculations"
import { pressureToColor } from "@/lib/heatmapCalculations"

interface HeatmapOverlayProps {
  grid: HeatmapGrid
  roomWidth: number  // meters
  roomLength: number // meters
  scale: number      // pixels per meter
  padding: number    // SVG padding
}

export function HeatmapOverlay({ grid, roomWidth, roomLength, scale, padding }: HeatmapOverlayProps) {
  const cellWidth = (roomWidth * scale) / grid.resolution
  const cellHeight = (roomLength * scale) / grid.resolution

  const rects = useMemo(() => {
    return grid.cells.map((cell, i) => {
      const x = padding + cell.x * roomWidth * scale - cellWidth / 2
      const y = padding + cell.y * roomLength * scale - cellHeight / 2
      const fill = pressureToColor(cell.pressure, 0.35)

      return (
        <rect
          key={i}
          x={x}
          y={y}
          width={cellWidth}
          height={cellHeight}
          fill={fill}
          pointerEvents="none"
        />
      )
    })
  }, [grid, roomWidth, roomLength, scale, padding, cellWidth, cellHeight])

  return <g className="heatmap-overlay">{rects}</g>
}
