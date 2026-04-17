import { useMemo, useState, type ReactNode } from 'react'
import { LanguageContext, type LanguageCode } from './language-context'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('en')
  const value = useMemo(() => ({ language, setLanguage }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
