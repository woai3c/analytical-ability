import { useState } from 'react'

import { Plus, X } from 'lucide-react'

import type { AnswerValue, DynamicQuestion, MethodId } from '@clarity/domain'
import { methodIds } from '@clarity/domain'

import { MethodBadge } from '@/components/method-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input, Textarea } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

const priorityLabels = { high: '必须补充', medium: '建议补充', low: '可选' } as const

function asMethodIds(ids: string[]): MethodId[] {
  return ids.filter((id): id is MethodId => (methodIds as readonly string[]).includes(id))
}

export function isAnswered(value: AnswerValue | undefined): boolean {
  if (value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  return value.length > 0
}

/**
 * 动态问题卡片：问题由 LLM 根据用户目标生成，每张卡片标清楚
 * "为什么问"和"哪个分析方法需要它"，并给出本目标专属的填写示例。
 */
export function QuestionCard({
  question,
  value,
  onChange,
}: {
  question: DynamicQuestion
  value: AnswerValue | undefined
  onChange: (value: AnswerValue) => void
}) {
  const { language, t } = useI18n()
  const [draft, setDraft] = useState('')
  const answered = isAnswered(value)
  const stringValue = typeof value === 'string' ? value : ''
  const listValue = Array.isArray(value) ? value : []

  const addListItem = (text: string) => {
    const item = text.trim()
    if (!item || listValue.includes(item)) return
    onChange([...listValue, item])
    setDraft('')
  }

  return (
    <article
      className={cn(
        'rounded-lg border p-4 transition sm:p-5',
        answered
          ? 'border-[color-mix(in_oklch,var(--success)_40%,var(--border))] bg-background'
          : 'border-border bg-background',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={question.priority === 'high' ? 'warning' : 'outline'}>
          {t(priorityLabels[question.priority])}
        </Badge>
        {asMethodIds(question.forMethods).map((id) => (
          <MethodBadge key={id} id={id} />
        ))}
        {answered ? <Badge variant="success">{t('已回答')}</Badge> : null}
      </div>

      <h3 className="mt-3 text-sm font-semibold leading-6">{question.question}</h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        <span className="font-medium text-foreground">{t('为什么需要：')}</span>
        {question.why}
      </p>

      <div className="mt-3">
        {question.inputType === 'longtext' ? (
          <Textarea value={stringValue} onChange={(event) => onChange(event.target.value)} className="min-h-20" />
        ) : null}
        {question.inputType === 'text' ? (
          <Input value={stringValue} onChange={(event) => onChange(event.target.value)} />
        ) : null}
        {question.inputType === 'date' ? (
          <DatePicker
            value={stringValue}
            onChange={(next) => onChange(next)}
            language={language}
            placeholder={t('选择日期')}
          />
        ) : null}
        {question.inputType === 'choice' ? (
          <div className="flex flex-wrap gap-2">
            {question.suggestions.map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  'rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-ring hover:text-foreground',
                  stringValue === option && 'border-primary bg-secondary font-medium text-secondary-foreground',
                )}
                onClick={() => onChange(stringValue === option ? '' : option)}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
        {question.inputType === 'list' ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addListItem(draft)
                  }
                }}
              />
              <Button type="button" variant="outline" className="shrink-0 px-3" onClick={() => addListItem(draft)}>
                <Plus className="size-4" />
              </Button>
            </div>
            {listValue.length ? (
              <div className="flex flex-wrap gap-2">
                {listValue.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-xs">
                    {item}
                    <button
                      type="button"
                      className="flex items-center text-muted-foreground hover:text-foreground"
                      onClick={() => onChange(listValue.filter((entry) => entry !== item))}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {question.inputType !== 'choice' && question.suggestions.length ? (
        <div className="mt-3">
          <div className="text-xs text-muted-foreground">{t('可以参考这些填法（点击填入）：')}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {question.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="rounded-md bg-muted px-2 py-1 text-left text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                onClick={() => (question.inputType === 'list' ? addListItem(suggestion) : onChange(suggestion))}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  )
}
