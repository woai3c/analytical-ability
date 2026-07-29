import { Moon, Sun } from 'lucide-react'

import { HeaderIconButton } from '@/components/header-icon-button'
import { useI18n } from '@/providers/i18n-provider'
import { useTheme } from '@/providers/theme-provider'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const isDark = theme === 'dark'
  const label = t(isDark ? '切换到浅色主题' : '切换到深色主题')

  return (
    <HeaderIconButton label={label} onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </HeaderIconButton>
  )
}
