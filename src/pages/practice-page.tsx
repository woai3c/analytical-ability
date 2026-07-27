import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Loader2,
  RotateCcw,
  TrendingUp,
  X,
} from 'lucide-react'

import type { GuidedSession, GuidedStepNumber, Scenario } from '@/data/domain'
import type { TaskType } from '@/data/domain'
import { methodRegistry, taskTypeLabels, taskTypeLabelsEn } from '@/data/methods'
import { generateGuidedScenario, processStep } from '@/lib/guided-api'
import type { ProcessStepResult } from '@/lib/guided-api'
import { LlmError } from '@/lib/llm'
import type { TokenUsage } from '@/lib/llm'
import { RECORDS_KEY } from '@/lib/settings'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

// ── Storage ──────────────────────────────────────────────────────

const SESSION_KEY = 'clarity-guided-session'
const LOADING_KEY = 'clarity-guided-loading'

function loadSession(): GuidedSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as GuidedSession) : null
  } catch {
    return null
  }
}

function saveSession(session: GuidedSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* quota */
  }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(LOADING_KEY)
}

// Module-level state so navigating away and back can re-attach to
// the same generation request instead of losing it.
let inflightGeneration: Promise<{ scenario: Scenario; usage: TokenUsage }> | null = null
let inflightDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'

function buildNewSession(
  scenario: Scenario,
  usage: TokenUsage,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
): GuidedSession {
  return {
    id: `gs-${Date.now()}`,
    scenario,
    difficulty,
    currentStep: 1,
    steps: {
      problemDefinition: null,
      methodSelection: null,
      methodApplication: null,
      conclusion: null,
      reflection: null,
    },
    tokenUsage: { promptTokens: usage.promptTokens, completionTokens: usage.completionTokens },
    startedAt: new Date().toISOString(),
    completedAt: null,
  }
}

function saveRecord(session: GuidedSession) {
  try {
    const raw = localStorage.getItem(RECORDS_KEY)
    const existing: unknown[] = raw ? JSON.parse(raw) : []
    existing.push({
      scenarioId: session.scenario.id,
      scenarioTitle: session.scenario.title,
      scenarioDescription: session.scenario.description,
      scenarioContext: session.scenario.context,
      applicableMethods: session.scenario.applicableMethods,
      taskType: session.scenario.taskType,
      selectedMethods: session.steps.methodSelection?.selectedMethods ?? [],
      correct: session.steps.reflection ? session.steps.reflection.score >= 60 : false,
      score: session.steps.reflection?.score ?? 0,
      feedback: session.steps.reflection?.aiFeedback ?? '',
      improvementTip: session.steps.reflection?.tips[0] ?? '',
      methodExplanations: [],
      completedAt: session.completedAt ?? new Date().toISOString(),
      guided: true,
      problemDefinition: session.steps.problemDefinition?.userAnswer,
      methodApplication: session.steps.methodApplication?.userWork,
      conclusion: session.steps.conclusion?.userAnswer,
      dimensions: session.steps.reflection?.dimensions,
    })
    localStorage.setItem(RECORDS_KEY, JSON.stringify(existing))
  } catch {
    /* quota */
  }
}

// ── Step Labels ──────────────────────────────────────────────────

const stepLabels = {
  1: { zh: '定义问题', en: 'Define Problem' },
  2: { zh: '选择方法', en: 'Select Method' },
  3: { zh: '运用方法', en: 'Apply Method' },
  4: { zh: '得出结论', en: 'Draw Conclusion' },
  5: { zh: '反思回顾', en: 'Reflect' },
} as const

// ── Main Component ───────────────────────────────────────────────

export function PracticePage() {
  const { language, t } = useI18n()
  const [searchParams] = useSearchParams()
  const en = language === 'en'
  const labels = en ? taskTypeLabelsEn : taskTypeLabels

  const [session, setSession] = useState<GuidedSession | null>(loadSession)
  const [loading, setLoading] = useState(() => {
    // Only show loading spinner if a module-level promise is actually in-flight;
    // a stale LOADING_KEY without an active promise means the page was refreshed.
    if (inflightGeneration) return true
    sessionStorage.removeItem(LOADING_KEY)
    return false
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null)
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')

  const methodParam = searchParams.get('method') ?? undefined
  const [selectedMethod, setSelectedMethod] = useState<string | undefined>(methodParam)

  // On mount: if there's an in-flight generation from before navigation, re-attach to it
  useEffect(() => {
    if (!inflightGeneration) return
    let cancelled = false
    inflightGeneration
      .then(({ scenario, usage }) => {
        if (cancelled) return
        const s = buildNewSession(scenario, usage, inflightDifficulty)
        setSession(s)
        setTokenUsage(usage)
        saveSession(s)
        sessionStorage.removeItem(LOADING_KEY)
        inflightGeneration = null
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof LlmError ? e.message : t('加载场景失败，请重试。'))
        sessionStorage.removeItem(LOADING_KEY)
        inflightGeneration = null
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
    sessionStorage.setItem(LOADING_KEY, '1')
    inflightDifficulty = difficulty

    const promise = generateGuidedScenario({
      difficulty,
      ...(selectedMethod ? { methodId: selectedMethod } : {}),
    })
    inflightGeneration = promise

    try {
      const { scenario, usage } = await promise
      inflightGeneration = null
      sessionStorage.removeItem(LOADING_KEY)
      const s = buildNewSession(scenario, usage, difficulty)
      setSession(s)
      setTokenUsage(usage)
      saveSession(s)
    } catch (e) {
      inflightGeneration = null
      sessionStorage.removeItem(LOADING_KEY)
      setError(e instanceof LlmError ? e.message : t('加载场景失败，请重试。'))
    } finally {
      setLoading(false)
    }
  }, [difficulty, selectedMethod, t])

  function handleAbandon() {
    clearSession()
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
            <button
              type="button"
              onClick={() => setSelectedMethod(undefined)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                !selectedMethod
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
              )}
            >
              {t('随机')}
            </button>
            {methodRegistry.map((method) => {
              const name = en ? method.name.en : method.name.zh
              const isActive = selectedMethod === method.id
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
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

// ── Guided Training Panel ────────────────────────────────────────

function GuidedTraining({
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
  submitting: boolean
  setSubmitting: (b: boolean) => void
  error: string
  setError: (s: string) => void
  onAbandon: () => void
  t: (s: string) => string
  en: boolean
  labels: Record<string, string>
}) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())

  const isCompleted = session.completedAt !== null

  async function submitCurrentStep(userInput: StepUserInput) {
    setSubmitting(true)
    setError('')

    const updated = applyUserInput(session, session.currentStep, userInput)
    setSession(updated)
    saveSession(updated)

    try {
      const result: ProcessStepResult = await processStep(updated, session.currentStep)

      const withAi = applyAiResponse(updated, session.currentStep, result)

      const newUsage: TokenUsage = {
        promptTokens: withAi.tokenUsage.promptTokens + result.usage.promptTokens,
        completionTokens: withAi.tokenUsage.completionTokens + result.usage.completionTokens,
        totalTokens: 0,
      }
      withAi.tokenUsage = { promptTokens: newUsage.promptTokens, completionTokens: newUsage.completionTokens }

      if (session.currentStep < 5) {
        withAi.currentStep = (session.currentStep + 1) as GuidedStepNumber
      } else {
        withAi.completedAt = new Date().toISOString()
        saveRecord(withAi)
      }

      setSession(withAi)
      saveSession(withAi)
      setTokenUsage(newUsage)
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
      <ScenarioCard scenario={session.scenario} labels={labels} t={t} en={en} />

      {/* Completed steps (collapsed) */}
      {([1, 2, 3, 4, 5] as const)
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
  t: (s: string) => string
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-1">
        {([1, 2, 3, 4, 5] as const).map((step) => {
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
      <div className="mt-2 text-sm font-medium">
        {completed
          ? t('训练完成')
          : `${t('步骤')} ${currentStep}/5：${en ? stepLabels[currentStep].en : stepLabels[currentStep].zh}`}
      </div>
    </div>
  )
}

// ── Scenario Card ────────────────────────────────────────────────

function ScenarioCard({
  scenario,
  labels,
  t,
  en: _en,
}: {
  scenario: Scenario
  labels: Record<string, string>
  t: (s: string) => string
  en: boolean
}) {
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
  t: (s: string) => string
}) {
  const label = en ? stepLabels[stepNum].en : stepLabels[stepNum].zh
  const data = getStepDisplay(session, stepNum)

  return (
    <div className="mt-3 rounded-lg border border-border">
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
              <p className="mt-1 whitespace-pre-wrap leading-relaxed text-muted-foreground">{data.aiResponse}</p>
            </div>
          )}
          {stepNum === 5 && session.steps.reflection && (
            <ReflectionDisplay reflection={session.steps.reflection} t={t} />
          )}
        </div>
      )}
    </div>
  )
}

// ── Active Step ──────────────────────────────────────────────────

type StepUserInput =
  | { step: 1; userAnswer: string }
  | { step: 2; selectedMethods: string[]; reasoning: string }
  | { step: 3; userWork: string }
  | { step: 4; userAnswer: string }
  | { step: 5 }

function ActiveStep({
  session,
  submitting,
  onSubmit,
  en,
  t,
}: {
  session: GuidedSession
  submitting: boolean
  onSubmit: (input: StepUserInput) => void
  en: boolean
  t: (s: string) => string
}) {
  const step = session.currentStep
  const scenario = session.scenario

  switch (step) {
    case 1:
      return <Step1Input submitting={submitting} onSubmit={onSubmit} t={t} en={en} scenario={scenario} />
    case 2:
      return <Step2Input submitting={submitting} onSubmit={onSubmit} t={t} en={en} scenario={scenario} />
    case 3:
      return (
        <Step3Input
          submitting={submitting}
          onSubmit={onSubmit}
          selectedMethods={session.steps.methodSelection?.selectedMethods ?? []}
          t={t}
          en={en}
          scenario={scenario}
        />
      )
    case 4:
      return <Step4Input submitting={submitting} onSubmit={onSubmit} t={t} en={en} scenario={scenario} />
    case 5:
      return <Step5Input submitting={submitting} onSubmit={onSubmit} t={t} />
    default:
      return null
  }
}

function Step1Input({
  submitting,
  onSubmit,
  t,
  en,
  scenario,
}: {
  submitting: boolean
  onSubmit: (input: StepUserInput) => void
  t: (s: string) => string
  en: boolean
  scenario: Scenario
}) {
  const [value, setValue] = useState('')

  const hints = en
    ? [
        `Re-read the scenario title: "${scenario.title}". What core tension does it describe?`,
        'Identify the main stakeholder — who needs to make a decision or take action?',
        'Look for constraints in the background info — budget, time, resources, or trade-offs.',
        'Try framing it as: "[Stakeholder] needs to [goal] but is constrained by [limitation]."',
      ]
    : [
        `重新阅读场景标题："${scenario.title}"。它描述了什么核心矛盾？`,
        '找出主要利益相关者——谁需要做决策或采取行动？',
        '在背景信息中寻找约束条件——预算、时间、资源或权衡取舍。',
        '尝试用这个句式概括："[谁] 需要 [做什么]，但受到 [什么限制]。"',
      ]

  return (
    <div className="mt-5 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {en
            ? 'Read the scenario above. In your own words, what is the core problem?'
            : '阅读上方场景。用你自己的话，核心问题是什么？'}
        </div>
        <HintButton hints={hints} t={t} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {en
          ? 'Think about: Who faces the problem? What decision must be made? What constraints exist?'
          : '想一想：谁面临这个问题？需要做什么决策？有哪些约束条件？'}
      </p>
      <textarea
        className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/50"
        rows={4}
        placeholder={t('在这里写下你对核心问题的理解...')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <SubmitButton
          disabled={!value.trim() || submitting}
          loading={submitting}
          onClick={() => onSubmit({ step: 1, userAnswer: value.trim() })}
          t={t}
        />
      </div>
    </div>
  )
}

function Step2Input({
  submitting,
  onSubmit,
  t,
  en,
  scenario,
}: {
  submitting: boolean
  onSubmit: (input: StepUserInput) => void
  t: (s: string) => string
  en: boolean
  scenario: Scenario
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [reasoning, setReasoning] = useState('')

  const hints = en
    ? [
        `The scenario type is "${scenario.taskType}". Think about which methods are best suited for this type of problem.`,
        'Consider: Is this a root-cause analysis? An optimization? A decision-making problem? A planning task?',
        'Some methods work well together — e.g. SWOT + Decision Matrix, or Fishbone + 5 Whys.',
        'When explaining your choice, mention what the method helps you do that other methods cannot.',
      ]
    : [
        `场景类型是"${scenario.taskType}"。想想哪些方法最适合这类问题。`,
        '思考：这是根因分析？优化改进？决策问题？还是规划任务？',
        '有些方法可以组合使用——例如 SWOT + 决策矩阵，或鱼骨图 + 5 Why。',
        '解释选择时，说明这个方法能帮你做到什么，而其他方法做不到。',
      ]

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  return (
    <div className="mt-5 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {en
            ? 'Based on your problem definition, which analysis method(s) would you use?'
            : '根据你的问题定义，你会选择什么分析方法？'}
        </div>
        <HintButton hints={hints} t={t} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {en
          ? 'Select one or more methods. Then explain WHY this method fits this specific problem.'
          : '选择一个或多个方法，然后解释为什么这个方法适合这个具体问题。'}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {methodRegistry.map((method) => {
          const name = en ? method.name.en : method.name.zh
          const isSelected = selected.includes(method.id)
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => toggle(method.id)}
              className={cn(
                'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                isSelected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
              )}
            >
              {name}
            </button>
          )
        })}
      </div>
      <textarea
        className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/50"
        rows={3}
        placeholder={
          en
            ? 'Why did you choose this method? What made you rule out others?'
            : '为什么选这个方法？为什么排除其他方法？'
        }
        value={reasoning}
        onChange={(e) => setReasoning(e.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <SubmitButton
          disabled={selected.length === 0 || !reasoning.trim() || submitting}
          loading={submitting}
          onClick={() => onSubmit({ step: 2, selectedMethods: selected, reasoning: reasoning.trim() })}
          t={t}
        />
      </div>
    </div>
  )
}

function Step3Input({
  submitting,
  onSubmit,
  selectedMethods,
  t,
  en,
  scenario,
}: {
  submitting: boolean
  onSubmit: (input: StepUserInput) => void
  selectedMethods: string[]
  t: (s: string) => string
  en: boolean
  scenario: Scenario
}) {
  const [value, setValue] = useState('')

  const methodNames = selectedMethods
    .map((id) => {
      const spec = methodRegistry.find((m) => m.id === id)
      return spec ? (en ? spec.name.en : spec.name.zh) : null
    })
    .filter(Boolean)
    .join('、')

  const hints = en
    ? [
        "Follow the method steps listed below in order — don't skip any.",
        `Connect each step directly to the scenario "${scenario.title}". Use specific details from the background info.`,
        "Don't just list the steps — show your actual analysis. What did you find? What data supports it?",
        `If you chose multiple methods (${methodNames}), show how they complement each other.`,
      ]
    : [
        '按照下方列出的方法步骤依次进行——不要跳过任何一步。',
        `每一步都要紧密联系场景"${scenario.title}"，使用背景信息中的具体细节。`,
        '不要只列出步骤——展示你的实际分析。你发现了什么？有什么数据支持？',
        `如果选了多个方法（${methodNames}），展示它们如何互补配合。`,
      ]

  const methodGuide = selectedMethods
    .map((id) => {
      const spec = methodRegistry.find((m) => m.id === id)
      if (!spec) return null
      const name = en ? spec.name.en : spec.name.zh
      const steps = spec.steps.map((s, i) => `${i + 1}. ${en ? s.en : s.zh}`).join('\n')
      return `【${name}】\n${steps}`
    })
    .filter(Boolean)
    .join('\n\n')

  return (
    <div className="mt-5 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {en ? 'Now apply your chosen method to this scenario step by step.' : '现在请逐步将所选方法应用于场景。'}
        </div>
        <HintButton hints={hints} t={t} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {en
          ? 'Follow the method steps below. Write out your analysis process.'
          : '按照下面的方法步骤，写出你的分析过程。'}
      </p>
      {methodGuide && (
        <div className="mt-3 rounded-lg bg-secondary px-3 py-2.5 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {methodGuide}
        </div>
      )}
      <textarea
        className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/50"
        rows={8}
        placeholder={
          en
            ? 'Write your analysis here, following the method steps above...'
            : '在这里写出你的分析过程，按照上面的方法步骤...'
        }
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <SubmitButton
          disabled={!value.trim() || submitting}
          loading={submitting}
          onClick={() => onSubmit({ step: 3, userWork: value.trim() })}
          t={t}
        />
      </div>
    </div>
  )
}

function Step4Input({
  submitting,
  onSubmit,
  t,
  en,
  scenario,
}: {
  submitting: boolean
  onSubmit: (input: StepUserInput) => void
  t: (s: string) => string
  en: boolean
  scenario: Scenario
}) {
  const [value, setValue] = useState('')

  const hints = en
    ? [
        'Start with a one-sentence summary of your key finding.',
        `Tie your recommendation back to the original problem in "${scenario.title}".`,
        'Be specific and actionable — who should do what, by when, and why?',
        'Consider risks or trade-offs of your recommendation. Are there alternative approaches?',
      ]
    : [
        '先用一句话概括你的核心发现。',
        `把你的建议和"${scenario.title}"中的原始问题联系起来。`,
        '建议要具体可执行——谁、做什么、什么时候、为什么？',
        '考虑建议的风险或权衡取舍。是否有替代方案？',
      ]

  return (
    <div className="mt-5 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {en
            ? 'Based on your analysis, what is your conclusion or recommendation?'
            : '基于你的分析，你的结论或建议是什么？'}
        </div>
        <HintButton hints={hints} t={t} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {en ? 'Summarize what you found and what action should be taken.' : '总结你的发现，提出应该采取的行动。'}
      </p>
      <textarea
        className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/50"
        rows={4}
        placeholder={en ? 'Your conclusion and action recommendations...' : '你的结论和行动建议...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <SubmitButton
          disabled={!value.trim() || submitting}
          loading={submitting}
          onClick={() => onSubmit({ step: 4, userAnswer: value.trim() })}
          t={t}
        />
      </div>
    </div>
  )
}

function Step5Input({
  submitting,
  onSubmit,
  t,
}: {
  submitting: boolean
  onSubmit: (input: StepUserInput) => void
  t: (s: string) => string
}) {
  return (
    <div className="mt-5 rounded-lg border border-border p-4">
      <div className="text-sm font-medium">{t('准备好获取综合评价了吗？')}</div>
      <p className="mt-1 text-xs text-muted-foreground">{t('AI 教练将对你整个分析过程进行综合评审和打分。')}</p>
      <div className="mt-3 flex justify-end">
        <SubmitButton
          disabled={submitting}
          loading={submitting}
          onClick={() => onSubmit({ step: 5 })}
          t={t}
          label={t('获取评价')}
        />
      </div>
    </div>
  )
}

// ── Reflection Display ───────────────────────────────────────────

function ReflectionDisplay({
  reflection,
  t,
}: {
  reflection: NonNullable<GuidedSession['steps']['reflection']>
  t: (s: string) => string
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

function SubmitButton({
  disabled,
  loading,
  onClick,
  t,
  label,
}: {
  disabled: boolean
  loading: boolean
  onClick: () => void
  t: (s: string) => string
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
    >
      {loading && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
      {label ?? t('提交并继续')}
    </button>
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

// ── Helpers ──────────────────────────────────────────────────────

function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}m`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`
  return String(count)
}

function getStepDisplay(
  session: GuidedSession,
  step: GuidedStepNumber,
): { userAnswer: string; aiResponse: string } | null {
  switch (step) {
    case 1:
      return session.steps.problemDefinition
        ? {
            userAnswer: session.steps.problemDefinition.userAnswer,
            aiResponse: session.steps.problemDefinition.aiResponse,
          }
        : null
    case 2:
      return session.steps.methodSelection
        ? {
            userAnswer: `${session.steps.methodSelection.selectedMethods.join(', ')}\n${session.steps.methodSelection.reasoning}`,
            aiResponse: session.steps.methodSelection.aiResponse,
          }
        : null
    case 3:
      return session.steps.methodApplication
        ? {
            userAnswer: session.steps.methodApplication.userWork,
            aiResponse: session.steps.methodApplication.aiResponse,
          }
        : null
    case 4:
      return session.steps.conclusion
        ? { userAnswer: session.steps.conclusion.userAnswer, aiResponse: session.steps.conclusion.aiResponse }
        : null
    case 5:
      return session.steps.reflection ? { userAnswer: '', aiResponse: session.steps.reflection.aiFeedback } : null
    default:
      return null
  }
}

function applyUserInput(session: GuidedSession, step: GuidedStepNumber, input: StepUserInput): GuidedSession {
  const clone: GuidedSession = JSON.parse(JSON.stringify(session))
  switch (step) {
    case 1:
      if (input.step === 1) clone.steps.problemDefinition = { userAnswer: input.userAnswer, aiResponse: '' }
      break
    case 2:
      if (input.step === 2)
        clone.steps.methodSelection = {
          selectedMethods: input.selectedMethods,
          reasoning: input.reasoning,
          aiResponse: '',
        }
      break
    case 3:
      if (input.step === 3) clone.steps.methodApplication = { userWork: input.userWork, aiResponse: '' }
      break
    case 4:
      if (input.step === 4) clone.steps.conclusion = { userAnswer: input.userAnswer, aiResponse: '' }
      break
    case 5:
      break
  }
  return clone
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
  t: (s: string) => string
  en: boolean
}) {
  const methodId = session.steps.methodSelection?.selectedMethods?.[0]
  const methodSpec = methodId ? methodRegistry.find((m) => m.id === methodId) : null

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

// ── Hint Dialog ──────────────────────────────────────────────────

function HintButton({ hints, t }: { hints: string[]; t: (s: string) => string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Lightbulb className="size-3.5" />
        {t('提示')}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="relative mx-4 max-h-[80dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-background p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <Lightbulb className="size-4 text-warning" />
                {t('思路提示')}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {hints.map((hint, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-0.5 shrink-0 text-xs text-foreground/50">{i + 1}.</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}

function applyAiResponse(session: GuidedSession, step: GuidedStepNumber, result: ProcessStepResult): GuidedSession {
  const clone: GuidedSession = JSON.parse(JSON.stringify(session))
  switch (step) {
    case 1:
      if (clone.steps.problemDefinition) clone.steps.problemDefinition.aiResponse = result.aiResponse
      break
    case 2:
      if (clone.steps.methodSelection) clone.steps.methodSelection.aiResponse = result.aiResponse
      break
    case 3:
      if (clone.steps.methodApplication) clone.steps.methodApplication.aiResponse = result.aiResponse
      break
    case 4:
      if (clone.steps.conclusion) clone.steps.conclusion.aiResponse = result.aiResponse
      break
    case 5:
      if (result.reflection) {
        clone.steps.reflection = {
          aiFeedback: result.reflection.overallFeedback,
          score: result.reflection.score,
          dimensions: result.reflection.dimensions,
          tips: result.reflection.tips,
        }
      }
      break
  }
  return clone
}
