"use client"

import { track } from "@vercel/analytics"

type PilotEvent = "analysis_completed" | "analysis_failed" | "report_opened" | "pdf_downloaded" | "trial_started" | "trial_result"
type PilotProperties = {
  goal?: string
  mode?: string
  persisted?: boolean
  trial?: string
  outcome?: "better" | "same" | "worse"
}

// Only categorical facts: never send room dimensions, report ids or personal notes.
export function trackPilot(event: PilotEvent, properties: PilotProperties = {}) {
  try { track(event, properties) } catch { /* Analytics must never interrupt a room trial. */ }
}
