import React from "react"
import { Document, Page, Text, View, StyleSheet, Link, Svg, Rect, Circle, Line, Polyline } from "@react-pdf/renderer"
import type { EnhancedAnalysisResponse, RoomProject, ProductRecommendation } from "@/app/types/room"
import { es } from "@/lib/translations/es"
import { en } from "@/lib/translations/en"
import { initialLayout, proposeLayout, DEFAULT_MOVES, type Layout } from "@/lib/layoutTrial"
import { experimentCatalog, getReportExperiments } from "@/lib/reportExperiments"
import { surfaceAbsorption, rt60Reference, rt60ChartMaximum, budgetTotal, type ReportPersonalization } from "@/lib/reportModel"

const c = { ink: "#101820", text: "#3d4a54", muted: "#5c6b77", cyan: "#0284c7", green: "#147a5d", border: "#d7e0e7", light: "#f4f7f9" }
const s = StyleSheet.create({
  page: { paddingTop: 35, paddingBottom: 48, paddingHorizontal: 40, fontFamily: "Helvetica", color: c.text, fontSize: 9 },
  brand: { fontSize: 25, fontWeight: "bold", color: c.ink, marginBottom: 5 },
  title: { fontSize: 15, fontWeight: "bold", color: c.ink, paddingBottom: 7, borderBottomWidth: 1, borderBottomColor: c.ink, marginBottom: 12 },
  sub: { fontSize: 10, fontWeight: "bold", color: c.ink, marginTop: 12, marginBottom: 6 },
  body: { fontSize: 9, lineHeight: 1.5, marginBottom: 6 },
  small: { fontSize: 8, lineHeight: 1.4, color: c.muted, marginBottom: 5 },
  card: { borderWidth: .7, borderColor: c.border, padding: 10, marginBottom: 9 },
  accent: { borderLeftWidth: 3, borderLeftColor: c.cyan, paddingLeft: 10, marginVertical: 9 },
  row: { flexDirection: "row", borderBottomWidth: .5, borderBottomColor: c.border, paddingVertical: 5 },
  cell: { fontSize: 8, lineHeight: 1.35, flex: 1, paddingHorizontal: 3 },
  header: { backgroundColor: c.light, fontWeight: "bold", color: c.ink },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontFamily: "Courier", fontSize: 7, color: c.muted },
  link: { color: c.cyan, fontSize: 8, marginBottom: 7 },
})
// react-pdf SVG text accepts presentation props not declared by its types.
const Label = Text as React.ComponentType<React.ComponentProps<typeof Text> & { x?: number; y?: number; fontSize?: number; fill?: string; textAnchor?: string }>
function Footer({ english }: { english: boolean }) {
  return <View style={s.footer} fixed><Text>{english ? "RoomTuner / personalised report" : "RoomTuner / informe personalizado"}</Text><Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} /></View>
}
function RoomSketch({ layout, title, furnitureLabels, ghost }: { layout: Layout; title: string; furnitureLabels: Record<string, string>; ghost?: Layout }) {
  const scale = Math.min(184 / layout.width, 175 / layout.length)
  const w = layout.width * scale, h = layout.length * scale
  const x = (232 - w) / 2, y = 27
  const sx = (p: { x: number }) => x + p.x * w
  const sy = (p: { y: number }) => y + p.y * h
  const objects = (room: Layout) => [...room.speakerPositions, room.listeningPosition]
  return <View style={{ width: 246, borderWidth: .7, borderColor: c.border, padding: 6 }}>
    <Text style={[s.sub, { marginTop: 0 }]}>{title}</Text>
    <Svg width={232} height={220}>
      <Rect x={x} y={y} width={w} height={h} fill={c.light} stroke={c.ink} strokeWidth={1} />
      <Label x={116} y={16} textAnchor="middle" fill={c.muted} fontSize={8}>{layout.width.toFixed(1)} x {layout.length.toFixed(1)} m</Label>
      {ghost && objects(layout).map((p, i) => <Line key={`line-${i}`} x1={sx(objects(ghost)[i])} y1={sy(objects(ghost)[i])} x2={sx(p)} y2={sy(p)} stroke={c.cyan} strokeDasharray="3 2" strokeWidth={1} />)}
      {layout.furnitureLayout.map((f, i) => <React.Fragment key={`f-${i}`}>
        <Rect x={sx(f) - f.width * w / 2} y={sy(f) - f.length * h / 2} width={f.width * w} height={f.length * h} fill="#e3eaf0" stroke={c.muted} strokeWidth={.5} />
        <Label x={sx(f)} y={sy(f) + 2} textAnchor="middle" fill={c.text} fontSize={5}>{furnitureLabels[f.type] ?? f.type}</Label>
      </React.Fragment>)}
      {layout.speakerPositions.map((p, i) => <React.Fragment key={`s-${i}`}><Rect x={sx(p) - 5} y={sy(p) - 5} width={10} height={10} fill={c.cyan} /><Label x={sx(p)} y={sy(p) - 9} textAnchor="middle" fill={c.cyan} fontSize={7}>{i === 0 ? "L" : "R"}</Label></React.Fragment>)}
      <Circle cx={sx(layout.listeningPosition)} cy={sy(layout.listeningPosition)} r={6} fill={c.green} />
    </Svg>
  </View>
}
function ReverbChart({ values, range, labels, seconds }: { values: number[]; range: { min: number; max: number }; labels: string[]; seconds: string }) {
  const max = rt60ChartMaximum(values, range.max)
  const left = 90, plot = 365
  const xx = (v: number) => left + v / max * plot
  return <Svg width={495} height={150}>
    <Rect x={xx(range.min)} y={50} width={xx(range.max) - xx(range.min)} height={24} fill="#e1f0e8" />
    {Array.from({ length: 5 }, (_, i) => i * max / 4).map((value, i) => <React.Fragment key={i}><Line x1={xx(value)} y1={10} x2={xx(value)} y2={120} stroke={c.border} strokeWidth={.5} /><Label x={xx(value)} y={135} textAnchor="middle" fontSize={7} fill={c.muted}>{value.toFixed(2)}</Label></React.Fragment>)}
    {values.map((value, i) => <React.Fragment key={i}><Label x={0} y={33 + i * 34} fontSize={8} fill={c.text}>{labels[i]}</Label><Rect x={left} y={20 + i * 34} width={Math.max(1, value / max * plot)} height={15} fill={c.cyan} /><Label x={Math.min(480, xx(value) + 4)} y={32 + i * 34} fontSize={7} fill={c.ink}>{value.toFixed(2)}</Label></React.Fragment>)}
    <Label x={275} y={149} textAnchor="middle" fontSize={7} fill={c.muted}>{seconds}</Label>
  </Svg>
}
function FrequencyIllustration({ data, title, english }: { english: boolean; data: EnhancedAnalysisResponse["frequencyResponse"]; title: string }) {
  const w = 495, left = 30, right = 14, top = 15, bottom = 105
  const values = data.map(p => p.response)
  const min = Math.min(-6, ...values), max = Math.max(6, ...values)
  const xx = (f: number) => left + (Math.log10(Math.max(20, Math.min(20000, f))) - Math.log10(20)) / 3 * (w - left - right)
  const yy = (v: number) => bottom - (v - min) / (max - min) * (bottom - top)
  return <View style={{ marginVertical: 7 }}><Text style={s.sub}>{title}</Text><Svg width={w} height={136}>
    {[min, 0, max].map(v => <React.Fragment key={v}><Line x1={left} y1={yy(v)} x2={w - right} y2={yy(v)} stroke={c.border} strokeWidth={.5} /><Label x={26} y={yy(v) + 3} textAnchor="end" fill={c.muted} fontSize={6}>{v.toFixed(0)}</Label></React.Fragment>)}
    <Polyline points={[...data].sort((a, b) => a.frequency - b.frequency).map(p => `${xx(p.frequency)},${yy(p.response)}`).join(" ")} fill="none" stroke={c.cyan} strokeWidth={1.3} />
    {[20, 100, 1000, 10000, 20000].map(f => <Label key={f} x={xx(f)} y={120} textAnchor="middle" fill={c.muted} fontSize={6}>{f >= 1000 ? `${f / 1000}k` : f} Hz</Label>)}
    <Label x={250} y={134} textAnchor="middle" fill={c.muted} fontSize={6}>{english ? "Hz / dB: illustrative model, not a measurement" : "Hz / dB: modelo ilustrativo, no medición"}</Label>
  </Svg></View>
}
const productNamesES: Record<string, string> = {
  "foam-panel-5cm": "Panel de espuma 60 x 60 cm, 5 cm", "foam-panel-10cm": "Panel de espuma 60 x 60 cm, 10 cm",
  "pro-fabric-panel-5cm": "Panel absorbente de tela 60 x 120 cm, 5 cm", "pro-fabric-panel-10cm": "Panel absorbente de tela 60 x 120 cm, 10 cm",
  "corner-bass-trap-60cm": "Trampa de graves de esquina 30 x 30 x 60 cm", "corner-bass-trap-120cm": "Trampa de graves de esquina 30 x 30 x 120 cm",
  "qrd-diffuser-large": "Difusor QRD 60 x 120 cm", "thick-rug-medium": "Alfombra gruesa 2 x 3 m", "thick-rug-small": "Alfombra gruesa 1,5 x 2 m", "thick-rug-large": "Alfombra gruesa 3 x 4 m",
  "soffit-bass-trap": "Trampa de graves de gran volumen", "membrane-bass-trap": "Trampa de graves de membrana", "qrd-diffuser-small": "Difusor QRD pequeño", "skyline-diffuser": "Difusor tipo skyline", "poly-diffuser": "Difusor policilíndrico",
  "light-curtain": "Cortina liviana", "medium-curtain": "Cortina de peso medio", "heavy-curtain": "Cortina pesada", "blackout-acoustic-curtain": "Cortina blackout acústica",
  "door-seal-kit": "Kit de burletes de puerta", "window-plug": "Tapón desmontable de ventana", "bass-shaker": "Transductor de vibración", "acoustic-caulk": "Sellador acústico", "mass-loaded-vinyl": "Barrera de vinilo de alta masa", "isolation-pads": "Apoyos aislantes para parlantes (par)",
  "ceiling-cloud-panel": "Panel absorbente de techo 120 x 120 cm", "measurement-mic": "Micrófono USB de medición",
}
function productName(product: ProductRecommendation, english: boolean) { return english ? product.product : productNamesES[product.productId] ?? product.product }

export function ReportPDFDocument({ project, analysis, personalization = {}, locale }: { project: RoomProject; analysis: EnhancedAnalysisResponse; personalization?: ReportPersonalization; locale: string }) {
  const english = locale === "en"
  const t = english ? en : es
  const say = (spanish: string, eng: string) => english ? eng : spanish
  const layouts = personalization.layout ?? (() => {
    const current = initialLayout(project, analysis.roomDiagram.floorPlan)
    const moves = project.moveConstraints ?? DEFAULT_MOVES
    return { confirmed: false, current, proposal: proposeLayout(current, moves), moves, view: "current" as const, source: "schematic" as const }
  })()
  const effectiveProject = { ...project, moveConstraints: layouts.moves }
  const experiments = getReportExperiments(effectiveProject, analysis.roomCharacter, t.experiments)
  const recordedExperiments = [...experiments, ...experimentCatalog(t.experiments).filter(item => personalization.experiments?.[item.id] && !experiments.some(candidate => candidate.id === item.id))]
  const { rows, furniture } = surfaceAbsorption(project)
  const range = rt60Reference(project.goal)
  const rt = analysis.roomMetrics.rt60Estimate
  const bands = say("Graves 125 Hz|Medios 1 kHz|Agudos 4 kHz", "Bass 125 Hz|Mids 1 kHz|Treble 4 kHz").split("|")
  const floorNames = { ceramico: t.espacio.ceramic, madera: t.espacio.wood, vinilico: t.espacio.vinyl, concreto: t.espacio.concrete, marmol: t.espacio.marble, alfombra: t.espacio.carpet, goma: t.espacio.rubber, otro: t.espacio.otherFloor }
  const wallNames = { desnudas: t.espacio.nakedWalls, vidrio: t.espacio.windowWalls, ladrillo: t.espacio.brickWalls, cuadros: t.espacio.framedWalls, bibliotecas: t.espacio.libraryWalls, cortinas: t.espacio.curtainWalls, paneles_madera: t.espacio.panelWalls, mixto: t.espacio.mixedWalls }
  const date = new Date(analysis.generatedAt).toLocaleDateString(english ? "en-US" : "es-AR", { timeZone: "America/Argentina/Buenos_Aires" })
  const money = (value: number, currency: string) => `${currency} ${new Intl.NumberFormat(english ? "en-US" : "es-AR", { maximumFractionDigits: 0 }).format(value)}`
  const outcomes = { better: t.experiments.better, same: t.experiments.same, worse: t.experiments.worse, unable: t.journey.unable }
  const source = say("Calculado con dimensiones y materiales ingresados. Coeficientes genéricos y techo duro supuesto; no es una medición de la sala.", "Calculated from entered dimensions and materials. Generic coefficients and assumed hard ceiling; not a room measurement.")
  return <Document title={say("RoomTuner - Tu espacio y tus pruebas", "RoomTuner - Your space and experiments")} author="RoomTuner" language={locale}>
    <Page size="A4" style={s.page}>
      <Text style={s.brand}>RoomTuner</Text><Text style={s.title}>{say("Tu espacio y qué probar primero", "Your space and what to try first")}</Text>
      <Text style={s.small}>{date} / {say("Informe orientativo personalizado", "Personalised guidance report")}</Text>
      <View style={s.card}><Text style={s.body}>{say("Dimensiones ingresadas", "Entered dimensions")}: {project.lengthM} x {project.widthM} x {project.heightM} m / {analysis.roomMetrics.volume.toFixed(1)} m³</Text>
        <Text style={s.body}>{say("Uso", "Use")}: {project.goal === "music" ? t.resultado.goalMusic : project.goal === "instrument" ? t.resultado.goalInstrument : t.resultado.goalWork}</Text>
        <Text style={s.body}>{say("Qué querés mejorar", "What you want to improve")}: {t.layoutTrial[project.concern ?? "clarity"]}</Text>
        <Text style={s.body}>{say("Piso / paredes", "Floor / walls")}: {project.floorType ? floorNames[project.floorType] : say("sin indicar", "not specified")} / {project.wallType ? wallNames[project.wallType] : say("sin indicar", "not specified")}</Text>
        <Text style={s.small}>{say("Fuente: tus respuestas en el formulario. No escaneamos el espacio.", "Source: your form answers. We did not scan the room.")}</Text>
      </View>
      <Text style={s.sub}>{t.layoutTrial.restrictions}</Text>
      <Text style={s.body}>{(["speakers", "listening", "furniture"] as const).map(k => `${t.layoutTrial[k]}: ${layouts.moves[k] ? say("se puede mover", "movable") : say("fijo", "fixed")}`).join(" / ")}</Text>
      <Text style={s.sub}>{say("La primera prueba para tu objetivo", "The first experiment for your goal")}</Text>
      <View style={s.accent}><Text style={[s.body, { fontWeight: "bold" }]}>{experiments[0]?.title ?? t.journey.noTrial}</Text><Text style={s.body}>{experiments[0]?.action}</Text><Text style={s.body}>{experiments[0]?.why}</Text><Text style={s.body}>{experiments[0]?.check}</Text></View>
      <Text style={s.sub}>{say("Qué sabemos y qué falta comprobar", "What we know and what needs checking")}</Text>
      <Text style={s.body}>{source}</Text>
      <Text style={s.body}>{say(`El modelo estima ${rt.mid.toFixed(2)} s de reverberación en medios. Sirve para orientar una prueba de reflexiones, no para asegurar cómo suena cada asiento.`, `The model estimates ${rt.mid.toFixed(2)} s mid-frequency reverberation. It can guide a reflection experiment, but cannot establish how every seat sounds.`)}</Text>
      <Text style={s.body}>{t.experiments.protocol}</Text>
      <Text style={s.small}>{say("No se recomienda comprar trampas o paneles solo por la presencia de modos calculados. Primero probá y comprobá.", "Calculated room modes alone are not a reason to buy traps or panels. Test and verify first.")}</Text>
      <Footer english={english} />
    </Page>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>{say("Tu distribución: actual y propuesta", "Your layout: current and proposal")}</Text>
      <Text style={s.body}>{layouts.source === "user" ? say("Incluye los ajustes de tu plano en este navegador.", "Includes your layout edits in this browser.") : say("Esquema inicial basado en tus respuestas; todavía no fue acomodado por vos.", "Initial sketch based on your answers; you have not arranged it yet.")}</Text>
      <View style={{ flexDirection: "row", gap: 12, marginVertical: 10 }}>
        <RoomSketch layout={layouts.current} title={t.layoutTrial.current} furnitureLabels={t.report.furniture} />
        <RoomSketch layout={layouts.proposal} title={t.layoutTrial.proposal} furnitureLabels={t.report.furniture} ghost={layouts.current} />
      </View>
      <Text style={s.small}>{say("Azul L/R: parlantes. Verde: lugar de escucha. Gris: muebles. Línea punteada: movimiento entre esquemas. Ambas vistas usan la misma escala.", "Blue L/R: speakers. Green: listening spot. Grey: furniture. Dashed lines: movement between layouts. Both views use the same scale.")}</Text>
      <Text style={s.body}>{say("Vista seleccionada al exportar", "Selected view when exported")}: {t.layoutTrial[layouts.view]}</Text>
      {layouts.confirmed ? <>
      <Text style={s.sub}>{say("Movimientos a evaluar", "Movements to evaluate")}</Text>
      {([...layouts.current.speakerPositions.map((p, i) => ({ label: i === 0 ? t.layoutTrial.left : t.layoutTrial.right, from: p, to: layouts.proposal.speakerPositions[i] })), { label: t.layoutTrial.listening, from: layouts.current.listeningPosition, to: layouts.proposal.listeningPosition }]).map((item, i) => {
        const dx = (item.to.x - item.from.x) * layouts.current.width, dy = (item.to.y - item.from.y) * layouts.current.length
        return <View key={i} style={s.row}><Text style={s.cell}>{item.label}</Text><Text style={s.cell}>{Math.abs(dx) < .005 && Math.abs(dy) < .005 ? say("Sin cambio", "Unchanged") : say(`Horizontal ${dx.toFixed(2)} m / vertical ${dy.toFixed(2)} m`, `Horizontal ${dx.toFixed(2)} m / vertical ${dy.toFixed(2)} m`)}</Text></View>
      })}
      <Text style={s.small}>{say("Signos positivos: hacia la derecha y abajo en la planta. Las distancias dependen de las dimensiones ingresadas y de posiciones estimadas.", "Positive signs: right and down in the plan. Distances depend on entered room dimensions and estimated positions.")}</Text>
      </> : <Text style={s.body}>{t.journey.confirmHint}</Text>}
      <Text style={s.body}>{t.layoutTrial.proposalNote}</Text><Text style={s.body}>{t.layoutTrial.layoutNote}</Text>
      <Text style={s.small}>{say("El plano no calcula una mejora de respuesta en dB. No se añadieron tratamientos genéricos ni se llamó óptima a una posición sin verificarla.", "The layout does not calculate a dB improvement. No generic treatments were added and no unverified position is labelled optimal.")}</Text><Footer english={english} />
    </Page>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>{say("Reverberación: cómo leer la estimación", "Reverberation: reading the estimate")}</Text>
      <Text style={s.body}>{say("RT60 expresa cuánto tarda en decaer el sonido. Aquí se estima por bandas representativas a partir de absorción y volumen. Un valor mayor puede orientar una prueba para reducir reflexiones.", "RT60 describes sound decay time. Here it is estimated at representative bands using absorption and volume. A larger value can guide a reflection-reduction experiment.")}</Text>
      <ReverbChart values={[rt.low, rt.mid, rt.high]} range={range} labels={bands} seconds={say("Tiempo estimado (segundos)", "Estimated time (seconds)")} />
      <Text style={s.small}>{say(`Azul: estimación ${analysis.roomMetrics.rt60Method ?? "Sabine/Eyring"}. Verde: referencia interna de RoomTuner de ${range.min}-${range.max} s para medios y el uso elegido. La misma escala se usa en las tres bandas. No es una norma ni un objetivo validado para graves o agudos.`, `Blue: ${analysis.roomMetrics.rt60Method ?? "Sabine/Eyring"} estimate. Green: RoomTuner's internal ${range.min}-${range.max} s mid-frequency reference for the selected use. All bands share one scale. Not a standard or a validated bass/treble target.`)}</Text>
      <Text style={s.body}>{source}</Text>
      {analysis.roomMetrics.measuredRT60 ? <View style={s.card}><Text style={s.body}>{say("Prueba exploratoria de aplauso", "Exploratory clap test")}: {analysis.roomMetrics.measuredRT60.value.toFixed(2)} s</Text><Text style={s.small}>{t.experiments.confidence}: {analysis.roomMetrics.measuredRT60.confidence === "high" ? t.experiments.high : analysis.roomMetrics.measuredRT60.confidence === "medium" ? t.experiments.medium : t.experiments.low}</Text><Text style={s.body}>{say("El aplauso no está separado por bandas y su precisión no está validada. No es directamente comparable con la estimación de medios. Si difieren, repetí la prueba en iguales condiciones o usá una medición de referencia antes de comprar.", "The clap is not frequency-banded and its accuracy is unvalidated. It is not directly comparable to the mid-frequency estimate. If they differ, repeat under the same conditions or use a reference measurement before buying.")}</Text></View> : <Text style={s.small}>{say("No hay prueba de aplauso registrada: estos valores son estimaciones del modelo.", "No clap test is recorded: these values are model estimates.")}</Text>}
      <Text style={s.sub}>{say("Aporte de cada superficie", "Contribution from each surface")}</Text>
      <Text style={s.small}>{say("Unidad: m² de absorción equivalente (sabins). Área de superficie x coeficiente genérico de esa banda. No representa porcentajes medidos.", "Unit: equivalent absorption area in m² (sabins). Surface area x generic coefficient for that band. Not measured percentages.")}</Text>
      <View style={[s.row, s.header]}>{[say("Superficie", "Surface"), "m²", "125 Hz", "1 kHz", "4 kHz"].map(label => <Text key={label} style={s.cell}>{label}</Text>)}</View>
      {rows.map(row => <View key={row.id} style={s.row}>{[row.id === "floor" ? say("Piso", "Floor") : row.id === "walls" ? say("Paredes", "Walls") : say("Techo", "Ceiling"), row.area.toFixed(1), row.low.toFixed(2), row.mid.toFixed(2), row.high.toFixed(2)].map((label, i) => <Text key={i} style={s.cell}>{label}</Text>)}</View>)}
      <View style={s.row}>{[say("Muebles", "Furniture"), "-", furniture.low.toFixed(2), furniture.mid.toFixed(2), furniture.high.toFixed(2)].map((label, i) => <Text key={i} style={s.cell}>{label}</Text>)}</View>
      <Text style={s.small}>{say("Techo duro supuesto; los muebles usan un área efectiva estimada por categoría. Sin datos de ventanas, puertas abiertas ni superficies mixtas exactas.", "Assumed hard ceiling; furniture uses estimated effective area per category. No exact window, open-door or mixed-surface data.")}</Text>
      {project.noiseMeasurement?.taken && <View style={s.accent}><Text style={s.body}>{say("Ruido capturado", "Captured noise")}: {project.noiseMeasurement.dbLevel?.toFixed(0) ?? "-"} / {t.experiments.relative}</Text><Text style={s.small}>{t.experiments.noise}</Text></View>}
      <Footer english={english} />
    </Page>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>{say("Tus pruebas y resultados", "Your experiments and results")}</Text><Text style={s.body}>{t.experiments.protocol}</Text>
      {recordedExperiments.map((item, i) => {
        const record = personalization.experiments?.[item.id]
        return <View key={item.id} style={s.card} wrap={false}><Text style={s.sub}>{i + 1}. {item.title}</Text><Text style={s.body}>{item.action}</Text><Text style={s.small}>{item.why}</Text><Text style={s.body}>{item.check}</Text><Text style={[s.body, { color: c.cyan }]}>{record?.outcome === "unable" ? t.journey.unable : record?.tried ? say("Probada", "Tried") : say("Todavía no registrada como probada", "Not yet recorded as tried")}{record?.tried && record.outcome ? ` / ${outcomes[record.outcome]}` : ""}</Text>{record?.note && <Text style={s.small}>{say("Tu nota", "Your note")}: {record.note}</Text>}</View>
      })}
      <View style={s.accent}><Text style={s.body}>{say("Cómo decidir el siguiente paso", "How to choose the next step")}</Text><Text style={s.body}>{say("Si mejoró, conservá el cambio y comprobalo en otra escucha. Si quedó igual o empeoró, volvé a la distribución anterior y probá una sola alternativa. Si no podés distinguirlo, el resultado es inconcluso.", "If it improved, keep the change and check on another listening session. If unchanged or worse, restore the previous layout and test one alternative. If you cannot distinguish it, the result is inconclusive.")}</Text></View><Text style={s.small}>{say("Estas valoraciones son tuyas y subjetivas; no prueban una mejora medida en RT60 o dB. No se asignaron plazos de compra genéricos.", "These are your subjective ratings, not proof of a measured RT60 or dB improvement. No generic purchase deadlines were assigned.")}</Text><Footer english={english} />
    </Page>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>{say("Compras opcionales: decidir después de probar", "Optional purchases: decide after testing")}</Text>
      <Text style={s.body}>{say("Son opciones del catálogo, no una prescripción validada para tu sala. Las cantidades se obtienen con reglas simples de área y carácter estimado; confirmá cobertura, rendimiento por frecuencia y ubicación antes de comprar.", "These are catalog options, not a validated prescription for your room. Quantities use simple area and estimated-character rules; confirm coverage, frequency performance and placement before buying.")}</Text>
      {[analysis.lowBudgetChanges, analysis.advancedChanges].filter(block => block.items.length).map((block, b) => <View key={b}>
        <Text style={s.sub}>{b === 0 ? say("Opciones de menor inversión", "Lower investment options") : say("Opciones de mayor inversión", "Higher investment options")}</Text>
        <View style={[s.row, s.header]}><Text style={[s.cell, { flex: 3 }]}>{say("Producto / especificación", "Product / specification")}</Text><Text style={[s.cell, { flex: .5 }]}>{say("Cant.", "Qty")}</Text><Text style={s.cell}>{say("Unidad", "Unit")}</Text><Text style={s.cell}>{say("Subtotal", "Subtotal")}</Text></View>
        {block.items.map((product, i) => <View key={i} style={s.row} wrap={false}><View style={{ flex: 3, paddingHorizontal: 3 }}>{product.link ? <Link src={product.link} style={s.link}>{productName(product, english)}</Link> : <Text style={s.cell}>{productName(product, english)}</Text>}</View><Text style={[s.cell, { flex: .5 }]}>{product.quantity}</Text><Text style={s.cell}>{money(product.unitPrice, product.currency)}</Text><Text style={s.cell}>{money(product.unitPrice * product.quantity, product.currency)}</Text></View>)}
        <Text style={[s.body, { marginTop: 6 }]}>{say("Suma de esta lista", "List total")}: {money(budgetTotal(block.items), block.items[0].currency)}</Text>
      </View>)}
      <Text style={s.sub}>{say("Qué puede resolver cada tipo", "What each type can address")}</Text><Text style={s.body}>{say("Absorbentes y textiles: reflexiones en medios/agudos según espesor y montaje. Trampas de graves: pedir datos de absorción en las frecuencias problemáticas; no todo producto de esquina sirve. Difusores: evaluar distancia de uso y banda antes de agregarlos. Aislantes de apoyo: vibración del equipo, no aislamiento de paredes.", "Absorbers and textiles: mid/treble reflections depending on thickness and mounting. Bass traps: request absorption data at the relevant frequencies; not every corner product works. Diffusers: check working distance and band. Isolation pads: equipment vibration, not wall sound isolation.")}</Text>
      <Text style={s.small}>{say("Fuente de precios: importes incluidos en el análisis, con catálogo de referencia. No hay cotización de proveedor confirmada ni fecha de actualización garantizada. Fecha del informe no equivale a fecha del precio. Envío e instalación no incluidos. Los enlaces pueden llevar a una búsqueda, no al producto exacto.", "Price source: values included in the analysis, using the reference catalog. No confirmed supplier quote or guaranteed update date. Report date is not price date. Shipping and installation excluded. Links may lead to a search, not an exact item.")}</Text>
      <Text style={s.small}>{say("Los niveles de inversión son alternativas, no listas que deban sumarse. Antes de elegir, verificá las restricciones y repetí las pruebas relevantes.", "Investment levels are alternatives, not lists to add together. Check restrictions and repeat relevant experiments before choosing.")}</Text><Footer english={english} />
    </Page>
    <Page size="A4" style={s.page}>
      <Text style={s.title}>{say("Apéndice: cálculos y referencias", "Appendix: calculations and references")}</Text>
      <Text style={s.body}>{say("Los modos indican frecuencias de resonancia de una sala rectangular ideal. El modelo no mide su amplitud ni confirma un problema audible. Una frecuencia calculada no basta para elegir un tratamiento.", "Modes indicate resonant frequencies of an ideal rectangular room. The model does not measure their amplitude or confirm an audible problem. A calculated frequency alone cannot select a treatment.")}</Text>
      <View style={[s.row, s.header]}>{[say("Frecuencia", "Frequency"), say("Tipo", "Type"), say("Eje", "Axis")].map(label => <Text key={label} style={s.cell}>{label}</Text>)}</View>
      {[...analysis.roomMetrics.roomModes].sort((a, b) => a.frequency - b.frequency).slice(0, 8).map((mode, i) => <View key={i} style={s.row}><Text style={s.cell}>{mode.frequency.toFixed(1)} Hz</Text><Text style={s.cell}>{mode.type === "axial" ? say("Axial", "Axial") : mode.type === "tangential" ? say("Tangencial", "Tangential") : say("Oblicuo", "Oblique")}</Text><Text style={s.cell}>{mode.dimension === "length" ? say("Largo", "Length") : mode.dimension === "width" ? say("Ancho", "Width") : mode.dimension === "height" ? say("Altura", "Height") : say("Mixto", "Mixed")}</Text></View>)}
      <Text style={s.small}>{say(`Se muestran hasta 8 de ${analysis.roomMetrics.roomModes.length} modos del modelo; no son 8 problemas detectados.`, `Up to 8 of ${analysis.roomMetrics.roomModes.length} model modes are shown; these are not 8 detected problems.`)}</Text>
      <FrequencyIllustration english={english} data={analysis.frequencyResponse} title={say("Ilustración educativa de frecuencia", "Educational frequency illustration")} />
      <Text style={s.small}>{say("Fuente: reglas ilustrativas de RoomTuner. Eje horizontal logarítmico en Hz; vertical en dB del modelo. No es una respuesta medida ni una predicción validada. No usar los picos para ajustar un ecualizador o comprar tratamiento.", "Source: RoomTuner's illustrative rules. Horizontal log-frequency axis in Hz; vertical axis in model dB. Not a measured response or validated prediction. Do not use these peaks for EQ or treatment purchases.")}</Text>
      <Text style={s.sub}>{say("Método y límites", "Method and limits")}</Text><Text style={s.small}>{say("RT60: Sabine/Eyring con áreas y coeficientes genéricos en 125 Hz, 1 kHz y 4 kHz. La referencia verde es un criterio interno compartido con la app, no una certificación. En salas domésticas, RT60 en graves tiene límites por el campo modal. Para comprobar cambios, usar mediciones repetibles y el mismo dispositivo/posición.", "RT60: Sabine/Eyring with surface areas and generic coefficients at 125 Hz, 1 kHz and 4 kHz. The green reference is internal guidance shared with the app, not certification. Domestic-room bass RT60 is limited by modal behaviour. Verify changes using repeatable measurements with the same device/position.")}</Text>
      <Link style={s.link} src="https://www.roomeqwizard.com/help/help_en-GB/html/graph_rt60.html">{say("[1] REW: cálculo de RT60 y límites en salas domésticas", "[1] REW: RT60 calculation and domestic-room limits")}</Link>
      <Link style={s.link} src="https://www.roomeqwizard.com/help/help_en-GB/html/modalsim.html">{say("[2] REW: qué representa una simulación de sala", "[2] REW: interpreting a room simulation")}</Link>
      <Link style={s.link} src="https://www.genelec.com/en/improving-room-acoustics">{say("[3] Genelec: reflexiones y ubicación de parlantes", "[3] Genelec: reflections and speaker placement")}</Link>
      <Text style={s.small}>{say("Estas referencias explican los principios y límites. No validan los coeficientes del catálogo, la curva ilustrativa ni una mejora garantizada en tu sala.", "These references explain principles and limits. They do not validate catalog coefficients, the illustrative curve or a guaranteed improvement in your room.")}</Text><Footer english={english} />
    </Page>
  </Document>
}
