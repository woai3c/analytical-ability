import { AlertTriangle, Plus, Trophy, X } from 'lucide-react'

import { computeMcda } from '@clarity/analysis-engine'
import type { McdaRun } from '@clarity/domain'

import { MethodGenerateBox } from '@/components/methods/generate-box'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { cn, uid } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

export function McdaPanel({
  run,
  busy,
  onGenerate,
  onChange,
}: {
  run: McdaRun | undefined
  busy: boolean
  onGenerate: (material: string) => void
  onChange: (run: McdaRun) => void
}) {
  const { t } = useI18n()

  if (!run) {
    return (
      <MethodGenerateBox
        busy={busy}
        hasRun={false}
        materialHint={t('可选：列出你已在考虑的候选方案和在乎的条件，AI 会据此搭好评分表草稿。')}
        onGenerate={onGenerate}
      />
    )
  }

  const result = computeMcda(run)
  const weightSum = run.criteria.reduce((sum, criterion) => sum + criterion.weight, 0)
  const topOptionId = result.ranking[0]
  const flipWarnings = result.sensitivity.filter((item) => item.topOptionId !== null)

  const setScore = (optionId: string, criterionId: string, score: number) =>
    onChange({
      ...run,
      scores: {
        ...run.scores,
        [optionId]: { ...run.scores[optionId], [criterionId]: Math.max(0, Math.min(10, score)) },
      },
    })

  return (
    <div>
      <div className="mb-4 rounded-md bg-muted p-3 text-xs leading-5 text-muted-foreground">
        {t('打分是 0-10 的估计，权重合计应为 100。总分、排序和敏感性由代码计算，可随意改数字观察结论变化。')}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3 font-medium">{t('准则（权重 / 最低可接受）')}</th>
              {run.options.map((option) => (
                <th key={option.id} className="py-2 pr-3 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={option.name}
                      className="h-8 min-w-28 text-xs font-medium"
                      onChange={(event) =>
                        onChange({
                          ...run,
                          options: run.options.map((item) =>
                            item.id === option.id ? { ...item, name: event.target.value } : item,
                          ),
                        })
                      }
                    />
                    {run.options.length > 2 ? (
                      <button
                        type="button"
                        className="text-muted-foreground/60 hover:text-destructive"
                        onClick={() => {
                          const scores = { ...run.scores }
                          delete scores[option.id]
                          onChange({ ...run, options: run.options.filter((item) => item.id !== option.id), scores })
                        }}
                        aria-label={t('删除方案')}
                      >
                        <X className="size-3.5" />
                      </button>
                    ) : null}
                    {option.id === topOptionId ? <Trophy className="size-3.5 shrink-0 text-[var(--warning)]" /> : null}
                  </div>
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {run.criteria.map((criterion) => (
              <tr key={criterion.id} className="border-b border-border/60">
                <td className="py-2 pr-3">
                  <Input
                    value={criterion.name}
                    className="h-8 min-w-36 text-xs"
                    onChange={(event) =>
                      onChange({
                        ...run,
                        criteria: run.criteria.map((item) =>
                          item.id === criterion.id ? { ...item, name: event.target.value } : item,
                        ),
                      })
                    }
                  />
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <label className="flex items-center gap-1">
                      {t('权重')}
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={criterion.weight}
                        className="h-6 w-14 rounded border border-input bg-background px-1 text-[11px]"
                        onChange={(event) =>
                          onChange({
                            ...run,
                            criteria: run.criteria.map((item) =>
                              item.id === criterion.id ? { ...item, weight: Number(event.target.value) || 0 } : item,
                            ),
                          })
                        }
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      {t('最低')}
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={criterion.minimum}
                        className="h-6 w-12 rounded border border-input bg-background px-1 text-[11px]"
                        onChange={(event) =>
                          onChange({
                            ...run,
                            criteria: run.criteria.map((item) =>
                              item.id === criterion.id
                                ? { ...item, minimum: Math.max(0, Math.min(10, Number(event.target.value) || 0)) }
                                : item,
                            ),
                          })
                        }
                      />
                    </label>
                  </div>
                </td>
                {run.options.map((option) => {
                  const score = run.scores[option.id]?.[criterion.id] ?? 0
                  const below = score < criterion.minimum
                  return (
                    <td key={option.id} className="py-2 pr-3 align-top">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={score}
                        className={cn(
                          'h-8 w-16 rounded border bg-background px-1.5 text-xs',
                          below ? 'border-destructive/60 text-destructive' : 'border-input',
                        )}
                        onChange={(event) => setScore(option.id, criterion.id, Number(event.target.value) || 0)}
                      />
                      {below ? <div className="mt-0.5 text-[10px] text-destructive">{t('低于最低可接受')}</div> : null}
                    </td>
                  )
                })}
                <td className="align-top">
                  {run.criteria.length > 2 ? (
                    <button
                      type="button"
                      className="mt-2 text-muted-foreground/60 hover:text-destructive"
                      onClick={() =>
                        onChange({ ...run, criteria: run.criteria.filter((item) => item.id !== criterion.id) })
                      }
                      aria-label={t('删除准则')}
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            <tr className="text-sm font-medium">
              <td className="py-2 pr-3 text-xs text-muted-foreground">
                {t('加权总分')}
                <span className={cn('ml-2', weightSum === 100 ? 'text-[var(--success)]' : 'text-[var(--warning)]')}>
                  {t('权重合计 {{sum}}', { sum: weightSum })}
                </span>
              </td>
              {run.options.map((option) => (
                <td key={option.id} className="py-2 pr-3">
                  <Badge variant={option.id === topOptionId ? 'default' : 'outline'}>
                    {(result.totals[option.id] ?? 0).toFixed(2)}
                  </Badge>
                </td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const option = { id: uid('opt'), name: `${t('方案')} ${run.options.length + 1}` }
            onChange({ ...run, options: [...run.options, option], scores: { ...run.scores, [option.id]: {} } })
          }}
        >
          <Plus className="size-3.5" />
          {t('加方案')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onChange({
              ...run,
              criteria: [...run.criteria, { id: uid('crit'), name: t('新准则'), weight: 0, minimum: 0 }],
            })
          }
        >
          <Plus className="size-3.5" />
          {t('加准则')}
        </Button>
      </div>

      {flipWarnings.length ? (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-[color-mix(in_oklch,var(--warning)_38%,var(--border))] p-3 text-xs leading-5 text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
          <span>
            {t('敏感性提示：调整以下准则的权重 ±10 会改变第一名——结论对这些权重很敏感，请重点确认：')}
            {flipWarnings
              .map((item) => run.criteria.find((criterion) => criterion.id === item.criterionId)?.name ?? '')
              .filter(Boolean)
              .join('、')}
          </span>
        </div>
      ) : (
        <p className="mt-4 text-xs text-[var(--success)]">
          {t('敏感性检查：任意单一准则权重 ±10 不会改变第一名，结论相对稳健。')}
        </p>
      )}

      {run.notes ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{run.notes}</p> : null}

      <MethodGenerateBox busy={busy} hasRun onGenerate={onGenerate} />
    </div>
  )
}
