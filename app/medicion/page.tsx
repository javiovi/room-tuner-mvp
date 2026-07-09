"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Mic, MicOff } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { Button } from "@/components/Button"
import { NoiseLevelMeter } from "@/components/medicion/NoiseLevelMeter"
import { ClapTest } from "@/components/medicion/ClapTest"
import { useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"
import { isAudioSupported } from "@/lib/audioMeasurement"
import type { NoiseMeasurementResult, ClapTestResult } from "@/lib/audioMeasurement"

type MeasurementStep = "idle" | "noise" | "noise_done" | "clap" | "done"

export default function MedicionPage() {
  const { t } = useT()
  const router = useRouter()
  const updateProject = useRoomStore((s) => s.updateProject)
  const [step, setStep] = useState<MeasurementStep>("idle")
  const [noiseResult, setNoiseResult] = useState<NoiseMeasurementResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const audioSupported = isAudioSupported()

  const handleStartMeasurement = () => {
    setError(null)
    setStep("noise")
  }

  const handleNoiseComplete = (result: NoiseMeasurementResult) => {
    setNoiseResult(result)
    updateProject({
      noiseMeasurement: {
        taken: true,
        level: result.averageDb < 40 ? "tranquilo" : result.averageDb < 60 ? "normal" : "ruidoso",
        dbLevel: result.averageDb,
        classification: result.classification,
      }
    })
    setStep("noise_done")
  }

  const handleClapComplete = (result: ClapTestResult) => {
    updateProject({
      measuredRT60: {
        value: result.rt60,
        method: result.method,
        confidence: result.confidence,
      }
    })
    setStep("done")
  }

  const handleClapSkip = () => {
    setStep("done")
  }

  const handleContinue = () => {
    router.push("/analizando")
  }

  // Step indicators
  const steps = [
    { key: "noise", label: t.medicion.stepNoise },
    { key: "clap", label: t.medicion.stepClap },
    { key: "done", label: t.medicion.stepDone },
  ]

  const stepIndex = step === "idle" ? -1 : step === "noise" ? 0 : step === "noise_done" ? 0 : step === "clap" ? 1 : 2

  return (
    <CenteredLayout>
      <Link
        href="/muebles"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        {t.common.back}
      </Link>

      <div className="space-y-3 text-center">
        <h1 className="text-lg md:text-xl font-semibold text-foreground leading-snug">
          {t.medicion.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t.medicion.description}
        </p>
      </div>

      {/* Step progress (only shown when measuring) */}
      {step !== "idle" && (
        <div className="flex items-center justify-center gap-2 py-2">
          {steps.map((s, idx) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-sm border flex items-center justify-center text-xs font-mono font-semibold transition-colors ${
                idx <= stepIndex
                  ? "border-primary text-primary"
                  : "border-muted-foreground/40 text-muted-foreground"
              }`}>
                {idx + 1}
              </div>
              <span className={`text-xs ${idx <= stepIndex ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`w-6 h-px ${idx < stepIndex ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="border border-destructive/40 bg-destructive/5 text-destructive rounded-sm p-3 text-xs flex items-center gap-2">
          <MicOff className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content based on step */}
      <div className="space-y-4">
        {step === "idle" && (
          <>
            {!audioSupported ? (
              <div className="border border-border rounded-sm p-4 text-center space-y-2">
                <MicOff className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">{t.medicion.notSupported}</p>
              </div>
            ) : (
              <Button onClick={handleStartMeasurement} className="w-full flex items-center justify-center gap-2">
                <Mic className="w-4 h-4" />
                {t.medicion.measureButton}
              </Button>
            )}
            <Button variant="secondary" onClick={() => router.push("/analizando")} className="w-full">
              {t.medicion.skipButton}
            </Button>
          </>
        )}

        {step === "noise" && (
          <div className="bg-card border border-border rounded-sm p-4">
            <NoiseLevelMeter
              onComplete={handleNoiseComplete}
              onError={(err) => { setError(err); setStep("idle") }}
            />
          </div>
        )}

        {step === "noise_done" && (
          <div className="space-y-4">
            {/* Show noise result summary */}
            {noiseResult && (
              <div className="bg-card border border-border rounded-sm p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Mic className="w-4 h-4" />
                  <span className="text-xs font-semibold">{t.medicion.noiseComplete}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t.medicion.noiseAverage}</span>
                  <span className="text-lg font-semibold font-mono text-foreground">{noiseResult.averageDb} dB</span>
                </div>
              </div>
            )}

            {/* Clap test */}
            <div className="bg-card border border-border rounded-sm p-4">
              <ClapTest
                onComplete={handleClapComplete}
                onSkip={handleClapSkip}
                onError={(err) => setError(err)}
              />
            </div>
          </div>
        )}

        {step === "clap" && (
          <div className="bg-card border border-border rounded-sm p-4">
            <ClapTest
              onComplete={handleClapComplete}
              onSkip={handleClapSkip}
              onError={(err) => setError(err)}
            />
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4">
            <div className="border border-primary/30 rounded-sm p-4 text-center">
              <p className="text-sm font-semibold text-foreground">{t.medicion.measuringComplete}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {noiseResult && `${t.medicion.noiseLevel}: ${noiseResult.averageDb} dB`}
              </p>
            </div>
            <Button onClick={handleContinue} className="w-full">
              {t.medicion.continueToAnalysis}
            </Button>
          </div>
        )}
      </div>
    </CenteredLayout>
  )
}
