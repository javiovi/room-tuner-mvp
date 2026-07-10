/**
 * PDF Report Document — Blueprint identity, matching the web app's report
 */

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Svg,
  Rect,
  Circle,
  Line,
  Polyline,
} from '@react-pdf/renderer'
import type { EnhancedAnalysisResponse, RoomProject, ProductRecommendation, FrequencyPoint } from '@/app/types/room'

// Blueprint palette — literal hex (mirrors app/globals.css light-mode tokens; react-pdf can't read CSS vars)
const c = {
  ink: '#101820',
  body: '#3d4a54',
  muted: '#5c6b77',
  accent: '#0284c7',
  success: '#147a5d',
  warning: '#b4790e',
  danger: '#d93a2b',
  bgLight: '#f4f7f9',
  border: '#d7e0e7',
  white: '#ffffff',
}

const MONO = 'Courier'

const s = StyleSheet.create({
  page: { backgroundColor: c.white, paddingTop: 36, paddingBottom: 50, paddingHorizontal: 40, fontFamily: 'Helvetica' },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: c.muted, fontFamily: MONO },

  // Cover
  coverWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverBrand: { fontSize: 26, fontWeight: 'bold', color: c.ink, letterSpacing: 1 },
  coverSub: { fontSize: 10, color: c.muted, marginTop: 4, letterSpacing: 2, textTransform: 'uppercase', fontFamily: MONO },
  coverInfoBlock: { marginTop: 32, alignItems: 'center' },
  coverInfo: { fontSize: 10, color: c.body, marginBottom: 5, fontFamily: MONO },
  coverBadgeRow: { flexDirection: 'row', marginTop: 20, gap: 8 },
  coverSummary: { marginTop: 28, paddingHorizontal: 30, maxWidth: 460 },

  // Section
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: c.ink, marginBottom: 10, paddingBottom: 5, borderBottomWidth: 1.5, borderBottomColor: c.ink, borderBottomStyle: 'solid' },
  subTitle: { fontSize: 10, fontWeight: 'bold', color: c.ink, marginBottom: 6, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { fontSize: 9, color: c.body, lineHeight: 1.5 },
  small: { fontSize: 8, color: c.muted, lineHeight: 1.4 },
  bodyBold: { fontSize: 9, fontWeight: 'bold', color: c.ink },

  // Cards & grids — outline, no fill (Blueprint: annotation regions on one sheet, not floating cards)
  card: { backgroundColor: c.white, borderWidth: 0.75, borderColor: c.border, borderStyle: 'solid', borderRadius: 1, padding: 10, marginBottom: 8 },
  metricsRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  metricBox: { flex: 1, backgroundColor: c.white, borderWidth: 0.75, borderColor: c.border, borderStyle: 'solid', borderRadius: 1, padding: 8 },
  metricLabel: { fontSize: 7, color: c.muted, textTransform: 'uppercase', marginBottom: 3, fontFamily: MONO, letterSpacing: 0.5 },
  metricValue: { fontSize: 13, fontWeight: 'bold', color: c.ink, fontFamily: MONO },
  metricUnit: { fontSize: 8, color: c.muted },

  // Badges — outline tags, not filled pills
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 1, borderWidth: 0.75, borderStyle: 'solid', fontSize: 8, fontWeight: 'bold', fontFamily: MONO },
  badgeDanger: { borderColor: c.danger, color: c.danger },
  badgeWarning: { borderColor: c.warning, color: c.warning },
  badgeSuccess: { borderColor: c.success, color: c.success },
  badgeInfo: { borderColor: c.accent, color: c.accent },

  // Tables
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: c.border, borderBottomStyle: 'solid', paddingVertical: 4, alignItems: 'center' },
  tableHeader: { backgroundColor: c.bgLight, borderBottomWidth: 1, borderBottomColor: c.ink, borderBottomStyle: 'solid' },
  tableCell: { fontSize: 8, color: c.body, paddingHorizontal: 3 },
  tableCellBold: { fontSize: 8, fontWeight: 'bold', color: c.ink, paddingHorizontal: 3, fontFamily: MONO },

  // List
  listItem: { flexDirection: 'row', marginBottom: 4 },
  bullet: { fontSize: 9, color: c.accent, marginRight: 6, fontWeight: 'bold', fontFamily: MONO },

  // RT60 bar — width set explicitly; `flex: 1` on a column-layout child resolves as a
  // height weight, not a width, and silently collapses to zero visible width.
  barRow: { flexDirection: 'row' },
  barBg: { height: 8, backgroundColor: c.border, borderRadius: 1, width: '100%' },
  barFill: { height: 8, borderRadius: 1 },

  // Diagram
  diagramBox: { width: '100%', height: 320, borderWidth: 0.75, borderColor: c.border, borderStyle: 'solid', borderRadius: 1, backgroundColor: c.bgLight, padding: 15, marginVertical: 8 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, marginRight: 4 },
  legendText: { fontSize: 7, color: c.body },

  // Frequency chart
  chartBox: { width: '100%', borderWidth: 0.75, borderColor: c.border, borderStyle: 'solid', borderRadius: 1, padding: 10, marginTop: 6, marginBottom: 8 },

  // Link
  link: { color: c.accent, textDecoration: 'underline', fontSize: 8 },
})

// ─── i18n dictionary ───
function getLabels(locale: string) {
  const isEN = locale === 'en'
  return {
    reportTitle: isEN ? 'Acoustic Analysis Report' : 'Informe de Analisis Acustico',
    space: isEN ? 'Space' : 'Espacio',
    volume: isEN ? 'Volume' : 'Volumen',
    character: isEN ? 'Character' : 'Caracter',
    date: isEN ? 'Date' : 'Fecha',
    critical: isEN ? 'Critical' : 'Criticos',
    improvements: isEN ? 'Improvements' : 'Mejoras',
    optimizations: isEN ? 'Optimizations' : 'Optimizaciones',
    summary: isEN ? 'Executive Summary' : 'Resumen Ejecutivo',
    acousticAnalysis: isEN ? 'Acoustic Analysis' : 'Analisis Acustico',
    roomMetrics: isEN ? 'Room Metrics' : 'Metricas del Espacio',
    surfaceArea: isEN ? 'Surface Area' : 'Area Superficie',
    floorArea: isEN ? 'Floor Area' : 'Area Piso',
    absorption: isEN ? 'Absorption' : 'Absorcion Total',
    proportions: isEN ? 'Proportions' : 'Proporciones',
    rt60: isEN ? 'Reverb Time (RT60)' : 'Tiempo de Reverberacion (RT60)',
    rt60Method: isEN ? 'Method' : 'Metodo',
    rt60Estimated: isEN ? 'Estimated' : 'Estimado',
    rt60Measured: isEN ? 'Measured (clap test)' : 'Medido (test de aplauso)',
    confidence: isEN ? 'Confidence' : 'Confianza',
    bass: isEN ? 'Bass (63-250 Hz)' : 'Graves (63-250 Hz)',
    mids: isEN ? 'Mids (500-2k Hz)' : 'Medios (500-2k Hz)',
    highs: isEN ? 'Highs (4k-16k Hz)' : 'Agudos (4k-16k Hz)',
    target: isEN ? 'target' : 'objetivo',
    good: isEN ? 'Good' : 'Bueno',
    acceptable: isEN ? 'Acceptable' : 'Aceptable',
    poor: isEN ? 'Poor' : 'Pobre',
    problematic: isEN ? 'Problematic' : 'Problematico',
    noiseLevel: isEN ? 'Ambient Noise' : 'Ruido Ambiente',
    materialsBreakdown: isEN ? 'Absorption by Surface' : 'Absorcion por Superficie',
    floor: isEN ? 'Floor' : 'Piso',
    walls: isEN ? 'Walls' : 'Paredes',
    ceiling: isEN ? 'Ceiling' : 'Techo',
    furniture: isEN ? 'Furniture' : 'Muebles',
    roomModes: isEN ? 'Room Modes (Resonances)' : 'Modos de Sala (Resonancias)',
    frequencyResponseTitle: isEN ? 'Frequency Response (estimated)' : 'Respuesta de Frecuencia (estimada)',
    frequency: isEN ? 'Frequency' : 'Frecuencia',
    type: isEN ? 'Type' : 'Tipo',
    dimension: isEN ? 'Dimension' : 'Dimension',
    severity: isEN ? 'Severity' : 'Severidad',
    mode: isEN ? 'Mode' : 'Modo',
    axial: isEN ? 'Axial' : 'Axial',
    tangential: isEN ? 'Tangential' : 'Tangencial',
    oblique: isEN ? 'Oblique' : 'Oblicuo',
    high: isEN ? 'High' : 'Alta',
    medium: isEN ? 'Medium' : 'Media',
    low: isEN ? 'Low' : 'Baja',
    length: isEN ? 'Length' : 'Largo',
    width: isEN ? 'Width' : 'Ancho',
    height: isEN ? 'Height' : 'Alto',
    mixed: isEN ? 'Mixed' : 'Mixto',
    frequencyIssues: isEN ? 'Frequency Issues Detected' : 'Problemas de Frecuencia Detectados',
    positionDiagram: isEN ? '2D Position Diagram' : 'Diagrama de Posiciones 2D',
    speakers: isEN ? 'Speakers' : 'Parlantes',
    sweetSpot: isEN ? 'Optimal listening position' : 'Posicion de escucha optima',
    bassTraps: isEN ? 'Bass traps' : 'Trampas de graves',
    absorbers: isEN ? 'Absorber panels' : 'Paneles absorbentes',
    diffusers: isEN ? 'Diffusers' : 'Difusores',
    treatmentPlan: isEN ? 'Treatment Plan' : 'Plan de Tratamiento',
    wall: isEN ? 'Wall' : 'Pared',
    priority: isEN ? 'Priority' : 'Prioridad',
    freeChanges: isEN ? 'Free Changes' : 'Cambios Gratuitos',
    freeChangesDesc: isEN ? 'Implement these changes this week at no cost:' : 'Implementa estos cambios esta semana sin gastar dinero:',
    recommendedProducts: isEN ? 'Recommended Products' : 'Productos Recomendados',
    product: isEN ? 'Product' : 'Producto',
    qty: isEN ? 'Qty' : 'Cant.',
    price: isEN ? 'Price' : 'Precio',
    total: isEN ? 'Total' : 'Total',
    estimatedBudget: isEN ? 'Estimated budget' : 'Presupuesto estimado',
    advancedTreatment: isEN ? 'Advanced Treatment' : 'Tratamiento Avanzado',
    actionPlan: isEN ? 'Action Plan' : 'Plan de Accion',
    week1: isEN ? 'Week 1 — Quick Wins' : 'Semana 1 — Quick Wins',
    month1: isEN ? 'Month 1-3 — Gradual Improvements' : 'Mes 1-3 — Mejoras Graduales',
    month6: isEN ? '6+ Months — Final Optimization' : '6+ Meses — Optimizacion Final',
    disclaimer: isEN ? 'Disclaimer & Resources' : 'Disclaimer y Recursos',
    disclaimerTitle: isEN ? 'Important' : 'Importante',
    disclaimerText: isEN
      ? 'This analysis is an estimate based on standard acoustic calculations. For professional results, measurements with specialized equipment (measurement microphone + REW software) are recommended.'
      : 'Este analisis es una estimacion basada en calculos acusticos estandar. Para resultados profesionales, se recomienda realizar mediciones con equipamiento especializado (microfono de medicion + software REW).',
    resources: isEN ? 'Recommended Resources' : 'Recursos Recomendados',
    nextSteps: isEN ? 'Next Steps' : 'Proximos Pasos',
    nextStepsList: isEN
      ? ['Start with free changes', 'Buy products gradually', 'Implement changes and listen', 'Adjust as needed', 'Consider professional measurement']
      : ['Comenza con los cambios gratuitos', 'Compra productos de forma gradual', 'Implementa cambios y escucha', 'Ajusta segun necesites', 'Considera medicion profesional'],
    madeWith: isEN ? 'Made with care' : 'Hecho con cuidado',
    page: isEN ? 'Page' : 'Pagina',
    endOfReport: isEN ? 'End of report' : 'Fin del reporte',
    clickProducts: isEN ? 'Click products to see updated prices' : 'Click en los productos para ver precios actualizados',
    noiseClassification: isEN
      ? { muy_silencioso: 'Very quiet', silencioso: 'Quiet', normal: 'Normal', ruidoso: 'Noisy', muy_ruidoso: 'Very noisy' }
      : { muy_silencioso: 'Muy silencioso', silencioso: 'Silencioso', normal: 'Normal', ruidoso: 'Ruidoso', muy_ruidoso: 'Muy ruidoso' },
    placement: isEN ? 'Placement' : 'Ubicacion',
    impact: isEN ? 'Impact' : 'Impacto',
    install: isEN ? 'Install' : 'Instalacion',
    installLabels: isEN
      ? { easy: 'Easy', moderate: 'Moderate', professional: 'Professional' }
      : { easy: 'Facil', moderate: 'Moderada', professional: 'Profesional' },
    front: isEN ? 'Front' : 'Frontal',
    back: isEN ? 'Back' : 'Trasera',
    left: isEN ? 'Left' : 'Izquierda',
    right: isEN ? 'Right' : 'Derecha',
    absorber: isEN ? 'Absorber' : 'Absorbente',
    diffuser: isEN ? 'Diffuser' : 'Difusor',
    bass_trap: isEN ? 'Bass Trap' : 'Trampa de Graves',
    generatedWith: isEN ? 'Generated with RoomTuner' : 'Generado con RoomTuner',
  }
}

// ─── Helpers ───
function formatPrice(price: number, currency: string) {
  if (currency === 'USD') return `$${price.toLocaleString('en-US')}`
  return `ARS $${price.toLocaleString('es-AR')}`
}

function severityColor(sev: string) {
  return sev === 'high' ? c.danger : sev === 'medium' ? c.warning : c.success
}

/** @react-pdf/renderer's SVG <Text> supports `fontSize` at runtime but the published
 * types (SVGPresentationAttributes) don't declare it — isolated cast so it's a single
 * documented workaround instead of `as any` scattered at each call site. */
function SvgLabel(props: {
  x: number | string
  y: number | string
  fontSize: number | string
  fill: string
  textAnchor?: 'start' | 'middle' | 'end'
  fontWeight?: string
  children: React.ReactNode
}) {
  return <Text {...(props as React.ComponentProps<typeof Text>)} />
}

function ratingBadgeStyle(rating: string) {
  if (rating === 'good') return s.badgeSuccess
  if (rating === 'acceptable') return s.badgeWarning
  return s.badgeDanger
}

// ─── Sub-components ───

function Footer({ page, total, label }: { page: number; total: number; label: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>{label}</Text>
      <Text>{page}/{total}</Text>
    </View>
  )
}

function MetricBox({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={s.metricBox}>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={s.metricValue}>{value}{unit && <Text style={s.metricUnit}> {unit}</Text>}</Text>
    </View>
  )
}

function RT60Bar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min((value / (target * 2)) * 100, 100)
  const isOver = value > target
  return (
    <View style={{ marginBottom: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
        <Text style={s.small}>{label}</Text>
        <Text style={[s.small, { fontFamily: MONO, fontWeight: 'bold', color: isOver ? c.danger : c.success }]}>{value.toFixed(2)}s</Text>
      </View>
      <View style={s.barBg}>
        <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  )
}

/** Frequency response line chart — the web app has one (recharts); the PDF had none at all. */
function FrequencyChart({ data, l }: { data: FrequencyPoint[]; l: ReturnType<typeof getLabels> }) {
  const width = 515
  const height = 130
  const pad = { left: 26, right: 8, top: 8, bottom: 14 }
  const chartW = width - pad.left - pad.right
  const chartH = height - pad.top - pad.bottom
  const minF = 20
  const maxF = 20000
  const logMin = Math.log10(minF)
  const logMax = Math.log10(maxF)
  const clampDb = (db: number) => Math.max(-12, Math.min(12, db))
  const xFor = (f: number) => pad.left + ((Math.log10(Math.max(f, minF)) - logMin) / (logMax - logMin)) * chartW
  const yFor = (db: number) => pad.top + chartH - ((clampDb(db) + 12) / 24) * chartH
  const zeroY = yFor(0)

  const sorted = [...data].sort((a, b) => a.frequency - b.frequency)
  const points = sorted.map((p) => `${xFor(p.frequency)},${yFor(p.response)}`).join(' ')

  return (
    <View style={s.chartBox}>
      <Text style={[s.small, { marginBottom: 4, fontFamily: MONO, textTransform: 'uppercase' }]}>{l.frequencyResponseTitle}</Text>
      <Svg width={width} height={height}>
        <Line x1={pad.left} y1={zeroY} x2={width - pad.right} y2={zeroY} stroke={c.border} strokeWidth={0.75} strokeDasharray="2,2" />
        {points.length > 0 && <Polyline points={points} fill="none" stroke={c.accent} strokeWidth={1.5} />}
        <SvgLabel x={pad.left} y={height - 3} fontSize={6} fill={c.muted}>20Hz</SvgLabel>
        <SvgLabel x={xFor(1000)} y={height - 3} fontSize={6} fill={c.muted} textAnchor="middle">1kHz</SvgLabel>
        <SvgLabel x={width - pad.right} y={height - 3} fontSize={6} textAnchor="end" fill={c.muted}>20kHz</SvgLabel>
        <SvgLabel x={pad.left - 2} y={pad.top + 4} fontSize={6} textAnchor="end" fill={c.muted}>+12dB</SvgLabel>
        <SvgLabel x={pad.left - 2} y={pad.top + chartH} fontSize={6} textAnchor="end" fill={c.muted}>-12dB</SvgLabel>
      </Svg>
    </View>
  )
}

function ProductTableSection({ items, currency, l }: { items: ProductRecommendation[]; currency: string; l: ReturnType<typeof getLabels> }) {
  return (
    <View>
      <View style={[s.tableRow, s.tableHeader]}>
        <Text style={[s.tableCellBold, { flex: 3 }]}>{l.product}</Text>
        <Text style={[s.tableCellBold, { flex: 0.7, textAlign: 'center' }]}>{l.qty}</Text>
        <Text style={[s.tableCellBold, { flex: 1.3, textAlign: 'right' }]}>{l.price}</Text>
        <Text style={[s.tableCellBold, { flex: 1.3, textAlign: 'right' }]}>{l.total}</Text>
      </View>
      {items.map((item, idx) => (
        <View key={idx} style={s.tableRow}>
          {item.link ? (
            <Link src={item.link} style={[s.link, { flex: 3 }]}>
              <Text>{item.product}</Text>
            </Link>
          ) : (
            <Text style={[s.tableCell, { flex: 3 }]}>{item.product}</Text>
          )}
          <Text style={[s.tableCell, { flex: 0.7, textAlign: 'center' }]}>{item.quantity}</Text>
          <Text style={[s.tableCell, { flex: 1.3, textAlign: 'right', fontFamily: MONO }]}>{formatPrice(item.unitPrice, currency)}</Text>
          <Text style={[s.tableCell, { flex: 1.3, textAlign: 'right', fontFamily: MONO }]}>{formatPrice(item.totalPrice, currency)}</Text>
        </View>
      ))}
    </View>
  )
}

// ─── Main Document ───

interface ReportPDFDocumentProps {
  project: RoomProject
  analysis: EnhancedAnalysisResponse
  locale: string
}

export function ReportPDFDocument({ project, analysis, locale }: ReportPDFDocumentProps) {
  const l = getLabels(locale)
  const isEN = locale === 'en'
  const currency = isEN ? 'USD' : 'ARS'

  const {
    summary,
    roomCharacter,
    priorityScore,
    roomMetrics,
    materialsAnalysis,
    frequencyResponse,
    freeChanges,
    lowBudgetChanges,
    advancedChanges,
    roomDiagram,
    generatedAt,
  } = analysis

  const totalIssues = priorityScore.critical + priorityScore.improvements
  const hasAdvanced = advancedChanges.items.length > 0
  const totalPages = hasAdvanced ? 7 : 6

  // Group modes by type
  const axialModes = roomMetrics.roomModes.filter(m => m.type === 'axial')
  const tangentialModes = roomMetrics.roomModes.filter(m => m.type === 'tangential')
  const obliqueModes = roomMetrics.roomModes.filter(m => m.type === 'oblique')

  // Frequency issues
  const freqIssues = frequencyResponse.filter(fp => fp.issue && fp.description)

  // Date formatting
  const dateStr = new Date(generatedAt).toLocaleDateString(isEN ? 'en-US' : 'es-AR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // RT60 targets for comparison
  const rt60Targets = { low: 0.5, mid: 0.4, high: 0.35 }

  return (
    <Document>
      {/* ═══ PAGE 1: COVER ═══ */}
      <Page size="A4" style={s.page}>
        <View style={s.coverWrap}>
          <Text style={s.coverBrand}>RoomTuner</Text>
          <Text style={s.coverSub}>{l.reportTitle}</Text>

          <View style={s.coverInfoBlock}>
            <Text style={s.coverInfo}>
              {l.space}: {project.lengthM}m x {project.widthM}m x {project.heightM}m
            </Text>
            <Text style={s.coverInfo}>
              {l.volume}: {roomMetrics.volume.toFixed(1)} m3
            </Text>
            <Text style={s.coverInfo}>
              {l.character}: {roomCharacter.charAt(0).toUpperCase() + roomCharacter.slice(1)}
            </Text>
            <Text style={s.coverInfo}>{l.date}: {dateStr}</Text>
          </View>

          {totalIssues > 0 && (
            <View style={s.coverBadgeRow}>
              {priorityScore.critical > 0 && (
                <View style={[s.badge, s.badgeDanger]}>
                  <Text>{priorityScore.critical} {l.critical}</Text>
                </View>
              )}
              {priorityScore.improvements > 0 && (
                <View style={[s.badge, s.badgeWarning]}>
                  <Text>{priorityScore.improvements} {l.improvements}</Text>
                </View>
              )}
              {priorityScore.optimizations > 0 && (
                <View style={[s.badge, s.badgeInfo]}>
                  <Text>{priorityScore.optimizations} {l.optimizations}</Text>
                </View>
              )}
            </View>
          )}

          <View style={s.coverSummary}>
            <Text style={[s.body, { textAlign: 'center', lineHeight: 1.6 }]}>{summary}</Text>
          </View>
        </View>
        <Footer page={1} total={totalPages} label={l.generatedWith} />
      </Page>

      {/* ═══ PAGE 2: ACOUSTIC ANALYSIS ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>{l.acousticAnalysis}</Text>

        {/* Metrics grid */}
        <Text style={s.subTitle}>{l.roomMetrics}</Text>
        <View style={s.metricsRow}>
          <MetricBox label={l.volume} value={roomMetrics.volume.toFixed(1)} unit="m3" />
          <MetricBox label={l.surfaceArea} value={roomMetrics.surfaceArea.toFixed(1)} unit="m2" />
          <MetricBox label={l.floorArea} value={roomMetrics.floorArea.toFixed(1)} unit="m2" />
        </View>
        <View style={s.metricsRow}>
          <MetricBox label={l.absorption} value={roomMetrics.totalAbsorption.toFixed(1)} unit="sabins" />
          <MetricBox label={l.character} value={roomCharacter.charAt(0).toUpperCase() + roomCharacter.slice(1)} />
          <View style={s.metricBox}>
            <Text style={s.metricLabel}>{l.proportions}</Text>
            <View style={[s.badge, ratingBadgeStyle(roomMetrics.ratios.rating), { alignSelf: 'flex-start', marginTop: 2 }]}>
              <Text>{roomMetrics.ratios.rating === 'good' ? l.good : roomMetrics.ratios.rating === 'acceptable' ? l.acceptable : l.poor}</Text>
            </View>
          </View>
        </View>

        {/* RT60 */}
        <Text style={s.subTitle}>
          {l.rt60}
          {roomMetrics.rt60Method && <Text style={s.small}> ({roomMetrics.rt60Method === 'eyring' ? 'Eyring' : 'Sabine'})</Text>}
        </Text>
        <View style={s.card}>
          <RT60Bar label={l.bass} value={roomMetrics.rt60Estimate.low} target={rt60Targets.low} color={roomMetrics.rt60Estimate.low > rt60Targets.low ? c.danger : c.success} />
          <RT60Bar label={l.mids} value={roomMetrics.rt60Estimate.mid} target={rt60Targets.mid} color={roomMetrics.rt60Estimate.mid > rt60Targets.mid ? c.warning : c.success} />
          <RT60Bar label={l.highs} value={roomMetrics.rt60Estimate.high} target={rt60Targets.high} color={roomMetrics.rt60Estimate.high > rt60Targets.high ? c.warning : c.success} />

          <Text style={[s.small, { marginTop: 4 }]}>
            {roomMetrics.rt60Evaluation.message}
          </Text>

          {/* Measured RT60 comparison */}
          {roomMetrics.measuredRT60 && (
            <View style={{ marginTop: 8, padding: 6, borderWidth: 0.75, borderColor: c.accent, borderStyle: 'solid', borderRadius: 1 }}>
              <Text style={[s.small, { fontFamily: MONO, fontWeight: 'bold', color: c.accent }]}>
                {l.rt60Measured}: {roomMetrics.measuredRT60.value.toFixed(2)}s
                {'  '}({l.confidence}: {roomMetrics.measuredRT60.confidence})
              </Text>
            </View>
          )}
        </View>

        {/* Noise measurement */}
        {project.noiseMeasurement?.taken && (
          <>
            <Text style={s.subTitle}>{l.noiseLevel}</Text>
            <View style={s.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {project.noiseMeasurement.dbLevel != null && (
                  <Text style={s.bodyBold}>{project.noiseMeasurement.dbLevel.toFixed(0)} dB</Text>
                )}
                {project.noiseMeasurement.classification && (
                  <View style={[s.badge, project.noiseMeasurement.classification === 'ruidoso' || project.noiseMeasurement.classification === 'muy_ruidoso' ? s.badgeDanger : project.noiseMeasurement.classification === 'normal' ? s.badgeWarning : s.badgeSuccess]}>
                    <Text>{l.noiseClassification[project.noiseMeasurement.classification as keyof typeof l.noiseClassification] || project.noiseMeasurement.classification}</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* Materials absorption */}
        <Text style={s.subTitle}>{l.materialsBreakdown}</Text>
        <View style={s.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
            <Text style={s.small}>{l.floor}</Text>
            <Text style={[s.small, { fontFamily: MONO, fontWeight: 'bold', color: c.ink }]}>{(materialsAnalysis.floorAbsorption * 100).toFixed(0)}%</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
            <Text style={s.small}>{l.walls}</Text>
            <Text style={[s.small, { fontFamily: MONO, fontWeight: 'bold', color: c.ink }]}>{(materialsAnalysis.wallAbsorption * 100).toFixed(0)}%</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
            <Text style={s.small}>{l.ceiling}</Text>
            <Text style={[s.small, { fontFamily: MONO, fontWeight: 'bold', color: c.ink }]}>{(materialsAnalysis.ceilingAbsorption * 100).toFixed(0)}%</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={s.small}>{l.furniture}</Text>
            <Text style={[s.small, { fontFamily: MONO, fontWeight: 'bold', color: c.ink }]}>{materialsAnalysis.furnitureContribution.toFixed(1)} sabins</Text>
          </View>
        </View>

        <Footer page={2} total={totalPages} label={l.generatedWith} />
      </Page>

      {/* ═══ PAGE 3: FREQUENCY RESPONSE + ROOM MODES ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>{l.roomModes}</Text>

        <FrequencyChart data={frequencyResponse} l={l} />

        {/* Mode count summary */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <View style={[s.badge, s.badgeInfo]}><Text>{l.axial}: {axialModes.length}</Text></View>
          <View style={[s.badge, s.badgeWarning]}><Text>{l.tangential}: {tangentialModes.length}</Text></View>
          <View style={[s.badge, s.badgeSuccess]}><Text>{l.oblique}: {obliqueModes.length}</Text></View>
        </View>

        {/* Modes table — show up to 20 most severe */}
        <View>
          <View style={[s.tableRow, s.tableHeader]}>
            <Text style={[s.tableCellBold, { flex: 1 }]}>{l.frequency}</Text>
            <Text style={[s.tableCellBold, { flex: 1 }]}>{l.type}</Text>
            <Text style={[s.tableCellBold, { flex: 0.8 }]}>{l.mode}</Text>
            <Text style={[s.tableCellBold, { flex: 1 }]}>{l.dimension}</Text>
            <Text style={[s.tableCellBold, { flex: 0.8 }]}>{l.severity}</Text>
          </View>
          {roomMetrics.roomModes
            .sort((a, b) => {
              const sevOrder = { high: 0, medium: 1, low: 2 }
              return (sevOrder[a.severity] - sevOrder[b.severity]) || (a.frequency - b.frequency)
            })
            .slice(0, 14)
            .map((mode, idx) => {
              const typeLabel = mode.type === 'axial' ? l.axial : mode.type === 'tangential' ? l.tangential : l.oblique
              const dimLabel = mode.dimension === 'length' ? l.length : mode.dimension === 'width' ? l.width : mode.dimension === 'height' ? l.height : l.mixed
              const sevLabel = mode.severity === 'high' ? l.high : mode.severity === 'medium' ? l.medium : l.low
              const modeStr = `(${mode.nx ?? 0},${mode.ny ?? 0},${mode.nz ?? 0})`
              return (
                <View key={idx} style={s.tableRow}>
                  <Text style={[s.tableCellBold, { flex: 1 }]}>{mode.frequency.toFixed(0)} Hz</Text>
                  <Text style={[s.tableCell, { flex: 1 }]}>{typeLabel}</Text>
                  <Text style={[s.tableCell, { flex: 0.8, fontFamily: MONO }]}>{modeStr}</Text>
                  <Text style={[s.tableCell, { flex: 1 }]}>{dimLabel}</Text>
                  <Text style={[s.tableCell, { flex: 0.8, color: severityColor(mode.severity), fontWeight: 'bold' }]}>{sevLabel}</Text>
                </View>
              )
            })}
        </View>

        {/* Proportions info */}
        <View style={[s.card, { marginTop: 10 }]}>
          <Text style={[s.small, { fontFamily: MONO }]}>
            {l.proportions}: {roomMetrics.ratios.lengthWidth.toFixed(2)} : {roomMetrics.ratios.lengthHeight.toFixed(2)} : {roomMetrics.ratios.widthHeight.toFixed(2)}
          </Text>
          <Text style={[s.small, { marginTop: 2 }]}>{roomMetrics.ratios.message}</Text>
        </View>

        {/* Frequency issues */}
        {freqIssues.length > 0 && (
          <>
            <Text style={[s.subTitle, { marginTop: 10 }]}>{l.frequencyIssues}</Text>
            {freqIssues.slice(0, 6).map((fp, idx) => (
              <View key={idx} style={s.listItem}>
                <Text style={s.bullet}>{fp.frequency} Hz</Text>
                <Text style={s.body}>{fp.description}</Text>
              </View>
            ))}
          </>
        )}

        <Footer page={3} total={totalPages} label={l.generatedWith} />
      </Page>

      {/* ═══ PAGE 4: DIAGRAM ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>{l.positionDiagram}</Text>

        <View style={s.diagramBox}>
          <Svg width="100%" height="290" viewBox="0 0 400 290">
            {/* Room outline */}
            <Rect x="40" y="20" width="320" height="250" fill="none" stroke={c.ink} strokeWidth="1" />

            {/* Dimension labels */}
            <SvgLabel x="200" y="13" fontSize="10" textAnchor="middle" fill={c.muted}>
              {project.lengthM?.toFixed(1)} m
            </SvgLabel>
            <SvgLabel x="368" y="145" fontSize="10" textAnchor="start" fill={c.muted}>
              {project.widthM?.toFixed(1)} m
            </SvgLabel>

            {/* Speakers — sp.x/sp.y are already 0-1 normalized, do not divide by room meters */}
            {roomDiagram?.floorPlan?.speakerPositions?.map((sp, idx) => {
              const x = 40 + sp.x * 320
              const y = 20 + sp.y * 250
              return (
                <React.Fragment key={`sp-${idx}`}>
                  <Rect x={x - 7} y={y - 7} width="14" height="14" fill={c.accent} stroke={c.ink} strokeWidth="0.5" />
                  <SvgLabel x={x} y={y - 12} fontSize="8" textAnchor="middle" fill={c.accent}>S{idx + 1}</SvgLabel>
                </React.Fragment>
              )
            })}

            {/* Listening position — same fix: already normalized */}
            {roomDiagram?.floorPlan?.listeningPosition && (() => {
              const lp = roomDiagram.floorPlan.listeningPosition
              const x = 40 + lp.x * 320
              const y = 20 + lp.y * 250
              return (
                <Circle cx={x} cy={y} r="9" fill={c.success} stroke={c.ink} strokeWidth="0.5" />
              )
            })()}

            {/* Treatment positions */}
            {roomDiagram?.treatmentPlan?.map((t, idx) => {
              const x = 40 + t.position.x * 320
              const y = 20 + t.position.y * 250
              const fill = t.type === 'bass_trap' ? c.danger : t.type === 'diffuser' ? c.warning : c.success
              return (
                <Circle key={`t-${idx}`} cx={x} cy={y} r="5" fill={fill} opacity={0.6} />
              )
            })}
          </Svg>
        </View>

        {/* Legend */}
        <View style={s.legendRow}>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: c.accent }]} />
            <Text style={s.legendText}>{l.speakers}</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: c.success }]} />
            <Text style={s.legendText}>{l.sweetSpot}</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: c.danger }]} />
            <Text style={s.legendText}>{l.bassTraps}</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: c.success, opacity: 0.6 }]} />
            <Text style={s.legendText}>{l.absorbers}</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: c.warning }]} />
            <Text style={s.legendText}>{l.diffusers}</Text>
          </View>
        </View>

        {/* Treatment plan list */}
        {roomDiagram?.treatmentPlan && roomDiagram.treatmentPlan.length > 0 && (
          <>
            <Text style={[s.subTitle, { marginTop: 12 }]}>{l.treatmentPlan}</Text>
            <View>
              <View style={[s.tableRow, s.tableHeader]}>
                <Text style={[s.tableCellBold, { flex: 1.5 }]}>{l.type}</Text>
                <Text style={[s.tableCellBold, { flex: 1 }]}>{l.wall}</Text>
                <Text style={[s.tableCellBold, { flex: 1 }]}>{l.priority}</Text>
              </View>
              {roomDiagram.treatmentPlan.map((t, idx) => {
                const typeLabel = t.type === 'bass_trap' ? l.bass_trap : t.type === 'absorber' ? l.absorber : l.diffuser
                const wallLabel = t.wall === 'front' ? l.front : t.wall === 'back' ? l.back : t.wall === 'left' ? l.left : t.wall === 'right' ? l.right : l.ceiling
                const prioLabel = t.priority === 'high' ? l.high : t.priority === 'medium' ? l.medium : l.low
                return (
                  <View key={idx} style={s.tableRow}>
                    <Text style={[s.tableCell, { flex: 1.5 }]}>{typeLabel}</Text>
                    <Text style={[s.tableCell, { flex: 1 }]}>{wallLabel}</Text>
                    <Text style={[s.tableCell, { flex: 1, color: severityColor(t.priority), fontWeight: 'bold' }]}>{prioLabel}</Text>
                  </View>
                )
              })}
            </View>
          </>
        )}

        <Footer page={4} total={totalPages} label={l.generatedWith} />
      </Page>

      {/* ═══ PAGE 5: FREE CHANGES + LOW BUDGET PRODUCTS ═══ */}
      <Page size="A4" style={s.page}>
        {/* Free changes */}
        <Text style={s.sectionTitle}>{l.freeChanges}</Text>
        <Text style={[s.body, { marginBottom: 8 }]}>{l.freeChangesDesc}</Text>
        {freeChanges.items.map((item, idx) => (
          <View key={idx} style={s.listItem}>
            <Text style={s.bullet}>{idx + 1}.</Text>
            <Text style={s.body}>{item}</Text>
          </View>
        ))}

        {/* Low budget products */}
        <Text style={[s.sectionTitle, { marginTop: 16 }]}>{l.recommendedProducts}</Text>
        <Text style={[s.small, { marginBottom: 4 }]}>{lowBudgetChanges.title}</Text>
        <ProductTableSection items={lowBudgetChanges.items} currency={currency} l={l} />

        <View style={[s.card, { marginTop: 8 }]}>
          <Text style={[s.bodyBold, { fontFamily: MONO }]}>
            {l.estimatedBudget}: {formatPrice(lowBudgetChanges.totalEstimatedCost.min, currency)} - {formatPrice(lowBudgetChanges.totalEstimatedCost.max, currency)}
          </Text>
          <Text style={[s.small, { marginTop: 2 }]}>{l.clickProducts}</Text>
        </View>

        <Footer page={5} total={totalPages} label={l.generatedWith} />
      </Page>

      {/* ═══ PAGE 6: ADVANCED PRODUCTS + ACTION PLAN ═══ */}
      <Page size="A4" style={s.page}>
        {hasAdvanced && (
          <>
            <Text style={s.sectionTitle}>{l.advancedTreatment}</Text>
            <Text style={[s.small, { marginBottom: 4 }]}>{advancedChanges.title}</Text>
            <ProductTableSection items={advancedChanges.items} currency={currency} l={l} />

            <View style={[s.card, { marginTop: 8 }]}>
              <Text style={[s.bodyBold, { fontFamily: MONO }]}>
                {l.estimatedBudget}: {formatPrice(advancedChanges.totalEstimatedCost.min, currency)} - {formatPrice(advancedChanges.totalEstimatedCost.max, currency)}
              </Text>
            </View>
          </>
        )}

        {/* Action plan */}
        <Text style={[s.sectionTitle, { marginTop: hasAdvanced ? 14 : 0 }]}>{l.actionPlan}</Text>

        <Text style={s.subTitle}>{l.week1}</Text>
        <View style={s.card}>
          {freeChanges.items.slice(0, 3).map((item, idx) => (
            <View key={idx} style={s.listItem}>
              <Text style={s.bullet}>{idx + 1}.</Text>
              <Text style={s.body}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={s.subTitle}>{l.month1}</Text>
        <View style={s.card}>
          {lowBudgetChanges.items.slice(0, 3).map((item, idx) => (
            <View key={idx} style={s.listItem}>
              <Text style={s.bullet}>{idx + 4}.</Text>
              <Text style={s.body}>{item.product} — {item.placement}</Text>
            </View>
          ))}
        </View>

        <Text style={s.subTitle}>{l.month6}</Text>
        <View style={s.card}>
          {(hasAdvanced ? advancedChanges.items.slice(0, 3) : lowBudgetChanges.items.slice(3, 6)).map((item, idx) => (
            <View key={idx} style={s.listItem}>
              <Text style={s.bullet}>{idx + 7}.</Text>
              <Text style={s.body}>{item.product} — {item.placement}</Text>
            </View>
          ))}
        </View>

        <Footer page={6} total={totalPages} label={l.generatedWith} />
      </Page>

      {/* ═══ PAGE 7: DISCLAIMER ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>{l.disclaimer}</Text>

        <View style={s.card}>
          <Text style={s.bodyBold}>{l.disclaimerTitle}</Text>
          <Text style={[s.body, { marginTop: 4 }]}>{l.disclaimerText}</Text>
        </View>

        <Text style={[s.subTitle, { marginTop: 8 }]}>{l.resources}</Text>
        <View style={s.card}>
          <View style={s.listItem}>
            <Text style={s.bullet}>1.</Text>
            <Text style={s.body}>REW (Room EQ Wizard) — {isEN ? 'Free measurement software' : 'Software gratuito de medicion'}</Text>
          </View>
          <View style={s.listItem}>
            <Text style={s.bullet}>2.</Text>
            <Text style={s.body}>UMIK-1 — {isEN ? 'Affordable calibrated microphone' : 'Microfono calibrado economico'}</Text>
          </View>
          <View style={s.listItem}>
            <Text style={s.bullet}>3.</Text>
            <Text style={s.body}>{isEN ? 'Amazon — Acoustic products' : 'MercadoLibre Argentina — Productos acusticos locales'}</Text>
          </View>
        </View>

        <Text style={[s.subTitle, { marginTop: 8 }]}>{l.nextSteps}</Text>
        <View style={s.card}>
          {l.nextStepsList.map((step, idx) => (
            <View key={idx} style={s.listItem}>
              <Text style={s.bullet}>{idx + 1}.</Text>
              <Text style={s.body}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Text style={[s.body, { textAlign: 'center', color: c.accent, fontFamily: MONO }]}>
            roomtuner.app
          </Text>
          <Text style={[s.small, { textAlign: 'center', marginTop: 4 }]}>
            {l.madeWith} — {l.endOfReport}
          </Text>
        </View>

        <Footer page={totalPages} total={totalPages} label={l.generatedWith} />
      </Page>
    </Document>
  )
}
