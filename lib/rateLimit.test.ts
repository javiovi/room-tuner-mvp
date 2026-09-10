import { beforeEach, describe, expect, it, vi } from "vitest"

/** Counters live in module state, so each test gets a fresh copy. */
async function loadRateLimit() {
  vi.resetModules()
  return import("./rateLimit")
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it("allows requests up to the limit and rejects the one after", async () => {
    const { rateLimit } = await loadRateLimit()
    const options = { limit: 3, windowMs: 60_000 }

    expect(rateLimit("a", options)).toMatchObject({ ok: true, remaining: 2 })
    expect(rateLimit("a", options)).toMatchObject({ ok: true, remaining: 1 })
    expect(rateLimit("a", options)).toMatchObject({ ok: true, remaining: 0 })

    const rejected = rateLimit("a", options)
    expect(rejected.ok).toBe(false)
    expect(rejected.retryAfterSeconds).toBeGreaterThan(0)
  })

  it("counts each client separately", async () => {
    const { rateLimit } = await loadRateLimit()
    const options = { limit: 1, windowMs: 60_000 }

    expect(rateLimit("a", options).ok).toBe(true)
    expect(rateLimit("a", options).ok).toBe(false)
    // A different client must not inherit the first one's exhausted budget.
    expect(rateLimit("b", options).ok).toBe(true)
  })

  it("lets a client through again once its window has passed", async () => {
    vi.useFakeTimers()
    const { rateLimit } = await loadRateLimit()
    const options = { limit: 1, windowMs: 1_000 }

    expect(rateLimit("a", options).ok).toBe(true)
    expect(rateLimit("a", options).ok).toBe(false)

    vi.advanceTimersByTime(1_001)
    expect(rateLimit("a", options).ok).toBe(true)
  })
})

describe("clientKey", () => {
  it("uses the first hop of x-forwarded-for, which is the real client", async () => {
    const { clientKey } = await loadRateLimit()
    const req = new Request("https://example.test", {
      headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" },
    })

    expect(clientKey(req, "scope")).toBe("scope:203.0.113.7")
  })

  it("falls back to a shared bucket when no client ip is present", async () => {
    const { clientKey } = await loadRateLimit()

    expect(clientKey(new Request("https://example.test"), "scope")).toBe("scope:unknown")
  })

  it("keeps scopes independent so one endpoint cannot exhaust another", async () => {
    const { clientKey, rateLimit } = await loadRateLimit()
    const req = new Request("https://example.test", { headers: { "x-forwarded-for": "203.0.113.7" } })
    const options = { limit: 1, windowMs: 60_000 }

    expect(rateLimit(clientKey(req, "analyze-room"), options).ok).toBe(true)
    expect(rateLimit(clientKey(req, "generate-pdf"), options).ok).toBe(true)
  })
})
