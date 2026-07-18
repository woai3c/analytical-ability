import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const storageKey = 'analysis-theme'

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(storageKey)
  return stored === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  useEffect(() => {
    const syncStoredTheme = (event: StorageEvent) => {
      if (event.key === storageKey) setThemeState(getStoredTheme())
    }

    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
    window.addEventListener('storage', syncStoredTheme)
    return () => {
      window.removeEventListener('storage', syncStoredTheme)
    }
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme(nextTheme) {
        localStorage.setItem(storageKey, nextTheme)
        setThemeState(nextTheme)
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
