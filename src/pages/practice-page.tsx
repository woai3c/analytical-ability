import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import { Loader2 } from 'lucide-react'

import { FilterChip } from '@/components/filter-chip'
import { DifficultySelector, GuidedTraining } from '@/components/guided-practice/guided-training'
import type { Difficulty, GuidedSession, MethodId, Scenario } from '@/data/domain'
import { findMethodSpec, methodRegistry, taskTypeLabels, taskTypeLabelsEn } from '@/data/methods'
import { generateGuidedScenario } from '@/lib/guided-api'
import { buildNewSession } from '@/lib/guided-session'
import { clearGuidedSession, loadGuidedSession, saveGuidedSession } from '@/lib/guided-session-store'
import { LlmError } from '@/lib/llm'
import type { TokenUsage } from '@/lib/llm'
import { useI18n } from '@/providers/i18n-provider'

// Module-level state so navigating away and back can re-attach to
// the same generation request instead of losing it.
let inflightGeneration: Promise<{ scenario: Scenario; usage: TokenUsage }> | null = null
let inflightDifficulty: Difficulty = 'beginner'
let inflightMethodId: MethodId | undefined

// ── Main Component ───────────────────────────────────────────────

export function PracticePage() {
  const { language, t } = useI18n()
  const [searchParams] = useSearchParams()
  const en = language === 'en'
  const labels = en ? taskTypeLabelsEn : taskTypeLabels

  const [session, setSession] = useState<GuidedSession | null>(loadGuidedSession)
  const [loading, setLoading] = useState(() => {
    return inflightGeneration !== null
  })
  const [submitting, setSubmitting] = useState<'submit' | 'skip' | false>(false)
  const [error, setError] = useState('')
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')

  const requestedMethod = searchParams.get('method') ?? undefined
  const methodParam = requestedMethod ? findMethodSpec(requestedMethod)?.id : undefined
  const [selectedMethod, setSelectedMethod] = useState<MethodId | undefined>(methodParam)

  // On mount: if there's an in-flight generation from before navigation, re-attach to it
  useEffect(() => {
    if (!inflightGeneration) return
    let cancelled = false
    const attachedDifficulty = inflightDifficulty
    const attachedMethodId = inflightMethodId
    inflightGeneration
      .then(({ scenario, usage }) => {
        if (cancelled) return
        const s = buildNewSession(scenario, usage, attachedDifficulty, attachedMethodId)
        setSession(s)
        setTokenUsage(usage)
        saveGuidedSession(s)
        inflightGeneration = null
        inflightMethodId = undefined
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof LlmError ? e.message : t('加载场景失败，请重试。'))
        inflightGeneration = null
        inflightMethodId = undefined
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startNewSession = useCallback(async () => {
    if (inflightGeneration) return
    setLoading(true)
    setError('')
    inflightDifficulty = difficulty
    inflightMethodId = selectedMethod

    const promise = generateGuidedScenario({
      difficulty,
      ...(selectedMethod ? { methodId: selectedMethod } : {}),
    })
    inflightGeneration = promise

    try {
      const { scenario, usage } = await promise
      inflightGeneration = null
      inflightMethodId = undefined
      const s = buildNewSession(scenario, usage, difficulty, selectedMethod)
      setSession(s)
      setTokenUsage(usage)
      saveGuidedSession(s)
    } catch (e) {
      inflightGeneration = null
      inflightMethodId = undefined
      setError(e instanceof LlmError ? e.message : t('加载场景失败，请重试。'))
    } finally {
      setLoading(false)
    }
  }, [difficulty, selectedMethod, t])

  function handleAbandon() {
    clearGuidedSession()
    setSession(null)
    setTokenUsage(null)
  }

  // ── Render ──────────────────────────────────────────────────────

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{t('场景训练')}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{t('通过 5 步引导式分析，掌握分析方法的实际运用。')}</p>
          </div>
          <DifficultySelector value={difficulty} onChange={setDifficulty} t={t} />
        </div>

        {/* Method filter */}
        <div className="mt-5">
          <p className="text-xs text-muted-foreground">{t('选择专项训练方法（可选）')}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <FilterChip active={!selectedMethod} onClick={() => setSelectedMethod(undefined)}>
              {t('随机')}
            </FilterChip>
            {methodRegistry.map((method) => {
              const name = en ? method.name.en : method.name.zh
              const isActive = selectedMethod === method.id
              return (
                <FilterChip key={method.id} active={isActive} onClick={() => setSelectedMethod(method.id)}>
                  {name}
                </FilterChip>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-(--destructive)/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">{t('正在生成训练场景...')}</span>
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">{t('点击下方按钮生成一个训练场景。')}</p>
            <button
              type="button"
              onClick={() => void startNewSession()}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              {t('开始训练')}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <GuidedTraining
      session={session}
      setSession={setSession}
      tokenUsage={tokenUsage}
      setTokenUsage={setTokenUsage}
      submitting={submitting}
      setSubmitting={setSubmitting}
      error={error}
      setError={setError}
      onAbandon={handleAbandon}
      t={t}
      en={en}
      labels={labels}
    />
  )
}
