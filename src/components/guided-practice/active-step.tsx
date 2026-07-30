import { useState } from 'react'

import { Lightbulb, Loader2, X } from 'lucide-react'

import type { GuidedSession, Scenario } from '@/data/domain'
import type { TaskType } from '@/data/domain-constants'
import { findMethodSpec, methodRegistry, taskTypeLabels, taskTypeLabelsEn } from '@/data/methods'
import type { StepUserInput } from '@/lib/guided-session'
import { cn } from '@/lib/utils'
import type { Translate } from '@/providers/i18n-provider'

type SubmissionState = 'submit' | 'skip' | false

interface ActiveStepProps {
  session: GuidedSession
  submitting: SubmissionState
  onSubmit: (input: StepUserInput) => void
  en: boolean
  t: Translate
}

interface StepInputProps {
  submitting: SubmissionState
  onSubmit: (input: StepUserInput) => void
  t: Translate
  en: boolean
  scenario: Scenario
}

export function ActiveStep({ session, submitting, onSubmit, en, t }: ActiveStepProps) {
  const step = session.currentStep
  const scenario = session.scenario
  const stepInputProps = { submitting, onSubmit, t, en, scenario }

  switch (step) {
    case 1:
      return <Step1MethodSelect {...stepInputProps} />
    case 2:
      return (
        <Step2Analysis {...stepInputProps} selectedMethods={session.steps.methodSelection?.selectedMethods ?? []} />
      )
    case 3:
      return <Step3Review submitting={submitting} onSubmit={onSubmit} t={t} />
    default:
      return null
  }
}

function TextStepInput({
  question,
  description,
  hints,
  guide,
  rows,
  placeholder,
  submitting,
  onSubmit,
  onSkip,
  t,
}: {
  question: string
  description: string
  hints: string[]
  guide?: string
  rows: number
  placeholder: string
  submitting: SubmissionState
  onSubmit: (value: string) => void
  onSkip: () => void
  t: Translate
}) {
  const [value, setValue] = useState('')

  return (
    <div className="mt-5 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{question}</div>
        <HintButton hints={hints} t={t} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      {guide && (
        <div className="mt-3 rounded-lg bg-secondary px-3 py-2.5 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {guide}
        </div>
      )}
      <textarea
        className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/50"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <div className="mt-3 flex items-center justify-end gap-2">
        <SkipButton submitting={submitting} onClick={onSkip} t={t} />
        <SubmitButton
          disabled={!value.trim() || !!submitting}
          loading={submitting === 'submit'}
          onClick={() => onSubmit(value.trim())}
          t={t}
        />
      </div>
    </div>
  )
}

/** 步骤 1（随机训练）：阅读场景 + 选择方法 + 说明理由 */
function Step1MethodSelect({ submitting, onSubmit, t, en, scenario }: StepInputProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [reasoning, setReasoning] = useState('')

  const taskLabel = en
    ? (taskTypeLabelsEn[scenario.taskType as TaskType] ?? scenario.taskType)
    : (taskTypeLabels[scenario.taskType as TaskType] ?? scenario.taskType)

  const hints = en
    ? [
        `This scenario is about "${taskLabel}". Think about which methods are best suited for this type of problem.`,
        'Consider: Is this a root-cause analysis? An optimization? A decision-making problem? A planning task?',
        'Some methods work well together — e.g. Fishbone + 5 Whys, or ABC + MCDA.',
        'When explaining your choice, mention what the method helps you do that other methods cannot.',
      ]
    : [
        `这个场景属于"${taskLabel}"类问题。想想哪些方法最适合这类问题。`,
        '思考：这是根因分析？优化改进？决策问题？还是规划任务？',
        '有些方法可以组合使用——例如鱼骨图 + 5 Why，或 ABC + MCDA。',
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
            ? 'Read the scenario above, then choose an analysis method and explain why.'
            : '阅读上面的场景，选择分析方法并说明理由。'}
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
      <div className="mt-3 flex items-center justify-end gap-2">
        <SkipButton
          submitting={submitting}
          onClick={() =>
            onSubmit({
              step: 1,
              selectedMethods: scenario.applicableMethods ?? [],
              reasoning: en ? '(skipped)' : '（跳过）',
              skipped: true,
            })
          }
          t={t}
        />
        <SubmitButton
          disabled={selected.length === 0 || !reasoning.trim() || !!submitting}
          loading={submitting === 'submit'}
          onClick={() => onSubmit({ step: 1, selectedMethods: selected, reasoning: reasoning.trim() })}
          t={t}
        />
      </div>
    </div>
  )
}

/** 步骤 2（随机）/ 步骤 1（专项）：分析与结论 */
function Step2Analysis({
  submitting,
  onSubmit,
  selectedMethods,
  t,
  en,
  scenario,
}: StepInputProps & {
  selectedMethods: string[]
}) {
  const methodNames = selectedMethods
    .map((id) => {
      const spec = findMethodSpec(id)
      return spec ? (en ? spec.name.en : spec.name.zh) : null
    })
    .filter(Boolean)
    .join('、')

  const hints = en
    ? [
        "Follow the method steps listed below in order — don't skip any.",
        `Connect each step directly to the scenario "${scenario.title}". Use specific details from the background info.`,
        "This is a practice scenario — you don't need real data. It's OK to reason based on the information given and your best judgment.",
        'After the analysis, write your conclusion: key findings + recommended actions.',
        `If you chose multiple methods (${methodNames}), show how they complement each other.`,
      ]
    : [
        '按照下方列出的方法步骤依次进行——不要跳过任何一步。',
        `每一步都要紧密联系场景"${scenario.title}"，使用背景信息中的具体细节。`,
        '这是训练场景——你不需要真实数据。可以根据场景提供的信息和你的合理判断来推理。',
        '分析完成后，写出你的结论：核心发现 + 建议行动。',
        `如果选了多个方法（${methodNames}），展示它们如何互补配合。`,
      ]

  const methodGuide = selectedMethods
    .map((id) => {
      const spec = findMethodSpec(id)
      if (!spec) return null
      const name = en ? spec.name.en : spec.name.zh
      const steps = spec.steps.map((s, i) => `${i + 1}. ${en ? s.en : s.zh}`).join('\n')
      return `【${name}】\n${steps}`
    })
    .filter(Boolean)
    .join('\n\n')

  return (
    <TextStepInput
      question={
        en
          ? 'Apply the method to analyze the scenario, then draw your conclusion.'
          : '运用方法分析场景，然后得出你的结论。'
      }
      description={
        en
          ? 'Follow the method steps below. After the analysis, summarize your key findings and propose specific action recommendations.'
          : '按照下面的方法步骤来分析。分析完成后，总结核心发现并提出具体的行动建议。'
      }
      hints={hints}
      guide={methodGuide}
      rows={10}
      placeholder={
        en
          ? 'Analysis:\nStep 1: ...\nStep 2: ...\n\nConclusion:\nKey findings: ...\nRecommended actions: ...'
          : '分析过程：\n步骤1：...\n步骤2：...\n\n结论：\n核心发现：...\n建议行动：...'
      }
      submitting={submitting}
      onSubmit={(value) => onSubmit({ step: 2, userWork: value })}
      onSkip={() => onSubmit({ step: 2, userWork: en ? '(skipped)' : '（跳过）', skipped: true })}
      t={t}
    />
  )
}

/** 步骤 3（随机）/ 步骤 2（专项）：综合评审 */
function Step3Review({
  submitting,
  onSubmit,
  t,
}: {
  submitting: SubmissionState
  onSubmit: (input: StepUserInput) => void
  t: Translate
}) {
  return (
    <div className="mt-5 rounded-lg border border-border p-4">
      <div className="text-sm font-medium">{t('准备好获取综合评价了吗？')}</div>
      <p className="mt-1 text-xs text-muted-foreground">{t('AI 教练将对你整个分析过程进行综合评审和打分。')}</p>
      <div className="mt-3 flex justify-end">
        <SubmitButton
          disabled={!!submitting}
          loading={submitting === 'submit'}
          onClick={() => onSubmit({ step: 3 })}
          t={t}
          label={t('获取评价')}
        />
      </div>
    </div>
  )
}

// ── Shared UI Components ────────────────────────────────────────

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
  t: Translate
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

function SkipButton({ submitting, onClick, t }: { submitting: SubmissionState; onClick: () => void; t: Translate }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!!submitting}
      className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
    >
      {submitting === 'skip' && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
      {submitting === 'skip' ? t('处理中...') : t('跳过，看答案')}
    </button>
  )
}

function HintButton({ hints, t }: { hints: string[]; t: Translate }) {
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
