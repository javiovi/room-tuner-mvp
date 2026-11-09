import { describe, expect, it } from "vitest"
import { approximateDimensions, clampPoint, initialLayout, proposeLayout, type Layout } from "./layoutTrial"

const layout: Layout = { width: 3, length: 4, speakerPositions: [{ x: .12, y: .12 }, { x: .28, y: .12 }], listeningPosition: { x: .85, y: .85 }, furnitureLayout: [{ type: "sofa", x: .8, y: .65, width: .3, length: .15 }] }
describe("layout experiments", () => {
  it("keeps fixed speakers, listening and furniture untouched", () => {
    expect(proposeLayout(layout, { speakers: false, listening: false, furniture: false })).toEqual(layout)
  })
  it("changes only the movable listening point and does not mutate the baseline", () => {
    const proposed = proposeLayout(layout, { speakers: false, listening: true, furniture: false })
    expect(proposed.speakerPositions).toEqual(layout.speakerPositions)
    expect(proposed.furnitureLayout).toEqual(layout.furnitureLayout)
    expect(proposed.listeningPosition).not.toEqual(layout.listeningPosition)
    expect(layout.listeningPosition).toEqual({ x: .85, y: .85 })
  })
  it("does not place the listening point inside a fixed piece of furniture", () => {
    const room = { ...layout, furnitureLayout: [{ type: "mesa", x: .5, y: .38, width: .3, length: .2 }] }
    expect(proposeLayout(room, { speakers: false, listening: true, furniture: false }).listeningPosition.y).not.toBe(.38)
  })
  it("generates a current sketch from the user's answers rather than optimal positions", () => {
    const initial = initialLayout({ goal: "music", speakerPlacement: "esquina", listeningPosition: "sillon-pared-posterior" }, layout)
    expect(initial.speakerPositions[0].x).toBe(.12)
    expect(initial.listeningPosition.y).toBe(.85)
  })
  it("keeps furniture fully within the room when nudged beyond a wall", () => {
    expect(clampPoint({ x: 0, y: 1 }, .4, .2)).toEqual({ x: .2, y: .9 })
  })
  it("uses explicit finite reference dimensions for a quick rectangular sketch", () => {
    const dimensions = approximateDimensions("medium", "rectangle")
    expect(dimensions.lengthM).toBeGreaterThan(dimensions.widthM)
    expect(dimensions.heightM).toBe(2.5)
  })
})
