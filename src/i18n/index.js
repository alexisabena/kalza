import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { es } from './locales/es'
import { en } from './locales/en'

// Lightweight i18n — no library. ES is the source; EN overlays it with a deep
// merge so any untranslated key falls back to Spanish. This lets the app be
// translated screen-by-screen without ever showing a blank/broken string.
// Strings that interpolate (counts, names) are stored as small functions.
const isPlainObject = (v) => v != null && typeof v === 'object' && !Array.isArray(v)

const deepMerge = (base, over) => {
  const out = { ...base }
  for (const key of Object.keys(over)) {
    out[key] =
      isPlainObject(base[key]) && isPlainObject(over[key])
        ? deepMerge(base[key], over[key])
        : over[key]
  }
  return out
}

const dicts = { es, en: deepMerge(es, en) }

export const LOCALES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
]

export const useLocale = create(
  persist(
    (set) => ({
      locale: 'es',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'kalza-locale' }
  )
)

// Returns the (fully-resolved) dictionary for the active locale.
export function useT() {
  const locale = useLocale((s) => s.locale)
  return dicts[locale] ?? dicts.es
}
