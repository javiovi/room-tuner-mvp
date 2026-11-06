import { afterEach, describe, expect, it, vi } from "vitest"
import type { EnhancedAnalysisResponse } from "@/app/types/room"

/** Minimal stand-in for sessionStorage, so the store can be exercised outside a browser. */
function createFakeStorage() {
  const entries = new Map<string, string>()
  return {
    entries,
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value)
    },
    removeItem: (key: string) => {
      entries.delete(key)
    },
  }
}

/** Loads a fresh copy of the store, as a new tab or a reloaded page would. */
async function loadStore(storage: ReturnType<typeof createFakeStorage>) {
  vi.stubGlobal("window", { sessionStorage: storage })
  vi.resetModules()
  return import("./roomStore")
}

const STORAGE_KEY = "roomtuner-session"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("roomStore persistence", () => {
  it("writes the wizard answers to session storage as they are filled in", async () => {
    const storage = createFakeStorage()
    const { useRoomStore } = await loadStore(storage)

    useRoomStore.getState().setGoal("music")
    useRoomStore.getState().updateProject({ lengthM: 4.2, widthM: 3.1, floorType: "madera" })

    const saved = JSON.parse(storage.getItem(STORAGE_KEY)!)
    expect(saved.state.project).toMatchObject({
      goal: "music",
      lengthM: 4.2,
      widthM: 3.1,
      floorType: "madera",
    })
  })

  it("restores those answers into a fresh store, but only once rehydrated", async () => {
    const storage = createFakeStorage()
    const first = await loadStore(storage)
    first.useRoomStore.getState().updateProject({ lengthM: 4.2, heightM: 2.5 })

    // A refresh: new module instance, same storage. `skipHydration` means it starts empty so
    // the first client render still matches the prerendered HTML.
    const second = await loadStore(storage)
    expect(second.useRoomStore.getState().project.lengthM).toBeUndefined()

    await second.rehydrateRoomStore()
    expect(second.useRoomStore.getState().project).toMatchObject({ lengthM: 4.2, heightM: 2.5 })
  })

  it("keeps working when session storage is unavailable", async () => {
    // Private mode: touching sessionStorage throws. The wizard has to stay usable in memory.
    vi.stubGlobal("window", {
      get sessionStorage(): never {
        throw new Error("access denied")
      },
    })
    vi.resetModules()
    const { useRoomStore, rehydrateRoomStore } = await import("./roomStore")

    expect(() => rehydrateRoomStore()).not.toThrow()
    useRoomStore.getState().updateProject({ lengthM: 3 })
    expect(useRoomStore.getState().project.lengthM).toBe(3)
  })
})

describe("roomStore analysis metadata", () => {
  const analysis = { summary: "x" } as unknown as EnhancedAnalysisResponse

  it("treats an analysis with a server id as persisted", async () => {
    const { useRoomStore } = await loadStore(createFakeStorage())

    useRoomStore.getState().setAnalysis(analysis, { projectId: "abc", persisted: true })

    expect(useRoomStore.getState().projectId).toBe("abc")
    expect(useRoomStore.getState().analysisPersisted).toBe(true)
  })

  it("treats an analysis the server could not save as not persisted", async () => {
    // This is what drives the "this report wasn't saved" warning on /resultado.
    const { useRoomStore } = await loadStore(createFakeStorage())

    useRoomStore.getState().setAnalysis(analysis, { projectId: null, persisted: false })

    expect(useRoomStore.getState().projectId).toBeNull()
    expect(useRoomStore.getState().analysisPersisted).toBe(false)
  })
})


describe("switching reports", () => {
  it("clears the old saved id when the next report could not be saved", async () => {
    const { useRoomStore } = await loadStore(createFakeStorage())
    const report = { generatedAt: "first" } as EnhancedAnalysisResponse
    useRoomStore.getState().setAnalysis(report, { projectId: "old", persisted: true })
    useRoomStore.getState().setAnalysis({ ...report, generatedAt: "second" }, { projectId: null, persisted: false })
    expect(useRoomStore.getState().projectId).toBeNull()
    expect(useRoomStore.getState().analysisPersisted).toBe(false)
  })

  it("replaces answers instead of inheriting another room's microphone data", async () => {
    const { useRoomStore } = await loadStore(createFakeStorage())
    useRoomStore.getState().updateProject({ goal: "music", measuredRT60: { value: .7, method: "T20", confidence: "high" }, concern: "bass" })
    useRoomStore.getState().replaceProject({ goal: "work", dimensionSource: "approximate", concern: "noise" })
    expect(useRoomStore.getState().project).toEqual({ goal: "work", dimensionSource: "approximate", concern: "noise" })
  })
})
