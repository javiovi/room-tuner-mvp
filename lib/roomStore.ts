// app/lib/roomStore.ts
"use client"

import { create } from "zustand"
import type { RoomProject, RoomGoal, EnhancedAnalysisResponse } from "@/app/types/room"
import { recalculateForPositions } from "@/lib/acousticsCalculations"

interface RoomState {
  project: RoomProject
  analysis: EnhancedAnalysisResponse | null

  setGoal: (goal: RoomGoal) => void
  updateProject: (partial: Partial<RoomProject>) => void
  setAnalysis: (analysis: EnhancedAnalysisResponse) => void
  updatePositions: (
    positions: { speakers: { x: number; y: number }[]; listeningPosition: { x: number; y: number } },
    furnitureLayout?: Array<{ type: string; x: number; y: number; width: number; length: number }>
  ) => void
  reset: () => void
}

export const useRoomStore = create<RoomState>((set) => ({
  project: {
    goal: null,
  },
  analysis: null,

  setGoal: (goal) =>
    set((state) => ({
      project: { ...state.project, goal },
    })),

  updateProject: (partial) =>
    set((state) => ({
      project: { ...state.project, ...partial },
    })),

  setAnalysis: (analysis) => set({ analysis }),

  updatePositions: (positions, furnitureLayout?) =>
    set((state) => {
      if (!state.analysis) return state

      const { roomMetrics, roomCharacter, roomDiagram } = state.analysis
      const furniture = furnitureLayout || roomDiagram.floorPlan.furnitureLayout

      const { frequencyResponse, treatmentPlan } = recalculateForPositions(
        roomMetrics.roomModes,
        roomCharacter,
        roomMetrics.volume,
        roomDiagram.floorPlan.width,
        roomDiagram.floorPlan.length,
        { ...positions, furnitureLayout: furniture }
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
    }),
}))
