import { useMemo } from 'react'

import { methodRegistry, taskTypeLabels, taskTypeLabelsEn } from '@clarity/analysis-engine'
import type { TaskType } from '@clarity/domain'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t('我的进度')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('追踪你的学习情况，了解哪些场景类型和方法你已经掌握，哪些还需要练习。')}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('总练习')} value={String(totalPractices)} />
        <StatCard label={t('正确率')} value={`${accuracy}%`} />
        <StatCard label={t('正确数')} value={String(correctCount)} />
        <StatCard
          label={t('最近练习')}
          value={records.length > 0 ? formatDate(records.at(-1)!.completedAt) : t('暂无')}
        />
      </div>

      {totalPractices === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">{t('还没有练习记录。去场景训练开始你的第一次练习吧！')}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('按场景类型')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(byTaskType).map(([type, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100)
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{labels[type as TaskType] ?? type}</span>
                      <span className="text-xs text-muted-foreground">
                        {stats.correct}/{stats.total} ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} className="mt-1.5 h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('按方法使用')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                        <span>{name}</span>
                        <span className="text-xs text-muted-foreground">
                          {stats.correct}/{stats.total} ({pct}%)
                        </span>
                      </div>
                      <Progress value={pct} className="mt-1.5 h-2" />
                    </div>
                  )
                })}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">{t('最近练习')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentRecords.map((record, i) => (
                  <div
                    key={`${record.scenarioId}-${i}`}
                    className="flex items-center justify-between rounded-md border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{record.scenarioTitle}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{labels[record.taskType as TaskType] ?? record.taskType}</span>
                        <span>{formatDate(record.completedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={record.correct ? 'success' : 'warning'}>{record.score}/100</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}
