"use client"

import { useTheme } from "next-themes"
import type { RoomDiagram as RoomDiagramType } from "@/app/types/room"

interface RoomDiagramProps {
  diagram: RoomDiagramType
}

export function RoomDiagram({ diagram }: RoomDiagramProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { floorPlan, treatmentPlan } = diagram
  const { width, length, speakerPositions, listeningPosition } = floorPlan

  const padding = 40
  const scale = 50
  const svgWidth = width * scale + padding * 2
  const svgHeight = length * scale + padding * 2

  const toSvgX = (normalizedX: number) => normalizedX * width * scale + padding
  const toSvgY = (normalizedY: number) => normalizedY * length * scale + padding

  const svgColors = {
    roomFill: isDark ? "#1C1C1E" : "#F2F2F7",
    roomStroke: isDark ? "#48484A" : "#C7C7CC",
    grid: isDark ? "#3A3A3C" : "#E5E5EA",
    dimText: isDark ? "#98989D" : "#8E8E93",
    primary: isDark ? "#FF9F0A" : "#FF9500",
    listening: isDark ? "#FFD60A" : "#FFCC00",
  }

  const treatmentColors = { absorber: svgColors.primary, diffuser: svgColors.listening, bass_trap: isDark ? "#FF453A" : "#FF3B30" }
  const priorityOpacity = { high: 1, medium: 0.7, low: 0.4 }

  return (
    <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Diagrama de sala - Vista superior</h2>
      <p className="text-xs text-muted-foreground">
        Posiciones recomendadas de parlantes, punto de escucha y tratamiento acústico.
      </p>

      <div className="w-full overflow-x-auto">
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
              <g key={idx}>
                <polygon points={`${x},${y - 15} ${x - 10},${y + 10} ${x + 10},${y + 10}`} fill={svgColors.primary} stroke={svgColors.roomStroke} strokeWidth="1" />
                <text x={x} y={y + 5} textAnchor="middle" fill={isDark ? "#1C1C1E" : "#fff"} fontSize="12" fontWeight="bold">{idx === 0 ? "L" : "R"}</text>
              </g>
            )
          })}

          <g>
            <circle cx={toSvgX(listeningPosition.x)} cy={toSvgY(listeningPosition.y)} r={12} fill={svgColors.listening} stroke={svgColors.roomStroke} strokeWidth="1" />
            <circle cx={toSvgX(listeningPosition.x) - 8} cy={toSvgY(listeningPosition.y)} r={3} fill={isDark ? "#1C1C1E" : "#fff"} />
            <circle cx={toSvgX(listeningPosition.x) + 8} cy={toSvgY(listeningPosition.y)} r={3} fill={isDark ? "#1C1C1E" : "#fff"} />
          </g>

          <path
            d={`M ${toSvgX(speakerPositions[0].x)},${toSvgY(speakerPositions[0].y)} L ${toSvgX(speakerPositions[1].x)},${toSvgY(speakerPositions[1].y)} L ${toSvgX(listeningPosition.x)},${toSvgY(listeningPosition.y)} Z`}
            fill="none" stroke={svgColors.listening} strokeWidth="1" strokeDasharray="4 4" opacity="0.5"
          />
        </svg>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-border text-xs">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-sm"></div><span className="text-muted-foreground">Parlantes (L/R)</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div><span className="text-muted-foreground">Punto escucha</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-destructive rounded-full"></div><span className="text-muted-foreground">B: Bass Trap</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-full"></div><span className="text-muted-foreground">A: Absorber</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div><span className="text-muted-foreground">D: Diffuser</span></div>
      </div>

      <div className="p-3 bg-muted rounded-xl text-xs text-muted-foreground space-y-1">
        <p><span className="text-foreground font-medium">Interpretar el diagrama:</span></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Los parlantes (L/R) deben formar triángulo equilátero con punto de escucha</li>
          <li>Bass Traps (B) en las esquinas controlan modos de graves</li>
          <li>Absorbers (A) en puntos de primera reflexión (paredes laterales)</li>
          <li>Diffusers (D) en pared trasera para dispersión natural</li>
        </ul>
      </div>
    </div>
  )
}
