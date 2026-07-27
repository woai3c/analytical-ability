import type { PdsaFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: PdsaFrame
  en: boolean
}

const PHASES = [
  { key: 'plan' as const, label: 'Plan', color: 'border-blue-400 bg-blue-500/10' },
  { key: 'do_' as const, label: 'Do', color: 'border-emerald-400 bg-emerald-500/10' },
  { key: 'study' as const, label: 'Study', color: 'border-amber-400 bg-amber-500/10' },
  { key: 'act' as const, label: 'Act', color: 'border-purple-400 bg-purple-500/10' },
] as const

const ACTIVE_KEY_MAP = { plan: 'plan', do: 'do_', study: 'study', act: 'act' } as const

export function PdsaViz({ frame, en }: Props) {
  const activeContentKey = ACTIVE_KEY_MAP[frame.activePhase]

  return (
    <div className="grid grid-cols-2 gap-2">
      {PHASES.map((phase) => {
        const i18n = frame.content[phase.key]
        const content = en ? i18n.en : i18n.zh
        const isActive = phase.key === activeContentKey
        return (
          <div
            key={phase.key}
            className={cn(
              'rounded-lg border-l-[3px] px-3 py-2 transition-all duration-500',
              phase.color,
              isActive && 'ring-1 ring-foreground/20',
              !content && !isActive && 'opacity-30',
            )}
          >
            <p className={cn('text-[12px] font-semibold', isActive ? 'text-foreground' : 'text-muted-foreground')}>
              {phase.label}
            </p>
            {content && (
              <p className="mt-1 whitespace-pre-line text-[10px] leading-relaxed text-muted-foreground">{content}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
