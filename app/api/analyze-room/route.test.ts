import { beforeEach, expect, it, vi } from "vitest"

const db = vi.hoisted(() => ({
  from: vi.fn(), insert: vi.fn(), select: vi.fn(), returns: vi.fn(), single: vi.fn(),
  upsert: vi.fn(), update: vi.fn(), eq: vi.fn(),
}))
vi.mock("@/lib/supabase/client", () => ({ createServerClient: () => db }))
vi.mock("@/lib/rateLimit", () => ({
  clientKey: () => "test", rateLimit: () => ({ ok: true }), tooManyRequests: vi.fn(),
}))
import { POST } from "./route"

beforeEach(() => {
  vi.clearAllMocks()
  for (const method of [db.from, db.insert, db.select, db.returns, db.update]) method.mockReturnValue(db)
  db.single.mockResolvedValue({ data: { id: "new-report" }, error: null })
  db.upsert.mockResolvedValue({ error: null })
  db.eq.mockResolvedValue({ error: null })
})

it("creates a new report even when a reader submits another report's id", async () => {
  const response = await POST(new Request("http://localhost/api/analyze-room", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal: "music", lengthM: 4, widthM: 3, heightM: 2.5,
      floorType: "madera", wallType: "desnudas", furniture: [],
      projectId: "d92b9fb3-611e-41d2-a43a-60bdd9437362", concern: "bass",
      dimensionSource: "measured", moveConstraints: { speakers: false, listening: true, furniture: false } }),
  }))
  expect(response.status).toBe(200)
  const report = await response.json()
  expect(report.projectId).toBe("new-report")
  expect(report.persisted).toBe(true)
  expect(db.insert).toHaveBeenCalledOnce()
  expect(db.update).toHaveBeenCalledExactlyOnceWith({ status: "completed" })
  expect(db.eq).toHaveBeenCalledExactlyOnceWith("id", "new-report")
  const saved = db.upsert.mock.calls[0][0]
  expect(saved.recommendations.inputContext).toMatchObject({ concern: "bass", moveConstraints: { speakers: false } })
  expect(saved.recommendations.inputContext).not.toHaveProperty("projectId")
})

it("returns an explicitly unsaved report when saving fails", async () => {
  db.single.mockResolvedValue({ data: null, error: { message: "unavailable" } })
  const response = await POST(new Request("http://localhost/api/analyze-room", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal: "work", lengthM: 4, widthM: 3, heightM: 2.5 }),
  }))
  const report = await response.json()
  expect(response.status).toBe(200)
  expect(report.persisted).toBe(false)
  expect(report.projectId).toBeUndefined()
  expect(db.upsert).not.toHaveBeenCalled()
})
