"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Ruler, BarChart3, FileText, Lock } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageToggle } from "@/components/LanguageToggle"
import { Button } from "@/components/Button"
import { StandingWaveMotif } from "@/components/motifs/StandingWaveMotif"
import { useT } from "@/lib/i18n"
import { PAYWALL_ENABLED } from "@/lib/paywall"

export default function LandingPage() {
  const { t } = useT()
  const router = useRouter()
  const [methodOpen, setMethodOpen] = useState(false)

  const handleStart = () => {
    router.push("/objetivo")
  }

  const scrollToPreview = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Top bar */}
      <div className="container max-w-4xl mx-auto px-4 pt-4 flex justify-end gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* ── HERO ── */}
      <section className="container max-w-4xl mx-auto px-4 pt-6 pb-6 md:pt-10 md:pb-10">
        <StandingWaveMotif variant="hero" animated className="h-24 md:h-28 w-full mb-6" />

        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
            {t.landing.heroH1}{" "}
            <span className="text-primary">{t.landing.heroH1Highlight}</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            {t.landing.heroSubtitle}
          </p>
        </div>

        {/* ── CTAs ── */}
        <div className="flex flex-col items-center gap-3 mt-8">
          <Button onClick={handleStart} className="w-full max-w-xs">
            {t.landing.ctaStart}
          </Button>
          <button
            onClick={scrollToPreview}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.landing.ctaExample}
          </button>
        </div>
      </section>

      {/* ── FREE vs PAID ── */}
      {/* Hidden while the paywall is dormant: during open testing the full report and
          the PDF are free for everyone, so a locked tier here would misdescribe the
          product. Comes back with the paywall. */}
      {PAYWALL_ENABLED && (
      <section id="how-it-works" className="container max-w-4xl mx-auto px-4 py-10 border-t border-border">
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-2">
          {t.landing.freeVsPaidTitle}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {t.landing.freeVsPaidSubtitle}
        </p>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Free */}
          <div className="border border-border p-5 space-y-3 flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">{t.landing.freeTitle}</h3>
            <ul className="space-y-2 flex-1">
              {[t.landing.freeItem1, t.landing.freeItem2, t.landing.freeItem3, t.landing.freeItem4].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 border border-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button onClick={handleStart} variant="secondary" className="w-full mt-2">
              {t.landing.freeCta}
            </Button>
          </div>
          {/* Paid */}
          <div className="relative border-2 border-primary p-5 space-y-3 flex flex-col">
            <span aria-hidden className="absolute -top-[3px] -left-[3px] h-2 w-2 border-t-2 border-l-2 border-primary" />
            <span aria-hidden className="absolute -bottom-[3px] -right-[3px] h-2 w-2 border-b-2 border-r-2 border-primary" />
            <h3 className="text-sm font-semibold text-foreground">{t.landing.paidTitle}</h3>
            <ul className="space-y-2 flex-1">
              {[t.landing.paidItem1, t.landing.paidItem2, t.landing.paidItem3, t.landing.paidItem4].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => alert(t.landing.paidComingSoon)}
              className="w-full mt-2 py-3 px-4 text-xs font-medium uppercase tracking-wider border border-primary bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              {t.landing.paidCta}
            </button>
          </div>
        </div>
      </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="container max-w-4xl mx-auto px-4 py-10 border-t border-border">
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8">
          {t.landing.howItWorks}
        </h2>
        <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { step: "01", Icon: Ruler, title: t.landing.step1Title, desc: t.landing.step1Desc },
            { step: "02", Icon: BarChart3, title: t.landing.step2Title, desc: t.landing.step2Desc },
            { step: "03", Icon: FileText, title: t.landing.step3Title, desc: t.landing.step3Desc },
          ].map((s) => (
            <div key={s.step} className="border border-border p-5 space-y-2.5 text-center">
              <s.Icon className="w-5 h-5 text-primary mx-auto" strokeWidth={1.5} />
              <p className="font-mono text-[10px] text-muted-foreground tracking-[0.2em]">{s.step}</p>
              <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
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
          <div className="mt-4 border border-border p-5 max-w-lg mx-auto space-y-3">
            <ul className="space-y-2">
              {[
                t.landing.methodologyItem1,
                t.landing.methodologyItem2,
                t.landing.methodologyItem3,
                t.landing.methodologyItem4,
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="font-mono text-primary">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground italic border-t border-dotted border-border pt-3">
              {t.landing.methodologyDisclaimer}
            </p>
          </div>
        )}
      </section>

      {/* ── FINAL CTA ── */}
      <section className="container max-w-4xl mx-auto px-4 py-12 border-t border-border">
        <StandingWaveMotif variant="divider" className="h-5 w-full mb-8" />
        <div className="border border-border p-8 md:p-10 text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {t.landing.finalCtaTitle}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t.landing.finalCtaDesc}
          </p>
          <Button onClick={handleStart} className="inline-flex">
            {t.landing.ctaStart}
          </Button>
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
