import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'

import { english } from '@/locales/en'
import type { TranslationKey } from '@/locales/en'

type Language = 'zh-CN' | 'en'
type Variables = Record<string, string | number>
export type Translate = (key: TranslationKey, variables?: Variables) => string

interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: Translate
}

const I18nContext = createContext<I18nContextValue | null>(null)
const storageKey = 'analysis-language'

function getStoredLanguage(): Language {
  return localStorage.getItem(storageKey) === 'en' ? 'en' : 'zh-CN'
}

function interpolate(text: string, variables?: Variables) {
  if (!variables) return text
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    text,
  )
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage(nextLanguage) {
        localStorage.setItem(storageKey, nextLanguage)
        setLanguageState(nextLanguage)
      },
      t(key, variables) {
        return interpolate(language === 'en' ? english[key] : key, variables)
      },
    }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}
