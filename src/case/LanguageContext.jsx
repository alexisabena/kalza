import { createContext, useContext, useEffect, useState } from 'react'
import { content } from '@/case/content'

// Portfolio language. English is the default; the choice persists.
const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('kalza-lang') || 'en')

  useEffect(() => {
    localStorage.setItem('kalza-lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: content[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
