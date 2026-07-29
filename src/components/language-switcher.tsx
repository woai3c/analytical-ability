import { Languages } from 'lucide-react'

import { HeaderIconButton } from '@/components/header-icon-button'
import { useI18n } from '@/providers/i18n-provider'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n()
  const isChinese = language === 'zh-CN'
  const label = t(isChinese ? '切换到英文' : '切换到中文')

  return (
    <HeaderIconButton label={label} onClick={() => setLanguage(isChinese ? 'en' : 'zh-CN')}>
      <Languages className="size-4" />
    </HeaderIconButton>
  )
}
