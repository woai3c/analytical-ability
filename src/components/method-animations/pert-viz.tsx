import type { PertFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: PertFrame
  en: boolean
}

export function PertViz({ frame, en }: Props) {
  const hasDeps = frame.tasks.some((t) => t.deps.length > 0)
  const hasTimeline = frame.tasks.some((t) => t.es != null)
  const maxEf = Math.max(...frame.tasks.map((t) => t.ef ?? 0), 1)

  return (
    <div className="space-y-3">
      {hasTimeline ? (
        /* Gantt-style timeline */
        <div className="space-y-1">
          {frame.tasks.map((task) => {
            const es = task.es ?? 0
            const ef = task.ef ?? es + task.duration
            const leftPct = (es / maxEf) * 100
            const widthPct = ((ef - es) / maxEf) * 100
            return (
              <div key={task.id} className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-5 shrink-0 rounded text-center text-[10px] font-bold',
                    task.critical ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {task.id}
                </span>
                <span className="w-20 shrink-0 truncate text-[12px] text-foreground">
                  {en ? task.name.en : task.name.zh}
                </span>
                <div className="relative h-6 flex-1 rounded bg-border/30">
                  <div
                    className={cn(
                      'absolute inset-y-0 flex items-center justify-center rounded text-[10px] font-medium text-white transition-all duration-500',
                      task.critical ? 'bg-destructive/70' : 'bg-blue-500/50',
                    )}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  >
                    {task.duration}
                    {en ? task.unit.en : task.unit.zh}
                  </div>
                </div>
                {task.float != null && task.float > 0 && (
                  <span className="shrink-0 rounded bg-success/10 px-1 py-0.5 text-[10px] text-success">
                    +{task.float}
                  </span>
                )}
              </div>
            )
          })}
          {/* Timeline scale */}
          <div className="ml-[7.5rem] flex justify-between text-[10px] text-muted-foreground">
            {Array.from({ length: maxEf + 1 }).map((_, i) => (
              <span key={i}>{i}</span>
            ))}
          </div>
        </div>
      ) : (
        /* Simple task list */
        <div className="space-y-1.5">
          {frame.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-[12px]"
            >
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                {task.id}
              </span>
              <span className="flex-1 font-medium text-foreground">{en ? task.name.en : task.name.zh}</span>
              <span className="shrink-0 text-muted-foreground">
                {task.duration} {en ? task.unit.en : task.unit.zh}
              </span>
              {hasDeps && task.deps.length > 0 && (
                <span className="shrink-0 text-[10px] text-muted-foreground">← {task.deps.join(', ')}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Critical path */}
      {frame.criticalPath && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
          <p className="text-[12px] text-foreground">
            <span className="font-semibold">{en ? 'Critical Path: ' : '关键路径：'}</span>
            {frame.criticalPath.join(' → ')}
          </p>
          {frame.totalDuration != null && (
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {en
                ? `Total duration: ${frame.totalDuration} weeks — any delay on this path delays the whole project`
                : `总工期 ${frame.totalDuration} 周 — 关键路径上的任何延误都会推迟整个项目`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
