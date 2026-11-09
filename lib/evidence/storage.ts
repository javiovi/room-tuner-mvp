import type { RoomEvidence } from "./model"
import { MAX_STORED_BYTES } from "./model"
const DB_NAME = "roomtuner-evidence-v1"
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = ()=>request.result.createObjectStore("rooms", { keyPath: "reportKey" })
    request.onsuccess = ()=>resolve(request.result)
    request.onerror = ()=>reject(request.error)
    request.onblocked = ()=>reject(new Error("blocked"))
  })
}
export async function loadEvidence(reportKey: string): Promise<RoomEvidence | undefined> {
  const db = await openDB()
  try {
    return await new Promise((resolve,reject)=>{
      const tx = db.transaction("rooms", "readonly")
      const request = tx.objectStore("rooms").get(reportKey)
      tx.oncomplete = ()=>resolve(request.result)
      tx.onabort = ()=>reject(tx.error)
    })
  } finally { db.close() }
}
export async function saveEvidence(value: RoomEvidence): Promise<void> {
  if (value.photo.size > MAX_STORED_BYTES || value.zones.length > 12) throw new Error("limit")
  const db = await openDB()
  try {
    await new Promise<void>((resolve,reject)=>{
      const tx = db.transaction("rooms", "readwrite"), store = tx.objectStore("rooms")
      // A bounded local collection: at most ten rooms, no silent eviction.
      const keys = store.getAllKeys()
      keys.onsuccess = ()=>{
        if (keys.result.length >= 10 && !keys.result.includes(value.reportKey)) { tx.abort(); return }
        try { store.put(value) } catch { tx.abort() }
      }
      tx.oncomplete = ()=>resolve()
      tx.onabort = ()=>reject(tx.error ?? new Error("limit"))
      tx.onerror = ()=>reject(tx.error)
    })
  } finally { db.close() }
}
export async function deleteEvidence(reportKey: string): Promise<void> {
  const db = await openDB()
  try {
    await new Promise<void>((resolve,reject)=>{
      const tx = db.transaction("rooms", "readwrite")
      tx.objectStore("rooms").delete(reportKey)
      tx.oncomplete = ()=>resolve()
      tx.onabort = ()=>reject(tx.error)
    })
  } finally { db.close() }
}
