"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { es, type Translations } from "@/lib/translations/es"
import { en } from "@/lib/translations/en"

type Locale = "es" | "en"

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const dictionaries: Record<Locale, Translations> = { es, en }

const I18nContext = createContext<I18nContextValue>({
  locale: "es",
  setLocale: () => {},
  t: es,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es")

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null
    if (stored && (stored === "es" || stored === "en")) {
      setLocaleState(stored)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("locale", newLocale)
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useT() {
  return useContext(I18nContext)
}
