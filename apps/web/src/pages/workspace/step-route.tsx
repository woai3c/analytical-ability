import { Check, FolderCheck } from 'lucide-react'

import type { ActionRoute } from '@clarity/domain'

import { MethodBadge } from '@/components/method-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Markdown } from '@/components/ui/markdown'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

const kindLabels = {
  clarify: '澄清',
  collect: '收集',
  analyze: '分析',
  decide: '决策',
  act: '行动',
  review: '复盘',
} as const

export function StepRoute({
  route,
  doneStepIds,
  onToggleDone,
  onSaveProject,
  saved,
  onBack,
}: {
  route: ActionRoute
  doneStepIds: string[]
  onToggleDone: (stepId: string) => void
  onSaveProject: () => void
  saved: boolean
  onBack: () => void
}) {
  const { t } = useI18n()
  const nextStep = route.steps.find((step) => !doneStepIds.includes(step.id))

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="border-b border-border p-6 sm:px-8">
          <CardTitle size="lg">{t('从今天开始的行动路线')}</CardTitle>
          <CardDescription>
            {t('每一步都标了来源方法和完成标准，可以直接勾选进度。当前最该做的是高亮的那一步。')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-7">
          <ol className="space-y-4">
            {route.steps.map((step, index) => {
              const done = doneStepIds.includes(step.id)
              const isNext = nextStep?.id === step.id
              return (
                <li key={step.id} className="grid grid-cols-[28px_1fr] gap-3">
                  <div className="pt-4 text-center text-xs font-semibold text-muted-foreground">{index + 1}</div>
                  <div
                    className={cn(
                      'rounded-lg border bg-background p-4 transition sm:p-5',
                      isNext && 'border-primary/60 ring-1 ring-primary/15',
                      done && 'opacity-60',
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleDone(step.id)}
                        className={cn(
                          'flex size-5 items-center justify-center rounded border transition',
                          done ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:border-ring',
                        )}
                        aria-label={t(done ? '标记为未完成' : '标记为完成')}
                      >
                        {done ? <Check className="size-3.5" /> : null}
                      </button>
                      <h3 className={cn('font-semibold', done && 'line-through')}>{step.title}</h3>
                      <Badge variant="outline">{t(kindLabels[step.kind])}</Badge>
                      {step.linkedMethod ? <MethodBadge id={step.linkedMethod} /> : null}
                      {isNext ? <Badge variant="default">{t('当前该做')}</Badge> : null}
                      {step.estimatedDays !== null ? (
                        <span className="text-xs text-muted-foreground">
                          {t('约 {{days}} 天', { days: step.estimatedDays })}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-muted-foreground">
                      <Markdown>{step.description}</Markdown>
                    </div>
                    <div className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                      <strong className="font-medium text-foreground">{t('完成标准：')}</strong>
                      {step.doneWhen}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
          {route.notes ? (
            <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">{route.notes}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>
          {t('返回分析执行')}
        </Button>
        <Button variant="secondary" onClick={onSaveProject}>
          <FolderCheck className="size-4" />
          {t(saved ? '已保存' : '保存为执行项目')}
        </Button>
      </div>
    </div>
  )
}
