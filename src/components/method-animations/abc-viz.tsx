import type { AbcFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: AbcFrame
  en: boolean
}

const GRADE_COLORS = {
  A: 'bg-success/20 text-success border-success/30',
  B: 'bg-warning/20 text-warning border-warning/30',
  C: 'bg-muted text-muted-foreground border-border',
} as const

export function AbcViz({ frame, en }: Props) {
  const maxValue = Math.max(...frame.items.map((it) => it.value))

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-muted-foreground">{en ? frame.metric.en : frame.metric.zh}</p>

      <div className="space-y-1.5">
        {frame.items.map((item) => (
          <div key={en ? item.name.en : item.name.zh} className="flex items-center gap-2">
            <span
              className={cn(
                'w-5 shrink-0 rounded border text-center text-[10px] font-semibold',
                item.cumPct > 0 ? GRADE_COLORS[item.grade] : 'border-transparent',
              )}
            >
              {item.cumPct > 0 ? item.grade : ''}
            </span>

            <span className="w-24 shrink-0 truncate text-[12px] text-foreground">
              {en ? item.name.en : item.name.zh}
            </span>

            <div className="relative h-4 flex-1 overflow-hidden rounded bg-border/50">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded transition-all duration-700',
                  item.grade === 'A'
                    ? 'bg-success/40'
                    : item.grade === 'B'
                      ? 'bg-warning/40'
                      : 'bg-muted-foreground/20',
                )}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
              <span className="relative z-10 flex h-full items-center pl-1.5 text-[10px] font-medium text-foreground">
                {item.value.toLocaleString()}
              </span>
            </div>

            {item.cumPct > 0 && (
              <span className="w-10 shrink-0 text-right text-[10px] text-muted-foreground">{item.cumPct}%</span>
            )}
          </div>
        ))}
      </div>

      {frame.conclusion && (
        <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs text-foreground">
          {en ? frame.conclusion.en : frame.conclusion.zh}
        </div>
      )}
    </div>
  )
}
