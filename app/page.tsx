"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Music, Guitar, Briefcase, ChevronDown, Check, Ruler, BarChart3, FileText, Lock } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageToggle } from "@/components/LanguageToggle"
import { ReportPreview } from "@/components/ReportPreview"
import { useT } from "@/lib/i18n"

type Mode = "music" | "instrument" | "work"

const MODE_MAP: Record<Mode, { icon: typeof Music; goalKey: Mode }> = {
  music: { icon: Music, goalKey: "music" },
  instrument: { icon: Guitar, goalKey: "instrument" },
  work: { icon: Briefcase, goalKey: "work" },
}

export default function LandingPage() {
  const { t } = useT()
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<Mode>("music")
  const [methodOpen, setMethodOpen] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Restore mode from localStorage if previously selected
  useEffect(() => {
    const stored = localStorage.getItem("roomtuner_mode")
    if (stored && (stored === "music" || stored === "instrument" || stored === "work")) {
      setSelectedMode(stored)
    }
  }, [])

  const modes: { key: Mode; label: string; desc: string; bullets: string[] }[] = [
    {
      key: "music",
      label: t.landing.modeMusic,
      desc: t.landing.modeMusicDesc,
      bullets: [t.landing.bulletMusic1, t.landing.bulletMusic2, t.landing.bulletMusic3],
    },
    {
      key: "instrument",
      label: t.landing.modeStudio,
      desc: t.landing.modeStudioDesc,
      bullets: [t.landing.bulletStudio1, t.landing.bulletStudio2, t.landing.bulletStudio3],
    },
    {
      key: "work",
      label: t.landing.modeWork,
      desc: t.landing.modeWorkDesc,
      bullets: [t.landing.bulletWork1, t.landing.bulletWork2, t.landing.bulletWork3],
    },
  ]

  const current = modes.find((m) => m.key === selectedMode)!

  const handleStart = () => {
    localStorage.setItem("roomtuner_mode", selectedMode)
    router.push("/objetivo")
  }

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Top bar */}
      <div className="container max-w-4xl mx-auto px-4 pt-4 flex justify-end gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* ── HERO ── */}
      <section className="container max-w-4xl mx-auto px-4 pt-10 pb-6 md:pt-16 md:pb-10">
        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
            {t.landing.heroH1}{" "}
            <span className="text-primary">{t.landing.heroH1Highlight}</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            {t.landing.heroSubtitle}
          </p>
        </div>

        {/* Bullets (change per mode) */}
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          {current.bullets.map((b, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-primary/5 border border-primary/10 rounded-full px-3 py-1.5"
            >
              <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
              {b}
            </span>
          ))}
        </div>

        {/* ── MODE SELECTOR ── */}
        <div className="mt-8">
          <p className="text-xs text-muted-foreground text-center mb-3 font-medium uppercase tracking-wide">
            {t.landing.modeTitle}
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {modes.map((m) => {
              const Icon = MODE_MAP[m.key].icon
              const isActive = selectedMode === m.key
              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedMode(m.key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-150 ${
                    isActive
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {m.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Mode description */}
          <p className="text-sm text-muted-foreground text-center mt-4 max-w-sm mx-auto">
            {current.desc}
          </p>
        </div>

        {/* ── CTAs ── */}
        <div className="flex flex-col items-center gap-3 mt-8">
          <button
            onClick={handleStart}
            className="w-full max-w-xs bg-primary text-primary-foreground py-3.5 px-8 font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-150"
          >
            {t.landing.ctaStart}
          </button>
          <button
            onClick={scrollToPreview}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.landing.ctaExample}
          </button>
        </div>
      </section>

      {/* ── FREE vs PAID ── */}
      <section className="container max-w-4xl mx-auto px-4 py-10 border-t border-border">
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-2">
          {t.landing.freeVsPaidTitle}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {t.landing.freeVsPaidSubtitle}
        </p>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-3 flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">{t.landing.freeTitle}</h3>
            <ul className="space-y-2 flex-1">
              {[t.landing.freeItem1, t.landing.freeItem2, t.landing.freeItem3, t.landing.freeItem4].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={handleStart}
              className="w-full mt-2 py-2.5 px-4 text-xs font-semibold rounded-xl border border-primary text-primary hover:bg-primary/5 transition-colors"
            >
              {t.landing.freeCta}
            </button>
          </div>
          {/* Paid */}
          <div className="bg-card rounded-2xl card-shadow border-2 border-primary/30 p-5 space-y-3 flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">{t.landing.paidTitle}</h3>
            <ul className="space-y-2 flex-1">
              {[t.landing.paidItem1, t.landing.paidItem2, t.landing.paidItem3, t.landing.paidItem4].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => alert(t.landing.paidComingSoon)}
              className="w-full mt-2 py-2.5 px-4 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-colors flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              {t.landing.paidCta}
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="container max-w-4xl mx-auto px-4 py-10 border-t border-border">
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8">
          {t.landing.howItWorks}
        </h2>
        <div className="grid md:grid-cols-3 gap-5 max-w-2xl mx-auto">
          {[
            { step: "01", Icon: Ruler, title: t.landing.step1Title, desc: t.landing.step1Desc },
            { step: "02", Icon: BarChart3, title: t.landing.step2Title, desc: t.landing.step2Desc },
            { step: "03", Icon: FileText, title: t.landing.step3Title, desc: t.landing.step3Desc },
          ].map((s) => (
            <div key={s.step} className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-2 text-center">
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <div className="inline-flex items-center justify-center w-7 h-7 bg-primary text-primary-foreground font-bold text-xs rounded-lg">
                {s.step}
              </div>
              <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── REPORT PREVIEW ── */}
      <section ref={previewRef} className="container max-w-4xl mx-auto px-4 py-10 border-t border-border">
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-3">
          {t.landing.reportExample}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">{t.landing.reportExampleDesc}</p>
        <ReportPreview />
      </section>

      {/* ── METHODOLOGY (collapsible) ── */}
      <section className="container max-w-4xl mx-auto px-4 py-10 border-t border-border">
        <button
          onClick={() => setMethodOpen(!methodOpen)}
          className="flex items-center justify-center gap-2 mx-auto text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t.landing.methodologyTitle}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${methodOpen ? "rotate-180" : ""}`}
          />
        </button>
        {methodOpen && (
          <div className="mt-4 bg-card rounded-2xl card-shadow border border-border/50 p-5 max-w-lg mx-auto space-y-3">
            <ul className="space-y-2">
              {[
                t.landing.methodologyItem1,
                t.landing.methodologyItem2,
                t.landing.methodologyItem3,
                t.landing.methodologyItem4,
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="text-primary font-bold">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
              {t.landing.methodologyDisclaimer}
            </p>
          </div>
        )}
      </section>

      {/* ── FINAL CTA ── */}
      <section className="container max-w-4xl mx-auto px-4 py-12 border-t border-border">
        <div className="bg-card rounded-2xl card-shadow border border-border/50 p-8 md:p-10 text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {t.landing.finalCtaTitle}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t.landing.finalCtaDesc}
          </p>
          <button
            onClick={handleStart}
            className="inline-flex items-center justify-center bg-primary text-primary-foreground py-3.5 px-8 font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-150"
          >
            {t.landing.ctaStart}
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="container max-w-4xl mx-auto px-4 py-8 border-t border-border">
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">{t.landing.footerTagline}</p>
          <p className="text-xs text-muted-foreground/70">{t.landing.footerDisclaimer}</p>
        </div>
      </footer>
    </div>
  )
}
