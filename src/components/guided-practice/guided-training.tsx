import { useRef, useState } from 'react'
import { Link } from 'react-router'

import { ArrowRight, BookOpen, ChevronDown, ChevronRight, ChevronUp, RotateCcw, TrendingUp } from 'lucide-react'

import { ActiveStep } from '@/components/guided-practice/active-step'
import { Markdown } from '@/components/markdown'
import { guidedStepNumbers } from '@/data/domain'
import type { Difficulty, GuidedSession, GuidedStepNumber, Scenario, TaskType } from '@/data/domain'
import { guidedStepLabels } from '@/data/guided-steps'
import { findMethodSpec } from '@/data/methods'
import { processStep } from '@/lib/guided-api'
import type { ProcessStepResult } from '@/lib/guided-api'
import { applyAiResponse, applyUserInput, getStepDisplay } from '@/lib/guided-session'
import type { StepUserInput } from '@/lib/guided-session'
import { saveGuidedSession } from '@/lib/guided-session-store'
import { LlmError } from '@/lib/llm'
import type { TokenUsage } from '@/lib/llm'
import { saveGuidedPracticeRecord } from '@/lib/practice-records'
import { cn } from '@/lib/utils'
import type { Translate } from '@/providers/i18n-provider'

export function GuidedTraining({
  session,
  setSession,
  tokenUsage,
  setTokenUsage,
  submitting,
  setSubmitting,
  error,
  setError,
  onAbandon,
  t,
  en,
  labels,
}: {
  session: GuidedSession
  setSession: (s: GuidedSession | null) => void
  tokenUsage: TokenUsage | null
  setTokenUsage: (u: TokenUsage | null) => void
  submitting: 'submit' | 'skip' | false
  setSubmitting: (b: 'submit' | 'skip' | false) => void
  error: string
  setError: (s: string) => void
  onAbandon: () => void
  t: Translate
  en: boolean
  labels: Record<string, string>
}) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())

  const isCompleted = session.completedAt !== null

  async function submitCurrentStep(userInput: StepUserInput) {
    const isSkip = 'skipped' in userInput && userInput.skipped
    setSubmitting(isSkip ? 'skip' : 'submit')
    setError('')

    const updated = applyUserInput(session, session.currentStep, userInput)
    setSession(updated)
    saveGuidedSession(updated)

    try {
      const result: ProcessStepResult = await processStep(updated, session.currentStep)

      const withAi = applyAiResponse(updated, session.currentStep, result)

      const newUsage: TokenUsage = {
        promptTokens: withAi.tokenUsage.promptTokens + result.usage.promptTokens,
        completionTokens: withAi.tokenUsage.completionTokens + result.usage.completionTokens,
      }
      withAi.tokenUsage = { promptTokens: newUsage.promptTokens, completionTokens: newUsage.completionTokens }

      if (session.currentStep < 5) {
        withAi.currentStep = (session.currentStep + 1) as GuidedStepNumber
      } else {
        withAi.completedAt = new Date().toISOString()
        saveGuidedPracticeRecord(withAi)
      }

      setSession(withAi)
      saveGuidedSession(withAi)
      setTokenUsage(newUsage)
      setExpandedSteps((prev) => new Set([...prev, session.currentStep]))
    } catch (e) {
      setError(e instanceof LlmError ? e.message : t('提交失败，请重试。'))
    } finally {
      setSubmitting(false)
    }
  }

  function toggleExpand(step: number) {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(step)) next.delete(step)
      else next.add(step)
      return next
    })
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('场景训练')}</h1>
        {!isCompleted && (
          <button
            type="button"
            onClick={onAbandon}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {t('放弃重来')}
          </button>
        )}
        {isCompleted && (
          <button
            type="button"
            onClick={onAbandon}
            className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background"
          >
            {t('开始新训练')}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <StepProgress currentStep={session.currentStep} completed={isCompleted} en={en} t={t} />

      {/* Scenario card */}
      <ScenarioCard scenario={session.scenario} labels={labels} t={t} />

      {/* Completed steps (collapsed) */}
      {guidedStepNumbers
        .filter((s) => s < session.currentStep || isCompleted)
        .map((stepNum) => (
          <CompletedStep
            key={stepNum}
            stepNum={stepNum}
            session={session}
            expanded={expandedSteps.has(stepNum)}
            onToggle={() => toggleExpand(stepNum)}
            en={en}
            t={t}
          />
        ))}

      {/* Active step input */}
      {!isCompleted && (
        <ActiveStep session={session} submitting={submitting} onSubmit={submitCurrentStep} en={en} t={t} />
      )}

      {/* Completion actions */}
      {isCompleted && <CompletionActions session={session} onNewTraining={onAbandon} t={t} en={en} />}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-(--destructive)/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Token usage */}
      {tokenUsage && (
        <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Token: ↑{formatTokenCount(tokenUsage.promptTokens)} ↓{formatTokenCount(tokenUsage.completionTokens)}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Step Progress ────────────────────────────────────────────────

function StepProgress({
  currentStep,
  completed,
  en,
  t,
}: {
  currentStep: GuidedStepNumber
  completed: boolean
  en: boolean
  t: Translate
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-1">
        {guidedStepNumbers.map((step) => {
          const isDone = completed || step < currentStep
          const isCurrent = !completed && step === currentStep
          return (
            <div key={step} className="flex flex-1 items-center">
              <div
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-xs font-medium',
                  isDone && 'bg-foreground text-background',
                  isCurrent && 'border-2 border-foreground text-foreground',
                  !isDone && !isCurrent && 'border border-border text-muted-foreground',
                )}
              >
                {isDone ? '✓' : step}
              </div>
              {step < 5 && (
                <div
                  className={cn('mx-1 h-px flex-1', step < currentStep || completed ? 'bg-foreground' : 'bg-border')}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex gap-1">
        {guidedStepNumbers.map((step) => {
          const isCurrent = !completed && step === currentStep
          return (
            <div key={step} className="flex-1 text-center">
              <span className={cn('text-[10px]', isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                {en ? guidedStepLabels[step].en : guidedStepLabels[step].zh}
              </span>
            </div>
          )
        })}
      </div>
      {completed && <div className="mt-1 text-sm font-medium">{t('训练完成')}</div>}
    </div>
  )
}

// ── Scenario Card ────────────────────────────────────────────────

function ScenarioCard({ scenario, labels, t }: { scenario: Scenario; labels: Record<string, string>; t: Translate }) {
  return (
    <section className="mt-5 rounded-lg border border-border">
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
  )
}

// ── Completed Step ───────────────────────────────────────────────

function CompletedStep({
  stepNum,
  session,
  expanded,
  onToggle,
  en,
  t,
}: {
  stepNum: GuidedStepNumber
  session: GuidedSession
  expanded: boolean
  onToggle: () => void
  en: boolean
  t: Translate
}) {
  const label = en ? guidedStepLabels[stepNum].en : guidedStepLabels[stepNum].zh
  const data = getStepDisplay(session, stepNum)
  const headerRef = useRef<HTMLDivElement>(null)

  function handleCollapse() {
    onToggle()
    setTimeout(() => {
      headerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  return (
    <div ref={headerRef} className="mt-3 rounded-lg border border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-secondary"
      >
        {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        <span>
          {t('步骤')} {stepNum}：{label}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">{t('已完成')}</span>
      </button>
      {expanded && data && (
        <div className="space-y-3 border-t border-border px-4 py-3 text-sm">
          {data.userAnswer && (
            <div>
              <div className="text-xs font-medium text-muted-foreground">{t('你的回答')}</div>
              <p className="mt-1 whitespace-pre-wrap leading-relaxed">{data.userAnswer}</p>
            </div>
          )}
          {data.aiResponse && (
            <div>
              <div className="text-xs font-medium text-muted-foreground">{t('教练反馈')}</div>
              <Markdown text={data.aiResponse} className="mt-1 text-muted-foreground" />
            </div>
          )}
          {stepNum === 5 && session.steps.reflection && (
            <ReflectionDisplay reflection={session.steps.reflection} t={t} />
          )}
          <button
            type="button"
            onClick={handleCollapse}
            className="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronUp className="size-3" />
            {t('收起')}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Reflection Display ───────────────────────────────────────────

function ReflectionDisplay({
  reflection,
  t,
}: {
  reflection: NonNullable<GuidedSession['steps']['reflection']>
  t: Translate
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold tabular-nums">{reflection.score}/100</span>
        <span className="text-xs text-muted-foreground">{t('综合得分')}</span>
      </div>
      {reflection.dimensions.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {reflection.dimensions.map((dim) => (
            <div key={dim.name} className="rounded-lg bg-secondary px-3 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{dim.name}</span>
                <span className="tabular-nums">{dim.score}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{dim.comment}</p>
            </div>
          ))}
        </div>
      )}
      {reflection.tips.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground">{t('改进建议')}</div>
          <ul className="mt-1 space-y-1">
            {reflection.tips.map((tip, i) => (
              <li key={i} className="text-sm leading-relaxed">
                • {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Shared Components ────────────────────────────────────────────

export function DifficultySelector({
  value,
  onChange,
  t,
}: {
  value: Difficulty
  onChange: (v: Difficulty) => void
  t: Translate
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

// ── Helpers ──────────────────────────────────────────────────────

function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}m`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`
  return String(count)
}

// ── Completion Actions ───────────────────────────────────────────

function CompletionActions({
  session,
  onNewTraining,
  t,
  en,
}: {
  session: GuidedSession
  onNewTraining: () => void
  t: Translate
  en: boolean
}) {
  const methodId = session.steps.methodSelection?.selectedMethods?.[0]
  const methodSpec = methodId ? findMethodSpec(methodId) : null

  return (
    <div className="mt-6 rounded-lg border border-border bg-secondary p-5">
      <h3 className="text-sm font-semibold">{en ? "What's next?" : '接下来？'}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={onNewTraining}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
        >
          <RotateCcw className="size-4 shrink-0 text-muted-foreground" />
          <span>{t('再来一局')}</span>
        </button>

        <Link
          to="/progress"
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
        >
          <TrendingUp className="size-4 shrink-0 text-muted-foreground" />
          <span>{t('查看进度')}</span>
        </Link>

        {methodSpec && (
          <Link
            to={`/methods/${methodSpec.id}`}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
          >
            <BookOpen className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{en ? methodSpec.name.en : methodSpec.name.zh}</span>
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
          </Link>
        )}
      </div>
    </div>
  )
}
