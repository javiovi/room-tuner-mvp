"use client"

import { useTheme } from "next-themes"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { RoomMode } from "@/app/types/room"
import { InfoTooltip } from "@/components/InfoTooltip"
import { useT } from "@/lib/i18n"

interface RoomModesChartProps {
  modes: RoomMode[]
}

export function RoomModesChart({ modes }: RoomModesChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { t } = useT()

  const colors = {
    grid: isDark ? "#3A3A3C" : "#E5E5EA",
    axis: isDark ? "#98989D" : "#8E8E93",
    cursor: isDark ? "#3A3A3C" : "#E5E5EA",
  }

  const displayModes = modes.filter(m => m.frequency < 300).slice(0, 15)

  const severityToValue = (severity: RoomMode["severity"]): number => {
    switch (severity) {
      case "high": return 3
      case "medium": return 2
      case "low": return 1
      default: return 1
    }
  }

  const chartData = displayModes.map(mode => ({
    ...mode,
    severityValue: severityToValue(mode.severity),
  }))

  const getColor = (severity: RoomMode["severity"]) => {
    switch (severity) {
      case "high": return isDark ? "#FF453A" : "#FF3B30"
      case "medium": return isDark ? "#FFD60A" : "#FFCC00"
      case "low": return isDark ? "#BF5AF2" : "#AF52DE"
      default: return isDark ? "#BF5AF2" : "#AF52DE"
    }
  }

  const intensityLabels = ["", t.report.modes.intensityLow, t.report.modes.intensityMedium, t.report.modes.intensityHigh]

  return (
    <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{t.report.modes.title}</h2>
        <InfoTooltip text={t.tooltips.roomModes} />
      </div>
      <p className="text-xs text-muted-foreground">
        {t.report.modes.description}
      </p>

      <div className="w-full h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="frequency" stroke={colors.axis}
              style={{ fontSize: '10px', fill: colors.axis }}
              label={{ value: t.report.frequency.frequencyLabel, position: 'insideBottom', offset: -15, style: { fontSize: '10px', fill: colors.axis } }}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <YAxis
              stroke={colors.axis}
              style={{ fontSize: '10px', fill: colors.axis }}
              label={{ value: t.report.modes.intensityLabel, angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: colors.axis } }}
              domain={[0, 3]} ticks={[0, 1, 2, 3]}
              tickFormatter={(value) => intensityLabels[value] || ""}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.cursor }} />
            <Bar dataKey="severityValue" radius={[4, 4, 0, 0]}>
              {chartData.map((mode, index) => (
                <Cell key={`cell-${index}`} fill={getColor(mode.severity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-destructive"></div>
          <span>{t.report.modes.severityHigh}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-amber-400"></div>
          <span>{t.report.modes.severityMedium}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary"></div>
          <span>{t.report.modes.severityLow}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {(['length', 'width', 'height'] as const).map((dimension) => {
          const count = displayModes.filter(m => m.dimension === dimension).length
          const labels = { length: t.report.modes.longitudinal, width: t.report.modes.transverse, height: t.report.modes.vertical }
          const tooltipTexts = {
            length: t.tooltips.modesLongitudinal,
            width: t.tooltips.modesTransverse,
            height: t.tooltips.modesVertical,
          }
          return (
            <div key={dimension} className="text-center p-2 bg-muted rounded-xl">
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                {labels[dimension]}
                <InfoTooltip text={tooltipTexts[dimension]} />
              </div>
              <div className="text-lg font-semibold text-foreground font-mono">{count}</div>
            </div>
          )
        })}
      </div>

      {displayModes.filter(m => m.severity === "high").length > 0 && (
        <div className="mt-3 p-3 rounded-xl border border-destructive/20 bg-destructive/5">
          <h3 className="text-xs font-medium text-destructive mb-2">{t.report.modes.criticalTitle}</h3>
          <div className="space-y-1">
            {displayModes.filter(m => m.severity === "high").map((mode, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{mode.description}</span>
                <span className="text-destructive font-medium font-mono">{mode.frequency.toFixed(0)} Hz</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t.report.modes.criticalSolution}
          </p>
        </div>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload[0]) return null
  const mode = payload[0].payload as RoomMode
  const severityLabels = { high: "Alta", medium: "Media", low: "Baja" }
  const dimensionLabels = { length: "Longitudinal", width: "Transversal", height: "Vertical", mixed: "Mixto" }

  return (
    <div className="bg-card rounded-xl card-shadow-lg border border-border p-3 space-y-1">
      <p className="text-xs font-semibold text-primary font-mono">{mode.frequency.toFixed(1)} Hz</p>
      <p className="text-xs text-foreground">{mode.description}</p>
      <p className="text-xs text-muted-foreground">Tipo: {dimensionLabels[mode.dimension]}</p>
      <p className={`text-xs font-medium ${
        mode.severity === "high" ? "text-destructive" : mode.severity === "medium" ? "text-yellow-600 dark:text-yellow-400" : "text-primary"
      }`}>
        Severidad: {severityLabels[mode.severity]}
      </p>
    </div>
  )
}
