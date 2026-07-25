import { useMemo } from 'react'

import { RefreshCw, Sparkles } from 'lucide-react'

import { taskTypeLabels, taskTypeLabelsEn } from '@clarity/analysis-engine'
import type { AnswerValue, Answers, IntakeResult, TaskType } from '@clarity/domain'
import { taskTypes } from '@clarity/domain'

import { QuestionCard, isAnswered } from '@/components/question-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Markdown } from '@/components/ui/markdown'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

const priorityOrder = { high: 0, medium: 1, low: 2 } as const

export function StepQuestions({
  intake,
  taskTypeOverride,
  onTaskTypeChange,
  answers,
  onAnswer,
  busy,
  error,
  onRecheck,
  onGeneratePlan,
  onBack,
}: {
  intake: IntakeResult
  taskTypeOverride: TaskType | null
  onTaskTypeChange: (value: TaskType | null) => void
  answers: Answers
  onAnswer: (questionId: string, value: AnswerValue) => void
  busy: string | null
  error: string
  onRecheck: () => void
  onGeneratePlan: () => void
  onBack: () => void
}) {
  const { language, t } = useI18n()
  const labels = language === 'en' ? taskTypeLabelsEn : taskTypeLabels
  const activeTaskType = taskTypeOverride ?? intake.taskType

  const sortedQuestions = useMemo(
    () => [...intake.questions].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    [intake.questions],
  )
  const unansweredHigh = sortedQuestions.filter((q) => q.priority === 'high' && !isAnswered(answers[q.id]))
  const extractedEntries = [
    { label: '当前起点', value: intake.extracted.currentState },
    { label: '期望结果', value: intake.extracted.desiredOutcome },
    { label: '成功标准', value: intake.extracted.successMetric },
    { label: '期限', value: intake.extracted.deadline },
    ...intake.extracted.constraints.map((value) => ({ label: '限制条件', value })),
    ...intake.extracted.knownFacts.map((value) => ({ label: '已知事实', value })),
  ].filter((entry) => entry.value.trim())

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="border-b border-border p-6 sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle size="lg">{t('AI 对你目标的理解')}</CardTitle>
            <Badge variant="secondary">{labels[activeTaskType]}</Badge>
          </div>
          <CardDescription>{intake.taskTypeReason}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-6 sm:p-8">
          <div>
            <div className="text-xs font-medium text-muted-foreground">{t('目标重述')}</div>
            <div className="mt-1 text-sm leading-6">
              <Markdown>{intake.restatement}</Markdown>
            </div>
          </div>

          {extractedEntries.length ? (
            <div>
              <div className="text-xs font-medium text-muted-foreground">{t('已经从你的描述里提取到')}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {extractedEntries.map((entry, index) => (
                  <span key={`${entry.label}-${index}`} className="rounded-md bg-muted px-2.5 py-1.5 text-xs">
                    <span className="text-muted-foreground">{t(entry.label)}：</span>
                    {entry.value}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {intake.assumptions.length ? (
            <div>
              <div className="text-xs font-medium text-muted-foreground">
                {t('你描述里的隐含假设（需要验证，不是事实）')}
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-6 text-muted-foreground">
                {intake.assumptions.map((assumption) => (
                  <li key={assumption}>
                    <Markdown>{assumption}</Markdown>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <div className="mb-2 text-xs font-medium text-muted-foreground">{t('任务类型（判断错了可以改）')}</div>
            <div className="flex flex-wrap gap-2">
              {taskTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={cn(
                    'rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-ring hover:text-foreground',
                    activeTaskType === type && 'border-primary bg-secondary font-medium text-secondary-foreground',
                  )}
                  onClick={() => onTaskTypeChange(type === intake.taskType ? null : type)}
                >
                  {labels[type]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">
              {sortedQuestions.length ? t('开始分析前，还需要你补充这些条件') : t('条件已经足够，可以直接进入分析计划')}
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t('这些问题是 AI 根据你的目标和要用到的分析方法动态生成的，每张卡片都标了哪个方法需要它。')}
            </p>
          </div>
          <Button variant="outline" size="sm" disabled={busy === 'intake'} onClick={onRecheck}>
            <RefreshCw className={cn('size-3.5', busy === 'intake' && 'animate-spin')} />
            {t(busy === 'intake' ? '正在重新检查…' : '再检查一遍还缺什么')}
          </Button>
        </div>

        <div className="space-y-3">
          {sortedQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) => onAnswer(question.id, value)}
            />
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <Button variant="ghost" onClick={onBack}>
          {t('返回')}
        </Button>
        <div className="flex items-center gap-3">
          {unansweredHigh.length ? (
            <span className="text-xs text-[var(--warning)]">
              {t('还有 {{count}} 个必答问题未填，对应的方法将无法运行', { count: unansweredHigh.length })}
            </span>
          ) : null}
          <Button disabled={busy === 'plan'} onClick={onGeneratePlan}>
            <Sparkles className="size-4" />
            {t(busy === 'plan' ? '正在生成分析计划…' : '生成分析计划')}
          </Button>
        </div>
      </div>
    </div>
  )
}
