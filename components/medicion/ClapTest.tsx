"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Hand, RotateCcw } from "lucide-react"
import { AudioMeasurementEngine, type ClapTestResult } from "@/lib/audioMeasurement"
import { useT } from "@/lib/i18n"

interface ClapTestProps {
  onComplete: (result: ClapTestResult) => void
  onSkip: () => void
  onError?: (error: string) => void
}

type ClapState = "idle" | "measuring_floor" | "waiting_clap" | "decay" | "done"

export function ClapTest({ onComplete, onSkip, onError }: ClapTestProps) {
  const { t } = useT()
  const [state, setState] = useState<ClapState>("idle")
  const [result, setResult] = useState<ClapTestResult | null>(null)
  const [noiseFloor, setNoiseFloor] = useState(0)
  const engineRef = useRef<AudioMeasurementEngine | null>(null)

  const start = useCallback(async () => {
    const engine = new AudioMeasurementEngine()
    engineRef.current = engine

    const ok = await engine.requestPermission()
    if (!ok) {
      onError?.(t.medicion.permissionDenied)
      return
    }

    setState("measuring_floor")

    engine.startClapDetection(
      // onNoiseFloor
      (db) => {
        setNoiseFloor(Math.round(db))
      },
      // onDetected
      () => {
        setState("decay")
      },
      // onDecay
      () => {
        // Decay curve updating — we check when it's done
        // The engine stops automatically, then we call analyzeClapResult
        setTimeout(() => {
          const clapResult = engine.analyzeClapResult()
          if (clapResult) {
            setResult(clapResult)
            setState("done")
            onComplete(clapResult)
          }
          engine.dispose()
        }, 3500) // Wait for decay capture to finish (max 3s + buffer)
      }
    )

    // After 500ms floor measurement, transition to waiting
    setTimeout(() => {
      setState((prev) => (prev === "measuring_floor" ? "waiting_clap" : prev))
    }, 600)
  }, [onComplete, onError, t.medicion.permissionDenied])

  const retry = useCallback(() => {
    engineRef.current?.dispose()
    setResult(null)
    setState("idle")
    start()
  }, [start])

  useEffect(() => {
    return () => {
      engineRef.current?.dispose()
    }
  }, [])

  const confidenceLabel = (c: string) => {
    if (c === "high") return t.medicion.clapTestConfidenceHigh
    if (c === "medium") return t.medicion.clapTestConfidenceMedium
    return t.medicion.clapTestConfidenceLow
  }

  const confidenceColor = (c: string) => {
    if (c === "high") return "bg-green-500/10 text-green-600"
    if (c === "medium") return "bg-yellow-500/10 text-yellow-600"
    return "bg-red-500/10 text-red-600"
  }

  // Done state
  if (state === "done" && result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Hand className="w-5 h-5" />
          <span className="text-sm font-semibold">{t.medicion.clapTestComplete}</span>
        </div>

        <div className="bg-muted rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t.medicion.clapTestRT60}</span>
            <span className="text-2xl font-semibold font-mono text-foreground">{result.rt60.toFixed(2)}s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t.medicion.clapTestConfidence}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${confidenceColor(result.confidence)}`}>
              {confidenceLabel(result.confidence)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t.medicion.clapTestSnr}</span>
            <span className="text-sm font-mono text-foreground">
              {(result.peakAmplitude - result.noiseFloor).toFixed(0)} dB
            </span>
          </div>
        </div>

        <button
          onClick={retry}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          {t.medicion.clapTestRetry}
        </button>
      </div>
    )
  }

  // Idle state — show start button
  if (state === "idle") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t.medicion.clapTestTitle}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t.medicion.clapTestDesc}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={start}
            className="flex-1 bg-primary text-primary-foreground py-3 px-4 font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {t.medicion.clapTestStart}
          </button>
          <button
            onClick={onSkip}
            className="flex-1 bg-secondary text-secondary-foreground py-3 px-4 font-semibold text-sm rounded-xl hover:bg-secondary/80 active:scale-[0.98] transition-all"
          >
            {t.medicion.clapTestSkip}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">{t.medicion.clapTestTip}</p>
      </div>
    )
  }

  // Active measurement states
  const statusText =
    state === "measuring_floor" ? t.medicion.clapTestMeasuringFloor :
    state === "waiting_clap" ? t.medicion.clapTestWaiting :
    state === "decay" ? t.medicion.clapTestDetected : ""

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Hand className={`w-5 h-5 ${state === "waiting_clap" ? "animate-bounce" : "animate-pulse"}`} />
        <span className="text-sm font-semibold">{statusText}</span>
      </div>

      {/* Visual feedback */}
      <div className="flex justify-center py-4">
        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all ${
          state === "waiting_clap"
            ? "border-primary bg-primary/5 animate-pulse"
            : state === "decay"
              ? "border-green-500 bg-green-500/5"
              : "border-muted-foreground/30 bg-muted"
        }`}>
          <span className="text-3xl">
            {state === "waiting_clap" ? "👏" : state === "decay" ? "📉" : "🎤"}
          </span>
        </div>
      </div>

      {state === "measuring_floor" && (
        <p className="text-xs text-muted-foreground text-center">
          {t.medicion.noiseLevel}: {noiseFloor} dB
        </p>
      )}
    </div>
  )
}
