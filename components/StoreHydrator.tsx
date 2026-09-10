"use client"

import { useEffect } from "react"
import { rehydrateRoomStore } from "@/lib/roomStore"

/**
 * Reads the wizard back out of sessionStorage once, after mount.
 *
 * The store is configured with `skipHydration` so that the first client render matches the
 * prerendered HTML; this is what actually restores it. It lives in the root layout so it
 * runs no matter which page the user lands on, and it renders nothing.
 *
 * Layout effects run after the effects of the pages nested inside it, so any page waiting
 * on `useRoomHydrated()` has already registered its listener by the time this fires.
 */
export function StoreHydrator() {
  useEffect(() => {
    void rehydrateRoomStore()
  }, [])

  return null
}
