import { describe, expect, it } from "vitest"
import { compareLayoutGeometry } from "./layoutGeometry"
import { proposeLayout, type Layout } from "./layoutTrial"

const room: Layout = { width: 4, length: 6, speakerPositions: [{ x: .25, y: .25 }, { x: .75, y: .25 }], listeningPosition: { x: .5, y: .75 }, furnitureLayout: [{ type: "mesa", x: .7, y: .8, width: .1, length: .1 }] }
describe("layout geometry comparison", () => {
  it("converts normalised positions to metres using each axis, rather than screen pixels", () => {
    const geometry = compareLayoutGeometry(room, room)!
    expect(geometry.current.left).toBeCloseTo(Math.sqrt(10))
    expect(geometry.current.right).toBeCloseTo(Math.sqrt(10))
    expect(geometry.current.separation).toBe(2)
    expect(geometry.current.difference).toBe(0)
    expect(geometry.diagonal).toBeCloseTo(Math.sqrt(52))
  })
  it("updates seat distances while preserving fixed speaker separation", () => {
    const proposal = { ...room, listeningPosition: { x: .25, y: .5 } }
    const geometry = compareLayoutGeometry(room, proposal)!
    expect(geometry.proposal.left).toBe(1.5)
    expect(geometry.proposal.right).toBe(2.5)
    expect(geometry.proposal.difference).toBe(1)
    expect(geometry.proposal.separation).toBe(geometry.current.separation)
    expect(geometry.movements.find(m => m.id === "listening")!.distance).toBeCloseTo(Math.sqrt(3.25))
  })
  it("finds the physically closest wall in a rectangular room", () => {
    const geometry = compareLayoutGeometry(room, { ...room, listeningPosition: { x: .8, y: .5 } })!
    expect(geometry.current.walls[2]).toEqual({ wall: "bottom", distance: 1.5 })
    expect(geometry.proposal.walls[2].wall).toBe("right")
    expect(geometry.proposal.walls[2].distance).toBeCloseTo(.8)
  })
  it("reports furniture movement and never mutates the baseline", () => {
    const baseline = structuredClone(room)
    const proposal = { ...room, furnitureLayout: [{ ...room.furnitureLayout[0], x: .2 }] }
    expect(compareLayoutGeometry(room, proposal)!.movements.find(m => m.id === "furniture-0")!.distance).toBeCloseTo(2)
    expect(room).toEqual(baseline)
  })
  it("returns zero movements when restrictions keep everything fixed", () => {
    const proposal = proposeLayout(room, { speakers: false, listening: false, furniture: false })
    expect(compareLayoutGeometry(room, proposal)!.movements.every(m => m.distance === 0)).toBe(true)
  })
  it("uses one shared room size for both arrangements", () => {
    expect(compareLayoutGeometry(room, { ...room, width: 100 })!.proposal).toEqual(compareLayoutGeometry(room, room)!.current)
  })
  it("rejects invalid dimensions or positions instead of displaying NaN or fictitious distances", () => {
    expect(compareLayoutGeometry({ ...room, width: 0 }, room)).toBeNull()
    expect(compareLayoutGeometry({ ...room, length: Infinity }, room)).toBeNull()
    expect(compareLayoutGeometry(room, { ...room, listeningPosition: { x: NaN, y: .5 } })).toBeNull()
    expect(compareLayoutGeometry(room, { ...room, speakerPositions: [] })).toBeNull()
  })
})
