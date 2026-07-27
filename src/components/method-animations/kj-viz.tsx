import type { KjFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: KjFrame
  en: boolean
}

const GROUP_COLORS = [
  'border-blue-400/40 bg-blue-500/10',
  'border-emerald-400/40 bg-emerald-500/10',
  'border-amber-400/40 bg-amber-500/10',
  'border-purple-400/40 bg-purple-500/10',
  'border-rose-400/40 bg-rose-500/10',
]

export function KjViz({ frame, en }: Props) {
  const hasGroups = frame.groups.length > 0
  const groupNames = frame.groups.map((g) => (en ? g.name.en : g.name.zh))

  if (!hasGroups) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {frame.cards.map((card) => (
          <span
            key={en ? card.text.en : card.text.zh}
            className="rounded border border-border bg-background px-2 py-1 text-[12px] text-foreground"
          >
            {en ? card.text.en : card.text.zh}
          </span>
        ))}
      </div>
    )
  }

  const grouped = groupNames.map((name) => ({
    name,
    cards: frame.cards.filter((c) => c.group && (en ? c.group.en : c.group.zh) === name),
  }))
  const ungrouped = frame.cards.filter((c) => !c.group)

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {grouped.map((group, gi) => (
          <div key={group.name} className={cn('rounded-lg border p-2.5', GROUP_COLORS[gi % GROUP_COLORS.length])}>
            <p className="mb-1.5 text-[12px] font-semibold text-foreground">
              {group.name}
              <span className="ml-1 font-normal text-muted-foreground">({group.cards.length})</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {group.cards.map((card) => (
                <span
                  key={en ? card.text.en : card.text.zh}
                  className="rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-foreground"
                >
                  {en ? card.text.en : card.text.zh}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {ungrouped.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ungrouped.map((card) => (
            <span
              key={en ? card.text.en : card.text.zh}
              className="rounded border border-dashed border-border bg-background px-2 py-1 text-[12px] text-muted-foreground"
            >
              {en ? card.text.en : card.text.zh}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
