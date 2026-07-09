import { calculateRoomModes } from "@/lib/acousticsCalculations"

export interface WaveLayer {
  freq: number
  amp: number
}

/** Representative room used for decorative placements (landing hero, loading screen)
 * where no real user project exists yet. */
export const HERO_ROOM = { length: 5.2, width: 3.6, height: 2.5 }

/**
 * Derives standing-wave layers from the room's real first-order axial modes — the same
 * `calculateRoomModes` used to build the actual acoustic report. The brand motif is the
 * product's own physics, not a decorative asset.
 */
export function getStandingWaveLayers(
  length: number,
  width: number,
  height: number,
  maxLayers = 4,
): WaveLayer[] {
  const modes = calculateRoomModes(length, width, height)
  const firstOrderAxial = modes
    .filter((m) => m.type === "axial" && (m.nx === 1 || m.ny === 1 || m.nz === 1))
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, maxLayers)

  if (firstOrderAxial.length === 0) return [{ freq: 1.5, amp: 1 }]

  const min = firstOrderAxial[0].frequency
  const max = firstOrderAxial[firstOrderAxial.length - 1].frequency
  const range = Math.max(max - min, 1)

  return firstOrderAxial.map((mode, i) => ({
    freq: 1 + ((mode.frequency - min) / range) * 2.4,
    amp: 1 / (i + 1.4),
  }))
}
