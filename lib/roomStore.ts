// app/lib/roomStore.ts
"use client"

import { useEffect, useState } from "react"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { RoomProject, RoomGoal, EnhancedAnalysisResponse } from "@/app/types/room"
import { recalculateForPositions } from "@/lib/acousticsCalculations"

/** Extra facts about the last analysis that aren't part of the analysis itself. */
interface AnalysisMeta {
  /** Server-side id, present only when the analysis was actually saved. */
  projectId?: string | null
  /** False when the API answered but couldn't persist — the report exists only here. */
  persisted?: boolean
}

interface RoomState {
  project: RoomProject
  analysis: EnhancedAnalysisResponse | null
  projectId: string | null
  analysisPersisted: boolean

  setGoal: (goal: RoomGoal) => void
  updateProject: (partial: Partial<RoomProject>) => void
  setAnalysis: (analysis: EnhancedAnalysisResponse, meta?: AnalysisMeta) => void
  updatePositions: (
    positions: { speakers: { x: number; y: number }[]; listeningPosition: { x: number; y: number } },
    furnitureLayout?: Array<{ type: string; x: number; y: number; width: number; length: number }>
  ) => void
  reset: () => void
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      project: {
        goal: null,
      },
      analysis: null,
      projectId: null,
      analysisPersisted: false,

      setGoal: (goal) =>
        set((state) => ({
          project: { ...state.project, goal },
        })),

      updateProject: (partial) =>
        set((state) => ({
          project: { ...state.project, ...partial },
        })),

      setAnalysis: (analysis, meta) =>
        set((state) => ({
          analysis,
          projectId: meta?.projectId ?? state.projectId,
          analysisPersisted: meta?.persisted ?? Boolean(meta?.projectId),
        })),

      updatePositions: (positions, furnitureLayout?) =>
        set((state) => {
          if (!state.analysis) return state

          const { roomMetrics, roomCharacter, roomDiagram } = state.analysis
          const furniture = furnitureLayout || roomDiagram.floorPlan.furnitureLayout

          const isES = (typeof window !== "undefined" ? localStorage.getItem("locale") : null) !== "en"

          const { frequencyResponse, treatmentPlan } = recalculateForPositions(
            roomMetrics.roomModes,
            roomCharacter,
            roomMetrics.volume,
            roomDiagram.floorPlan.width,
            roomDiagram.floorPlan.length,
            { ...positions, furnitureLayout: furniture },
            isES
          )

          return {
            analysis: {
              ...state.analysis,
              frequencyResponse,
              roomDiagram: {
                ...state.analysis.roomDiagram,
                floorPlan: {
                  ...state.analysis.roomDiagram.floorPlan,
                  speakerPositions: positions.speakers,
                  listeningPosition: positions.listeningPosition,
                  furnitureLayout: furniture,
                },
                treatmentPlan,
              },
            },
          }
        }),

      reset: () =>
        set({
          project: { goal: null },
          analysis: null,
          projectId: null,
          analysisPersisted: false,
        }),
    }),
    {
      // Survives a refresh and a tab the browser discarded and restored — the common way
      // a wizard gets lost on mobile — without carrying a half-filled form into next week.
      name: "roomtuner-session",
      version: 1,
      // Reaching for `window` throws during server render and wherever site data is blocked
      // (private mode). createJSONStorage catches that and hands persist no storage, which
      // degrades to plain in-memory state instead of crashing the page.
      storage: createJSONStorage(() => window.sessionStorage),
      // Hydration is triggered by <StoreHydrator/> after mount, not at import time, so the
      // first client render matches the prerendered HTML. See useRoomHydrated().
      skipHydration: true,
      partialize: (state) => ({
        project: state.project,
        analysis: state.analysis,
        projectId: state.projectId,
        analysisPersisted: state.analysisPersisted,
      }),
    }
  )
)

/**
 * `persist` is absent when no storage engine is available (server render, private mode,
 * blocked site data). Every caller below treats that as "nothing to restore".
 */
const persistApi = () => useRoomStore.persist as typeof useRoomStore.persist | undefined

/**
 * Called once from the root layout. Reads sessionStorage back into the store.
 * Returns the thenable persist hands back (synchronous for sessionStorage), or undefined
 * when there is no storage to read from.
 */
export function rehydrateRoomStore() {
  return persistApi()?.rehydrate()
}

/**
 * False until the store has been read back from storage. Anything that would act on an
 * empty store — firing the analysis, deciding there is no report, seeding a form — has to
 * wait for this, or it acts on state that is about to be replaced.
 *
 * Always starts false so the server HTML and the first client render agree.
 */
export function useRoomHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const api = persistApi()
    if (!api) {
      setHydrated(true)
      return
    }
    const unsubscribe = api.onFinishHydration(() => setHydrated(true))
    if (api.hasHydrated()) setHydrated(true)
    return unsubscribe
  }, [])

  return hydrated
}
