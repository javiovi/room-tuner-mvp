import { z } from "zod"

export const roomProjectSchema = z.object({
  goal: z.enum(["music", "instrument", "work"]).nullable(),
  concern: z.enum(["clarity", "echo", "bass", "noise"]).optional(),
  dimensionSource: z.enum(["measured", "approximate"]).optional(),
  roomSize: z.enum(["small", "medium", "large"]).optional(),
  roomShape: z.enum(["square", "rectangle"]).optional(),
  moveConstraints: z.object({ speakers: z.boolean(), listening: z.boolean(), furniture: z.boolean() }).optional(),
  lengthM: z.number().positive().max(50).optional(),
  widthM: z.number().positive().max(50).optional(),
  heightM: z.number().positive().max(10).optional(),
  floorType: z.enum(["ceramico", "madera", "vinilico", "concreto", "marmol", "alfombra", "goma", "otro"]).optional(),
  wallType: z.enum(["desnudas", "vidrio", "ladrillo", "cuadros", "bibliotecas", "cortinas", "paneles_madera", "mixto"]).optional(),
  speakerPlacement: z.enum(["pared-larga-centrado", "pared-corta-centrado", "esquina", "pared-lateral", "indefinido"]).optional(),
  listeningPosition: z.enum(["centro-sala", "escritorio-pared", "sillon-pared-posterior", "esquina", "variable"]).optional(),
  furniture: z.array(z.string()).max(50).optional(),
  noiseMeasurement: z
    .object({
      taken: z.boolean(),
      level: z.enum(["tranquilo", "normal", "ruidoso"]).optional(),
      dbLevel: z.number().optional(),
      classification: z.enum(["muy_silencioso", "silencioso", "normal", "ruidoso", "muy_ruidoso"]).optional(),
    })
    .optional(),
  measuredRT60: z
    .object({
      value: z.number(),
      method: z.enum(["T20", "T30"]),
      confidence: z.enum(["low", "medium", "high"]),
    })
    .optional(),
})

export const analyzeRoomRequestSchema = roomProjectSchema.extend({
  locale: z.enum(["es", "en"]).optional(),
})

const roomModeSchema = z.object({
  frequency: z.number(),
  type: z.enum(["axial", "tangential", "oblique"]),
  dimension: z.enum(["length", "width", "height", "mixed"]),
  severity: z.enum(["high", "medium", "low"]),
  description: z.string(),
  nx: z.number().optional(),
  ny: z.number().optional(),
  nz: z.number().optional(),
})

const frequencyPointSchema = z.object({
  frequency: z.number(),
  response: z.number(),
  issue: z.boolean(),
  description: z.string().optional(),
})

const productRecommendationSchema = z.object({
  productId: z.string(),
  product: z.string(),
  category: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  currency: z.enum(["USD", "ARS"]),
  supplier: z.string(),
  link: z.string().optional(),
  placement: z.string(),
  impactLevel: z.enum(["high", "medium", "low"]),
  installation: z.enum(["easy", "moderate", "professional"]),
})

const recommendationBlockSchema = z.object({
  title: z.string(),
  items: z.array(z.string()),
})

const productRecommendationBlockSchema = z.object({
  title: z.string(),
  totalEstimatedCost: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.enum(["USD", "ARS"]),
  }),
  items: z.array(productRecommendationSchema),
})

export const roomDiagramSchema = z.object({
  floorPlan: z.object({
    width: z.number(),
    length: z.number(),
    speakerPositions: z.array(z.object({ x: z.number(), y: z.number() })),
    listeningPosition: z.object({ x: z.number(), y: z.number() }),
    furnitureLayout: z.array(
      z.object({
        type: z.string(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        length: z.number(),
      })
    ),
  }),
  treatmentPlan: z.array(
    z.object({
      type: z.enum(["absorber", "diffuser", "bass_trap"]),
      position: z.object({ x: z.number(), y: z.number() }),
      wall: z.enum(["front", "back", "left", "right", "ceiling"]),
      priority: z.enum(["high", "medium", "low"]),
    })
  ),
})

export const enhancedAnalysisSchema = z.object({
  inputContext: roomProjectSchema.optional(),
  summary: z.string(),
  roomCharacter: z.enum(["viva", "equilibrada", "seca"]),
  priorityScore: z.object({
    critical: z.number(),
    improvements: z.number(),
    optimizations: z.number(),
  }),
  roomMetrics: z.object({
    volume: z.number(),
    surfaceArea: z.number(),
    floorArea: z.number(),
    wallArea: z.number(),
    ceilingArea: z.number(),
    ratios: z.object({
      lengthWidth: z.number(),
      lengthHeight: z.number(),
      widthHeight: z.number(),
      rating: z.enum(["good", "acceptable", "poor"]),
      message: z.string(),
    }),
    roomModes: z.array(roomModeSchema),
    rt60Estimate: z.object({ low: z.number(), mid: z.number(), high: z.number() }),
    rt60Evaluation: z.object({
      rating: z.enum(["good", "acceptable", "problematic"]),
      message: z.string(),
    }),
    rt60Method: z.enum(["sabine", "eyring"]).optional(),
    measuredRT60: z.object({ value: z.number(), confidence: z.enum(["low", "medium", "high"]) }).optional(),
    totalAbsorption: z.number(),
  }),
  materialsAnalysis: z.object({
    floorAbsorption: z.number(),
    wallAbsorption: z.number(),
    ceilingAbsorption: z.number(),
    furnitureContribution: z.number(),
    totalAbsorption: z.number(),
  }),
  frequencyResponse: z.array(frequencyPointSchema),
  freeChanges: recommendationBlockSchema,
  lowBudgetChanges: productRecommendationBlockSchema,
  advancedChanges: productRecommendationBlockSchema,
  roomDiagram: roomDiagramSchema,
  generatedAt: z.string(),
})

export const reportPersonalizationSchema = z.object({
  layout: z.object({
    current: roomDiagramSchema.shape.floorPlan,
    proposal: roomDiagramSchema.shape.floorPlan,
    moves: z.object({ speakers: z.boolean(), listening: z.boolean(), furniture: z.boolean() }),
    view: z.enum(["current", "proposal"]),
    source: z.enum(["user", "schematic"]),
  }).optional(),
  experiments: z.record(z.enum(["symmetry", "quiet", "position", "dry", "echo"]), z.object({
    tried: z.boolean(), outcome: z.enum(["better", "same", "worse"]).optional(), note: z.string().max(500),
  })).optional(),
})

export const generatePdfRequestSchema = z.object({
  personalization: reportPersonalizationSchema.optional(),
  project: roomProjectSchema,
  analysis: enhancedAnalysisSchema,
  locale: z.enum(["es", "en"]).optional(),
})

export const searchProductsQuerySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(20).default(5),
})
