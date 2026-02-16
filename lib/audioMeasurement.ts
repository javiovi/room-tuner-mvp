// Web Audio API engine for microphone noise level measurement and clap test RT60

export interface NoiseMeasurementResult {
  averageDb: number
  peakDb: number
  classification: 'muy_silencioso' | 'silencioso' | 'normal' | 'ruidoso' | 'muy_ruidoso'
  duration: number // ms
}

export interface ClapTestResult {
  rt60: number // estimated RT60 in seconds
  method: 'T20' | 'T30'
  confidence: 'low' | 'medium' | 'high'
  peakAmplitude: number // peak dB
  noiseFloor: number // ambient noise floor dB
  decayCurve: Array<{ time: number; amplitude: number }>
}

// dB SPL offset (uncalibrated approximation from dBFS)
const DB_OFFSET = 94

function rmsToDb(rms: number): number {
  const dbFS = 20 * Math.log10(rms + 1e-10)
  return Math.max(0, Math.min(120, dbFS + DB_OFFSET))
}

export function classifyNoiseLevel(db: number): NoiseMeasurementResult['classification'] {
  if (db < 30) return 'muy_silencioso'
  if (db < 40) return 'silencioso'
  if (db < 55) return 'normal'
  if (db < 70) return 'ruidoso'
  return 'muy_ruidoso'
}

export function isAudioSupported(): boolean {
  return typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof AudioContext !== 'undefined'
}

export class AudioMeasurementEngine {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private stream: MediaStream | null = null
  private dataArray: Float32Array | null = null
  private animFrameId: number = 0
  private noiseReadings: number[] = []
  private startTime: number = 0

  // Clap test state
  private noiseFloorDb: number = 0
  private peakLevel: number = -Infinity
  private decayCurve: Array<{ time: number; amplitude: number }> = []

  async requestPermission(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      })
      this.audioContext = new AudioContext()
      const source = this.audioContext.createMediaStreamSource(this.stream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.8
      source.connect(this.analyser)
      this.dataArray = new Float32Array(this.analyser.fftSize)
      return true
    } catch {
      return false
    }
  }

  private getRms(): number {
    if (!this.analyser || !this.dataArray) return 0
    this.analyser.getFloatTimeDomainData(this.dataArray)
    let sum = 0
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i]
    }
    return Math.sqrt(sum / this.dataArray.length)
  }

  startNoiseLevel(onLevel: (db: number) => void): void {
    this.noiseReadings = []
    this.startTime = performance.now()

    const loop = () => {
      const rms = this.getRms()
      const db = rmsToDb(rms)
      this.noiseReadings.push(db)
      onLevel(db)
      this.animFrameId = requestAnimationFrame(loop)
    }
    loop()
  }

  stopNoiseLevel(): NoiseMeasurementResult {
    cancelAnimationFrame(this.animFrameId)
    const duration = performance.now() - this.startTime

    if (this.noiseReadings.length === 0) {
      return { averageDb: 0, peakDb: 0, classification: 'normal', duration: 0 }
    }

    const averageDb = Math.round(
      this.noiseReadings.reduce((a, b) => a + b, 0) / this.noiseReadings.length
    )
    const peakDb = Math.round(Math.max(...this.noiseReadings))
    const classification = classifyNoiseLevel(averageDb)

    return { averageDb, peakDb, classification, duration }
  }

  startClapDetection(
    onNoiseFloor: (db: number) => void,
    onDetected: () => void,
    onDecay: (curve: Array<{ time: number; amplitude: number }>) => void
  ): void {
    // Phase 1: measure noise floor for 500ms
    const floorReadings: number[] = []
    const floorStart = performance.now()

    const measureFloor = () => {
      const rms = this.getRms()
      const db = rmsToDb(rms)
      floorReadings.push(db)
      onNoiseFloor(db)

      if (performance.now() - floorStart < 500) {
        this.animFrameId = requestAnimationFrame(measureFloor)
        return
      }

      // Floor measured
      this.noiseFloorDb = floorReadings.reduce((a, b) => a + b, 0) / floorReadings.length
      const threshold = this.noiseFloorDb + 20

      // Phase 2: wait for impulse
      const detectImpulse = () => {
        if (!this.dataArray) return
        this.analyser!.getFloatTimeDomainData(this.dataArray)
        let peak = 0
        for (let i = 0; i < this.dataArray.length; i++) {
          peak = Math.max(peak, Math.abs(this.dataArray[i]))
        }
        const peakDb = rmsToDb(peak)

        if (peakDb > threshold) {
          onDetected()
          this.captureDecay(onDecay)
          return
        }
        this.animFrameId = requestAnimationFrame(detectImpulse)
      }
      detectImpulse()
    }
    measureFloor()
  }

  private captureDecay(onDecay: (curve: Array<{ time: number; amplitude: number }>) => void): void {
    this.decayCurve = []
    this.peakLevel = -Infinity
    const captureStart = performance.now()

    const loop = () => {
      const rms = this.getRms()
      const db = rmsToDb(rms)
      const elapsed = performance.now() - captureStart

      if (elapsed < 50) {
        this.peakLevel = Math.max(this.peakLevel, db)
      }

      this.decayCurve.push({ time: elapsed, amplitude: db })
      onDecay([...this.decayCurve])

      if (elapsed > 3000 || (elapsed > 200 && db < this.noiseFloorDb + 3)) {
        cancelAnimationFrame(this.animFrameId)
        return
      }
      this.animFrameId = requestAnimationFrame(loop)
    }
    loop()
  }

  analyzeClapResult(): ClapTestResult | null {
    if (this.decayCurve.length < 10) return null

    const peak = this.peakLevel
    const snr = peak - this.noiseFloorDb

    // T20 method: find time from -5dB to -25dB below peak
    const level5 = peak - 5
    const level25 = peak - 25
    const level35 = peak - 35

    const findTimeAtLevel = (targetDb: number): number | null => {
      // Search for the first point after the peak that crosses below targetDb
      let pastPeak = false
      for (const point of this.decayCurve) {
        if (point.amplitude >= peak - 1) pastPeak = true
        if (pastPeak && point.amplitude <= targetDb) return point.time
      }
      return null
    }

    const time5 = findTimeAtLevel(level5)
    const time25 = findTimeAtLevel(level25)
    const time35 = findTimeAtLevel(level35)

    let rt60: number
    let method: 'T20' | 'T30'
    let confidence: 'low' | 'medium' | 'high'

    if (time5 != null && time35 != null) {
      // T30 method (more accurate)
      const T30 = (time35 - time5) / 1000 // to seconds
      rt60 = Math.round(T30 * 2 * 100) / 100 // extrapolate T30→T60
      method = 'T30'
      confidence = snr > 40 ? 'high' : snr > 25 ? 'medium' : 'low'
    } else if (time5 != null && time25 != null) {
      // T20 method
      const T20 = (time25 - time5) / 1000
      rt60 = Math.round(T20 * 3 * 100) / 100 // extrapolate T20→T60
      method = 'T20'
      confidence = snr > 35 ? 'medium' : 'low'
    } else {
      // Fallback: rough estimate from entire curve
      const lastPoint = this.decayCurve[this.decayCurve.length - 1]
      if (lastPoint && lastPoint.time > 0) {
        const decay = peak - lastPoint.amplitude
        if (decay > 5) {
          rt60 = Math.round(((60 / decay) * lastPoint.time / 1000) * 100) / 100
        } else {
          rt60 = 0
        }
      } else {
        rt60 = 0
      }
      method = 'T20'
      confidence = 'low'
    }

    // Clamp to reasonable range
    rt60 = Math.max(0.05, Math.min(5, rt60))

    return {
      rt60,
      method,
      confidence,
      peakAmplitude: Math.round(peak),
      noiseFloor: Math.round(this.noiseFloorDb),
      decayCurve: this.decayCurve,
    }
  }

  stopListening(): void {
    cancelAnimationFrame(this.animFrameId)
  }

  dispose(): void {
    cancelAnimationFrame(this.animFrameId)
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop())
      this.stream = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.analyser = null
    this.dataArray = null
  }
}
