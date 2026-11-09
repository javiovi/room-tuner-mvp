"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useT } from "@/lib/i18n"

export default function LandingPage() {
  const { t, locale } = useT()
  return <main className="min-h-screen bg-background">
    <div className="mx-auto max-w-xl px-5 py-6 space-y-10">
      <header className="flex items-center justify-between"><span className="font-mono text-sm">RoomTuner</span><div className="flex gap-2"><LanguageToggle /><ThemeToggle /></div></header>
      <section className="space-y-5 py-6">
        <h1 className="text-3xl font-semibold leading-tight">{t.landing.heroH1} <span className="text-primary">{t.landing.heroH1Highlight}</span></h1>
        <p className="text-base text-muted-foreground">{t.landing.heroSubtitle}</p>
        <Link href="/objetivo" className="block rounded-sm bg-primary text-primary-foreground px-5 py-4 text-center font-medium">{t.landing.ctaStart}</Link>
        <p className="text-xs text-muted-foreground">{locale === "es" ? "Sin registro. Podés empezar sin medidas ni micrófono." : "No account needed. Start without measurements or a microphone."}</p>
      </section>
      <section className="space-y-5" aria-label={t.landing.howItWorks}>
        {[{title:t.landing.step1Title,body:t.landing.step1Desc},{title:t.landing.step2Title,body:t.landing.step2Desc},{title:t.landing.step3Title,body:t.landing.step3Desc}].map((step,i)=><div key={step.title} className="border-t border-border pt-4"><p className="text-sm font-medium"><span className="font-mono text-primary mr-3">0{i+1}</span>{step.title}</p><p className="mt-2 text-sm text-muted-foreground">{step.body}</p></div>)}
      </section>
      <footer className="border-t border-border pt-5 text-xs text-muted-foreground">{locale === "es" ? "Orientación para probar cambios. Las estimaciones no reemplazan una medición acústica especializada ni garantizan una mejora." : "Guidance for trying changes. Estimates do not replace specialist acoustic measurements or guarantee improvement."}</footer>
    </div>
  </main>
}
