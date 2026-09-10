import { NextResponse } from "next/server"

/**
 * Fixed-window rate limiting, in memory.
 *
 * These routes are unauthenticated and one of them writes to the database with the service
 * role, so without a limit a single client can fill the project's Postgres for free. This
 * closes that door for the ordinary case: one client hammering one endpoint.
 *
 * What it deliberately is not: durable or shared. Counters live in the memory of a single
 * serverless instance, so they reset on cold start and a request routed to another instance
 * gets its own budget. A distributed flood needs a shared store (Upstash Redis) or the
 * platform's firewall in front — this is the cheap 90%, not the real thing.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

/** Ceiling on tracked keys, so a flood of distinct IPs can't grow this map without bound. */
const MAX_TRACKED_KEYS = 10_000

export interface RateLimitOptions {
  /** Requests allowed per window. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  /** Seconds until the current window resets — what a client should wait. */
  retryAfterSeconds: number
}

/** Drops expired buckets. Cheap enough to run per call at these volumes. */
function evictExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) evictExpired(now)
    // Still full of live windows: fail open rather than start rejecting arbitrary clients.
    if (buckets.size >= MAX_TRACKED_KEYS) {
      return { ok: true, remaining: 0, retryAfterSeconds: 0 }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  existing.count += 1
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))

  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfterSeconds }
  }

  return { ok: true, remaining: limit - existing.count, retryAfterSeconds }
}

/**
 * Best-effort client identity. On Vercel the real client is the first hop of
 * x-forwarded-for; everything else is a proxy. Falls back to a shared bucket, which
 * throttles the whole edge rather than nobody.
 */
export function clientKey(req: Request, scope: string): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
  return `${scope}:${ip}`
}

/** The 429 to return when a limit is hit, with the header clients actually honor. */
export function tooManyRequests(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    { error: "Too many requests", retryAfterSeconds: result.retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
  )
}
