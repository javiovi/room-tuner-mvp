import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/client"

// Never cached: a cached health check is worse than none.
export const dynamic = "force-dynamic"

/**
 * Liveness check for the dependency that fails silently.
 *
 * The analysis endpoint keeps working when the database is unreachable (it returns the
 * report and only logs the save error), which is how this project spent two months
 * persisting nothing. This is the endpoint that answers "is the database actually there?"
 * with a status code a monitor can act on: 200 when it is, 503 when it isn't.
 */
export async function GET() {
  const startedAt = Date.now()
  let db: "up" | "down" = "down"
  let detail: string | undefined

  try {
    const supabase = createServerClient()
    // Cheapest possible round trip that still proves Postgres answered.
    const { error } = await supabase.from("projects").select("id").limit(1).returns<{ id: string }[]>()

    if (error) {
      detail = error.message
    } else {
      db = "up"
    }
  } catch (error) {
    // Missing env vars land here too — createServerClient throws without the service key.
    detail = error instanceof Error ? error.message : "unknown error"
  }

  const ok = db === "up"

  return NextResponse.json(
    {
      ok,
      db,
      ...(detail ? { detail } : {}),
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  )
}
