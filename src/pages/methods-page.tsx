import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { FilterChip } from '@/components/filter-chip'
import { taskTypes } from '@/data/domain-constants'
import type { TaskType } from '@/data/domain-constants'
import { methodCatalog } from '@/data/methods/catalog'
import { taskTypeLabels, taskTypeLabelsEn } from '@/data/methods/labels'
import { countPracticedMethods } from '@/lib/practice-records'
import { useI18n } from '@/providers/i18n-provider'

const DEPTH_LABEL = { interactive: '交互式', guided: '引导式' } as const
const DEPTH_LABEL_EN = { interactive: 'Interactive', guided: 'Guided' } as const

export function MethodsPage() {
  const { language, t } = useI18n()
  const [activeFilter, setActiveFilter] = useState<TaskType | null>(null)
  const en = language === 'en'
  const labels = en ? taskTypeLabelsEn : taskTypeLabels
  const practiceCounts = useMemo(() => countPracticedMethods(), [])

  const filtered = useMemo(() => {
    if (!activeFilter) return methodCatalog
    return methodCatalog.filter((m) => m.taskTypes.includes(activeFilter))
  }, [activeFilter])

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6">
      <h1 className="text-xl font-semibold">{t('分析方法库')}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {t('掌握这些方法，学会什么场景用什么工具。点击任一方法，了解它的适用条件、步骤和常见误区。')}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        <FilterChip active={activeFilter === null} onClick={() => setActiveFilter(null)}>
          {t('全部')}
        </FilterChip>
        {taskTypes.map((type) => (
          <FilterChip key={type} active={activeFilter === type} onClick={() => setActiveFilter(type)}>
            {labels[type]}
          </FilterChip>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((method) => {
          const name = en ? method.name.en : method.name.zh
          const purpose = en ? method.purpose.en : method.purpose.zh
          const depthLabel = en ? DEPTH_LABEL_EN[method.depth] : DEPTH_LABEL[method.depth]
          const count = practiceCounts[method.id] ?? 0

          return (
            <Link
              key={method.id}
              to={`/methods/${method.id}`}
              className="group flex flex-col rounded-lg border border-border bg-background p-4 transition-colors hover:border-foreground/20 hover:bg-secondary"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold text-foreground group-hover:text-foreground">{name}</h2>
                {count > 0 && (
                  <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                    {en ? `${count}×` : `${count}次`}
                  </span>
                )}
              </div>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{purpose}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {method.taskTypes.map((type) => (
                  <span
                    key={type}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground group-hover:bg-accent"
                  >
                    {labels[type]}
                  </span>
                ))}
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground group-hover:bg-accent">
                  {depthLabel}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
