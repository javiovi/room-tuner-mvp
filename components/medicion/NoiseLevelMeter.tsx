"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff } from "lucide-react"
import { AudioMeasurementEngine, type NoiseMeasurementResult } from "@/lib/audioMeasurement"
import { useT } from "@/lib/i18n"

interface NoiseLevelMeterProps {
  duration?: number // seconds, default 5
  onComplete: (result: NoiseMeasurementResult) => void
  onError?: (error: string) => void
}

const MEASUREMENT_DURATION = 5 // seconds

function getBarColor(db: number): string {
  if (db < 30) return "bg-green-500"
  if (db < 40) return "bg-green-400"
  if (db < 55) return "bg-yellow-400"
  if (db < 70) return "bg-orange-400"
  return "bg-red-500"
}

function getClassificationKey(classification: NoiseMeasurementResult['classification']): string {
  const map: Record<string, string> = {
    muy_silencioso: "noiseClassMuySilencioso",
    silencioso: "noiseClassSilencioso",
    normal: "noiseClassNormal",
    ruidoso: "noiseClassRuidoso",
    muy_ruidoso: "noiseClassMuyRuidoso",
  }
  return map[classification] || "noiseClassNormal"
}

export function NoiseLevelMeter({ duration = MEASUREMENT_DURATION, onComplete, onError }: NoiseLevelMeterProps) {
  const { t } = useT()
  const [state, setState] = useState<"idle" | "measuring" | "done">("idle")
  const [currentDb, setCurrentDb] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(duration)
  const [result, setResult] = useState<NoiseMeasurementResult | null>(null)
  const engineRef = useRef<AudioMeasurementEngine | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startMeasurement = useCallback(async () => {
    const engine = new AudioMeasurementEngine()
    engineRef.current = engine

    const ok = await engine.requestPermission()
    if (!ok) {
      onError?.(t.medicion.permissionDenied)
      return
    }

    setState("measuring")
    setSecondsLeft(duration)

    engine.startNoiseLevel((db) => {
      setCurrentDb(Math.round(db))
    })

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Measurement complete
          if (timerRef.current) clearInterval(timerRef.current)
          const measureResult = engine.stopNoiseLevel()
          engine.dispose()
          setResult(measureResult)
          setState("done")
          onComplete(measureResult)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [duration, onComplete, onError, t.medicion.permissionDenied])

  useEffect(() => {
    startMeasurement()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      engineRef.current?.dispose()
    }
  }, [startMeasurement])

  if (state === "done" && result) {
    const classKey = getClassificationKey(result.classification) as keyof typeof t.medicion
    const classLabel = t.medicion[classKey] as string

    const resultMsg =
      result.averageDb < 40 ? t.medicion.noiseResultGood :
      result.averageDb < 60 ? t.medicion.noiseResultOk :
      t.medicion.noiseResultBad

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Mic className="w-5 h-5" />
          <span className="text-sm font-semibold">{t.medicion.noiseComplete}</span>
        </div>

        <div className="bg-muted rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t.medicion.noiseAverage}</span>
            <span className="text-2xl font-semibold font-mono text-foreground">{result.averageDb} dB</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t.medicion.noisePeak}</span>
            <span className="text-sm font-mono text-foreground">{result.peakDb} dB</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t.medicion.noiseLevel}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              result.averageDb < 40 ? "bg-green-500/10 text-green-600" :
              result.averageDb < 60 ? "bg-yellow-500/10 text-yellow-600" :
              "bg-red-500/10 text-red-600"
            }`}>
              {classLabel}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{resultMsg}</p>
      </div>
    )
  }

  // Measuring state
  const barWidth = Math.min(100, (currentDb / 90) * 100)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Mic className="w-5 h-5 animate-pulse" />
        <span className="text-sm font-semibold">{t.medicion.noiseMeasuring}</span>
      </div>

      {/* Level bar */}
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded-lg overflow-hidden relative">
          <div
            className={`h-full ${getBarColor(currentDb)} transition-all duration-150 rounded-lg`}
            style={{ width: `${barWidth}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-mono font-semibold text-foreground">
            {currentDb} dB
          </span>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
          <span>0</span>
          <span>30</span>
          <span>55</span>
          <span>70</span>
          <span>90+</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t.medicion.noiseTip}</span>
        <span className="font-mono font-semibold text-foreground">{secondsLeft}s</span>
      </div>
    </div>
  )
}
