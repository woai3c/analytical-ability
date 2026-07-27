import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'

import { MethodAnimation } from '@/components/method-animations/method-animation'
import { methodIds } from '@/data/domain'
import type { MethodId } from '@/data/domain'
import { getMethodSpec, taskTypeLabels, taskTypeLabelsEn } from '@/data/methods'
import { useI18n } from '@/providers/i18n-provider'

function RichText({ text }: { text: string }) {
  const blocks = text.split('\n\n')
  const elements: ReactNode[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!.trim()
    if (!block) continue

    const lines = block.split('\n')
    const isBulletList = lines.every((l) => /^[·\-]\s/.test(l))
    const isNumberedList = lines.every((l) => /^\d+\.\s/.test(l))

    if (isBulletList) {
      elements.push(
        <ul key={i} className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          {lines.map((line, j) => (
            <li key={j} className="flex gap-2 leading-relaxed">
              <span className="shrink-0 text-muted-foreground/60">·</span>
              <span>{line.replace(/^[·\-]\s*/, '')}</span>
            </li>
          ))}
        </ul>,
      )
    } else if (isNumberedList) {
      elements.push(
        <ol key={i} className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          {lines.map((line, j) => {
            const match = line.match(/^(\d+)\.\s(.*)/)
            return (
              <li key={j} className="flex gap-2 leading-relaxed">
                <span className="shrink-0 text-muted-foreground/60">{match?.[1]}.</span>
                <span>{match?.[2]}</span>
              </li>
            )
          })}
        </ol>,
      )
    } else {
      elements.push(
        <p key={i} className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {block}
        </p>,
      )
    }
  }

  return <>{elements}</>
}

export function MethodDetailPage() {
  const { methodId } = useParams<{ methodId: string }>()
  const { language, t } = useI18n()
  const en = language === 'en'
  const labels = en ? taskTypeLabelsEn : taskTypeLabels

  if (!methodId || !(methodIds as readonly string[]).includes(methodId)) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12 text-center">
        <p className="text-muted-foreground">{t('方法不存在')}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-foreground underline">
          {t('返回方法库')}
        </Link>
      </div>
    )
  }

  const spec = getMethodSpec(methodId as MethodId)

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← {t('方法库')}
      </Link>

      <h1 className="mt-4 text-xl font-semibold">{en ? spec.name.en : spec.name.zh}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{en ? spec.purpose.en : spec.purpose.zh}</p>

      <div className="mt-2 text-xs text-muted-foreground">
        {spec.taskTypes.map((type) => labels[type]).join(' · ')}
        {' · '}
        {spec.depth === 'interactive' ? t('交互式') : t('引导式')}
      </div>

      {/* 介绍 */}
      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-medium">{t('方法介绍')}</h2>
        <RichText text={en ? spec.introduction.en : spec.introduction.zh} />
      </section>

      {/* 什么时候用 / 不用 */}
      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-medium">{t('什么时候用')}</h2>
        <RichText text={en ? spec.whenToUse.en : spec.whenToUse.zh} />
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-medium">{t('什么时候不用')}</h2>
        <RichText text={en ? spec.whenNotToUse.en : spec.whenNotToUse.zh} />
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-medium">{t('和其他方法的区别')}</h2>
        <RichText text={en ? spec.vsOtherMethods.en : spec.vsOtherMethods.zh} />
      </section>

      {/* 步骤 */}
      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-medium">{t('操作步骤')}</h2>
        <ol className="mt-3 space-y-2 text-sm">
          {spec.steps.map((step, i) => (
            <li key={i} className="flex gap-2.5 leading-relaxed">
              <span className="mt-px shrink-0 text-muted-foreground">{i + 1}.</span>
              <span className="text-muted-foreground">{en ? step.en : step.zh}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 输入 / 产出 */}
      <section className="mt-8 border-t border-border pt-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-medium">{t('你需要准备')}</h2>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {spec.requiredInputs.map((input, i) => (
                <li key={i}>· {en ? input.en : input.zh}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-medium">{t('你会得到')}</h2>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {spec.outputs.map((output, i) => (
                <li key={i}>· {en ? output.en : output.zh}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 完整示例 = 文字 + 动画 */}
      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-medium">{t('完整示例')}</h2>

        <div className="mt-3 rounded-lg border border-border bg-secondary px-4 py-3">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {en ? spec.exampleWalkthrough.en : spec.exampleWalkthrough.zh}
          </pre>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">{t('点击播放，看这个方法从零到完成的全过程。')}</p>
        <div className="mt-2">
          <MethodAnimation methodId={methodId as MethodId} />
        </div>
      </section>

      {/* 注意事项 */}
      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-medium">{t('使用边界与常见误区')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{en ? spec.caution.en : spec.caution.zh}</p>
      </section>

      {/* 练习入口 */}
      <section className="mt-8 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          {t('去场景训练中遇到需要用到这个方法的问题，在实践中加深理解。')}
        </p>
        <Link
          to={`/practice?method=${methodId}`}
          className="mt-3 inline-block rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          {t('开始练习')}
        </Link>
      </section>
    </div>
  )
}
