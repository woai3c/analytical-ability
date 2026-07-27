import type { DmaicFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: DmaicFrame
  en: boolean
}

const PHASE_COLORS = [
  'border-blue-400 bg-blue-500/10',
  'border-emerald-400 bg-emerald-500/10',
  'border-amber-400 bg-amber-500/10',
  'border-purple-400 bg-purple-500/10',
  'border-rose-400 bg-rose-500/10',
]

export function DmaicViz({ frame, en }: Props) {
  return (
    <div className="space-y-2">
      {frame.phases.map((phase, i) => {
        const text = phase.content ? (en ? phase.content.en : phase.content.zh) : ''
        return (
          <div
            key={phase.name}
            className={cn(
              'rounded-md border-l-[3px] px-3 py-2 transition-all duration-500',
              PHASE_COLORS[i],
              phase.active && 'ring-1 ring-foreground/20',
              !text && !phase.active && 'opacity-30',
            )}
          >
            <p className={cn('text-[12px] font-semibold', phase.active ? 'text-foreground' : 'text-muted-foreground')}>
              {phase.name}
            </p>
            {text && <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{text}</p>}
          </div>
        )
      })}
    </div>
  )
}
