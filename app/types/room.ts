// app/types/room.ts

export type RoomGoal = "music" | "instrument" | "work"

export interface RoomProject {
  goal: RoomGoal | null

  // Dimensiones
  lengthM?: number
  widthM?: number
  heightM?: number

  // Materiales
  floorType?: "ceramico" | "madera" | "vinilico" | "concreto" | "marmol" | "alfombra" | "goma" | "otro"
  wallType?: "desnudas" | "vidrio" | "ladrillo" | "cuadros" | "bibliotecas" | "cortinas" | "paneles_madera" | "mixto"

  // Disposición
  speakerPlacement?: "pared-larga-centrado" | "pared-corta-centrado" | "esquina" | "pared-lateral" | "indefinido"
  listeningPosition?: "centro-sala" | "escritorio-pared" | "sillon-pared-posterior" | "esquina" | "variable"

  // Muebles
  furniture?: string[] // ej: ["sofa", "escritorio"]

  // Ruido
  noiseMeasurement?: {
    taken: boolean
    level?: "tranquilo" | "normal" | "ruidoso"
    dbLevel?: number
    classification?: "muy_silencioso" | "silencioso" | "normal" | "ruidoso" | "muy_ruidoso"
  }

  // Medición RT60 (test de aplauso)
  measuredRT60?: {
    value: number // seconds
    method: "T20" | "T30"
    confidence: "low" | "medium" | "high"
  }
}

// ===== ENHANCED ANALYSIS TYPES =====

export interface RoomMode {
  frequency: number // Hz
  type: "axial" | "tangential" | "oblique"
  dimension: "length" | "width" | "height" | "mixed"
  severity: "high" | "medium" | "low"
  description: string
  nx?: number // mode number along length
  ny?: number // mode number along width
  nz?: number // mode number along height
}

export interface RoomMetrics {
  volume: number // m³
  surfaceArea: number // m²
  floorArea: number // m²
  wallArea: number // m²
  ceilingArea: number // m²
  ratios: {
    lengthWidth: number
    lengthHeight: number
    widthHeight: number
    rating: "good" | "acceptable" | "poor"
    message: string
  }
}

export interface MaterialsAnalysis {
  floorAbsorption: number // coefficient
  wallAbsorption: number
  ceilingAbsorption: number
  furnitureContribution: number
  totalAbsorption: number // sabins
}

export interface FrequencyPoint {
  frequency: number // Hz
  response: number // dB (relative)
  issue: boolean
  description?: string
}

export interface ProductRecommendation {
  productId: string
  product: string // Product name
  category: string // 'Absorbers', 'Bass Traps', etc.
  quantity: number
  unitPrice: number
  totalPrice: number
  currency: "USD" | "ARS"
  supplier: string // 'Amazon', 'Local', etc.
  link?: string // Purchase link
  placement: string // Where to install
  impactLevel: "high" | "medium" | "low"
  installation: "easy" | "moderate" | "professional"
}

export interface RecommendationBlock {
  title: string
  items: string[]
}

export interface ProductRecommendationBlock {
  title: string
  totalEstimatedCost: {
    min: number
    max: number
    currency: "USD" | "ARS"
  }
  items: ProductRecommendation[]
}

export interface RoomDiagram {
  floorPlan: {
    width: number
    length: number
    speakerPositions: Array<{ x: number; y: number }> // Normalized 0-1
    listeningPosition: { x: number; y: number } // Normalized 0-1
    furnitureLayout: Array<{
      type: string
      x: number
      y: number
      width: number
      length: number
    }>
  }
  treatmentPlan: Array<{
    type: "absorber" | "diffuser" | "bass_trap"
    position: { x: number; y: number }
    wall: "front" | "back" | "left" | "right" | "ceiling"
    priority: "high" | "medium" | "low"
  }>
}

export interface EnhancedAnalysisResponse {
  // Executive Summary
  summary: string
  roomCharacter: "viva" | "equilibrada" | "seca"
  priorityScore: {
    critical: number
    improvements: number
    optimizations: number
  }

  // Room Analysis
  roomMetrics: {
    volume: number // m³
    surfaceArea: number // m²
    floorArea: number // m²
    wallArea: number // m²
    ceilingArea: number // m²
    ratios: {
      lengthWidth: number
      lengthHeight: number
      widthHeight: number
      rating: "good" | "acceptable" | "poor"
      message: string
    }
    roomModes: RoomMode[]
    rt60Estimate: {
      low: number // seconds (63-250 Hz)
      mid: number // seconds (500-2k Hz)
      high: number // seconds (4k-16k Hz)
    }
    rt60Evaluation: {
      rating: "good" | "acceptable" | "problematic"
      message: string
    }
    rt60Method?: "sabine" | "eyring"
    measuredRT60?: {
      value: number
      confidence: "low" | "medium" | "high"
    }
    totalAbsorption: number // sabins
  }

  // Materials Analysis
  materialsAnalysis: {
    floorAbsorption: number // coefficient
    wallAbsorption: number
    ceilingAbsorption: number
    furnitureContribution: number
    totalAbsorption: number // sabins
  }

  // Frequency Response
  frequencyResponse: FrequencyPoint[]

  // Recommendations
  freeChanges: RecommendationBlock
  lowBudgetChanges: ProductRecommendationBlock
  advancedChanges: ProductRecommendationBlock

  // Diagrams
  roomDiagram: RoomDiagram

  // Generated at
  generatedAt: string
}
