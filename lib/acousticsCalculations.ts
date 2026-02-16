// Room Acoustics Calculations
// Based on established acoustic physics formulas

import type { RoomProject } from "@/app/types/room"

// Speed of sound in air at 20°C (m/s)
const SPEED_OF_SOUND = 343

// ===== ROOM MODES =====

export interface RoomMode {
  frequency: number
  type: 'axial' | 'tangential' | 'oblique'
  dimension: 'length' | 'width' | 'height' | 'mixed'
  severity: 'high' | 'medium' | 'low'
  description: string
}

/**
 * Calculate axial room modes (most significant)
 * Formula: f = (n * c) / (2 * L)
 * where n = mode number, c = speed of sound, L = dimension
 */
export function calculateRoomModes(
  length: number,
  width: number,
  height: number
): RoomMode[] {
  const modes: RoomMode[] = []

  // Calculate first 5 modes for each dimension (axial modes)
  for (let n = 1; n <= 5; n++) {
    // Length modes
    const lengthFreq = (n * SPEED_OF_SOUND) / (2 * length)
    modes.push({
      frequency: Math.round(lengthFreq * 10) / 10,
      type: 'axial',
      dimension: 'length',
      severity: n === 1 ? 'high' : n <= 3 ? 'medium' : 'low',
      description: `${n}° modo longitudinal (${length}m)`
    })

    // Width modes
    const widthFreq = (n * SPEED_OF_SOUND) / (2 * width)
    modes.push({
      frequency: Math.round(widthFreq * 10) / 10,
      type: 'axial',
      dimension: 'width',
      severity: n === 1 ? 'high' : n <= 3 ? 'medium' : 'low',
      description: `${n}° modo transversal (${width}m)`
    })

    // Height modes
    const heightFreq = (n * SPEED_OF_SOUND) / (2 * height)
    modes.push({
      frequency: Math.round(heightFreq * 10) / 10,
      type: 'axial',
      dimension: 'height',
      severity: n === 1 ? 'high' : n <= 3 ? 'medium' : 'low',
      description: `${n}° modo vertical (${height}m)`
    })
  }

  // Sort by frequency and remove duplicates within 5Hz
  return modes
    .sort((a, b) => a.frequency - b.frequency)
    .filter((mode, index, arr) => {
      if (index === 0) return true
      return Math.abs(mode.frequency - arr[index - 1].frequency) > 5
    })
}

/**
 * Identify problematic room modes (below 300Hz, high severity)
 */
export function getProblematicModes(modes: RoomMode[]): RoomMode[] {
  return modes.filter(
    (mode) => mode.frequency < 300 && mode.severity === 'high'
  )
}

// ===== RT60 ESTIMATION =====

/**
 * Estimate RT60 using Sabine equation
 * RT60 = 0.161 * V / A
 * where V = volume (m³), A = total absorption (sabins)
 */
export function estimateRT60(
  volume: number,
  totalAbsorption: number
): number {
  if (totalAbsorption === 0) return 10 // Very reflective room
  const rt60 = (0.161 * volume) / totalAbsorption
  return Math.round(rt60 * 100) / 100
}

/**
 * Calculate RT60 for different frequency bands
 */
export function estimateRT60ByBand(
  volume: number,
  absorption: { low: number; mid: number; high: number }
): {
  low: number // 63-250 Hz
  mid: number // 500-2k Hz
  high: number // 4k-16k Hz
} {
  return {
    low: estimateRT60(volume, absorption.low),
    mid: estimateRT60(volume, absorption.mid),
    high: estimateRT60(volume, absorption.high),
  }
}

/**
 * Determine if RT60 is appropriate for room purpose
 */
export function evaluateRT60(
  rt60: number,
  purpose: 'music' | 'instrument' | 'work'
): {
  rating: 'good' | 'acceptable' | 'problematic'
  message: string
} {
  const idealRanges = {
    music: { min: 0.3, max: 0.5 },
    instrument: { min: 0.4, max: 0.7 },
    work: { min: 0.2, max: 0.4 },
  }

  const range = idealRanges[purpose]

  if (rt60 >= range.min && rt60 <= range.max) {
    return {
      rating: 'good',
      message: `RT60 ideal para ${purpose === 'music' ? 'escuchar música' : purpose === 'instrument' ? 'tocar instrumento' : 'trabajar'}`,
    }
  } else if (rt60 < range.min) {
    return {
      rating: 'problematic',
      message: 'Espacio demasiado seco, falta reverberación natural',
    }
  } else if (rt60 < range.max * 1.5) {
    return {
      rating: 'acceptable',
      message: 'RT60 ligeramente alto, considerar agregar absorción',
    }
  } else {
    return {
      rating: 'problematic',
      message: 'Espacio demasiado vivo, exceso de reverberación',
    }
  }
}

// ===== MATERIAL ABSORPTION COEFFICIENTS =====

export const absorptionCoefficients = {
  floor: {
    // Duros (más reflexivos)
    ceramico: { low: 0.01, mid: 0.01, high: 0.02 },
    madera: { low: 0.15, mid: 0.10, high: 0.10 },
    vinilico: { low: 0.03, mid: 0.03, high: 0.04 }, // Similar a madera pero más reflexivo
    concreto: { low: 0.01, mid: 0.01, high: 0.02 }, // Muy reflexivo
    marmol: { low: 0.01, mid: 0.01, high: 0.01 }, // Extremadamente reflexivo
    // Blandos (más absorbentes)
    alfombra: { low: 0.10, mid: 0.40, high: 0.60 },
    goma: { low: 0.05, mid: 0.15, high: 0.30 }, // Caucho - absorbe medios/altos
    // Otros
    otro: { low: 0.05, mid: 0.05, high: 0.05 },
  },
  wall: {
    // Duras (más reflexivas)
    desnudas: { low: 0.02, mid: 0.02, high: 0.03 },
    vidrio: { low: 0.03, mid: 0.02, high: 0.02 }, // Ventanas - muy reflexivo
    ladrillo: { low: 0.03, mid: 0.03, high: 0.04 }, // Similar a desnudas
    // Con elementos
    cuadros: { low: 0.05, mid: 0.10, high: 0.15 },
    bibliotecas: { low: 0.10, mid: 0.25, high: 0.40 }, // Libros absorben bien
    cortinas: { low: 0.05, mid: 0.25, high: 0.45 }, // Tela gruesa - buena absorción
    paneles_madera: { low: 0.15, mid: 0.20, high: 0.15 }, // Absorción moderada
    // Mixto
    mixto: { low: 0.06, mid: 0.15, high: 0.20 },
  },
  furniture: {
    // Asientos
    sofa: { low: 0.25, mid: 0.35, high: 0.40 },
    silla: { low: 0.05, mid: 0.15, high: 0.20 },
    puff: { low: 0.20, mid: 0.30, high: 0.35 }, // Similar a sofá pero menor
    // Almacenamiento
    estanteria: { low: 0.10, mid: 0.20, high: 0.30 },
    armario: { low: 0.08, mid: 0.12, high: 0.15 }, // Madera sólida
    cajonera: { low: 0.06, mid: 0.10, high: 0.12 }, // Similar a armario
    // Trabajo/Estudio
    escritorio: { low: 0.05, mid: 0.10, high: 0.10 },
    mesa: { low: 0.03, mid: 0.08, high: 0.10 },
    rack: { low: 0.05, mid: 0.12, high: 0.18 }, // Equipos + madera
    // Otros
    cama: { low: 0.30, mid: 0.40, high: 0.45 }, // Colchón + ropa - muy absorbente
    plantas: { low: 0.05, mid: 0.10, high: 0.15 }, // Hojas absorben altos
    instrumentos: { low: 0.10, mid: 0.15, high: 0.20 }, // Madera + formas irregulares
    alfombra: { low: 0.15, mid: 0.40, high: 0.60 }, // Alfombra como mueble/decoración
  },
}

// ===== ABSORPTION CALCULATIONS =====

/**
 * Calculate total absorption in sabins
 * Sabin = Area (m²) × Absorption Coefficient
 */
export function calculateTotalAbsorption(project: RoomProject): {
  low: number
  mid: number
  high: number
  average: number
} {
  const {
    lengthM = 0,
    widthM = 0,
    heightM = 0,
    floorType,
    wallType,
    furniture = [],
  } = project

  // Calculate surface areas
  const floorArea = lengthM * widthM
  const wallArea = 2 * (lengthM * heightM + widthM * heightM)
  const ceilingArea = floorArea

  // Get absorption coefficients
  const floorCoeff = absorptionCoefficients.floor[floorType || 'otro']
  const wallCoeff = absorptionCoefficients.wall[wallType || 'desnudas']
  const ceilingCoeff = { low: 0.02, mid: 0.02, high: 0.03 } // Assume hard ceiling

  // Calculate base absorption from surfaces
  let absorption = {
    low: floorArea * floorCoeff.low + wallArea * wallCoeff.low + ceilingArea * ceilingCoeff.low,
    mid: floorArea * floorCoeff.mid + wallArea * wallCoeff.mid + ceilingArea * ceilingCoeff.mid,
    high: floorArea * floorCoeff.high + wallArea * wallCoeff.high + ceilingArea * ceilingCoeff.high,
  }

  // Add furniture contribution (assume ~1m² effective area per item)
  furniture.forEach((item) => {
    const furnitureKey = item as keyof typeof absorptionCoefficients.furniture
    const furnitureCoeff = absorptionCoefficients.furniture[furnitureKey]
    if (furnitureCoeff) {
      absorption.low += furnitureCoeff.low
      absorption.mid += furnitureCoeff.mid
      absorption.high += furnitureCoeff.high
    }
  })

  const average = (absorption.low + absorption.mid + absorption.high) / 3

  return {
    ...absorption,
    average: Math.round(average * 100) / 100,
  }
}

// ===== ROOM RATIOS =====

/**
 * Calculate room dimension ratios
 * Good ratios help avoid coincident room modes
 */
export function calculateRoomRatios(
  length: number,
  width: number,
  height: number
): {
  lengthWidth: number
  lengthHeight: number
  widthHeight: number
  rating: 'good' | 'acceptable' | 'poor'
  message: string
} {
  const lengthWidth = Math.round((length / width) * 100) / 100
  const lengthHeight = Math.round((length / height) * 100) / 100
  const widthHeight = Math.round((width / height) * 100) / 100

  // Ideal room ratios (Bolt's criteria and others)
  // Avoid 1:1:1 (cube), 1:2:3, 1:2:4, and other simple integer ratios
  const isGoodRatio = (ratio: number) => {
    // Avoid ratios very close to integers
    const nearestInt = Math.round(ratio)
    const distanceFromInt = Math.abs(ratio - nearestInt)
    return distanceFromInt > 0.15
  }

  const goodRatios = [
    isGoodRatio(lengthWidth),
    isGoodRatio(lengthHeight),
    isGoodRatio(widthHeight),
  ]
  const goodCount = goodRatios.filter(Boolean).length

  let rating: 'good' | 'acceptable' | 'poor'
  let message: string

  if (goodCount === 3) {
    rating = 'good'
    message = 'Proporciones favorables, bajo riesgo de modos coincidentes'
  } else if (goodCount >= 2) {
    rating = 'acceptable'
    message = 'Proporciones aceptables, algunos modos pueden coincidir'
  } else {
    rating = 'poor'
    message = 'Proporciones problemáticas, probable acumulación modal'
  }

  return {
    lengthWidth,
    lengthHeight,
    widthHeight,
    rating,
    message,
  }
}

// ===== FREQUENCY RESPONSE ESTIMATION =====

/**
 * Generate estimated frequency response based on room characteristics
 * This is a simplified model for visualization purposes
 */
export function estimateFrequencyResponse(
  roomModes: RoomMode[],
  roomCharacter: 'viva' | 'equilibrada' | 'seca',
  volume: number
): Array<{ frequency: number; response: number; issue: boolean; description?: string }> {
  const response: Array<{ frequency: number; response: number; issue: boolean; description?: string }> = []

  // Generate response curve from 20Hz to 20kHz (logarithmic spacing)
  const frequencies = [
    20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500,
    630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000,
    10000, 12500, 16000, 20000,
  ]

  // Base response depends on room character
  const baseResponse = {
    viva: 0, // Reverberant room boosts everything
    equilibrada: -2, // Balanced room slight roll-off
    seca: -4, // Dead room more roll-off
  }[roomCharacter]

  frequencies.forEach((freq) => {
    let responseDb = baseResponse

    // Low frequency: affected by room modes
    if (freq < 300) {
      // Find nearby room modes
      const nearbyModes = roomModes.filter(
        (mode) => Math.abs(mode.frequency - freq) < 10
      )
      if (nearbyModes.length > 0) {
        // Boost at room mode frequencies
        const maxSeverity = nearbyModes.some((m) => m.severity === 'high') ? 12 :
                            nearbyModes.some((m) => m.severity === 'medium') ? 6 : 3
        responseDb += maxSeverity
      }

      // Small rooms have less bass extension
      if (volume < 30) {
        const bassRolloff = ((300 - freq) / 300) * -6
        responseDb += bassRolloff
      }
    }

    // Mid frequency: relatively flat, affected by room character
    if (freq >= 300 && freq < 4000) {
      if (roomCharacter === 'viva') {
        responseDb += Math.sin(freq / 100) * 2 // ±2dB deterministic variance
      } else if (roomCharacter === 'seca') {
        responseDb -= 2
      }
    }

    // High frequency: affected by absorption
    if (freq >= 4000) {
      if (roomCharacter === 'seca') {
        responseDb -= ((freq - 4000) / 16000) * 8 // Roll off highs
      } else if (roomCharacter === 'viva') {
        responseDb += 2 // Bright
      }
    }

    // Mark as issue if response deviates more than ±6dB from target
    const isIssue = Math.abs(responseDb) > 6

    response.push({
      frequency: freq,
      response: Math.round(responseDb * 10) / 10,
      issue: isIssue,
      description: isIssue
        ? responseDb > 6
          ? `Pico de +${responseDb.toFixed(1)}dB`
          : `Valle de ${responseDb.toFixed(1)}dB`
        : undefined,
    })
  })

  return response
}

// ===== ROOM CHARACTER DETERMINATION =====

/**
 * Determine room acoustic character based on RT60 and absorption
 */
export function determineRoomCharacter(
  rt60Mid: number,
  totalAbsorption: number,
  surfaceArea: number
): 'viva' | 'equilibrada' | 'seca' {
  const avgAbsorptionCoeff = totalAbsorption / surfaceArea

  // Viva: Long RT60, low absorption
  if (rt60Mid > 0.6 || avgAbsorptionCoeff < 0.15) {
    return 'viva'
  }

  // Seca: Short RT60, high absorption
  if (rt60Mid < 0.3 || avgAbsorptionCoeff > 0.35) {
    return 'seca'
  }

  // Equilibrada: Moderate RT60 and absorption
  return 'equilibrada'
}

// ===== ROOM METRICS SUMMARY =====

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
    rating: 'good' | 'acceptable' | 'poor'
    message: string
  }
}

/**
 * Calculate comprehensive room metrics
 */
export function calculateRoomMetrics(
  length: number,
  width: number,
  height: number
): RoomMetrics {
  const volume = Math.round(length * width * height * 100) / 100
  const floorArea = Math.round(length * width * 100) / 100
  const wallArea = Math.round(2 * (length * height + width * height) * 100) / 100
  const ceilingArea = floorArea
  const surfaceArea = Math.round((floorArea + wallArea + ceilingArea) * 100) / 100

  const ratios = calculateRoomRatios(length, width, height)

  return {
    volume,
    surfaceArea,
    floorArea,
    wallArea,
    ceilingArea,
    ratios,
  }
}

// ===== SPEAKER PLACEMENT =====

/**
 * Calculate optimal speaker and listening positions
 * Returns positions as percentages of room dimensions (0-1)
 */
export function calculateOptimalPositions(
  length: number,
  width: number,
  equipmentPosition: 'pared_larga' | 'pared_corta' | 'indefinido'
): {
  speakers: Array<{ x: number; y: number }> // Normalized 0-1
  listeningPosition: { x: number; y: number } // Normalized 0-1
  recommendations: string[]
} {
  const recommendations: string[] = []

  // Default: speakers on short wall (most common)
  let speakerWall: 'short' | 'long' = 'short'

  if (equipmentPosition === 'pared_larga') {
    speakerWall = 'long'
  } else if (equipmentPosition === 'pared_corta') {
    speakerWall = 'short'
  } else {
    // Auto-determine: prefer short wall if room is not too wide
    speakerWall = width / length > 0.7 ? 'short' : 'long'
  }

  let speakers: Array<{ x: number; y: number }>
  let listeningPosition: { x: number; y: number }

  if (speakerWall === 'short') {
    // Speakers on short wall (width direction)
    const speakerDistanceFromWall = 0.15 // 15% from front wall
    const speakerSpacing = 0.35 // 35% from side walls

    speakers = [
      { x: speakerSpacing, y: speakerDistanceFromWall },
      { x: 1 - speakerSpacing, y: speakerDistanceFromWall },
    ]

    // Listening position: 38% rule (avoid 50% which is room mode null)
    listeningPosition = { x: 0.5, y: 0.38 }

    recommendations.push(`Parlantes separados ${Math.round(width * (1 - 2 * speakerSpacing) * 100) / 100}m`)
    recommendations.push(`Punto de escucha a ${Math.round(length * 0.38 * 100) / 100}m de pared frontal`)
  } else {
    // Speakers on long wall (length direction)
    const speakerDistanceFromWall = 0.15
    const speakerSpacing = 0.35

    speakers = [
      { x: speakerDistanceFromWall, y: speakerSpacing },
      { x: speakerDistanceFromWall, y: 1 - speakerSpacing },
    ]

    listeningPosition = { x: 0.38, y: 0.5 }

    recommendations.push(`Configuración en pared larga`)
    recommendations.push(`Parlantes separados ${Math.round(length * (1 - 2 * speakerSpacing) * 100) / 100}m`)
  }

  recommendations.push('Formar triángulo equilátero con punto de escucha')
  recommendations.push('Evitar esquinas para los parlantes')

  return {
    speakers,
    listeningPosition,
    recommendations,
  }
}

// ===== POSITION-BASED RECALCULATION =====

export interface PositionUpdate {
  speakers: Array<{ x: number; y: number }>
  listeningPosition: { x: number; y: number }
  furnitureLayout?: Array<{ type: string; x: number; y: number; width: number; length: number }>
}

/**
 * Recalculate frequency response and treatment plan based on new positions.
 * Runs client-side without API call.
 */
export function recalculateForPositions(
  roomModes: RoomMode[],
  roomCharacter: 'viva' | 'equilibrada' | 'seca',
  volume: number,
  roomWidth: number,
  roomLength: number,
  positions: PositionUpdate
): {
  frequencyResponse: Array<{ frequency: number; response: number; issue: boolean; description?: string }>
  treatmentPlan: Array<{
    type: "absorber" | "diffuser" | "bass_trap"
    position: { x: number; y: number }
    wall: "front" | "back" | "left" | "right" | "ceiling"
    priority: "high" | "medium" | "low"
  }>
} {
  // 1. Recalculate frequency response with position-based modifiers
  const baseResponse = estimateFrequencyResponse(roomModes, roomCharacter, volume)
  const listenerY = positions.listeningPosition.y
  const listenerX = positions.listeningPosition.x

  // Furniture near walls adds extra absorption (reduces high-frequency energy)
  let furnitureAbsorptionBonus = 0
  if (positions.furnitureLayout) {
    positions.furnitureLayout.forEach(item => {
      const nearWall = item.x < 0.1 || item.x > 0.9 || item.y < 0.1 || item.y > 0.9
      furnitureAbsorptionBonus += nearWall ? 0.5 : 0.1
    })
  }

  const modifiedResponse = baseResponse.map(point => {
    let modifier = 0

    // Low frequencies: position relative to room mode nodes/antinodes
    if (point.frequency < 300) {
      roomModes
        .filter(mode => Math.abs(mode.frequency - point.frequency) < 15)
        .forEach(mode => {
          if (mode.dimension === 'length') {
            // Standing wave: pressure max at walls (0,1), null at 0.5
            const positionFactor = Math.abs(Math.cos(Math.PI * listenerY))
            modifier += (positionFactor - 0.5) * 4
          }
          if (mode.dimension === 'width') {
            const positionFactor = Math.abs(Math.cos(Math.PI * listenerX))
            modifier += (positionFactor - 0.5) * 4
          }
        })
    }

    // High frequencies: furniture absorption reduces energy
    if (point.frequency >= 1000 && furnitureAbsorptionBonus > 0) {
      modifier -= furnitureAbsorptionBonus * (point.frequency / 10000)
    }

    const newResponse = Math.round((point.response + modifier) * 10) / 10
    const isIssue = Math.abs(newResponse) > 6
    return {
      ...point,
      response: newResponse,
      issue: isIssue,
      description: isIssue
        ? newResponse > 6 ? `Pico de +${newResponse.toFixed(1)}dB` : `Valle de ${newResponse.toFixed(1)}dB`
        : undefined,
    }
  })

  // 2. Recalculate treatment plan (first reflection points depend on positions)
  const avgSpeakerY = (positions.speakers[0].y + positions.speakers[1].y) / 2
  const reflectionY = (avgSpeakerY + listenerY) / 2

  const treatmentPlan: Array<{
    type: "absorber" | "diffuser" | "bass_trap"
    position: { x: number; y: number }
    wall: "front" | "back" | "left" | "right" | "ceiling"
    priority: "high" | "medium" | "low"
  }> = [
    // Corner bass traps (always fixed)
    { type: "bass_trap", position: { x: 0, y: 0 }, wall: "front", priority: "high" },
    { type: "bass_trap", position: { x: 1, y: 0 }, wall: "front", priority: "high" },
    { type: "bass_trap", position: { x: 0, y: 1 }, wall: "back", priority: "high" },
    { type: "bass_trap", position: { x: 1, y: 1 }, wall: "back", priority: "high" },
    // First reflection points (move with speaker/listener positions)
    { type: "absorber", position: { x: 0, y: reflectionY }, wall: "left", priority: "high" },
    { type: "absorber", position: { x: 1, y: reflectionY }, wall: "right", priority: "high" },
  ]

  if (roomCharacter !== "seca") {
    treatmentPlan.push(
      { type: "diffuser", position: { x: 0.5, y: 1 }, wall: "back", priority: "medium" }
    )
  }

  return { frequencyResponse: modifiedResponse, treatmentPlan }
}
