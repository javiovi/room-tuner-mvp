import { afterEach, describe, expect, it, vi } from "vitest"
import { AudioMeasurementEngine } from "./audioMeasurement"

function microphone(getUserMedia: () => Promise<MediaStream>) {
  vi.stubGlobal("cancelAnimationFrame", vi.fn())
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } })
  vi.stubGlobal("window", { AudioContext: class {} })
}

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe("microphone lifecycle", () => {
  it("distinguishes a missing microphone from permission denial", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    microphone(() => Promise.reject(new DOMException("missing", "NotFoundError")))
    const missing = new AudioMeasurementEngine()
    expect(await missing.requestPermission()).toBe(false)
    expect(missing.error).toBe("missing")
    microphone(() => Promise.reject(new DOMException("denied", "NotAllowedError")))
    const denied = new AudioMeasurementEngine()
    expect(await denied.requestPermission()).toBe(false)
    expect(denied.error).toBe("denied")
  })

  it("stops a stream that arrives after the user cancelled", async () => {
    let resolve!: (stream: MediaStream) => void
    microphone(() => new Promise<MediaStream>((done) => { resolve = done }))
    const engine = new AudioMeasurementEngine()
    const permission = engine.requestPermission()
    engine.dispose()
    const stop = vi.fn()
    resolve({ getTracks: () => [{ stop }] } as unknown as MediaStream)
    expect(await permission).toBe(false)
    expect(stop).toHaveBeenCalledOnce()
  })

  it("times out pending permission and releases a later stream", async () => {
    vi.useFakeTimers()
    vi.spyOn(console, "error").mockImplementation(() => {})
    let resolve!: (stream: MediaStream) => void
    microphone(() => new Promise<MediaStream>((done) => { resolve = done }))
    const engine = new AudioMeasurementEngine()
    const permission = engine.requestPermission()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(await permission).toBe(false)
    expect(engine.error).toBe("timeout")
    const stop = vi.fn()
    resolve({ getTracks: () => [{ stop }] } as unknown as MediaStream)
    await Promise.resolve()
    expect(stop).toHaveBeenCalledOnce()
  })
})
