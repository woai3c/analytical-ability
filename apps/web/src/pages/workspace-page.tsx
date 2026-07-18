import { useEffect, useMemo, useState } from 'react'

import { analyzeGoal, taskTypeLabels, taskTypeLabelsEn } from '@clarity/analysis-engine'
import { type GoalInput, type LlmAnalysis, emptyGoalInput, goalInputSchema, taskTypes } from '@clarity/domain'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, Input, Textarea } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { assistGoal } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

const storageKey = 'analysis-goal-draft-v1'
const steps = [
  { id: 1, label: '描述目标' },
  { id: 2, label: '补齐条件' },
  { id: 3, label: '数据计划' },
  { id: 4, label: '行动路线' },
] as const
type Step = (typeof steps)[number]['id']

const chineseExamples: Array<{ label: string; goal: Partial<GoalInput> }> = [
  {
    label: '职业转型',
    goal: {
      rawGoal: '我想在六个月内转向 AI 产品经理岗位',
      currentState: '有三年 Web 开发经验，还没有产品经理工作经历',
      desiredOutcome: '获得至少一个 AI 产品经理录用通知',
      successMetric: '拿到一份满足薪资底线的书面 offer',
      deadline: '2027-01-31',
      constraints: ['每周最多投入 10 小时', '暂时不能离职脱产'],
      knownFacts: ['已经完成两个 AI API 小项目'],
    },
  },
  {
    label: '改进产品',
    goal: {
      rawGoal: '把新用户完成首次核心操作的比例提高到 45%',
      currentState: '过去四周平均完成率为 28%',
      desiredOutcome: '更多新用户在注册后 24 小时内完成首次核心操作',
      successMetric: '连续四周的完成率不低于 45%',
      deadline: '2026-10-01',
      constraints: ['不增加强制弹窗', '开发投入不超过两个迭代'],
      knownFacts: ['目前最大流失发生在资料填写步骤'],
    },
  },
  {
    label: '比较选择',
    goal: {
      rawGoal: '在三套客服系统中选择最适合 20 人团队的一套',
      currentState: '正在使用表格和个人微信协作，记录分散',
      desiredOutcome: '选出一套能统一工单、知识库和服务数据的系统',
      successMetric: '满足全部硬约束且团队试用评分最高',
      deadline: '2026-09-15',
      constraints: ['第一年总成本不超过 8 万元', '必须支持数据导出'],
      knownFacts: ['预计同时在线坐席不超过 12 人'],
    },
  },
]

const englishExamples: typeof chineseExamples = [
  {
    label: 'Career change',
    goal: {
      rawGoal: 'Move into an AI product manager role within six months',
      currentState: 'Three years of web development experience and no product manager experience',
      desiredOutcome: 'Receive at least one offer for an AI product manager role',
      successMetric: 'Receive a written offer above my minimum salary',
      deadline: '2027-01-31',
      constraints: ['No more than 10 hours per week', 'Cannot leave my current job yet'],
      knownFacts: ['Completed two small projects using AI APIs'],
    },
  },
  {
    label: 'Improve a product',
    goal: {
      rawGoal: 'Increase new-user completion of the first core action to 45%',
      currentState: 'The four-week average completion rate is 28%',
      desiredOutcome: 'More new users complete the first core action within 24 hours',
      successMetric: 'Remain at or above 45% for four consecutive weeks',
      deadline: '2026-10-01',
      constraints: ['No forced pop-ups', 'No more than two development iterations'],
      knownFacts: ['The largest drop-off currently occurs during profile setup'],
    },
  },
  {
    label: 'Compare options',
    goal: {
      rawGoal: 'Choose the best customer support system for a team of 20',
      currentState: 'Work is fragmented across spreadsheets and personal messaging accounts',
      desiredOutcome: 'Select one system for tickets, knowledge, and service data',
      successMetric: 'Meet every hard constraint and achieve the highest trial score',
      deadline: '2026-09-15',
      constraints: ['First-year cost below 80,000 CNY', 'Data export is required'],
      knownFacts: ['No more than 12 agents are expected online simultaneously'],
    },
  },
]

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
        <Button type="button" variant="outline" onClick={add} aria-label={t('添加{{label}}', { label })}>
          {t('添加')}
        </Button>
      </div>
      {values.length ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((value) => (
            <span key={value} className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-xs">
              {value}
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onChange(values.filter((item) => item !== value))}
                aria-label={t('删除{{value}}', { value })}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </Field>
  )
}

export function WorkspacePage() {
  const { language, t } = useI18n()
  const [goal, setGoal] = useState<GoalInput>(loadGoal)
  const [step, setStep] = useState<Step>(() => (loadGoal().rawGoal ? 2 : 1))
  const [llmResponse, setLlmResponse] = useState<{ language: typeof language; result: LlmAnalysis } | null>(null)
  const [llmError, setLlmError] = useState('')
  const [llmLoading, setLlmLoading] = useState(false)
  const analysis = useMemo(
    () => (goal.rawGoal.trim().length >= 4 ? analyzeGoal(goal, language) : null),
    [goal, language],
  )
  const examples = language === 'en' ? englishExamples : chineseExamples
  const localizedTaskTypeLabels = language === 'en' ? taskTypeLabelsEn : taskTypeLabels
  const llmResult = llmResponse?.language === language ? llmResponse.result : null

  useEffect(() => {
    if (goal.rawGoal) localStorage.setItem(storageKey, JSON.stringify(goal))
  }, [goal])

  function update<K extends keyof GoalInput>(field: K, value: GoalInput[K]) {
    setGoal((current) => ({ ...current, [field]: value }))
    setLlmResponse(null)
  }

  function applyExample(example: (typeof examples)[number]) {
    setGoal({ ...emptyGoalInput, ...example.goal })
    setStep(2)
    setLlmResponse(null)
  }

  function resetGoal() {
    if (goal.rawGoal && !window.confirm(t('清空当前草稿并新建目标？'))) return
    localStorage.removeItem(storageKey)
    setGoal(emptyGoalInput)
    setStep(1)
    setLlmResponse(null)
    setLlmError('')
  }

  async function runSemanticAssist() {
    setLlmLoading(true)
    setLlmError('')
    try {
      const response = await assistGoal(goal, language)
      setLlmResponse({ language, result: response.result })
    } catch {
      setLlmError(t('智能补充暂时不可用，请稍后重试。'))
    } finally {
      setLlmLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t(goal.rawGoal ? '目标草稿' : '新目标')}</span>
            {goal.rawGoal ? <Badge variant="success">{t('已保存')}</Badge> : null}
          </div>
          <h1 className="max-w-3xl truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {goal.rawGoal || t('从一个真实目标开始')}
          </h1>
        </div>
        <Button variant="outline" onClick={resetGoal}>
          {t('新建目标')}
        </Button>
      </div>

      <ol
        className="mb-6 grid grid-cols-4 gap-1 rounded-lg border border-border bg-card p-1.5 sm:gap-2"
        aria-label={t('分析进度')}
      >
        {steps.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={cn(
                'w-full rounded-md px-2 py-2 text-xs text-muted-foreground transition sm:text-sm',
                item.id === step && 'bg-secondary font-medium text-secondary-foreground',
                item.id < step && 'text-foreground',
              )}
              onClick={() => {
                if (item.id === 1 || goal.rawGoal.length >= 4) setStep(item.id)
              }}
            >
              <span className="sm:hidden">{item.id}</span>
              <span className="hidden sm:inline">{t(item.label)}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          {step === 1 ? (
            <Card className="overflow-hidden">
              <CardContent className="p-6 sm:p-10">
                <div className="mb-5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {t('新建分析')}
                </div>
                <h2 className="max-w-3xl font-serif text-3xl leading-tight tracking-tight sm:text-[34px]">
                  {t('你现在最想完成的目标是什么？')}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {t(
                    '先用自己的话描述。系统会区分事实、假设和未知项，告诉你还缺什么数据，而不是直接生成一篇看似正确的答案。',
                  )}
                </p>
                <Textarea
                  className="mt-7 min-h-40 bg-background text-base leading-7 sm:text-lg"
                  value={goal.rawGoal}
                  onChange={(event) => update('rawGoal', event.target.value)}
                  placeholder={t(
                    '例如：我想在六个月内转向 AI 产品经理，但不知道需要补哪些能力、收集什么岗位数据，也不知道该从哪一步开始。',
                  )}
                  autoFocus
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="self-center text-xs text-muted-foreground">{t('加载完整示例：')}</span>
                  {examples.map((example) => (
                    <Button
                      key={example.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyExample(example)}
                    >
                      {example.label}
                    </Button>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <Button size="lg" disabled={goal.rawGoal.trim().length < 4} onClick={() => setStep(2)}>
                    {t('开始拆解')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card>
              <CardHeader className="border-b border-border p-6 sm:px-8">
                <CardTitle className="text-xl">{t('把愿望改成可分析的目标')}</CardTitle>
                <CardDescription>
                  {t('不知道的字段可以先留空；右侧会解释为什么需要它，而不会替你捏造。')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-7 p-6 sm:p-8">
                <Field label={t('原始目标')} hint={t('必填')} htmlFor="raw-goal">
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
                      placeholder={t('现在已经有什么、做到什么程度？')}
                    />
                  </Field>
                  <Field label={t('期望结果')} hint={t('可观察结果')} htmlFor="desired-outcome">
                    <Textarea
                      id="desired-outcome"
                      value={goal.desiredOutcome}
                      onChange={(event) => update('desiredOutcome', event.target.value)}
                      placeholder={t('完成后具体会发生什么？')}
                    />
                  </Field>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label={t('成功标准')} hint={t('指标或证据')} htmlFor="success-metric">
                    <Input
                      id="success-metric"
                      value={goal.successMetric}
                      onChange={(event) => update('successMetric', event.target.value)}
                      placeholder={t('例如：连续四周达到 45%')}
                    />
                  </Field>
                  <Field label={t('期限')} hint={t('决定计划强度')} htmlFor="deadline">
                    <Input
                      id="deadline"
                      type="date"
                      value={goal.deadline}
                      onChange={(event) => update('deadline', event.target.value)}
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
                  <Button onClick={() => setStep(3)}>{t('继续到数据计划')}</Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {step === 3 && analysis ? (
            <div className="space-y-5">
              <Card>
                <CardHeader className="border-b border-border p-6 sm:px-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">{t('先收集这些数据')}</CardTitle>
                      <CardDescription>
                        {t('每一项都说明收集原因、字段和做法。必要数据不等于所有可能有用的数据。')}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{analysis.taskTypeLabel}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
                  {analysis.dataNeeds.map((need, index) => (
                    <article key={need.id} className="rounded-lg border border-border bg-background p-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold">{index + 1}</span>
                        <Badge variant={need.required ? 'warning' : 'outline'}>
                          {t(need.required ? '必要' : '可选')}
                        </Badge>
                      </div>
                      <h3 className="mt-4 font-semibold">{need.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{need.reason}</p>
                      <div className="mt-4">
                        <div className="text-xs font-medium text-foreground">{t('需要填写')}</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {need.fields.map((field) => (
                            <Badge key={field} variant="outline">
                              {field}
                            </Badge>
                          ))}
                        </div>
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
                  <CardTitle className="text-xl">{t('从今天开始的行动路线')}</CardTitle>
                  <CardDescription>{t('当前路线优先补齐高价值信息，再进行分析、行动和复盘。')}</CardDescription>
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
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  {t('返回数据计划')}
                </Button>
                <Button variant="secondary">{t('保存为执行项目')}</Button>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="space-y-4 xl:sticky xl:top-[68px]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{t('分析状态')}</CardTitle>
                {analysis ? <Badge variant="secondary">{analysis.taskTypeLabel}</Badge> : null}
              </div>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <>
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-sm text-muted-foreground">{t('目标完整度')}</span>
                    <span className="text-2xl font-semibold">
                      {analysis.completeness}
                      <span className="text-sm text-muted-foreground">%</span>
                    </span>
                  </div>
                  <Progress value={analysis.completeness} />
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{analysis.summary}</p>
                </>
              ) : (
                <p className="py-6 text-center text-sm leading-6 text-muted-foreground">
                  {t('输入目标后，这里会显示任务类型、缺口和风险。')}
                </p>
              )}
            </CardContent>
          </Card>

          {analysis ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('智能补充')}</CardTitle>
                <CardDescription>
                  {t('规则负责稳定的流程骨架，智能补充只发现目标上下文中的隐含假设和检索词。')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!llmResult ? (
                  <Button className="w-full" variant="outline" disabled={llmLoading} onClick={runSemanticAssist}>
                    {t(llmLoading ? '正在分析' : '补充语义分析')}
                  </Button>
                ) : (
                  <div className="space-y-4 text-xs leading-5">
                    <div>
                      <div className="font-medium text-foreground">{t('目标重述')}</div>
                      <p className="mt-1 text-muted-foreground">{llmResult.goalRestatement}</p>
                    </div>
                    {llmResult.assumptions.length ? (
                      <div>
                        <div className="font-medium text-foreground">{t('隐含假设')}</div>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
                          {llmResult.assumptions.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div>
                      <div className="font-medium text-foreground">{t('建议下一步')}</div>
                      <p className="mt-1 text-muted-foreground">{llmResult.suggestedNextStep}</p>
                    </div>
                    <Button className="w-full" size="sm" variant="ghost" onClick={runSemanticAssist}>
                      {t('重新生成')}
                    </Button>
                  </div>
                )}
                {llmError ? <p className="mt-3 text-xs leading-5 text-destructive">{llmError}</p> : null}
              </CardContent>
            </Card>
          ) : null}

          {analysis?.clarifications.length ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('待澄清问题')}</CardTitle>
                <CardDescription>{t('先回答前面的必要问题，后续结论会更可靠。')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.clarifications.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-md border border-border p-3">
                    <p className="text-sm font-medium leading-5">{item.question}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {analysis ? (
            <Card className="border-[color-mix(in_oklch,var(--warning)_38%,var(--border))]">
              <CardHeader>
                <CardTitle>{t('分析边界')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-4 text-xs leading-5 text-muted-foreground">
                  {analysis.cautions.map((caution) => (
                    <li key={caution}>{caution}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
