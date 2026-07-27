import type { ValueAnalysisFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: ValueAnalysisFrame
  en: boolean
}

const CONTRIB_LABEL = {
  high: { zh: '高', en: 'High' },
  medium: { zh: '中', en: 'Med' },
  low: { zh: '低', en: 'Low' },
} as const
const CONTRIB_STYLE = {
  high: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-destructive/10 text-destructive',
} as const

export function ValueAnalysisViz({ frame, en }: Props) {
  const cutLabel = en ? 'Cut' : '砍掉'

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {frame.items.map((item) => {
          const decisionText = item.decision ? (en ? item.decision.en : item.decision.zh) : undefined
          const isCut = decisionText === cutLabel
          return (
            <div
              key={en ? item.name.en : item.name.zh}
              className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12px]',
                isCut
                  ? 'border-destructive/30 bg-destructive/5 line-through opacity-60'
                  : 'border-border bg-secondary/50',
              )}
            >
              <span className="flex-1 font-medium text-foreground">{en ? item.name.en : item.name.zh}</span>
              <span className="shrink-0 text-muted-foreground">{item.cost}</span>
              <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px]', CONTRIB_STYLE[item.contribution])}>
                {en ? CONTRIB_LABEL[item.contribution].en : CONTRIB_LABEL[item.contribution].zh}
              </span>
              {decisionText && (
                <span
                  className={cn(
                    'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
                    isCut
                      ? 'bg-destructive/10 text-destructive'
                      : decisionText === (en ? 'Keep' : '保留')
                        ? 'bg-success/10 text-success'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                  )}
                >
                  {decisionText}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {frame.saving && (
        <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs font-medium text-success">
          {en ? frame.saving.en : frame.saving.zh}
        </div>
      )}
    </div>
  )
}
