import { describe, it, expect } from "vitest"
import {
  calculateRoomMetrics,
  calculateRoomRatios,
  calculateRoomModes,
  calculateTotalAbsorption,
  calculateFurnitureAbsorption,
  determineRoomCharacter,
  evaluateRT60,
  calculateOptimalPositions,
} from "./acousticsCalculations"

describe("calculateRoomMetrics", () => {
  it("computes volume, floor/wall/ceiling areas from dimensions", () => {
    const metrics = calculateRoomMetrics(4, 3, 2.5)
    expect(metrics.volume).toBe(30)
    expect(metrics.floorArea).toBe(12)
    expect(metrics.ceilingArea).toBe(12)
    expect(metrics.wallArea).toBe(2 * (4 * 2.5 + 3 * 2.5))
    expect(metrics.surfaceArea).toBe(metrics.floorArea + metrics.wallArea + metrics.ceilingArea)
  })
})

describe("calculateRoomRatios", () => {
  it("rates a cube (1:1:1) as poor — worst case for room modes", () => {
    const ratios = calculateRoomRatios(4, 4, 4)
    expect(ratios.rating).toBe("poor")
  })

  it("rates well-spaced, non-integer ratios as good", () => {
    const ratios = calculateRoomRatios(4.8, 3.6, 2.7)
    expect(ratios.rating).toBe("good")
  })
})

describe("calculateRoomModes", () => {
  it("derives the first axial mode from f = c / (2L)", () => {
    const modes = calculateRoomModes(4, 3, 2.5)
    const firstLengthMode = modes.find((m) => m.dimension === "length" && m.nx === 1)
    // Speed of sound 343 m/s: f = 343 / (2*4) = 42.875 Hz
    expect(firstLengthMode?.frequency).toBeCloseTo(42.9, 1)
    expect(firstLengthMode?.severity).toBe("high")
  })

  it("returns modes sorted ascending by frequency with no near-duplicates", () => {
    const modes = calculateRoomModes(4, 3, 2.5)
    for (let i = 1; i < modes.length; i++) {
      expect(modes[i].frequency).toBeGreaterThan(modes[i - 1].frequency)
    }
  })

  it("translates mode descriptions when isES is false", () => {
    const modesEs = calculateRoomModes(4, 3, 2.5, true)
    const modesEn = calculateRoomModes(4, 3, 2.5, false)
    expect(modesEs[0].description).toMatch(/modo/)
    expect(modesEn[0].description).toMatch(/mode/)
  })
})

describe("calculateFurnitureAbsorption", () => {
  it("scales by effective area, not just the raw coefficient", () => {
    // sofa: area 4m², coefficient.mid 0.35 -> 1.4 sabins, not 0.35
    const { mid } = calculateFurnitureAbsorption(["sofa"])
    expect(mid).toBeCloseTo(4 * 0.35, 5)
  })

  it("sums contributions across multiple items", () => {
    const single = calculateFurnitureAbsorption(["sofa"])
    const double = calculateFurnitureAbsorption(["sofa", "sofa"])
    expect(double.mid).toBeCloseTo(single.mid * 2, 5)
  })

  it("ignores unknown furniture keys instead of throwing", () => {
    expect(() => calculateFurnitureAbsorption(["not-a-real-item"])).not.toThrow()
    expect(calculateFurnitureAbsorption(["not-a-real-item"])).toEqual({ low: 0, mid: 0, high: 0 })
  })
})

describe("calculateTotalAbsorption — furniture must contribute in sabins, not bare coefficients", () => {
  it("furniture materially raises total absorption for a small, hard-surfaced room", () => {
    const base = {
      goal: null,
      lengthM: 4,
      widthM: 3,
      heightM: 2.5,
      floorType: "concreto" as const,
      wallType: "desnudas" as const,
    }
    const empty = calculateTotalAbsorption({ ...base, furniture: [] })
    const furnished = calculateTotalAbsorption({ ...base, furniture: ["sofa", "cama", "estanteria"] })

    // Regression test: furniture absorption used to be added as a bare coefficient
    // (effectively "1m² per item"), understating a sofa/bed/shelf's real contribution
    // by roughly an order of magnitude. With effective-area scaling the difference
    // between furnished and empty should be substantial, not a rounding error.
    expect(furnished.average).toBeGreaterThan(empty.average * 1.5)
  })

  it("matches area × coefficient exactly for a single furniture item", () => {
    const base = {
      goal: null,
      lengthM: 4,
      widthM: 3,
      heightM: 2.5,
      floorType: "concreto" as const,
      wallType: "desnudas" as const,
    }
    const empty = calculateTotalAbsorption({ ...base, furniture: [] })
    const withSofa = calculateTotalAbsorption({ ...base, furniture: ["sofa"] })
    const furnitureOnly = calculateFurnitureAbsorption(["sofa"])
    const expectedAverage = Math.round(
      ((empty.low + furnitureOnly.low) + (empty.mid + furnitureOnly.mid) + (empty.high + furnitureOnly.high)) / 3 * 100
    ) / 100
    expect(withSofa.average).toBe(expectedAverage)
  })
})

describe("determineRoomCharacter", () => {
  it("classifies long RT60 / low absorption as viva", () => {
    expect(determineRoomCharacter(0.9, 5, 60)).toBe("viva")
  })

  it("classifies short RT60 / high absorption as seca", () => {
    expect(determineRoomCharacter(0.2, 30, 60)).toBe("seca")
  })

  it("classifies moderate RT60 / absorption as equilibrada", () => {
    expect(determineRoomCharacter(0.45, 15, 60)).toBe("equilibrada")
  })
})

describe("evaluateRT60", () => {
  it("rates RT60 within the target music range as good", () => {
    const result = evaluateRT60(0.45, "music")
    expect(result.rating).toBe("good")
  })

  it("rates a very dry room as problematic", () => {
    const result = evaluateRT60(0.05, "music")
    expect(result.rating).toBe("problematic")
  })
})

describe("calculateOptimalPositions", () => {
  it("keeps speakers and listening position within the normalized 0-1 room bounds", () => {
    const positions = calculateOptimalPositions(4, 3, "pared-corta-centrado")
    for (const speaker of positions.speakers) {
      expect(speaker.x).toBeGreaterThanOrEqual(0)
      expect(speaker.x).toBeLessThanOrEqual(1)
      expect(speaker.y).toBeGreaterThanOrEqual(0)
      expect(speaker.y).toBeLessThanOrEqual(1)
    }
    expect(positions.listeningPosition.y).toBeCloseTo(0.38, 5)
  })

  it("translates recommendations when isES is false", () => {
    const es = calculateOptimalPositions(4, 3, "pared-corta-centrado", true)
    const en = calculateOptimalPositions(4, 3, "pared-corta-centrado", false)
    expect(es.recommendations.some((r) => r.includes("Parlantes"))).toBe(true)
    expect(en.recommendations.some((r) => r.includes("Speakers"))).toBe(true)
  })
})
