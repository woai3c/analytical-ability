import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { methodRegistry, taskTypeLabels, taskTypeLabelsEn } from '@clarity/analysis-engine'
import type { TaskType } from '@clarity/domain'

import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

const allTaskTypes: TaskType[] = [
  'diagnosis',
  'improvement',
  'selection',
  'planning',
  'prediction',
  'exploration',
  'learning',
]

export function MethodsPage() {
  const { language, t } = useI18n()
  const [activeFilter, setActiveFilter] = useState<TaskType | null>(null)
  const en = language === 'en'
  const labels = en ? taskTypeLabelsEn : taskTypeLabels

  const filtered = useMemo(() => {
    if (!activeFilter) return methodRegistry
    return methodRegistry.filter((m) => m.taskTypes.includes(activeFilter))
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
        {allTaskTypes.map((type) => (
          <FilterChip key={type} active={activeFilter === type} onClick={() => setActiveFilter(type)}>
            {labels[type]}
          </FilterChip>
        ))}
      </div>

      <div className="mt-6 divide-y divide-border overflow-hidden rounded-lg border border-border">
        {filtered.map((method) => {
          const name = en ? method.name.en : method.name.zh
          const purpose = en ? method.purpose.en : method.purpose.zh

          return (
            <Link
              key={method.id}
              to={`/methods/${method.id}`}
              className="block px-4 py-3.5 transition-colors hover:bg-secondary"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium text-foreground">{name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {method.taskTypes.map((type) => labels[type]).join(' · ')}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{purpose}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs transition-colors',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
