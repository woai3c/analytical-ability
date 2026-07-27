import type { ValueAnalysisFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: ValueAnalysisFrame
}

const CONTRIB_LABEL = { high: '高', medium: '中', low: '低' } as const
const CONTRIB_STYLE = {
  high: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-destructive/10 text-destructive',
} as const

export function ValueAnalysisViz({ frame }: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {frame.items.map((item) => (
          <div
            key={item.name}
            className={cn(
              'flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12px]',
              item.decision === '砍掉'
                ? 'border-destructive/30 bg-destructive/5 line-through opacity-60'
                : 'border-border bg-secondary/50',
            )}
          >
            <span className="flex-1 font-medium text-foreground">{item.name}</span>
            <span className="shrink-0 text-muted-foreground">{item.cost}</span>
            <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px]', CONTRIB_STYLE[item.contribution])}>
              {CONTRIB_LABEL[item.contribution]}
            </span>
            {item.decision && (
              <span
                className={cn(
                  'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
                  item.decision === '保留'
                    ? 'bg-success/10 text-success'
                    : item.decision === '砍掉'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                )}
              >
                {item.decision}
              </span>
            )}
          </div>
        ))}
      </div>

      {frame.saving && (
        <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs font-medium text-success">
          {frame.saving}
        </div>
      )}
    </div>
  )
}
