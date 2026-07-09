"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { getStandingWaveLayers, HERO_ROOM } from "@/lib/motifGenerator"

interface StandingWaveMotifProps {
  variant?: "hero" | "divider"
  room?: { length: number; width: number; height: number }
  /** Keeps one wave layer in constant sinusoidal motion instead of a frozen frame.
   * No-ops under prefers-reduced-motion. */
  animated?: boolean
  className?: string
}

/** Blueprint grammar: baseline + measurement ticks + thin standing-wave traces derived
 * from real room-mode physics (see lib/motifGenerator.ts), not a decorative waveform. */
export function StandingWaveMotif({
  variant = "hero",
  room = HERO_ROOM,
  animated = false,
  className,
}: StandingWaveMotifProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const layers = getStandingWaveLayers(room.length, room.width, room.height, variant === "hero" ? 4 : 2)
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const shouldAnimate = animated && !reduceMotion
    // Middle layer loops continuously; the rest stay frozen at a fixed phase — one
    // moving trace reads as "live," all three moving would just be noise.
    const animatedIndex = layers.length > 1 ? 1 : 0

    function draw(t: number) {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas!.getBoundingClientRect()
      const w = Math.max(rect.width, 1)
      const h = Math.max(rect.height, 1)
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      const ctx = canvas!.getContext("2d")
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const root = getComputedStyle(document.documentElement)
      const border = root.getPropertyValue("--border").trim() || "#d7e0e7"
      const primary = root.getPropertyValue("--primary").trim() || "#0284c7"

      ctx.strokeStyle = border
      ctx.globalAlpha = 0.9
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, h / 2)
      ctx.lineTo(w, h / 2)
      ctx.stroke()
      ctx.globalAlpha = 0.55
      for (let tx = 6; tx < w; tx += 18) {
        ctx.beginPath()
        ctx.moveTo(tx, h / 2 - 3)
        ctx.lineTo(tx, h / 2 + 3)
        ctx.stroke()
      }

      const baseAmp = (h / 2) * (variant === "hero" ? 0.62 : 0.85)
      layers.forEach((layer, i) => {
        const phase = shouldAnimate && i === animatedIndex ? t * 0.0012 : 0.35
        ctx.beginPath()
        for (let x = 0; x <= w; x += 2) {
          const tx = x / w
          const y = h / 2 + baseAmp * layer.amp * Math.sin(tx * Math.PI * 2 * layer.freq + phase + i * 0.6)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = primary
        ctx.globalAlpha = 0.55 / (i + 1) + 0.12
        ctx.lineWidth = 1.4
        ctx.stroke()
      })
      ctx.globalAlpha = 1
    }

    draw(0)

    let rafId: number | null = null
    if (shouldAnimate) {
      const loop = (t: number) => {
        draw(t)
        rafId = requestAnimationFrame(loop)
      }
      rafId = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(() => draw(0))
    ro.observe(canvas)
    return () => {
      ro.disconnect()
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [room.length, room.width, room.height, variant, resolvedTheme, animated])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
