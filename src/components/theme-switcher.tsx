import { Moon, Sun } from 'lucide-react'

import { useI18n } from '@/providers/i18n-provider'
import { useTheme } from '@/providers/theme-provider'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t(isDark ? '切换到浅色主题' : '切换到深色主题')}
      title={t(isDark ? '切换到浅色主题' : '切换到深色主题')}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
