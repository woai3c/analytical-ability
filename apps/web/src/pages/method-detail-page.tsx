import { Link, useParams } from 'react-router'

import { getMethodSpec, taskTypeLabels, taskTypeLabelsEn } from '@clarity/analysis-engine'
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
        ← {t('方法库')}
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

      {/* 完整介绍 */}
      <section className="mt-8">
        <h2 className="text-lg font-medium">{t('方法介绍')}</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {en ? spec.introduction.en : spec.introduction.zh}
        </p>
      </section>

      {/* 操作步骤 */}
      <section className="mt-8">
        <h2 className="text-lg font-medium">{t('操作步骤')}</h2>
        <ol className="mt-3 space-y-2">
          {spec.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm leading-6">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{en ? step.en : step.zh}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 输入与产出 */}
      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('你需要准备')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm leading-6 text-muted-foreground">
              {spec.requiredInputs.map((input, i) => (
                <li key={i}>· {en ? input.en : input.zh}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('你会得到')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm leading-6 text-muted-foreground">
              {spec.outputs.map((output, i) => (
                <li key={i}>· {en ? output.en : output.zh}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* 完整示例 */}
      <section className="mt-8">
        <h2 className="text-lg font-medium">{t('完整示例')}</h2>
        <div className="mt-3 rounded-lg border border-border bg-muted/30 p-5">
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {en ? spec.exampleWalkthrough.en : spec.exampleWalkthrough.zh}
          </p>
        </div>
      </section>

      {/* 使用边界 */}
      <section className="mt-8">
        <h2 className="text-lg font-medium">{t('使用边界与常见误区')}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{en ? spec.caution.en : spec.caution.zh}</p>
      </section>

      {/* 去练习 */}
      <div className="mt-10 rounded-lg border border-border p-5">
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
