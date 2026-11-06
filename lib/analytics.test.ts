import { expect, it, vi } from "vitest"
const send = vi.hoisted(() => vi.fn())
vi.mock("@vercel/analytics", () => ({ track: send }))
import { trackPilot } from "./analytics"
it("does not interrupt a trial if analytics is unavailable", () => {
  send.mockImplementation(() => { throw new Error("blocked") })
  expect(() => trackPilot("trial_result", { trial: "position", outcome: "same" })).not.toThrow()
})
