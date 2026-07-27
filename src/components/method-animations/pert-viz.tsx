import type { PertFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: PertFrame
}

export function PertViz({ frame }: Props) {
  const hasDeps = frame.tasks.some((t) => t.deps.length > 0)
  const hasCritical = frame.tasks.some((t) => t.critical != null)

  return (
    <div className="space-y-3">
      {/* Task list */}
      <div className="space-y-1.5">
        {frame.tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12px] transition-all duration-500',
              task.critical === true
                ? 'border-destructive/40 bg-destructive/5'
                : task.critical === false
                  ? 'border-border bg-secondary/50'
                  : 'border-border bg-secondary/50',
            )}
          >
            <span
              className={cn(
                'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold',
                task.critical ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground',
              )}
            >
              {task.id}
            </span>
            <span className="flex-1 font-medium text-foreground">{task.name}</span>
            <span className="shrink-0 text-muted-foreground">{task.duration} 周</span>
            {hasDeps && task.deps.length > 0 && (
              <span className="shrink-0 text-[10px] text-muted-foreground">← {task.deps.join(', ')}</span>
            )}
            {hasCritical && task.float != null && task.float > 0 && (
              <span className="shrink-0 rounded bg-success/10 px-1 py-0.5 text-[10px] text-success">
                浮动 {task.float} 周
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Critical path */}
      {frame.criticalPath && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
          <p className="text-[12px] text-foreground">
            <span className="font-semibold">关键路径：</span>
            {frame.criticalPath.join(' → ')}
          </p>
          {frame.totalDuration != null && (
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              总工期 {frame.totalDuration} 周，刚好卡住 deadline
            </p>
          )}
        </div>
      )}
    </div>
  )
}
