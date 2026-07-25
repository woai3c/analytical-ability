import { Languages } from 'lucide-react'

import { useI18n } from '@/providers/i18n-provider'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n()
  const isChinese = language === 'zh-CN'
  return (
    <button
      type="button"
      className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring"
      onClick={() => setLanguage(isChinese ? 'en' : 'zh-CN')}
      aria-label={t(isChinese ? '切换到英文' : '切换到中文')}
      title={t(isChinese ? '切换到英文' : '切换到中文')}
    >
      <Languages className="size-4" />
    </button>
  )
}
