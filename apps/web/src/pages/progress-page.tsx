import { useMemo } from 'react'
import { Link } from 'react-router'

import { methodRegistry, taskTypeLabels, taskTypeLabelsEn } from '@clarity/analysis-engine'
import type { TaskType } from '@clarity/domain'

import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

interface PracticeRecord {
  scenarioId: string
  scenarioTitle: string
  taskType: string
  selectedMethods: string[]
  correct: boolean
  score: number
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

  const totalPractices = records.length
  const correctCount = records.filter((r) => r.correct).length
  const accuracy = totalPractices > 0 ? Math.round((correctCount / totalPractices) * 100) : 0

  const byTaskType = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {}
    for (const r of records) {
      const entry = map[r.taskType] ?? { total: 0, correct: 0 }
      entry.total++
      if (r.correct) entry.correct++
      map[r.taskType] = entry
    }
    return map
  }, [records])

  const byMethod = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {}
    for (const r of records) {
      for (const m of r.selectedMethods) {
        const entry = map[m] ?? { total: 0, correct: 0 }
        entry.total++
        if (r.correct) entry.correct++
        map[m] = entry
      }
    }
    return map
  }, [records])

  const recentRecords = records.slice(-10).reverse()

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
          value={records.length > 0 ? formatDate(records.at(-1)!.completedAt) : t('暂无')}
        />
      </div>

      {totalPractices === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t('还没有练习记录。')}
            <Link to="/practice" className="ml-1 text-foreground underline">
              {t('开始练习')}
            </Link>
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
              {recentRecords.map((record, i) => (
                <div key={`${record.scenarioId}-${i}`} className="flex items-center justify-between px-3.5 py-2.5">
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
                        ? 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]'
                        : 'bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]',
                    )}
                  >
                    {record.score}
                  </span>
                </div>
              ))}
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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}
