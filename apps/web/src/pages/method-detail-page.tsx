import { Link, useParams } from 'react-router'

import { AlertTriangle, ArrowLeft, CheckCircle2, Target } from 'lucide-react'

import { getMethodSpec, taskTypeLabels, taskTypeLabelsEn } from '@clarity/analysis-engine'
import type { MethodSpec } from '@clarity/analysis-engine'
import { methodIds } from '@clarity/domain'
import type { MethodId } from '@clarity/domain'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/providers/i18n-provider'

export function MethodDetailPage() {
  const { methodId } = useParams<{ methodId: string }>()
  const { language, t } = useI18n()
  const en = language === 'en'
  const labels = en ? taskTypeLabelsEn : taskTypeLabels

  if (!methodId || !(methodIds as readonly string[]).includes(methodId)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-foreground">{t('方法不存在')}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary underline">
          {t('返回方法库')}
        </Link>
      </div>
    )
  }

  const spec = getMethodSpec(methodId as MethodId)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        {t('方法库')}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{en ? spec.name.en : spec.name.zh}</h1>
      <p className="mt-2 text-base leading-7 text-muted-foreground">{en ? spec.purpose.en : spec.purpose.zh}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {spec.taskTypes.map((type) => (
          <Badge key={type} variant="secondary">
            {labels[type]}
          </Badge>
        ))}
        <Badge variant="outline">{spec.depth === 'interactive' ? t('交互式') : t('引导式')}</Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-primary" />
              {t('什么时候用')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <WhenToUse spec={spec} en={en} labels={labels} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="size-4 text-[var(--success)]" />
              {t('运行步骤')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2.5">
              {spec.requiredInputs.map((input, i) => (
                <li key={i} className="flex gap-3 text-sm leading-6">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">
                    {en ? t('准备：') : t('准备：')}
                    {en ? input.en : input.zh}
                  </span>
                </li>
              ))}
              {spec.outputs.map((output, i) => (
                <li key={`o-${i}`} className="flex gap-3 text-sm leading-6">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/10 text-xs font-medium text-[var(--success)]">
                    ✓
                  </span>
                  <span className="text-muted-foreground">
                    {en ? t('产出：') : t('产出：')}
                    {en ? output.en : output.zh}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-[var(--warning)]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-[var(--warning)]" />
            {t('使用边界与常见误区')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          {en ? spec.caution.en : spec.caution.zh}
        </CardContent>
      </Card>

      <div className="mt-8 rounded-lg border border-border bg-muted/50 p-5">
        <h2 className="text-sm font-medium">{t('想在真实场景中练习这个方法？')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('去场景训练中遇到需要用到这个方法的问题，在实践中加深理解。')}
        </p>
        <Link
          to={`/practice?method=${methodId}`}
          className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('开始练习')}
        </Link>
      </div>
    </div>
  )
}

function WhenToUse({ spec, en, labels }: { spec: MethodSpec; en: boolean; labels: Record<string, string> }) {
  const scenarios = spec.taskTypes.map((type) => labels[type])

  return (
    <>
      <p>
        {en
          ? `Use this method when you face a "${scenarios.join('" or "')}" scenario.`
          : `当你面对「${scenarios.join('」或「')}」类型的问题时，可以考虑这个方法。`}
      </p>
      <p>{en ? 'Specifically, you need:' : '具体来说，你需要：'}</p>
      <ul className="list-disc space-y-1 pl-5">
        {spec.requiredInputs.map((input, i) => (
          <li key={i}>{en ? input.en : input.zh}</li>
        ))}
      </ul>
      <p className="text-xs">
        {en
          ? "If you don't have these inputs yet, collect them first before attempting this method."
          : '如果这些输入你还没有，先去收集它们，再来运用这个方法。'}
      </p>
    </>
  )
}
