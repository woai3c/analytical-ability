import { ArrowRight } from 'lucide-react'

import type { AnalysisPlan, MethodId } from '@clarity/domain'

import { MethodBadge } from '@/components/method-badge'
import { MethodCard } from '@/components/method-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/providers/i18n-provider'

const priorityLabels = { A: 'A · 不补就无法分析', B: 'B · 提升分析质量', C: 'C · 可选' } as const

export function StepPlan({
  plan,
  onToggleMethod,
  onFixMissing,
  onStart,
  onBack,
}: {
  plan: AnalysisPlan
  onToggleMethod: (methodId: MethodId, accepted: boolean) => void
  onFixMissing: () => void
  onStart: () => void
  onBack: () => void
}) {
  const { t } = useI18n()
  const acceptedCount = plan.methods.filter((item) => item.accepted).length
  const blockedCount = plan.methods.filter((item) => item.accepted && !item.ready).length

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="border-b border-border p-6 sm:px-8">
          <CardTitle size="lg">{t('将用这些方法为你分析')}</CardTitle>
          <CardDescription>
            {t(
              '方法由规则引擎根据任务类型路由，AI 解释推荐理由。你可以移出或加回方法；标注"还缺输入"的方法需要回去补答对应问题。',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-5 sm:p-6">
          {plan.methods.map((item) => (
            <MethodCard
              key={item.methodId}
              item={item}
              onToggle={(accepted) => onToggleMethod(item.methodId, accepted)}
              onFixMissing={item.ready ? undefined : onFixMissing}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border p-6 sm:px-8">
          <CardTitle size="lg">{t('需要准备的数据')}</CardTitle>
          <CardDescription>{t('每条数据都标了它要回答的问题、获取方式和服务的分析方法。')}</CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-3">
            {(['A', 'B', 'C'] as const).map((priority) => {
              const needs = plan.dataNeeds.filter((need) => need.priority === priority)
              if (!needs.length) return null
              return (
                <div key={priority}>
                  <div className="mb-2 text-xs font-medium text-muted-foreground">{t(priorityLabels[priority])}</div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {needs.map((need) => (
                      <article key={need.id} className="rounded-lg border border-border bg-background p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold leading-6">{need.question}</h3>
                          {need.methodId ? <MethodBadge id={need.methodId} /> : null}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {need.fields.map((field) => (
                            <Badge key={field} variant="outline">
                              {field}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          <span className="font-medium text-foreground">{t('获取方式：')}</span>
                          {need.source}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>
          {t('返回补答')}
        </Button>
        <div className="flex items-center gap-3">
          {blockedCount ? (
            <span className="text-xs text-[var(--warning)]">
              {t('{{count}} 个已选方法缺少输入，执行时会提示你补充', { count: blockedCount })}
            </span>
          ) : null}
          <Button disabled={acceptedCount === 0} onClick={onStart}>
            {t('开始运行分析方法', { count: acceptedCount })}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
