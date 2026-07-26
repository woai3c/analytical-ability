import { useCallback, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'

import { Loader2 } from 'lucide-react'

import { methodRegistry, taskTypeLabels, taskTypeLabelsEn } from '@clarity/analysis-engine'
import type { TaskType } from '@clarity/domain'

import { ApiError, generateScenario, submitPractice } from '@/lib/api'
import type { PracticeFeedback, Scenario } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

const STORAGE_KEY = 'clarity-practice-session'

interface PracticeSession {
  scenario: Scenario
  selectedMethods: string[]
  reasoning: string
  feedback: PracticeFeedback | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

function loadSession(): PracticeSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PracticeSession
  } catch {
    return null
  }
}

function saveSession(session: PracticeSession) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // quota exceeded
  }
}

function clearSession() {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function PracticePage() {
  const { language, t } = useI18n()
  const [searchParams] = useSearchParams()
  const en = language === 'en'
  const labels = en ? taskTypeLabelsEn : taskTypeLabels

  const [initialSession] = useState(loadSession)

  const [scenario, setScenario] = useState<Scenario | null>(initialSession?.scenario ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedMethods, setSelectedMethods] = useState<string[]>(initialSession?.selectedMethods ?? [])
  const [reasoning, setReasoning] = useState(initialSession?.reasoning ?? '')
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(initialSession?.feedback ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    initialSession?.difficulty ?? 'beginner',
  )

  const methodParam = searchParams.get('method') ?? undefined
  const loadingRef = useRef(false)

  const persistState = useCallback(
    (patch: Partial<PracticeSession>) => {
      const current: PracticeSession = {
        scenario: patch.scenario ?? scenario!,
        selectedMethods: patch.selectedMethods ?? selectedMethods,
        reasoning: patch.reasoning ?? reasoning,
        feedback: patch.feedback ?? feedback,
        difficulty: patch.difficulty ?? difficulty,
      }
      if (current.scenario) saveSession(current)
    },
    [scenario, selectedMethods, reasoning, feedback, difficulty],
  )

  const loadScenario = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
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
      const session: PracticeSession = {
        scenario: result,
        selectedMethods: [],
        reasoning: '',
        feedback: null,
        difficulty,
      }
      saveSession(session)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('加载场景失败，请重试。'))
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [difficulty, methodParam, t])

  function toggleMethod(id: string) {
    setSelectedMethods((prev) => {
      const next = prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
      persistState({ selectedMethods: next })
      return next
    })
  }

  function handleReasoningChange(value: string) {
    setReasoning(value)
    persistState({ reasoning: value })
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
      persistState({ feedback: result })
      savePracticeRecord(scenario, selectedMethods, result)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('提交失败，请重试。'))
    } finally {
      setSubmitting(false)
    }
  }

  function handleNewScenario() {
    clearSession()
    void loadScenario()
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{t('场景训练')}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t('阅读场景，判断该用什么分析方法，写出你的思路。提交后获得反馈。')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DifficultySelector value={difficulty} onChange={setDifficulty} t={t} />
          <button
            type="button"
            onClick={handleNewScenario}
            disabled={loading}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            {t('换一个')}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-[var(--destructive)]/30 px-4 py-3 text-sm text-[var(--destructive)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">{t('正在生成训练场景...')}</span>
        </div>
      ) : scenario ? (
        <div className="mt-6 space-y-6">
          {/* 场景描述 */}
          <section className="rounded-lg border border-border">
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-baseline gap-2">
                <h2 className="font-medium">{scenario.title}</h2>
                <span className="text-xs text-muted-foreground">
                  {labels[scenario.taskType as TaskType] ?? scenario.taskType}
                </span>
              </div>
            </div>
            <div className="px-4 py-3 text-sm leading-relaxed">{scenario.description}</div>
            <div className="border-t border-border bg-secondary px-4 py-3">
              <div className="text-xs font-medium text-muted-foreground">{t('背景信息')}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{scenario.context}</p>
            </div>
          </section>

          {!feedback ? (
            <>
              {/* 方法选择 */}
              <section>
                <h2 className="text-sm font-medium">{t('你认为该用什么分析方法？')}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{t('可以选择一个或多个。先独立思考再选择。')}</p>
                <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {methodRegistry.map((method) => {
                    const name = en ? method.name.en : method.name.zh
                    const selected = selectedMethods.includes(method.id)
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => toggleMethod(method.id)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                          selected
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                        )}
                      >
                        {name}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* 思路 */}
              <section>
                <h2 className="text-sm font-medium">{t('写出你的分析思路')}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('为什么选这个方法？你打算怎么用它？（可选但强烈建议填写，帮助你理清思路）')}
                </p>
                <textarea
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none"
                  rows={4}
                  placeholder={t('例如：这个场景的核心问题是...所以我选择...因为...')}
                  value={reasoning}
                  onChange={(e) => handleReasoningChange(e.target.value)}
                />
              </section>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={selectedMethods.length === 0 || submitting}
                  className="inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
                >
                  {submitting && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                  {t('提交答案')}
                </button>
              </div>
            </>
          ) : (
            <FeedbackPanel feedback={feedback} scenario={scenario} t={t} en={en} onNext={handleNewScenario} />
          )}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">{t('点击下方按钮生成一个训练场景。')}</p>
          <button
            type="button"
            onClick={handleNewScenario}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            {t('开始训练')}
          </button>
        </div>
      )}
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
    <div className="space-y-5">
      <section className="rounded-lg border border-border">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="font-medium">{t(feedback.correct ? '判断正确' : '需要调整')}</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">{feedback.score}/100</span>
        </div>
        <div className="px-4 py-3 text-sm leading-relaxed">{feedback.feedback}</div>

        <div className="border-t border-border px-4 py-3">
          <h3 className="text-sm font-medium">{t('方法适配分析')}</h3>
          <div className="mt-2 space-y-2">
            {feedback.methodExplanations.map((item) => {
              const spec = methodRegistry.find((m) => m.id === item.methodId)
              const name = spec ? (en ? spec.name.en : spec.name.zh) : item.methodId
              return (
                <div key={item.methodId} className="rounded-lg border border-border px-3 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{name}</span>
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-xs',
                        item.fit === 'good' &&
                          'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]',
                        item.fit === 'partial' && 'bg-secondary text-muted-foreground',
                        item.fit === 'poor' &&
                          'bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]',
                      )}
                    >
                      {t(item.fit === 'good' ? '适合' : item.fit === 'partial' ? '部分适合' : '不太合适')}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{item.explanation}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-border bg-secondary px-4 py-3">
          <h3 className="text-sm font-medium">{t('下次记住')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{feedback.improvementTip}</p>
        </div>
      </section>

      {scenario.commonMistakes.length > 0 && (
        <section className="rounded-lg border border-border px-4 py-3">
          <h3 className="text-sm font-medium">{t('常见误区')}</h3>
          <div className="mt-2 space-y-1.5">
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
          </div>
        </section>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
        >
          {t('下一个场景')}
        </button>
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
    <div className="flex overflow-hidden rounded-lg border border-border">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'px-2.5 py-1.5 text-xs transition-colors',
            value === opt.id
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
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
    const raw = localStorage.getItem(key)
    const existing: unknown[] = raw ? JSON.parse(raw) : []
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
    // quota exceeded
  }
}
