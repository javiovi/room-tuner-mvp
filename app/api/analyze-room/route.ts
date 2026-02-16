import { NextResponse } from "next/server"
import type { RoomProject, EnhancedAnalysisResponse, ProductRecommendation } from "@/app/types/room"
import {
  calculateRoomModes,
  calculateRoomMetrics,
  calculateTotalAbsorption,
  estimateRT60SmartByBand,
  evaluateRT60,
  determineRoomCharacter,
  estimateFrequencyResponse,
  calculateOptimalPositions,
} from "@/lib/acousticsCalculations"
import {
  generateProductRecommendations,
  getProductById,
  calculateTreatmentCost,
} from "@/lib/acousticProducts"
import { enrichProductsWithRealPrices } from "@/lib/productPricing"
import { createServerClient } from "@/lib/supabase/client"

const N8N_URL = process.env.N8N_WEBHOOK_URL

/**
 * Analyze room and generate comprehensive report
 * Now saves project and analysis to Supabase
 */
export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const project = (await req.json()) as RoomProject
    const supabase = createServerClient()

    // Validate required fields
    if (!project.lengthM || !project.widthM || !project.heightM) {
      return NextResponse.json(
        { error: "Missing room dimensions" },
        { status: 400 }
      )
    }

    // For MVP without auth, user_id is null
    // TODO: Replace with actual auth.uid() when auth is implemented

    // Save or update project in Supabase
    const { data: savedProject, error: projectError } = await supabase
      .from('projects')
      .upsert({
        user_id: null,
        name: 'Mi Espacio',
        goal: project.goal,
        length_m: project.lengthM,
        width_m: project.widthM,
        height_m: project.heightM,
        floor_type: project.floorType,
        wall_type: project.wallType,
        speaker_placement: project.speakerPlacement,
        listening_position: project.listeningPosition,
        furniture: project.furniture || [],
        noise_measurement: project.noiseMeasurement,
        status: 'analyzing',
      })
      .select()
      .single()

    if (projectError) {
      console.error('Error saving project:', projectError)
      // Continue with analysis even if save fails
    }

    // If N8N webhook is configured, try to use it (for future AI enhancements)
    let analysis: EnhancedAnalysisResponse

    if (N8N_URL) {
      try {
        const n8nRes = await fetch(N8N_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...project,
            projectId: savedProject?.id,
            locale: "es-AR",
            source: "web-mvp",
            version: "0.2.0",
          }),
          signal: AbortSignal.timeout(5000), // 5 second timeout
        })

        if (n8nRes.ok) {
          const data = await n8nRes.json()
          // If N8N returns enhanced analysis, use it
          if (data.roomMetrics) {
            analysis = data
          } else {
            analysis = await generateLocalAnalysis(project)
          }
        } else {
          analysis = await generateLocalAnalysis(project)
        }
      } catch (n8nError) {
        console.warn("N8N webhook failed, using local analysis:", n8nError)
        analysis = await generateLocalAnalysis(project)
      }
    } else {
      // Generate comprehensive analysis locally
      analysis = await generateLocalAnalysis(project)
    }

    const calculationTime = Date.now() - startTime

    // Save analysis to Supabase
    if (savedProject?.id) {
      const { error: analysisError } = await supabase
        .from('analyses')
        .upsert({
          project_id: savedProject.id,
          summary: analysis.summary,
          room_character: analysis.roomCharacter,
          priority_score: analysis.priorityScore,
          room_metrics: analysis.roomMetrics,
          frequency_response: analysis.frequencyResponse,
          recommendations: {
            freeChanges: analysis.freeChanges,
            lowBudgetChanges: analysis.lowBudgetChanges,
            advancedChanges: analysis.advancedChanges,
          },
          room_diagram: analysis.roomDiagram,
          version: '1.0',
          calculation_time_ms: calculationTime,
        })

      if (analysisError) {
        console.error('Error saving analysis:', analysisError)
        // Return analysis anyway
      }

      // Update project status to completed
      await supabase
        .from('projects')
        .update({ status: 'completed' })
        .eq('id', savedProject.id)

      // Add projectId to response
      return NextResponse.json({
        ...analysis,
        projectId: savedProject.id,
        generatedAt: new Date().toISOString(),
      })
    }

    // If save failed, return analysis without projectId
    return NextResponse.json({
      ...analysis,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error analyzing room:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Generate comprehensive analysis using local calculations
 */
async function generateLocalAnalysis(project: RoomProject): Promise<EnhancedAnalysisResponse> {
  const { lengthM = 0, widthM = 0, heightM = 0, goal } = project

  // === STEP 1: Calculate room metrics ===
  const metrics = calculateRoomMetrics(lengthM, widthM, heightM)

  // === STEP 2: Calculate room modes ===
  const roomModes = calculateRoomModes(lengthM, widthM, heightM)

  // === STEP 3: Calculate absorption ===
  const absorption = calculateTotalAbsorption(project)

  // === STEP 4: Estimate RT60 (Sabine or Eyring based on absorption level) ===
  const rt60Result = estimateRT60SmartByBand(metrics.volume, absorption, metrics.surfaceArea)
  const rt60 = { low: rt60Result.low, mid: rt60Result.mid, high: rt60Result.high }
  const rt60Method = rt60Result.method
  const rt60Eval = evaluateRT60(rt60.mid, goal || "music")

  // === STEP 5: Determine room character ===
  const roomCharacter = determineRoomCharacter(
    rt60.mid,
    absorption.average,
    metrics.surfaceArea
  )

  // === STEP 6: Generate frequency response estimate ===
  const frequencyResponse = estimateFrequencyResponse(
    roomModes,
    roomCharacter,
    metrics.volume
  )

  // === STEP 7: Calculate optimal speaker positions ===
  const positions = calculateOptimalPositions(
    lengthM,
    widthM,
    project.equipmentPosition || "indefinido"
  )

  // === STEP 8: Generate recommendations ===

  // Free recommendations
  const freeRecommendations = generateFreeRecommendations(project, roomCharacter, positions)

  // Low budget recommendations
  const lowBudgetRecs = generateProductRecommendations(
    metrics.floorArea,
    metrics.volume,
    roomCharacter,
    "low"
  )

  // Enrich some products with real ML prices (limit to 4 to keep analysis fast)
  const productsToEnrich = lowBudgetRecs
    .slice(0, 4)
    .map(r => getProductById(r.productId))
    .filter(Boolean) as any[]

  const enrichedProducts = await enrichProductsWithRealPrices(productsToEnrich, {
    useServer: true,
    batchSize: 2,
    delay: 300
  }).catch(err => {
    console.warn('[Analysis] Failed to enrich products with real prices:', err)
    return productsToEnrich // Fallback to database prices
  })

  const lowBudgetProducts = convertToProductRecommendations(lowBudgetRecs, "ARS", enrichedProducts)
  const lowBudgetCost = calculateTreatmentCost(
    lowBudgetRecs.map((r) => ({ id: r.productId, quantity: r.quantity })),
    "ARS"
  )

  // Advanced recommendations
  const advancedRecs = generateProductRecommendations(
    metrics.floorArea,
    metrics.volume,
    roomCharacter,
    "advanced"
  )
  const advancedProducts = convertToProductRecommendations(advancedRecs, "USD")
  const advancedCost = calculateTreatmentCost(
    advancedRecs.map((r) => ({ id: r.productId, quantity: r.quantity })),
    "USD"
  )

  // === STEP 9: Generate summary ===
  const summary = generateSummary(project, roomCharacter, metrics, rt60, roomModes)

  // === STEP 10: Create room diagram data ===
  const roomDiagram = {
    floorPlan: {
      width: widthM,
      length: lengthM,
      speakerPositions: positions.speakers,
      listeningPosition: positions.listeningPosition,
      furnitureLayout: generateFurnitureLayout(project.furniture || [], widthM, lengthM),
    },
    treatmentPlan: generateTreatmentPlan(roomCharacter, lowBudgetRecs, advancedRecs),
  }

  // === STEP 11: Count priorities ===
  const priorityScore = calculatePriorityScore(roomCharacter, rt60Eval, roomModes)

  // === STEP 12: Assemble final response ===
  const response: EnhancedAnalysisResponse = {
    summary,
    roomCharacter,
    priorityScore,

    roomMetrics: {
      ...metrics,
      roomModes,
      rt60Estimate: rt60,
      rt60Evaluation: rt60Eval,
      rt60Method,
      measuredRT60: project.measuredRT60 ? {
        value: project.measuredRT60.value,
        confidence: project.measuredRT60.confidence,
      } : undefined,
      totalAbsorption: absorption.average,
    },

    materialsAnalysis: {
      floorAbsorption: absorption.low / metrics.floorArea,
      wallAbsorption: absorption.mid / metrics.wallArea,
      ceilingAbsorption: 0.02, // Assumed hard ceiling
      furnitureContribution: (project.furniture?.length || 0) * 0.3,
      totalAbsorption: absorption.average,
    },

    frequencyResponse,

    freeChanges: {
      title: "Cambios sin gastar dinero",
      items: freeRecommendations,
    },

    lowBudgetChanges: {
      title: "Mejoras con bajo presupuesto (ARS $50k-150k)",
      totalEstimatedCost: {
        min: Math.round(lowBudgetCost * 0.7),
        max: Math.round(lowBudgetCost * 1.2),
        currency: "ARS",
      },
      items: lowBudgetProducts,
    },

    advancedChanges: {
      title: "Soluciones avanzadas (USD $500-2000)",
      totalEstimatedCost: {
        min: Math.round(advancedCost * 0.8),
        max: Math.round(advancedCost * 1.3),
        currency: "USD",
      },
      items: advancedProducts,
    },

    roomDiagram,

    generatedAt: new Date().toISOString(),
  }

  return response
}

// ===== HELPER FUNCTIONS =====

/**
 * Generate free (no cost) recommendations
 */
function generateFreeRecommendations(
  project: RoomProject,
  roomCharacter: "viva" | "equilibrada" | "seca",
  positions: ReturnType<typeof calculateOptimalPositions>
): string[] {
  const recommendations: string[] = []

  // Speaker placement
  recommendations.push(...positions.recommendations)

  // Listening position advice
  recommendations.push(
    "Evitar punto de escucha exactamente en el centro del espacio (50% de profundidad)"
  )

  // Room character specific
  if (roomCharacter === "viva") {
    recommendations.push(
      "Agregar mantas gruesas en las paredes para absorción temporal"
    )
    recommendations.push(
      "Colocar almohadones en las esquinas para reducir acumulación de graves"
    )
    recommendations.push("Abrir puertas de placares para añadir absorción difusa")
  } else if (roomCharacter === "seca") {
    recommendations.push(
      "Remover exceso de materiales absorbentes si el espacio suena muy apagado"
    )
    recommendations.push(
      "Mantener superficies duras y lisas para preservar brillo natural"
    )
  } else {
    recommendations.push(
      "El espacio tiene buen balance, enfocarse en optimizar posiciones"
    )
  }

  // Furniture recommendations
  if (!project.furniture || project.furniture.length === 0) {
    recommendations.push(
      "Agregar muebles como biblioteca o sofá para romper reflexiones paralelas"
    )
  }

  // General tips
  recommendations.push(
    "Despejar espacio entre parlantes y paredes (mínimo 30cm)"
  )
  recommendations.push(
    "Experimentar con pequeños cambios de posición antes de comprar tratamiento"
  )

  return recommendations
}

/**
 * Convert product recommendations to full product objects
 * Optionally use enriched products with real ML prices
 */
function convertToProductRecommendations(
  recommendations: ReturnType<typeof generateProductRecommendations>,
  currency: "USD" | "ARS",
  enrichedProducts?: any[]
): ProductRecommendation[] {
  return recommendations.map((rec) => {
    // Try to find enriched product first
    const enriched = enrichedProducts?.find(p => p.id === rec.productId)
    const product = enriched || getProductById(rec.productId)

    if (!product) {
      throw new Error(`Product not found: ${rec.productId}`)
    }

    // Use real price if available from ML, otherwise use database price
    const unitPrice = currency === "USD" ? product.priceUSD : product.priceARS
    const totalPrice = unitPrice * rec.quantity

    return {
      productId: rec.productId,
      product: product.name,
      category: product.category,
      quantity: rec.quantity,
      unitPrice,
      totalPrice,
      currency,
      supplier: product.supplier,
      link: product.link,
      placement: rec.placement,
      impactLevel: rec.priority,
      installation: product.installation,
    }
  })
}

/**
 * Generate executive summary
 */
function generateSummary(
  project: RoomProject,
  roomCharacter: "viva" | "equilibrada" | "seca",
  metrics: ReturnType<typeof calculateRoomMetrics>,
  rt60: { low: number; mid: number; high: number },
  roomModes: ReturnType<typeof calculateRoomModes>
): string {
  const goal =
    project.goal === "music"
      ? "escuchar música"
      : project.goal === "instrument"
        ? "tocar instrumento"
        : "trabajar y concentrarse"

  const characterDesc = {
    viva: "viva (reverberante)",
    equilibrada: "equilibrada",
    seca: "seca (muy absorbente)",
  }[roomCharacter]

  const problematicModes = roomModes.filter(
    (m) => m.frequency < 200 && m.severity === "high"
  )

  let summary = `Análisis para espacio de ${metrics.volume.toFixed(1)}m³ optimizada para ${goal}. `
  summary += `El espacio tiene carácter acústico ${characterDesc} con RT60 promedio de ${rt60.mid.toFixed(2)}s. `

  if (roomCharacter === "viva") {
    summary += `Se recomienda agregar absorción para controlar reverberación excesiva. `
  } else if (roomCharacter === "seca") {
    summary += `El espacio es muy absorbente, considerar agregar difusión para recuperar vitalidad. `
  } else {
    summary += `El balance acústico es bueno, enfocarse en tratamiento de puntos específicos. `
  }

  if (problematicModes.length > 0) {
    summary += `Se detectaron ${problematicModes.length} modos problemáticos en graves (${problematicModes
      .slice(0, 3)
      .map((m) => `${m.frequency.toFixed(0)}Hz`)
      .join(", ")}), requieren trampas de graves en esquinas.`
  }

  return summary
}

/**
 * Generate furniture layout for diagram
 */
function generateFurnitureLayout(
  furniture: string[],
  width: number,
  length: number
): Array<{
  type: string
  x: number
  y: number
  width: number
  length: number
}> {
  const layout: Array<{
    type: string
    x: number
    y: number
    width: number
    length: number
  }> = []

  furniture.forEach((item, index) => {
    // Simple placement algorithm - spread furniture around the room
    const angle = (index / furniture.length) * Math.PI * 2
    const radiusX = width * 0.3
    const radiusY = length * 0.3

    layout.push({
      type: item,
      x: 0.5 + Math.cos(angle) * (radiusX / width),
      y: 0.5 + Math.sin(angle) * (radiusY / length),
      width: 0.15, // Normalized size
      length: 0.15,
    })
  })

  return layout
}

/**
 * Generate treatment plan for diagram
 */
function generateTreatmentPlan(
  roomCharacter: "viva" | "equilibrada" | "seca",
  lowBudget: ReturnType<typeof generateProductRecommendations>,
  advanced: ReturnType<typeof generateProductRecommendations>
): Array<{
  type: "absorber" | "diffuser" | "bass_trap"
  position: { x: number; y: number }
  wall: "front" | "back" | "left" | "right" | "ceiling"
  priority: "high" | "medium" | "low"
}> {
  const plan: Array<{
    type: "absorber" | "diffuser" | "bass_trap"
    position: { x: number; y: number }
    wall: "front" | "back" | "left" | "right" | "ceiling"
    priority: "high" | "medium" | "low"
  }> = []

  // Always recommend corner bass traps
  plan.push(
    { type: "bass_trap", position: { x: 0, y: 0 }, wall: "front", priority: "high" },
    { type: "bass_trap", position: { x: 1, y: 0 }, wall: "front", priority: "high" },
    { type: "bass_trap", position: { x: 0, y: 1 }, wall: "back", priority: "high" },
    { type: "bass_trap", position: { x: 1, y: 1 }, wall: "back", priority: "high" }
  )

  // First reflection points (side walls)
  plan.push(
    { type: "absorber", position: { x: 0, y: 0.3 }, wall: "left", priority: "high" },
    { type: "absorber", position: { x: 1, y: 0.3 }, wall: "right", priority: "high" }
  )

  // Rear diffusion (if not too dead)
  if (roomCharacter !== "seca") {
    plan.push(
      { type: "diffuser", position: { x: 0.5, y: 1 }, wall: "back", priority: "medium" }
    )
  }

  return plan
}

/**
 * Calculate priority scores
 */
function calculatePriorityScore(
  roomCharacter: "viva" | "equilibrada" | "seca",
  rt60Eval: { rating: "good" | "acceptable" | "problematic" },
  roomModes: ReturnType<typeof calculateRoomModes>
): {
  critical: number
  improvements: number
  optimizations: number
} {
  let critical = 0
  let improvements = 0
  let optimizations = 0

  // RT60 issues
  if (rt60Eval.rating === "problematic") {
    critical += 1
  } else if (rt60Eval.rating === "acceptable") {
    improvements += 1
  }

  // Room modes
  const problematicModes = roomModes.filter(
    (m) => m.frequency < 200 && m.severity === "high"
  )
  critical += Math.min(problematicModes.length, 3)

  // Room character
  if (roomCharacter === "viva") {
    improvements += 2 // Needs absorption
  } else if (roomCharacter === "seca") {
    improvements += 1 // Might need diffusion
  } else {
    optimizations += 3 // Just fine-tuning
  }

  // Always some optimizations possible
  optimizations += 2

  return { critical, improvements, optimizations }
}
