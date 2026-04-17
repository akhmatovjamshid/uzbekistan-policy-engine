import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type LanguageCode = 'en' | 'ru' | 'uz'

type LanguageState = {
  language: LanguageCode
  setLanguage: (next: LanguageCode) => void
}

const LanguageContext = createContext<LanguageState | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('en')

  const value = useMemo(() => ({ language, setLanguage }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
