import { Link, useParams } from 'react-router'

import { MethodDetailsContent, MethodSummary } from '@/components/method-introduction'
import { methodIds } from '@/data/domain-constants'
import type { MethodId } from '@/data/domain-constants'
import { useI18n } from '@/providers/i18n-provider'

export function MethodDetailPage() {
  const { methodId } = useParams<{ methodId: string }>()
  const { language, t } = useI18n()
  const en = language === 'en'

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

  const validMethodId = methodId as MethodId

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← {t('方法库')}
      </Link>

      <div className="mt-4">
        <MethodSummary methodId={validMethodId} en={en} t={t} />
      </div>
      <MethodDetailsContent methodId={validMethodId} en={en} t={t} />

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
