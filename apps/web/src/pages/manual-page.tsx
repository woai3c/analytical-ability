import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'

import { ArrowRight, Check, FolderCheck, Plus, X } from 'lucide-react'

import { analyzeGoal, taskTypeLabels, taskTypeLabelsEn } from '@clarity/analysis-engine'
import { type GoalInput, emptyGoalInput, goalInputSchema, taskTypes } from '@clarity/domain'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, Input, Textarea } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { createProjectId, saveProject } from '@/lib/projects'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

const storageKey = 'analysis-manual-draft-v1'
const steps = [
  { id: 1, label: '描述目标' },
  { id: 2, label: '补齐条件' },
  { id: 3, label: '数据计划' },
  { id: 4, label: '行动路线' },
] as const
type Step = (typeof steps)[number]['id']

function loadGoal(): GoalInput {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return emptyGoalInput
    const parsed = goalInputSchema.safeParse(JSON.parse(stored))
    return parsed.success ? parsed.data : emptyGoalInput
  } catch {
    return emptyGoalInput
  }
}

function TagEditor({
  id,
  label,
  hint,
  placeholder,
  values,
  onChange,
}: {
  id: string
  label: string
  hint: string
  placeholder: string
  values: string[]
  onChange: (values: string[]) => void
}) {
  const { t } = useI18n()
  const [draft, setDraft] = useState('')
  const add = () => {
    const value = draft.trim()
    if (!value || values.includes(value)) return
    onChange([...values, value])
    setDraft('')
  }

  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
        />
        <Button type="button" variant="outline" className="shrink-0 px-3" onClick={add} aria-label={t('添加')}>
          <Plus className="size-4" />
        </Button>
      </div>
      {values.length ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((value) => (
            <span key={value} className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-xs">
              {value}
              <button
                type="button"
                className="flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => onChange(values.filter((item) => item !== value))}
                aria-label={t('删除')}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </Field>
  )
}

/** 离线规则模式：不调用 LLM，全部内容由本地规则引擎生成。LLM 配置好后请回到主流程。 */
export function ManualPage() {
  const { language, t } = useI18n()
  const [goal, setGoal] = useState<GoalInput>(loadGoal)
  const [step, setStep] = useState<Step>(() => (loadGoal().rawGoal ? 2 : 1))
  const [rawGoalError, setRawGoalError] = useState('')
  const [saved, setSaved] = useState(false)
  const analysis = useMemo(
    () => (goal.rawGoal.trim().length >= 4 ? analyzeGoal(goal, language) : null),
    [goal, language],
  )
  const localizedTaskTypeLabels = language === 'en' ? taskTypeLabelsEn : taskTypeLabels

  useEffect(() => {
    if (goal.rawGoal) localStorage.setItem(storageKey, JSON.stringify(goal))
  }, [goal])

  function update<K extends keyof GoalInput>(field: K, value: GoalInput[K]) {
    setGoal((current) => ({ ...current, [field]: value }))
    setRawGoalError('')
  }

  function resetGoal() {
    localStorage.removeItem(storageKey)
    setGoal(emptyGoalInput)
    setStep(1)
    setRawGoalError('')
    setSaved(false)
  }

  function continueToDataPlan() {
    if (goal.rawGoal.trim().length < 4) {
      setRawGoalError(t('请先填写原始目标（至少 4 个字）'))
      return
    }
    setStep(3)
  }

  function handleSaveProject() {
    const now = new Date().toISOString()
    saveProject({
      id: createProjectId(),
      name: goal.rawGoal.trim().slice(0, 40) || t('未命名目标'),
      createdAt: now,
      language,
      step: 1,
      rawGoal: goal.rawGoal,
      answers: {},
      intake: null,
      plan: null,
      methodRuns: {},
      route: null,
      doneStepIds: [],
    })
    setSaved(true)
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 rounded-md border border-[color-mix(in_oklch,var(--warning)_38%,var(--border))] bg-[color-mix(in_oklch,var(--warning)_8%,transparent)] p-4 text-sm leading-6">
        {t('离线规则模式：当前内容全部由本地规则模板生成，没有 AI 分析。配置好模型 API Key 后，')}
        <Link to="/" className="underline">
          {t('回到智能分析流程')}
        </Link>
        。
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="max-w-3xl truncate text-xl font-semibold tracking-tight sm:text-2xl">
          {goal.rawGoal || t('从一个真实目标开始')}
        </h1>
        <Button variant="outline" onClick={resetGoal}>
          <Plus className="size-4" />
          {t('新建目标')}
        </Button>
      </div>

      <div className="mb-6 rounded-lg border border-border bg-card px-4 py-3.5 sm:px-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium">{t(steps[step - 1]?.label ?? '')}</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {step} / {steps.length}
          </span>
        </div>
        <Progress value={(step / steps.length) * 100} className="mt-2.5" />
      </div>

      {step === 1 ? (
        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-10">
            <h2 className="max-w-3xl text-2xl font-semibold leading-tight tracking-tight">
              {t('你现在最想完成的目标是什么？')}
            </h2>
            <Textarea
              className="mt-7 min-h-40 bg-background text-base leading-7"
              value={goal.rawGoal}
              onChange={(event) => update('rawGoal', event.target.value)}
              placeholder={t(
                '例如：我想在六个月内转向 AI 产品经理，但不知道需要补哪些能力、收集什么岗位数据，也不知道该从哪一步开始。',
              )}
              autoFocus
            />
            <div className="mt-8 flex justify-end">
              <Button size="lg" disabled={goal.rawGoal.trim().length < 4} onClick={() => setStep(2)}>
                {t('开始拆解')}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader className="border-b border-border p-6 sm:px-8">
            <CardTitle size="lg">{t('把愿望改成可分析的目标')}</CardTitle>
            <CardDescription>{t('不知道的字段可以先留空。')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-7 p-6 sm:p-8">
            <Field label={t('原始目标')} required error={rawGoalError} htmlFor="raw-goal">
              <Textarea
                id="raw-goal"
                value={goal.rawGoal}
                onChange={(event) => update('rawGoal', event.target.value)}
              />
            </Field>
            <div className="grid gap-6 md:grid-cols-2">
              <Field label={t('当前起点')} hint={t('基线')} htmlFor="current-state">
                <Textarea
                  id="current-state"
                  value={goal.currentState}
                  onChange={(event) => update('currentState', event.target.value)}
                />
              </Field>
              <Field label={t('期望结果')} hint={t('可观察结果')} htmlFor="desired-outcome">
                <Textarea
                  id="desired-outcome"
                  value={goal.desiredOutcome}
                  onChange={(event) => update('desiredOutcome', event.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Field label={t('成功标准')} hint={t('指标或证据')} htmlFor="success-metric">
                <Input
                  id="success-metric"
                  value={goal.successMetric}
                  onChange={(event) => update('successMetric', event.target.value)}
                />
              </Field>
              <Field label={t('期限')} hint={t('决定计划强度')} htmlFor="deadline">
                <DatePicker
                  id="deadline"
                  value={goal.deadline}
                  onChange={(value) => update('deadline', value)}
                  language={language}
                  placeholder={t('选择日期')}
                />
              </Field>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">{t('任务类型')}</div>
              <div className="flex flex-wrap gap-2">
                {taskTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={cn(
                      'rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-ring hover:text-foreground',
                      (goal.preferredTaskType ?? analysis?.taskType) === type &&
                        'border-primary bg-secondary font-medium text-secondary-foreground',
                    )}
                    onClick={() => update('preferredTaskType', type)}
                  >
                    {localizedTaskTypeLabels[type]}
                  </button>
                ))}
                {goal.preferredTaskType ? (
                  <button
                    type="button"
                    className="px-2 text-xs text-muted-foreground underline"
                    onClick={() => update('preferredTaskType', null)}
                  >
                    {t('恢复自动判断')}
                  </button>
                ) : null}
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <TagEditor
                id="constraints"
                label={t('限制条件')}
                hint={t('硬边界与偏好')}
                placeholder={t('例如：每周最多投入 10 小时')}
                values={goal.constraints}
                onChange={(values) => update('constraints', values)}
              />
              <TagEditor
                id="known-facts"
                label={t('已知事实')}
                hint={t('需要来源')}
                placeholder={t('例如：过去四周平均完成率为 28%')}
                values={goal.knownFacts}
                onChange={(values) => update('knownFacts', values)}
              />
            </div>
            <div className="flex justify-between border-t border-border pt-6">
              <Button variant="ghost" onClick={() => setStep(1)}>
                {t('返回')}
              </Button>
              <Button onClick={continueToDataPlan}>{t('继续到数据计划')}</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 && analysis ? (
        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b border-border p-6 sm:px-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle size="lg">{t('先收集这些数据')}</CardTitle>
                <Badge variant="secondary">{analysis.taskTypeLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
              {analysis.dataNeeds.map((need) => (
                <article key={need.id} className="rounded-lg border border-border bg-background p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{need.title}</h3>
                    <Badge variant={need.required ? 'warning' : 'outline'}>{t(need.required ? '必要' : '可选')}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{need.reason}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {need.fields.map((field) => (
                      <Badge key={field} variant="outline">
                        {field}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 rounded-md bg-muted p-3 text-xs leading-5 text-muted-foreground">
                    <span className="font-medium text-foreground">{t('怎么做：')}</span>
                    {need.collectionMethod}
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              {t('修改条件')}
            </Button>
            <Button onClick={() => setStep(4)}>{t('查看行动路线')}</Button>
          </div>
        </div>
      ) : null}

      {step === 4 && analysis ? (
        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b border-border p-6 sm:px-8">
              <CardTitle size="lg">{t('从今天开始的行动路线')}</CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-7">
              <ol className="space-y-4">
                {analysis.actionSteps.map((action, index) => (
                  <li key={action.id} className="grid grid-cols-[28px_1fr] gap-3">
                    <div className="pt-4 text-center text-xs font-semibold text-muted-foreground">{index + 1}</div>
                    <div className="rounded-lg border border-border bg-background p-4 sm:p-5">
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.description}</p>
                      <div className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                        <strong className="font-medium text-foreground">{t('完成标准：')}</strong>
                        {action.doneWhen}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(3)}>
              {t('返回数据计划')}
            </Button>
            <div className="flex items-center gap-3">
              {saved ? (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--success)]">
                  <Check className="size-3.5" />
                  {t('已保存到项目列表')}
                </span>
              ) : null}
              <Button variant="secondary" onClick={handleSaveProject} disabled={saved}>
                <FolderCheck className="size-4" />
                {t('保存为执行项目')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
