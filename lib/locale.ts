export const LOCALE_STORAGE_KEY = "roomtuner-locale"
export type Locale = "es" | "en"

export function readLocale(): Locale {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY) === "en" ? "en" : "es"
  } catch { return "es" }
}
