import { ArrowRight, Sparkles } from 'lucide-react'

import { getMethodSpec } from '@clarity/analysis-engine'
import type { AnalysisPlan, MethodId, MethodRuns } from '@clarity/domain'

import { FishbonePanel } from '@/components/methods/fishbone-panel'
import { GuidedMethodPanel } from '@/components/methods/guided-method-panel'
import { McdaPanel } from '@/components/methods/mcda-panel'
import { PertPanel } from '@/components/methods/pert-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/providers/i18n-provider'

export function StepMethods({
  plan,
  methodRuns,
  busy,
  error,
  onRunMethod,
  onChangeRun,
  onGenerateRoute,
  onBack,
}: {
  plan: AnalysisPlan
  methodRuns: MethodRuns
  busy: string | null
  error: string
  onRunMethod: (methodId: MethodId, material: string) => void
  onChangeRun: (methodId: MethodId, run: unknown) => void
  onGenerateRoute: () => void
  onBack: () => void
}) {
  const { language, t } = useI18n()
  const accepted = plan.methods.filter((item) => item.accepted)
  const completedCount = accepted.filter((item) => methodRuns[item.methodId] !== undefined).length

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">{t('逐个运行分析方法')}</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {t('AI 为每个方法生成候选内容，你来确认和修改；评分、关键路径等计算由代码完成，不由 AI 拍脑袋。')}
        </p>
      </div>

      {accepted.map((item) => {
        const spec = getMethodSpec(item.methodId)
        const run = methodRuns[item.methodId]
        return (
          <Card key={item.methodId}>
            <CardHeader className="border-b border-border p-5 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{language === 'en' ? spec.name.en : spec.name.zh}</CardTitle>
                {run ? (
                  <span className="rounded-md bg-[color-mix(in_oklch,var(--success)_16%,transparent)] px-2 py-0.5 text-[11px] font-medium text-[var(--success)]">
                    {t('已生成')}
                  </span>
                ) : null}
              </div>
              <CardDescription>{language === 'en' ? spec.purpose.en : spec.purpose.zh}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              {item.methodId === 'fishbone' ? (
                <FishbonePanel
                  run={run as never}
                  busy={busy === `method:${item.methodId}`}
                  onGenerate={(material) => onRunMethod(item.methodId, material)}
                  onChange={(next) => onChangeRun(item.methodId, next)}
                />
              ) : item.methodId === 'mcda' ? (
                <McdaPanel
                  run={run as never}
                  busy={busy === `method:${item.methodId}`}
                  onGenerate={(material) => onRunMethod(item.methodId, material)}
                  onChange={(next) => onChangeRun(item.methodId, next)}
                />
              ) : item.methodId === 'pert' ? (
                <PertPanel
                  run={run as never}
                  busy={busy === `method:${item.methodId}`}
                  onGenerate={(material) => onRunMethod(item.methodId, material)}
                  onChange={(next) => onChangeRun(item.methodId, next)}
                />
              ) : (
                <GuidedMethodPanel
                  methodId={item.methodId}
                  run={run}
                  busy={busy === `method:${item.methodId}`}
                  onGenerate={(material) => onRunMethod(item.methodId, material)}
                  onChange={(next) => onChangeRun(item.methodId, next)}
                />
              )}
            </CardContent>
          </Card>
        )
      })}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <Button variant="ghost" onClick={onBack}>
          {t('返回分析计划')}
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {t('已完成 {{done}} / {{total}} 个方法', { done: completedCount, total: accepted.length })}
          </span>
          <Button disabled={completedCount === 0 || busy === 'route'} onClick={onGenerateRoute}>
            <Sparkles className="size-4" />
            {t(busy === 'route' ? '正在生成行动路线…' : '生成行动路线')}
            {busy === 'route' ? null : <ArrowRight className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
