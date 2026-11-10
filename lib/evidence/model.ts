export type ZoneKind = "window" | "door" | "wall" | "desk"
export type Zone = { id: string; kind: ZoneKind; x: number; y: number; note: string; outcome: "untested" | "better" | "same" | "worse" }
export type RoomEvidence = { version: 1; reportKey: string; goal: string; photo: Blob; zones: Zone[]; updatedAt: string }
export const MAX_FILE_BYTES = 12 * 1024 * 1024
export const MAX_STORED_BYTES = 2 * 1024 * 1024
export function imageFormat(bytes: Uint8Array): boolean {
  return (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ||
    ([137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)) ||
    (String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP")
}
export function position(value: number): number { return Math.min(.98, Math.max(.02, Number.isFinite(value) ? value : .5)) }
export function makeZone(kind: ZoneKind, x: number, y: number): Zone {
  return { id: crypto.randomUUID(), kind, x: position(x), y: position(y), note: "", outcome: "untested" }
}
