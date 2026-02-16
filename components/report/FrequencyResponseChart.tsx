"use client"

import { useTheme } from "next-themes"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import type { FrequencyPoint } from "@/app/types/room"
import { InfoTooltip } from "@/components/InfoTooltip"
import { useT } from "@/lib/i18n"

interface FrequencyResponseChartProps {
  data: FrequencyPoint[]
}

export function FrequencyResponseChart({ data }: FrequencyResponseChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { t } = useT()

  const colors = {
    grid: isDark ? "#3A3A3C" : "#E5E5EA",
    axis: isDark ? "#98989D" : "#8E8E93",
    cursor: isDark ? "#48484A" : "#D1D1D6",
    primary: isDark ? "#BF5AF2" : "#AF52DE",
    warning: "#facc15",
  }

  return (
    <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{t.report.frequency.title}</h2>
        <InfoTooltip text={t.tooltips.frequency} />
      </div>
      <p className="text-xs text-muted-foreground">
        {t.report.frequency.description}
      </p>

      <div className="w-full h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="frequency" type="number" scale="log" domain={[20, 20000]}
              ticks={[20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]}
              tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value.toString()}
              stroke={colors.axis}
              style={{ fontSize: '10px', fill: colors.axis }}
              label={{ value: t.report.frequency.frequencyLabel, position: 'insideBottom', offset: -5, style: { fontSize: '10px', fill: colors.axis } }}
            />
            <YAxis
              domain={[-12, 12]} ticks={[-12, -6, 0, 6, 12]} stroke={colors.axis}
              style={{ fontSize: '10px', fill: colors.axis }}
              label={{ value: t.report.frequency.dbLabel, angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: colors.axis } }}
            />
            <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ stroke: colors.primary, strokeWidth: 1 }} />
            <ReferenceLine y={0} stroke={colors.primary} strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine y={6} stroke={colors.warning} strokeDasharray="2 2" strokeWidth={1} opacity={0.3} />
            <ReferenceLine y={-6} stroke={colors.warning} strokeDasharray="2 2" strokeWidth={1} opacity={0.3} />
            <Line type="monotone" dataKey="response" stroke={colors.primary} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: colors.primary }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary"></div>
          <span>{t.report.frequency.legendResponse}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary border-t-2 border-dashed"></div>
          <span>{t.report.frequency.legendFlat}</span>
          <InfoTooltip text={t.tooltips.flatResponse} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-amber-400 border-t-2 border-dashed opacity-50"></div>
          <span>{t.report.frequency.legendThreshold}</span>
          <InfoTooltip text={t.tooltips.dbThreshold} />
        </div>
      </div>

      {data.filter(d => d.issue).length > 0 && (
        <div className="mt-3 p-3 rounded-xl border border-destructive/20 bg-destructive/5">
          <h3 className="text-xs font-medium text-destructive mb-2">{t.report.frequency.issuesTitle}</h3>
          <div className="grid grid-cols-2 gap-2">
            {data.filter(d => d.issue).slice(0, 6).map((point, i) => (
              <div key={i} className="text-xs text-muted-foreground">
                <span className="font-mono text-destructive font-medium">
                  {point.frequency >= 1000 ? `${(point.frequency / 1000).toFixed(1)}kHz` : `${point.frequency}Hz`}
                </span>: {point.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, isDark }: any) {
  if (!active || !payload || !payload[0]) return null
  const data = payload[0].payload as FrequencyPoint

  return (
    <div className="bg-card rounded-xl card-shadow-lg border border-border p-3">
      <p className="text-xs font-semibold text-primary font-mono">
        {data.frequency >= 1000 ? `${(data.frequency / 1000).toFixed(1)} kHz` : `${data.frequency} Hz`}
      </p>
      <p className="text-xs text-foreground font-mono">
        {data.response > 0 ? '+' : ''}{data.response.toFixed(1)} dB
      </p>
      {data.issue && data.description && (
        <p className="text-xs text-destructive mt-1">{data.description}</p>
      )}
    </div>
  )
}
