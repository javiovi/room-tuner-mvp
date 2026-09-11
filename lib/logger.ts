/**
 * One place to write errors, so every line in the Vercel log viewer can be filtered by
 * scope: `[analyze-room]`, `[medicion]`, and so on.
 *
 * Where the lines end up depends on where the code runs, and the difference matters:
 * server code lands in Vercel's runtime logs (retained one hour on Hobby), while client
 * code lands in that visitor's own browser console and reaches nobody but them. Closing
 * that second gap needs a client→server channel, which is deliberately not built yet —
 * until it is, client-side calls here are for reading in a device inspector while
 * testing by hand.
 *
 * When error tracking does arrive, this is the single function it hooks into.
 */

export type LogScope =
  | "analyze-room"
  | "generate-pdf"
  | "search-products"
  | "projects"
  | "health"
  | "analizando"
  | "resultado"
  | "medicion"
  | "pricing"

/** Errors don't survive `JSON.stringify`, so unwrap them into something a log line shows. */
function describe(detail: unknown): unknown {
  if (detail instanceof Error) {
    return { name: detail.name, message: detail.message, stack: detail.stack }
  }
  return detail
}

/** Something failed and someone should look at it. */
export function logError(scope: LogScope, message: string, detail?: unknown): void {
  if (detail === undefined) {
    console.error(`[${scope}] ${message}`)
    return
  }
  console.error(`[${scope}] ${message}`, describe(detail))
}

/** Expected, handled, but worth knowing it happened — a rejected payload, a fallback taken. */
export function logWarn(scope: LogScope, message: string, detail?: unknown): void {
  if (detail === undefined) {
    console.warn(`[${scope}] ${message}`)
    return
  }
  console.warn(`[${scope}] ${message}`, describe(detail))
}
