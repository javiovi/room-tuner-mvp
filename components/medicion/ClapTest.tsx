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

type ClapState = "idle" | "requesting" | "measuring_floor" | "waiting_clap" | "decay" | "done"

export function ClapTest({ onComplete, onSkip, onError }: ClapTestProps) {
  const { t } = useT()
  const [state, setState] = useState<ClapState>("idle")
  const [result, setResult] = useState<ClapTestResult | null>(null)
  const [noiseFloor, setNoiseFloor] = useState(0)
  const engineRef = useRef<AudioMeasurementEngine | null>(null)

  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([])

  const stop = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    engineRef.current?.dispose()
    engineRef.current = null
  }, [])

  const start = useCallback(async () => {
    stop()
    setResult(null)
    setState("requesting")
    const engine = new AudioMeasurementEngine()
    engineRef.current = engine
    const active = () => engineRef.current === engine
    const fail = (message: string) => {
      if (!active()) return
      stop()
      setState("idle")
      onError?.(message)
    }
    const ok = await engine.requestPermission()
    if (!active()) return
    if (!ok) {
      fail(t.medicion.audioErrors[engine.error])
      return
    }
    setState("measuring_floor")
    // Stop waiting indefinitely when silence/no impulse is detected.
    const waitTimer = setTimeout(() => fail(t.medicion.clapTimeout), 12_000)
    timersRef.current.push(waitTimer)
    engine.startClapDetection(
      (db) => { if (active()) setNoiseFloor(Math.round(db)) },
      () => { if (active()) { clearTimeout(waitTimer); setState("decay") } },
      () => {},
      () => {
        if (!active()) return
        const clapResult = engine.analyzeClapResult()
        if (!clapResult || !Number.isFinite(clapResult.rt60)) {
          fail(t.medicion.clapInvalid)
          return
        }
        stop()
        setResult(clapResult)
        setState("done")
        onComplete(clapResult)
      }
    )
    timersRef.current.push(setTimeout(() => {
      if (active()) setState((prev) => prev === "measuring_floor" ? "waiting_clap" : prev)
    }, 600))
  }, [onComplete, onError, stop, t.medicion])

  const retry = useCallback(() => { void start() }, [start])
  const skip = () => { stop(); onSkip() }
  const cancel = () => { stop(); setState("idle") }
  useEffect(() => stop, [stop])

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
            onClick={skip}
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
    state === "requesting" ? t.medicion.requesting :
    state === "measuring_floor" ? t.medicion.clapTestMeasuringFloor :
    state === "waiting_clap" ? t.medicion.clapTestWaiting :
    state === "decay" ? t.medicion.clapTestDetected : ""

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Hand className={`w-5 h-5 ${state === "waiting_clap" ? "animate-bounce" : "animate-pulse"}`} />
        <span className="text-sm font-semibold">{statusText}</span>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={cancel} className="flex-1 border border-border rounded-sm p-3 text-sm">{t.medicion.cancel}</button>
        <button type="button" onClick={skip} className="flex-1 border border-border rounded-sm p-3 text-sm">{t.medicion.clapTestSkip}</button>
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
          {t.medicion.noiseLevel}: {noiseFloor} · {t.experiments.relative}
        </p>
      )}
    </div>
  )
}
