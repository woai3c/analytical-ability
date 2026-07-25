import { Plus, Route, X } from 'lucide-react'

import { computePert } from '@clarity/analysis-engine'
import type { PertRun } from '@clarity/domain'

import { MethodGenerateBox } from '@/components/methods/generate-box'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { cn, uid } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

export function PertPanel({
  run,
  busy,
  onGenerate,
  onChange,
}: {
  run: PertRun | undefined
  busy: boolean
  onGenerate: (material: string) => void
  onChange: (run: PertRun) => void
}) {
  const { t } = useI18n()

  if (!run) {
    return (
      <MethodGenerateBox
        busy={busy}
        hasRun={false}
        materialHint={t('可选：列出你已经想到的任务、里程碑或截止时间，AI 会据此拆出任务和依赖。')}
        onGenerate={onGenerate}
      />
    )
  }

  const result = computePert(run)
  const taskName = (id: string) => run.tasks.find((task) => task.id === id)?.name ?? id

  const updateTask = (id: string, patch: Partial<PertRun['tasks'][number]>) =>
    onChange({ ...run, tasks: run.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)) })

  const toggleDependency = (taskId: string, dependencyId: string) => {
    const task = run.tasks.find((item) => item.id === taskId)
    if (!task) return
    const dependencies = task.dependencies.includes(dependencyId)
      ? task.dependencies.filter((id) => id !== dependencyId)
      : [...task.dependencies, dependencyId]
    updateTask(taskId, { dependencies })
  }

  return (
    <div>
      <div className="mb-4 rounded-md bg-muted p-3 text-xs leading-5 text-muted-foreground">
        {t('三点估算单位为天（乐观 / 最可能 / 悲观）。期望工期、关键路径和浮动时间由代码计算；请按实际情况修正工期。')}
      </div>

      {result.ok ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-background p-3 text-xs">
          <Route className="size-4 text-primary" />
          <span className="font-medium">{t('关键路径：')}</span>
          {result.criticalPath.map((id, index) => (
            <span key={id} className="flex items-center gap-2">
              {index > 0 ? <span className="text-muted-foreground/50">{'>'}</span> : null}
              <Badge variant="default">{taskName(id)}</Badge>
            </span>
          ))}
          <span className="ml-auto font-medium">{t('预计总工期 {{days}} 天', { days: result.totalDuration })}</span>
        </div>
      ) : (
        <div className="mb-4 rounded-md border border-destructive/40 p-3 text-xs text-destructive">
          {t('任务依赖存在循环，请检查"前置任务"设置。')}
        </div>
      )}

      <div className="space-y-3">
        {run.tasks.map((task) => {
          const computed = result.ok ? result.tasks.find((item) => item.id === task.id) : undefined
          return (
            <section
              key={task.id}
              className={cn(
                'rounded-lg border bg-background p-4',
                computed?.critical ? 'border-primary/50' : 'border-border',
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={task.name}
                  className="h-8 min-w-48 flex-1 text-sm font-medium"
                  onChange={(event) => updateTask(task.id, { name: event.target.value })}
                />
                {computed ? (
                  <Badge variant={computed.critical ? 'default' : 'outline'}>
                    {computed.critical ? t('关键任务') : t('浮动 {{days}} 天', { days: computed.slack })}
                  </Badge>
                ) : null}
                <button
                  type="button"
                  className="text-muted-foreground/60 hover:text-destructive"
                  onClick={() =>
                    onChange({
                      ...run,
                      tasks: run.tasks
                        .filter((item) => item.id !== task.id)
                        .map((item) => ({ ...item, dependencies: item.dependencies.filter((id) => id !== task.id) })),
                    })
                  }
                  aria-label={t('删除任务')}
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                {(
                  [
                    ['optimistic', '乐观'],
                    ['likely', '最可能'],
                    ['pessimistic', '悲观'],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field} className="flex items-center gap-1">
                    {t(label)}
                    <input
                      type="number"
                      min={0}
                      value={task[field]}
                      className="h-7 w-16 rounded border border-input bg-background px-1.5 text-[11px]"
                      onChange={(event) =>
                        updateTask(task.id, { [field]: Math.max(0, Number(event.target.value) || 0) })
                      }
                    />
                  </label>
                ))}
                {computed ? <span>{t('期望 {{days}} 天', { days: computed.expected })}</span> : null}
              </div>

              <div className="mt-3">
                <div className="text-[11px] text-muted-foreground">{t('前置任务（点击切换）：')}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {run.tasks.filter((item) => item.id !== task.id).length === 0 ? (
                    <span className="text-[11px] text-muted-foreground/60">{t('暂无其他任务')}</span>
                  ) : (
                    run.tasks
                      .filter((item) => item.id !== task.id)
                      .map((candidate) => (
                        <button
                          key={candidate.id}
                          type="button"
                          className={cn(
                            'rounded-md border px-2 py-1 text-[11px] transition',
                            task.dependencies.includes(candidate.id)
                              ? 'border-primary bg-secondary text-secondary-foreground'
                              : 'border-border text-muted-foreground hover:border-ring hover:text-foreground',
                          )}
                          onClick={() => toggleDependency(task.id, candidate.id)}
                        >
                          {candidate.name || candidate.id}
                        </button>
                      ))
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <Button
        size="sm"
        variant="outline"
        className="mt-4"
        onClick={() =>
          onChange({
            ...run,
            tasks: [
              ...run.tasks,
              {
                id: uid('task'),
                name: `${t('任务')} ${run.tasks.length + 1}`,
                optimistic: 1,
                likely: 2,
                pessimistic: 4,
                dependencies: [],
              },
            ],
          })
        }
      >
        <Plus className="size-3.5" />
        {t('加任务')}
      </Button>

      <MethodGenerateBox busy={busy} hasRun onGenerate={onGenerate} />
    </div>
  )
}
