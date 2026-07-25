import { useEffect, useMemo, useState } from 'react'

import { Check, Plus } from 'lucide-react'

import type { MethodId, Project } from '@clarity/domain'

import { ApiError, runIntake, runMethodRun, runPlan, runRoute } from '@/lib/api'
import { createProjectId, saveProject } from '@/lib/projects'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

import { StepGoal } from './step-goal'
import { StepMethods } from './step-methods'
import { StepPlan } from './step-plan'
import { StepQuestions } from './step-questions'
import { StepRoute } from './step-route'
import {
  type WizardState,
  clearWizardDraft,
  emptyWizardState,
  loadWizardDraft,
  saveWizardDraft,
  wizardSteps,
} from './types'

export function WorkspacePage() {
  const { language, t } = useI18n()
  const [state, setState] = useState<WizardState>(loadWizardDraft)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [projectListVersion, setProjectListVersion] = useState(0)

  useEffect(() => {
    saveWizardDraft(state)
  }, [state])

  const update = (patch: Partial<WizardState>) => setState((current) => ({ ...current, ...patch }))

  const taskType = state.taskTypeOverride ?? state.intake?.taskType ?? null

  const answeredForApi = useMemo(() => {
    if (!state.intake) return []
    return state.intake.questions.flatMap((question) => {
      const answer = state.answers[question.id]
      const answered =
        answer !== undefined && (typeof answer === 'string' ? answer.trim().length > 0 : answer.length > 0)
      return answered ? [{ question: question.question, answer: answer as string | string[] }] : []
    })
  }, [state.intake, state.answers])

  const showError = (cause: unknown) => {
    setError(cause instanceof ApiError ? cause.message : t('请求失败，请重试。'))
  }

  /** 步骤 1/2：LLM 分析目标，动态生成缺失条件问题。 */
  async function handleIntake(nextStep: number) {
    setBusy('intake')
    setError('')
    try {
      const { result } = await runIntake({ rawGoal: state.rawGoal, answered: answeredForApi }, language)
      setState((current) => ({
        ...current,
        intake: result,
        step: nextStep,
        // 目标重新分析后，下游产物全部失效。
        plan: null,
        methodRuns: {},
        route: null,
        doneStepIds: [],
      }))
    } catch (cause) {
      showError(cause)
    } finally {
      setBusy(null)
    }
  }

  /** 步骤 2 → 3：代码路由方法，LLM 解释并生成数据需求。 */
  async function handlePlan() {
    if (!state.intake || !taskType) return
    setBusy('plan')
    setError('')
    try {
      const { result } = await runPlan(
        { rawGoal: state.rawGoal, taskType, intake: state.intake, answers: state.answers },
        language,
      )
      setState((current) => ({ ...current, plan: result, step: 3, methodRuns: {}, route: null }))
    } catch (cause) {
      showError(cause)
    } finally {
      setBusy(null)
    }
  }

  /** 步骤 4：运行单个分析方法，LLM 生成候选内容。 */
  async function handleMethodRun(methodId: MethodId, material: string) {
    if (!state.intake) return
    setBusy(`method:${methodId}`)
    setError('')
    try {
      const { result } = await runMethodRun(
        { methodId, rawGoal: state.rawGoal, intake: state.intake, answers: state.answers, material },
        language,
      )
      setState((current) => ({
        ...current,
        methodRuns: { ...current.methodRuns, [methodId]: result as never },
        route: null,
      }))
    } catch (cause) {
      showError(cause)
    } finally {
      setBusy(null)
    }
  }

  /** 步骤 4 → 5：基于方法产出生成行动路线。 */
  async function handleRoute() {
    if (!state.intake || !state.plan) return
    setBusy('route')
    setError('')
    try {
      const { result } = await runRoute(
        {
          rawGoal: state.rawGoal,
          intake: state.intake,
          answers: state.answers,
          plan: state.plan,
          methodRuns: state.methodRuns as Record<string, unknown>,
        },
        language,
      )
      setState((current) => ({ ...current, route: result, step: 5, doneStepIds: [] }))
    } catch (cause) {
      showError(cause)
    } finally {
      setBusy(null)
    }
  }

  /** 保存为执行项目（localStorage），保存后回到首页并刷新项目列表。 */
  function handleSaveProject() {
    const name = (state.intake?.restatement || state.rawGoal).trim().slice(0, 40) || t('未命名目标')
    const now = new Date().toISOString()
    saveProject({
      id: state.projectId ?? createProjectId(),
      name,
      createdAt: now,
      language,
      step: state.step,
      rawGoal: state.rawGoal,
      answers: state.answers,
      intake: state.intake,
      plan: state.plan,
      methodRuns: state.methodRuns as Record<string, unknown>,
      route: state.route,
      doneStepIds: state.doneStepIds,
    })
    clearWizardDraft()
    setState(emptyWizardState)
    setProjectListVersion((version) => version + 1)
  }

  function handleOpenProject(project: Project) {
    setError('')
    setState({
      step: project.intake ? project.step : 1,
      rawGoal: project.rawGoal,
      taskTypeOverride: null,
      intake: project.intake,
      answers: project.answers,
      plan: project.plan,
      methodRuns: project.methodRuns as WizardState['methodRuns'],
      route: project.route,
      doneStepIds: project.doneStepIds,
      projectId: project.id,
    })
  }

  function handleNewGoal() {
    clearWizardDraft()
    setState(emptyWizardState)
    setError('')
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t(state.rawGoal ? '目标草稿' : '新目标')}</span>
          </div>
          <h1 className="max-w-3xl truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {state.rawGoal || t('从一个真实目标开始')}
          </h1>
        </div>
        {state.rawGoal ? (
          <button
            type="button"
            className="text-sm text-muted-foreground underline hover:text-foreground"
            onClick={handleNewGoal}
          >
            <Plus className="mr-1 inline size-4" />
            {t('新建目标')}
          </button>
        ) : null}
      </div>

      {state.step > 1 ? (
        <div className="mb-6 rounded-lg border border-border bg-card px-4 py-3.5 sm:px-5" aria-label={t('分析进度')}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium">{t(wizardSteps[state.step - 1]?.label ?? '')}</span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {state.step} / {wizardSteps.length}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(state.step / wizardSteps.length) * 100}%` }}
            />
          </div>
          <ol className="mt-3 grid grid-cols-5 gap-1">
            {wizardSteps.map((item) => (
              <li
                key={item.id}
                className={cn(
                  'flex items-center gap-1.5 text-xs',
                  item.id === state.step && 'font-medium text-foreground',
                  item.id < state.step && 'text-muted-foreground',
                  item.id > state.step && 'text-muted-foreground/60',
                )}
              >
                {item.id < state.step ? (
                  <Check className="size-3.5 shrink-0 text-primary" />
                ) : (
                  <span
                    className={cn(
                      'size-1.5 shrink-0 rounded-full',
                      item.id === state.step ? 'bg-primary' : 'bg-muted-foreground/40',
                    )}
                  />
                )}
                <span className="hidden sm:inline">{t(item.label)}</span>
                <span className="sm:hidden">{item.id}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {state.step === 1 ? (
        <StepGoal
          rawGoal={state.rawGoal}
          onRawGoalChange={(rawGoal) => {
            update({ rawGoal })
            setError('')
          }}
          busy={busy === 'intake'}
          error={error}
          onAnalyze={() => void handleIntake(2)}
          onOpenProject={handleOpenProject}
          onProjectsChanged={() => setProjectListVersion((version) => version + 1)}
          listVersion={projectListVersion}
        />
      ) : null}

      {state.step === 2 && state.intake ? (
        <StepQuestions
          intake={state.intake}
          taskTypeOverride={state.taskTypeOverride}
          onTaskTypeChange={(taskTypeOverride) => update({ taskTypeOverride })}
          answers={state.answers}
          onAnswer={(questionId, value) => update({ answers: { ...state.answers, [questionId]: value } })}
          busy={busy}
          error={error}
          onRecheck={() => void handleIntake(2)}
          onGeneratePlan={() => void handlePlan()}
          onBack={() => update({ step: 1 })}
        />
      ) : null}

      {state.step === 3 && state.plan ? (
        <StepPlan
          plan={state.plan}
          onToggleMethod={(methodId, accepted) =>
            update({
              plan: state.plan
                ? {
                    ...state.plan,
                    methods: state.plan.methods.map((item) =>
                      item.methodId === methodId ? { ...item, accepted } : item,
                    ),
                  }
                : state.plan,
            })
          }
          onFixMissing={() => update({ step: 2 })}
          onStart={() => update({ step: 4 })}
          onBack={() => update({ step: 2 })}
        />
      ) : null}

      {state.step === 4 && state.plan ? (
        <StepMethods
          plan={state.plan}
          methodRuns={state.methodRuns}
          busy={busy}
          error={error}
          onRunMethod={(methodId, material) => void handleMethodRun(methodId, material)}
          onChangeRun={(methodId, run) =>
            update({ methodRuns: { ...state.methodRuns, [methodId]: run as never }, route: null })
          }
          onGenerateRoute={() => void handleRoute()}
          onBack={() => update({ step: 3 })}
        />
      ) : null}

      {state.step === 5 && state.route ? (
        <StepRoute
          route={state.route}
          doneStepIds={state.doneStepIds}
          onToggleDone={(stepId) =>
            update({
              doneStepIds: state.doneStepIds.includes(stepId)
                ? state.doneStepIds.filter((id) => id !== stepId)
                : [...state.doneStepIds, stepId],
            })
          }
          onSaveProject={handleSaveProject}
          saved={false}
          onBack={() => update({ step: 4 })}
        />
      ) : null}
    </div>
  )
}
