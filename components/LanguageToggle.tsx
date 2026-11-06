"use client"

import { useT } from "@/lib/i18n"

export function LanguageToggle() {
  const { locale, setLocale } = useT()

  return (
    <button
      onClick={() => setLocale(locale === "es" ? "en" : "es")}
      className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
      aria-label={locale === "es" ? "Cambiar a inglés" : "Switch to Spanish"}
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  )
}
