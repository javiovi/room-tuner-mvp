"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { es, type Translations } from "@/lib/translations/es"
import { en } from "@/lib/translations/en"

import { LOCALE_STORAGE_KEY, readLocale, type Locale } from "@/lib/locale"

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
    setLocaleState(readLocale())
  }, [])

  useEffect(() => { document.documentElement.lang = locale }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    try { localStorage.setItem(LOCALE_STORAGE_KEY, newLocale) } catch { /* Keep language in memory. */ }
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
