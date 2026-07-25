import { getMethodSpec } from '@clarity/analysis-engine'
import type { MethodId } from '@clarity/domain'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

export function methodName(id: MethodId, language: 'zh-CN' | 'en'): string {
  const spec = getMethodSpec(id)
  return language === 'en' ? spec.name.en : spec.name.zh
}

/** 统一的方法标注 chip：全站用它标出"这个内容由哪个分析方法驱动"。 */
export function MethodBadge({ id, className }: { id: MethodId; className?: string }) {
  const { language } = useI18n()
  return (
    <Badge variant="secondary" className={cn('shrink-0', className)}>
      {methodName(id, language)}
    </Badge>
  )
}
