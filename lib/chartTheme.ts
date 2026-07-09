/**
 * Single source of truth for colors used outside CSS (SVG/Recharts props require literal
 * values, not CSS custom properties). Keep these in sync with app/globals.css — same PR only.
 */
export const chartTheme = {
  light: {
    primary: "#0284c7",
    secondary: "#5b6b78",
    warning: "#b4790e",
    destructive: "#d93a2b",
    success: "#147a5d",
    grid: "#dce5ea",
    axis: "#5c6b77",
    diagramBg: "#eef3f6",
    diagramStroke: "#c3d1da",
    diagramGrid: "#dce5ea",
    diagramText: "#5c6b77",
    heatmapLow: "#0284c7",
    heatmapHigh: "#d93a2b",
  },
  dark: {
    primary: "#4fc3f7",
    secondary: "#9aa5b1",
    warning: "#f2b84b",
    destructive: "#ff6b5e",
    success: "#4fd1a5",
    grid: "#1c2731",
    axis: "#7e93a3",
    diagramBg: "#141c24",
    diagramStroke: "#2e3f4e",
    diagramGrid: "#1c2731",
    diagramText: "#7e93a3",
    heatmapLow: "#4fc3f7",
    heatmapHigh: "#ff6b5e",
  },
} as const

export type ChartTheme = typeof chartTheme.light

export function useChartTheme(isDark: boolean): ChartTheme {
  return isDark ? chartTheme.dark : chartTheme.light
}
