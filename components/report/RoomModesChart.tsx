"use client"

import { useTheme } from "next-themes"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { RoomMode } from "@/app/types/room"
import { InfoTooltip } from "@/components/InfoTooltip"
import { useT } from "@/lib/i18n"
import { useChartTheme } from "@/lib/chartTheme"
import type { Translations } from "@/lib/translations/es"

interface RoomModesChartProps {
  modes: RoomMode[]
}

export function RoomModesChart({ modes }: RoomModesChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { t } = useT()
  const theme = useChartTheme(isDark)

  const displayModes = modes.filter(m => m.frequency < 300).slice(0, 25)

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
      case "high": return theme.destructive
      case "medium": return theme.warning
      case "low": return theme.primary
      default: return theme.primary
    }
  }

  const intensityLabels = ["", t.report.modes.intensityLow, t.report.modes.intensityMedium, t.report.modes.intensityHigh]

  return (
    <div className="bg-card border border-border rounded-sm p-5 space-y-3">
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
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
            <XAxis
              dataKey="frequency" stroke={theme.axis}
              style={{ fontSize: '10px', fill: theme.axis }}
              label={{ value: t.report.frequency.frequencyLabel, position: 'insideBottom', offset: -15, style: { fontSize: '10px', fill: theme.axis } }}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <YAxis
              stroke={theme.axis}
              style={{ fontSize: '10px', fill: theme.axis }}
              label={{ value: t.report.modes.intensityLabel, angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: theme.axis } }}
              domain={[0, 3]} ticks={[0, 1, 2, 3]}
              tickFormatter={(value) => intensityLabels[value] || ""}
            />
            <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: theme.grid }} />
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
          <div className="w-3 h-3 rounded-sm bg-warning"></div>
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
            <div key={dimension} className="text-center p-2 border border-border rounded-sm">
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                {labels[dimension]}
                <InfoTooltip text={tooltipTexts[dimension]} />
              </div>
              <div className="text-lg font-semibold text-foreground font-mono">{count}</div>
            </div>
          )
        })}
      </div>

      {/* Tangential + Oblique counts */}
      {displayModes.some(m => m.type === "tangential" || m.type === "oblique") && (
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 border border-border rounded-sm">
            <div className="text-xs text-muted-foreground">{t.report.modes.tangentialLabel}</div>
            <div className="text-lg font-semibold text-foreground font-mono">
              {displayModes.filter(m => m.type === "tangential").length}
            </div>
          </div>
          <div className="text-center p-2 border border-border rounded-sm">
            <div className="text-xs text-muted-foreground">{t.report.modes.obliqueLabel}</div>
            <div className="text-lg font-semibold text-foreground font-mono">
              {displayModes.filter(m => m.type === "oblique").length}
            </div>
          </div>
        </div>
      )}

      {displayModes.filter(m => m.severity === "high").length > 0 && (
        <div className="mt-3 p-3 rounded-sm border border-destructive/20 bg-destructive/5">
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

function CustomTooltip({
  active,
  payload,
  t,
}: {
  active?: boolean
  payload?: Array<{ payload: RoomMode & { nx?: number; ny?: number; nz?: number } }>
  t: Translations
}) {
  if (!active || !payload || !payload[0]) return null
  const mode = payload[0].payload
  const severityLabels = {
    high: t.report.modes.severityLabelHigh,
    medium: t.report.modes.severityLabelMedium,
    low: t.report.modes.severityLabelLow,
  }
  const dimensionLabels = {
    length: t.report.modes.dimLongitudinal,
    width: t.report.modes.dimTransverse,
    height: t.report.modes.dimVertical,
    mixed: t.report.modes.dimMixed,
  }
  const typeLabels = {
    axial: t.report.modes.typeAxial,
    tangential: t.report.modes.typeTangential,
    oblique: t.report.modes.typeOblique,
  }

  return (
    <div className="bg-card rounded-sm border border-border p-3 space-y-1">
      <p className="text-xs font-semibold text-primary font-mono">{mode.frequency.toFixed(1)} Hz</p>
      <p className="text-xs text-foreground">{mode.description}</p>
      <p className="text-xs text-muted-foreground">
        {typeLabels[mode.type]} · {dimensionLabels[mode.dimension]}
      </p>
      <p className={`text-xs font-medium ${
        mode.severity === "high" ? "text-destructive" : mode.severity === "medium" ? "text-warning" : "text-primary"
      }`}>
        {t.report.modes.severityFieldLabel} {severityLabels[mode.severity]}
      </p>
    </div>
  )
}
