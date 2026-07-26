import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'

import { CheckCircle2, Loader2, RefreshCw, Send, XCircle } from 'lucide-react'

import { methodRegistry, taskTypeLabels, taskTypeLabelsEn } from '@clarity/analysis-engine'
import type { TaskType } from '@clarity/domain'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError, generateScenario, submitPractice } from '@/lib/api'
import type { PracticeFeedback, Scenario } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

export function PracticePage() {
  const { language, t } = useI18n()
  const [searchParams] = useSearchParams()
  const en = language === 'en'
  const labels = en ? taskTypeLabelsEn : taskTypeLabels

  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [reasoning, setReasoning] = useState('')
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')

  const methodParam = searchParams.get('method') ?? undefined
  const initialLoadDone = useRef(false)

  const loadScenario = useCallback(async () => {
    setLoading(true)
    setError('')
    setFeedback(null)
    setSelectedMethods([])
    setReasoning('')
    try {
      const { result } = await generateScenario({
        difficulty,
        ...(methodParam ? { methodId: methodParam } : {}),
      })
      setScenario(result)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('加载场景失败，请重试。'))
    } finally {
      setLoading(false)
    }
  }, [difficulty, methodParam, t])

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true
      void loadScenario()
      return
    }
    void loadScenario()
  }, [loadScenario])

  function toggleMethod(id: string) {
    setSelectedMethods((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  async function handleSubmit() {
    if (!scenario || selectedMethods.length === 0) return
    setSubmitting(true)
    setError('')
    try {
      const { result } = await submitPractice({
        scenarioTitle: scenario.title,
        scenarioDescription: scenario.description,
        scenarioContext: scenario.context,
        applicableMethods: scenario.applicableMethods,
        selectedMethods,
        reasoning,
      })
      setFeedback(result)
      savePracticeRecord(scenario, selectedMethods, result)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('提交失败，请重试。'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('场景训练')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('阅读场景，判断该用什么分析方法，写出你的思路。提交后获得反馈。')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DifficultySelector value={difficulty} onChange={setDifficulty} t={t} />
          <Button variant="outline" size="sm" onClick={loadScenario} disabled={loading}>
            <RefreshCw className={cn('mr-1.5 size-3.5', loading && 'animate-spin')} />
            {t('换一个')}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <span className="text-sm">{t('正在生成训练场景...')}</span>
        </div>
      ) : scenario ? (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{scenario.title}</CardTitle>
                <Badge variant="outline">{labels[scenario.taskType as TaskType] ?? scenario.taskType}</Badge>
                <Badge variant="secondary">
                  {t(
                    scenario.difficulty === 'beginner'
                      ? '入门'
                      : scenario.difficulty === 'intermediate'
                        ? '进阶'
                        : '挑战',
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7">{scenario.description}</p>
              <div className="rounded-md bg-muted p-4">
                <div className="text-xs font-medium text-muted-foreground">{t('背景信息')}</div>
                <p className="mt-1 text-sm leading-6">{scenario.context}</p>
              </div>
            </CardContent>
          </Card>

          {!feedback ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('你认为该用什么分析方法？')}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t('可以选择一个或多个。先独立思考再选择。')}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {methodRegistry.map((method) => {
                      const name = en ? method.name.en : method.name.zh
                      const selected = selectedMethods.includes(method.id)
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => toggleMethod(method.id)}
                          className={cn(
                            'rounded-md border px-3 py-2.5 text-left text-sm transition',
                            selected
                              ? 'border-primary bg-primary/5 font-medium text-foreground'
                              : 'border-border text-muted-foreground hover:border-ring',
                          )}
                        >
                          {name}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('写出你的分析思路')}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {t('为什么选这个方法？你打算怎么用它？（可选但强烈建议填写，帮助你理清思路）')}
                  </p>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full rounded-md border border-border bg-background p-3 text-sm leading-6 placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none"
                    rows={4}
                    placeholder={t('例如：这个场景的核心问题是...所以我选择...因为...')}
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={selectedMethods.length === 0 || submitting}
                  className="min-w-[120px]"
                >
                  {submitting ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <Send className="mr-1.5 size-3.5" />
                  )}
                  {t('提交答案')}
                </Button>
              </div>
            </>
          ) : (
            <FeedbackPanel feedback={feedback} scenario={scenario} t={t} en={en} onNext={loadScenario} />
          )}
        </div>
      ) : null}
    </div>
  )
}

function FeedbackPanel({
  feedback,
  scenario,
  t,
  en,
  onNext,
}: {
  feedback: PracticeFeedback
  scenario: Scenario
  t: (s: string) => string
  en: boolean
  onNext: () => void
}) {
  return (
    <div className="space-y-4">
      <Card className={cn(feedback.correct ? 'border-[var(--success)]/30' : 'border-[var(--warning)]/30')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {feedback.correct ? (
              <CheckCircle2 className="size-5 text-[var(--success)]" />
            ) : (
              <XCircle className="size-5 text-[var(--warning)]" />
            )}
            {t(feedback.correct ? '判断正确' : '需要调整')}
            <Badge variant="outline">{feedback.score}/100</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6">{feedback.feedback}</p>

          <div>
            <h3 className="text-sm font-medium">{t('方法适配分析')}</h3>
            <div className="mt-2 space-y-2">
              {feedback.methodExplanations.map((item) => {
                const spec = methodRegistry.find((m) => m.id === item.methodId)
                const name = spec ? (en ? spec.name.en : spec.name.zh) : item.methodId
                return (
                  <div
                    key={item.methodId}
                    className={cn(
                      'rounded-md border p-3 text-sm',
                      item.fit === 'good' && 'border-[var(--success)]/30 bg-[var(--success)]/5',
                      item.fit === 'partial' && 'border-border bg-muted/50',
                      item.fit === 'poor' && 'border-[var(--warning)]/30 bg-[var(--warning)]/5',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{name}</span>
                      <Badge variant={item.fit === 'good' ? 'success' : item.fit === 'partial' ? 'outline' : 'warning'}>
                        {t(item.fit === 'good' ? '适合' : item.fit === 'partial' ? '部分适合' : '不太合适')}
                      </Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground">{item.explanation}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-md bg-primary/5 p-4">
            <h3 className="text-sm font-medium text-primary">{t('下次记住')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{feedback.improvementTip}</p>
          </div>
        </CardContent>
      </Card>

      {scenario.commonMistakes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('常见误区')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scenario.commonMistakes.map((mistake) => {
              const spec = methodRegistry.find((m) => m.id === mistake.methodId)
              const name = spec ? (en ? spec.name.en : spec.name.zh) : mistake.methodId
              return (
                <div key={mistake.methodId} className="text-sm">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground"> — {mistake.why}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-center">
        <Button onClick={onNext} className="min-w-[140px]">
          <RefreshCw className="mr-1.5 size-3.5" />
          {t('下一个场景')}
        </Button>
      </div>
    </div>
  )
}

function DifficultySelector({
  value,
  onChange,
  t,
}: {
  value: string
  onChange: (v: 'beginner' | 'intermediate' | 'advanced') => void
  t: (s: string) => string
}) {
  const options = [
    { id: 'beginner' as const, label: t('入门') },
    { id: 'intermediate' as const, label: t('进阶') },
    { id: 'advanced' as const, label: t('挑战') },
  ]

  return (
    <div className="flex rounded-md border border-border">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'px-3 py-1.5 text-xs transition first:rounded-l-md last:rounded-r-md',
            value === opt.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function savePracticeRecord(scenario: Scenario, selected: string[], feedback: PracticeFeedback) {
  try {
    const key = 'clarity-practice-records'
    const existing = JSON.parse(localStorage.getItem(key) ?? '[]')
    existing.push({
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      taskType: scenario.taskType,
      selectedMethods: selected,
      correct: feedback.correct,
      score: feedback.score,
      completedAt: new Date().toISOString(),
    })
    localStorage.setItem(key, JSON.stringify(existing))
  } catch {
    // 静默失败
  }
}
