"use client"

import Link from "next/link"
import { Music, Guitar, Briefcase } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageToggle } from "@/components/LanguageToggle"
import { ReportPreview } from "@/components/ReportPreview"
import { useT } from "@/lib/i18n"

export default function LandingPage() {
  const { t } = useT()

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Top bar */}
      <div className="container max-w-4xl mx-auto px-4 pt-4 flex justify-end gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Hero */}
      <section className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6">
          <span className="inline-flex items-center bg-primary/10 text-primary px-4 py-1.5 text-xs font-medium rounded-full">
            {t.common.beta}
          </span>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
            {t.landing.heroTitle1}
            <br />
            <span className="text-primary">{t.landing.heroTitle2}</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto">
            {t.landing.heroSubtitle}
          </p>

          <div className="pt-2">
            <Link
              href="/objetivo"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground py-4 px-8 font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-150"
            >
              {t.landing.ctaDemo}
            </Link>
            <p className="text-xs text-muted-foreground mt-3">{t.common.noRegistration}</p>
          </div>
        </div>
      </section>

      {/* App Preview Placeholder — future GIFs/screenshots go here */}
      <section className="container max-w-4xl mx-auto px-4 pb-12">
        <div className="rounded-2xl border border-border/50 bg-muted/30 p-8 md:p-12 flex items-center justify-center min-h-[280px]">
          <p className="text-sm text-muted-foreground/60 text-center">
            {t.landing.previewPlaceholder}
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="container max-w-4xl mx-auto px-4 py-12 border-t border-border">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10 leading-tight">{t.landing.howItWorks}</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl card-shadow border border-border/50 p-6 space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground font-bold text-sm rounded-xl">
              01
            </div>
            <h3 className="text-base font-semibold text-foreground">{t.landing.step1Title}</h3>
            <p className="text-sm text-muted-foreground">{t.landing.step1Desc}</p>
          </div>

          <div className="bg-card rounded-2xl card-shadow border border-border/50 p-6 space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground font-bold text-sm rounded-xl">
              02
            </div>
            <h3 className="text-base font-semibold text-foreground">{t.landing.step2Title}</h3>
            <p className="text-sm text-muted-foreground">{t.landing.step2Desc}</p>
          </div>

          <div className="bg-card rounded-2xl card-shadow border border-border/50 p-6 space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground font-bold text-sm rounded-xl">
              03
            </div>
            <h3 className="text-base font-semibold text-foreground">{t.landing.step3Title}</h3>
            <p className="text-sm text-muted-foreground">{t.landing.step3Desc}</p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container max-w-4xl mx-auto px-4 py-12 border-t border-border">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10 leading-tight">{t.landing.forWhom}</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-3 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Music className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t.landing.usecaseMusic}</h3>
            <p className="text-xs text-muted-foreground">{t.landing.usecaseMusicDesc}</p>
          </div>

          <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-3 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Guitar className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t.landing.usecaseProduce}</h3>
            <p className="text-xs text-muted-foreground">{t.landing.usecaseProduceDesc}</p>
          </div>

          <div className="bg-card rounded-2xl card-shadow border border-border/50 p-5 space-y-3 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t.landing.usecaseWork}</h3>
            <p className="text-xs text-muted-foreground">{t.landing.usecaseWorkDesc}</p>
          </div>
        </div>
      </section>

      {/* Report Preview */}
      <section className="container max-w-4xl mx-auto px-4 py-12 border-t border-border">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3 leading-tight">{t.landing.reportExample}</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">{t.landing.reportExampleDesc}</p>
        <ReportPreview />
      </section>

      {/* Final CTA */}
      <section className="container max-w-4xl mx-auto px-4 py-16 border-t border-border">
        <div className="bg-card rounded-2xl card-shadow border border-border/50 p-8 md:p-12 text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {t.landing.finalCtaTitle}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t.landing.finalCtaDesc}
          </p>
          <Link
            href="/objetivo"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground py-4 px-8 font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-150"
          >
            {t.landing.ctaStart}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container max-w-4xl mx-auto px-4 py-8 border-t border-border">
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">{t.landing.footerTagline}</p>
          <p className="text-xs text-muted-foreground/70">{t.landing.footerDisclaimer}</p>
        </div>
      </footer>
    </div>
  )
}
