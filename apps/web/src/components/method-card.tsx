import { AlertTriangle, Check, CircleCheck } from 'lucide-react'

import { getMethodSpec } from '@clarity/analysis-engine'
import type { MethodPlanItem } from '@clarity/domain'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

/**
 * 分析计划中的方法卡片：名称、用途、为什么适用于当前目标、
 * 前置条件满足状态、误用边界，以及接受/移出操作。
 */
export function MethodCard({
  item,
  onToggle,
  onFixMissing,
}: {
  item: MethodPlanItem
  onToggle: (accepted: boolean) => void
  onFixMissing?: (() => void) | undefined
}) {
  const { language, t } = useI18n()
  const spec = getMethodSpec(item.methodId)
  const name = language === 'en' ? spec.name.en : spec.name.zh
  const purpose = language === 'en' ? spec.purpose.en : spec.purpose.zh
  const caution = language === 'en' ? spec.caution.en : spec.caution.zh

  return (
    <article
      className={cn(
        'rounded-lg border p-4 transition sm:p-5',
        item.accepted ? 'border-primary/50 bg-background' : 'border-border bg-background opacity-70',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{name}</h3>
            <Badge variant={item.role === 'primary' ? 'default' : 'outline'}>
              {t(item.role === 'primary' ? '主方法' : '可选方法')}
            </Badge>
            {item.ready ? (
              <Badge variant="success">{t('条件已满足')}</Badge>
            ) : (
              <Badge variant="warning">{t('还缺输入')}</Badge>
            )}
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{purpose}</p>
        </div>
        <Button size="sm" variant={item.accepted ? 'outline' : 'secondary'} onClick={() => onToggle(!item.accepted)}>
          {item.accepted ? (
            <>
              <Check className="size-3.5" />
              {t('已选用')}
            </>
          ) : (
            t('选用此方法')
          )}
        </Button>
      </div>

      <div className="mt-3 rounded-md bg-muted p-3 text-xs leading-5 text-muted-foreground">
        <span className="font-medium text-foreground">{t('为什么适用于你的目标：')}</span>
        {item.reason}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="text-xs font-medium">{t('运行前需要')}</div>
          <ul className="mt-1.5 space-y-1">
            {item.requiredInputs.map((input) => (
              <li key={input} className="flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" />
                {input}
              </li>
            ))}
          </ul>
        </div>
        {item.missingInputs.length ? (
          <div className="rounded-md border border-[color-mix(in_oklch,var(--warning)_38%,var(--border))] p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--warning)]">
              <AlertTriangle className="size-3.5" />
              {t('补齐这些才能运行')}
            </div>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-5 text-muted-foreground">
              {item.missingInputs.map((missing) => (
                <li key={missing}>{missing}</li>
              ))}
            </ul>
            {onFixMissing ? (
              <Button size="sm" variant="ghost" className="mt-2" onClick={onFixMissing}>
                {t('回去补答')}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mt-3 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
        <span className="font-medium text-foreground">{t('使用边界：')}</span>
        {caution}
      </p>
    </article>
  )
}
