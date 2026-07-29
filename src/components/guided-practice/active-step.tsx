import { useState } from 'react'

import { Lightbulb, Loader2, X } from 'lucide-react'

import type { GuidedSession, Scenario } from '@/data/domain'
import { findMethodSpec, methodRegistry } from '@/data/methods'
import type { StepUserInput } from '@/lib/guided-session'
import { cn } from '@/lib/utils'
import type { Translate } from '@/providers/i18n-provider'

export function ActiveStep({
  session,
  submitting,
  onSubmit,
  en,
  t,
}: {
  session: GuidedSession
  submitting: 'submit' | 'skip' | false
  onSubmit: (input: StepUserInput) => void
  en: boolean
  t: Translate
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
  submitting: 'submit' | 'skip' | false
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

function Step1Input({
  submitting,
  onSubmit,
  t,
  en,
  scenario,
}: {
  submitting: 'submit' | 'skip' | false
  onSubmit: (input: StepUserInput) => void
  t: Translate
  en: boolean
  scenario: Scenario
}) {
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
    <TextStepInput
      question={
        en
          ? 'Read the scenario above. In your own words, what is the core problem?'
          : '阅读上方场景。用你自己的话，核心问题是什么？'
      }
      description={
        en
          ? 'Think about: Who faces the problem? What decision must be made? What constraints exist?'
          : '想一想：谁面临这个问题？需要做什么决策？有哪些约束条件？'
      }
      hints={hints}
      rows={4}
      placeholder={t('在这里写下你对核心问题的理解...')}
      submitting={submitting}
      onSubmit={(value) => onSubmit({ step: 1, userAnswer: value })}
      onSkip={() => onSubmit({ step: 1, userAnswer: en ? '(skipped)' : '（跳过）', skipped: true })}
      t={t}
    />
  )
}

function Step2Input({
  submitting,
  onSubmit,
  t,
  en,
  scenario,
}: {
  submitting: 'submit' | 'skip' | false
  onSubmit: (input: StepUserInput) => void
  t: Translate
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
      <div className="mt-3 flex items-center justify-end gap-2">
        <SkipButton
          submitting={submitting}
          onClick={() =>
            onSubmit({
              step: 2,
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
  submitting: 'submit' | 'skip' | false
  onSubmit: (input: StepUserInput) => void
  selectedMethods: string[]
  t: Translate
  en: boolean
  scenario: Scenario
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
      question={en ? 'Now apply your chosen method to this scenario step by step.' : '现在请逐步将所选方法应用于场景。'}
      description={
        en
          ? 'Follow the method steps below. Write out your analysis process.'
          : '按照下面的方法步骤，写出你的分析过程。'
      }
      hints={hints}
      guide={methodGuide}
      rows={8}
      placeholder={
        en
          ? 'Write your analysis here, following the method steps above...'
          : '在这里写出你的分析过程，按照上面的方法步骤...'
      }
      submitting={submitting}
      onSubmit={(value) => onSubmit({ step: 3, userWork: value })}
      onSkip={() => onSubmit({ step: 3, userWork: en ? '(skipped)' : '（跳过）', skipped: true })}
      t={t}
    />
  )
}

function Step4Input({
  submitting,
  onSubmit,
  t,
  en,
  scenario,
}: {
  submitting: 'submit' | 'skip' | false
  onSubmit: (input: StepUserInput) => void
  t: Translate
  en: boolean
  scenario: Scenario
}) {
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
    <TextStepInput
      question={
        en
          ? 'Based on your analysis, what is your conclusion or recommendation?'
          : '基于你的分析，你的结论或建议是什么？'
      }
      description={
        en ? 'Summarize what you found and what action should be taken.' : '总结你的发现，提出应该采取的行动。'
      }
      hints={hints}
      rows={4}
      placeholder={en ? 'Your conclusion and action recommendations...' : '你的结论和行动建议...'}
      submitting={submitting}
      onSubmit={(value) => onSubmit({ step: 4, userAnswer: value })}
      onSkip={() => onSubmit({ step: 4, userAnswer: en ? '(skipped)' : '（跳过）', skipped: true })}
      t={t}
    />
  )
}

function Step5Input({
  submitting,
  onSubmit,
  t,
}: {
  submitting: 'submit' | 'skip' | false
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
          onClick={() => onSubmit({ step: 5 })}
          t={t}
          label={t('获取评价')}
        />
      </div>
    </div>
  )
}

// ── Reflection Display ───────────────────────────────────────────

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

function SkipButton({
  submitting,
  onClick,
  t,
}: {
  submitting: 'submit' | 'skip' | false
  onClick: () => void
  t: Translate
}) {
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
