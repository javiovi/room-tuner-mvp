"use client"

import { useEffect, useState } from "react"
import { loadEvidence } from "@/lib/evidence/storage"
import { useT } from "@/lib/i18n"

type Point = { x: number; y: number }
export function LocalRoomImage({ reportKey, onMark, mark }: { reportKey: string; onMark?: (point: Point) => void; mark?: Point }) {
  const { locale } = useT()
  const [url, setUrl] = useState("")
  const [storedMark, setStoredMark] = useState<Point>()
  const visibleMark = mark ?? storedMark
  useEffect(() => {
    let active = true
    let source = ""
    setUrl("")
    setStoredMark(undefined)
    loadEvidence(reportKey).then(record => {
      if (active && record) {
        setStoredMark(record.zones[0])
        source = URL.createObjectURL(record.photo)
        setUrl(source)
      }
    }).catch(() => {})
    return () => { active = false; if (source) URL.revokeObjectURL(source) }
  }, [reportKey])
  return url ? <div className="relative">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="w-full h-auto" src={url} alt={locale === "es" ? "Tu habitación" : "Your room"} />
    {onMark && <button type="button" className="absolute inset-0 w-full cursor-crosshair" aria-label={locale === "es" ? "Marcar entrada sospechada" : "Mark suspected entry"} onClick={event => {
      const bounds = event.currentTarget.getBoundingClientRect()
      onMark(event.detail === 0 ? { x: .5, y: .5 } : { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height })
    }}/>}
    {visibleMark && <span aria-hidden className="absolute pointer-events-none rounded-full border-2 border-primary bg-background h-5 w-5 -translate-x-1/2 -translate-y-1/2" style={{left: `${visibleMark.x * 100}%`, top: `${visibleMark.y * 100}%`}}/>}
  </div> : null
}
