import type { FiveWhyFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: FiveWhyFrame
}

export function FiveWhyViz({ frame }: Props) {
  return (
    <div className="space-y-0">
      {/* Problem */}
      <div className="rounded-md border border-foreground bg-secondary px-3 py-2 text-xs font-semibold text-foreground">
        {frame.problem}
      </div>

      {/* Why chain */}
      {frame.whys.map((why, i) => (
        <div key={i} className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-center py-1">
            <div className="h-4 w-0.5 bg-muted-foreground/40" />
          </div>
          <div className="ml-4 rounded-md border border-border bg-secondary/50 px-3 py-2">
            <p className="text-[12px] font-medium text-muted-foreground">
              Why {i + 1}: {why.question}
            </p>
            <p className="mt-0.5 text-xs text-foreground">{why.answer}</p>
          </div>
        </div>
      ))}

      {/* Root cause action */}
      {frame.rootCause && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-center py-1">
            <div className="h-4 w-0.5 bg-success" />
          </div>
          <div className={cn('rounded-md border-2 border-success bg-success/10 px-3 py-2')}>
            <p className="text-[12px] font-medium text-success">行动 →</p>
            <p className="mt-0.5 text-xs text-foreground">{frame.rootCause}</p>
          </div>
        </div>
      )}
    </div>
  )
}
