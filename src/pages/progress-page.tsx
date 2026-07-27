import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

import type { TaskType } from '@/data/domain'
import { methodRegistry, taskTypeLabels, taskTypeLabelsEn } from '@/data/methods'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

interface PracticeRecord {
  scenarioId: string
  scenarioTitle: string
  scenarioDescription?: string
  scenarioContext?: string
  applicableMethods?: string[]
  taskType: string
  selectedMethods: string[]
  correct: boolean
  score: number
  feedback?: string
  improvementTip?: string
  methodExplanations?: Array<{ methodId: string; explanation: string; isBestFit: boolean }>
  completedAt: string
}

function loadRecords(): PracticeRecord[] {
  try {
    return JSON.parse(localStorage.getItem('clarity-practice-records') ?? '[]')
  } catch {
    return []
  }
}

export function ProgressPage() {
  const { language, t } = useI18n()
  const en = language === 'en'
  const labels = en ? taskTypeLabelsEn : taskTypeLabels
  const records = useMemo(() => loadRecords(), [])
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const [methodFilter, setMethodFilter] = useState<string | null>(null)

  const filteredRecords = useMemo(() => {
    if (!methodFilter) return records
    return records.filter((r) => r.selectedMethods.includes(methodFilter))
  }, [records, methodFilter])

  const totalPractices = filteredRecords.length
  const correctCount = filteredRecords.filter((r) => r.correct).length
  const accuracy = totalPractices > 0 ? Math.round((correctCount / totalPractices) * 100) : 0

  const byTaskType = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {}
    for (const r of filteredRecords) {
      const entry = map[r.taskType] ?? { total: 0, correct: 0 }
      entry.total++
      if (r.correct) entry.correct++
      map[r.taskType] = entry
    }
    return map
  }, [filteredRecords])

  const byMethod = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {}
    for (const r of filteredRecords) {
      for (const m of r.selectedMethods) {
        const entry = map[m] ?? { total: 0, correct: 0 }
        entry.total++
        if (r.correct) entry.correct++
        map[m] = entry
      }
    }
    return map
  }, [filteredRecords])

  const recentRecords = filteredRecords.slice(-10).reverse()

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6">
      <h1 className="text-xl font-semibold">{t('我的进度')}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {t('追踪你的学习情况，了解哪些场景类型和方法你已经掌握，哪些还需要练习。')}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-4">
        <StatCell label={t('总练习')} value={String(totalPractices)} />
        <StatCell label={t('正确率')} value={`${accuracy}%`} />
        <StatCell label={t('正确数')} value={String(correctCount)} />
        <StatCell
          label={t('最近练习')}
          value={filteredRecords.length > 0 ? formatDate(filteredRecords.at(-1)!.completedAt) : t('暂无')}
        />
      </div>

      {/* Trend comparison */}
      {filteredRecords.length >= 2 && <TrendComparison records={filteredRecords} t={t} />}

      {/* Method filter */}
      {records.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setMethodFilter(null)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              methodFilter === null
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
            )}
          >
            {t('全部')}
          </button>
          {methodRegistry.map((method) => {
            const name = en ? method.name.en : method.name.zh
            const isActive = methodFilter === method.id
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setMethodFilter(method.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors',
                  isActive
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                )}
              >
                {name}
              </button>
            )
          })}
        </div>
      )}

      {totalPractices === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {methodFilter ? (
              t('该方法暂无练习记录。')
            ) : (
              <>
                {t('还没有练习记录。')}
                <Link to="/practice" className="ml-1 text-foreground underline">
                  {t('开始练习')}
                </Link>
              </>
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <section>
              <h2 className="text-sm font-medium">{t('按场景类型')}</h2>
              <div className="mt-3 space-y-2.5">
                {Object.entries(byTaskType).map(([type, stats]) => {
                  const pct = Math.round((stats.correct / stats.total) * 100)
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{labels[type as TaskType] ?? type}</span>
                        <span className="text-xs text-muted-foreground">
                          {stats.correct}/{stats.total}
                        </span>
                      </div>
                      <ProgressBar value={pct} />
                    </div>
                  )
                })}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-medium">{t('按方法使用')}</h2>
              <div className="mt-3 space-y-2.5">
                {Object.entries(byMethod)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .slice(0, 8)
                  .map(([methodId, stats]) => {
                    const spec = methodRegistry.find((m) => m.id === methodId)
                    const name = spec ? (en ? spec.name.en : spec.name.zh) : methodId
                    const pct = Math.round((stats.correct / stats.total) * 100)
                    return (
                      <div key={methodId}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{name}</span>
                          <span className="text-xs text-muted-foreground">
                            {stats.correct}/{stats.total}
                          </span>
                        </div>
                        <ProgressBar value={pct} />
                      </div>
                    )
                  })}
              </div>
            </section>
          </div>

          <section className="mt-8 border-t border-border pt-6">
            <h2 className="text-sm font-medium">{t('最近练习')}</h2>
            <div className="mt-3 divide-y divide-border rounded-lg border border-border">
              {recentRecords.map((record, i) => {
                const globalIdx = records.length - 1 - i
                const isExpanded = expandedIdx === globalIdx
                return (
                  <div key={`${record.scenarioId}-${i}`}>
                    <button
                      type="button"
                      onClick={() => setExpandedIdx(isExpanded ? null : globalIdx)}
                      className="flex w-full items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:bg-secondary"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">{record.scenarioTitle}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {labels[record.taskType as TaskType] ?? record.taskType}
                          {' · '}
                          {formatDate(record.completedAt)}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                          record.correct
                            ? 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-(--success)'
                            : 'bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-(--warning)',
                        )}
                      >
                        {record.score}
                      </span>
                    </button>
                    {isExpanded && <RecordDetail record={record} t={t} en={en} />}
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary px-4 py-3">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full bg-foreground/20" style={{ width: `${value}%` }} />
    </div>
  )
}

function TrendComparison({ records, t }: { records: PracticeRecord[]; t: (s: string) => string }) {
  const n = Math.min(5, Math.floor(records.length / 2))
  if (n === 0) return null

  const recent = records.slice(-n)
  const previous = records.slice(-n * 2, -n)

  const recentAvg = Math.round(recent.reduce((s, r) => s + r.score, 0) / recent.length)
  const previousAvg = previous.length > 0 ? Math.round(previous.reduce((s, r) => s + r.score, 0) / previous.length) : 0
  const delta = recentAvg - previousAvg

  const recentAccuracy = Math.round((recent.filter((r) => r.correct).length / recent.length) * 100)
  const previousAccuracy =
    previous.length > 0 ? Math.round((previous.filter((r) => r.correct).length / previous.length) * 100) : 0
  const accDelta = recentAccuracy - previousAccuracy

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <TrendCard
        label={t('平均得分趋势')}
        recent={`${recentAvg}`}
        previous={`${previousAvg}`}
        delta={delta}
        suffix=""
        t={t}
        n={n}
      />
      <TrendCard
        label={t('正确率趋势')}
        recent={`${recentAccuracy}%`}
        previous={`${previousAccuracy}%`}
        delta={accDelta}
        suffix="%"
        t={t}
        n={n}
      />
    </div>
  )
}

function TrendCard({
  label,
  recent,
  previous,
  delta,
  suffix,
  t,
  n,
}: {
  label: string
  recent: string
  previous: string
  delta: number
  suffix: string
  t: (s: string) => string
  n: number
}) {
  const TrendIcon = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus
  const trendColor = delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground'

  return (
    <div className="rounded-lg border border-border bg-secondary p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-lg font-semibold tabular-nums">{recent}</span>
        <span className={cn('flex items-center gap-0.5 text-xs font-medium', trendColor)}>
          <TrendIcon className="size-3" />
          {delta > 0 ? '+' : ''}
          {delta}
          {suffix}
        </span>
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">
        {t('前{{n}}次').replace('{{n}}', String(n))}: {previous}
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}

function RecordDetail({ record, t, en }: { record: PracticeRecord; t: (s: string) => string; en: boolean }) {
  const hasDetail = record.scenarioDescription || record.feedback
  if (!hasDetail) {
    return (
      <div className="border-t border-border px-3.5 py-3 text-xs text-muted-foreground">
        {t('该记录保存时未包含详情数据。')}
      </div>
    )
  }

  return (
    <div className="border-t border-border px-3.5 py-3 space-y-3 text-sm">
      {record.scenarioDescription && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground">{t('场景描述')}</h4>
          <p className="mt-1 leading-relaxed">{record.scenarioDescription}</p>
        </div>
      )}
      {record.scenarioContext && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground">{t('背景信息')}</h4>
          <p className="mt-1 leading-relaxed">{record.scenarioContext}</p>
        </div>
      )}
      {record.applicableMethods && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground">{t('最佳方法')}</h4>
          <p className="mt-1">
            {record.applicableMethods
              .map((id) => {
                const spec = methodRegistry.find((m) => m.id === id)
                return spec ? (en ? spec.name.en : spec.name.zh) : id
              })
              .join('、')}
          </p>
        </div>
      )}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground">{t('你的选择')}</h4>
        <p className="mt-1">
          {record.selectedMethods
            .map((id) => {
              const spec = methodRegistry.find((m) => m.id === id)
              return spec ? (en ? spec.name.en : spec.name.zh) : id
            })
            .join('、')}
        </p>
      </div>
      {record.feedback && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground">{t('AI 反馈')}</h4>
          <p className="mt-1 leading-relaxed">{record.feedback}</p>
        </div>
      )}
      {record.improvementTip && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground">{t('改进建议')}</h4>
          <p className="mt-1 leading-relaxed">{record.improvementTip}</p>
        </div>
      )}
    </div>
  )
}
