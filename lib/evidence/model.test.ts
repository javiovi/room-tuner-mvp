import { describe, expect, it } from "vitest"
import { imageFormat, makeZone, position } from "./model"

describe("local photo evidence", ()=>{
  it("accepts only supported image signatures, regardless of extension", ()=>{
    expect(imageFormat(new Uint8Array([255,216,255,224]))).toBe(true)
    expect(imageFormat(new Uint8Array([137,80,78,71,13,10,26,10]))).toBe(true)
    expect(imageFormat(new TextEncoder().encode("RIFF1234WEBP"))).toBe(true)
    expect(imageFormat(new TextEncoder().encode("<svg>"))).toBe(false)
    expect(imageFormat(new TextEncoder().encode("ftypheic"))).toBe(false)
    expect(imageFormat(new Uint8Array())).toBe(false)
  })
  it("keeps normalized markers inside the photo, including invalid coordinates", ()=>{
    expect(position(-1)).toBe(.02)
    expect(position(2)).toBe(.98)
    expect(position(NaN)).toBe(.5)
    const first = makeZone("window",.25,.75), second = makeZone("door",.5,.5)
    expect(first).toMatchObject({ kind:"window",x:.25,y:.75,note:"",outcome:"untested" })
    expect(first.id).not.toBe(second.id)
  })
})
