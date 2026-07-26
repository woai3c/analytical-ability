import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { methodRegistry, taskTypeLabels, taskTypeLabelsEn } from '@clarity/analysis-engine'
import type { TaskType } from '@clarity/domain'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t('分析方法库')}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        {t('掌握这些方法，学会什么场景用什么工具。点击任一方法，了解它的适用条件、步骤和常见误区。')}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip active={activeFilter === null} onClick={() => setActiveFilter(null)}>
          {t('全部')}
        </FilterChip>
        {allTaskTypes.map((type) => (
          <FilterChip key={type} active={activeFilter === type} onClick={() => setActiveFilter(type)}>
            {labels[type]}
          </FilterChip>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((method) => {
          const name = en ? method.name.en : method.name.zh
          const purpose = en ? method.purpose.en : method.purpose.zh

          return (
            <Link key={method.id} to={`/methods/${method.id}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{purpose}</p>
                  <p className="mt-2 text-xs italic leading-5 text-muted-foreground/70">
                    {en ? method.example.en : method.example.zh}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {method.taskTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="text-[11px]">
                        {labels[type]}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
        'rounded-full border px-3 py-1.5 text-xs transition',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:border-ring hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
