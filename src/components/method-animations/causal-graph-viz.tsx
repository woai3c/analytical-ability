import type { CausalGraphFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: CausalGraphFrame
  en: boolean
}

const NODE_STYLES = {
  factor: 'border-blue-400 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  outcome: 'border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  confounder: 'border-amber-400 bg-amber-500/10 text-amber-700 dark:text-amber-300',
} as const

const NODE_LABELS = {
  factor: { zh: '因素', en: 'Factor' },
  outcome: { zh: '结果', en: 'Outcome' },
  confounder: { zh: '混杂', en: 'Confound.' },
} as const

export function CausalGraphViz({ frame, en }: Props) {
  return (
    <div className="space-y-4">
      {/* Nodes */}
      <div className="flex flex-wrap items-start justify-center gap-3">
        {frame.nodes.map((node) => (
          <div key={node.id} className={cn('rounded-lg border-2 px-3 py-2 text-center', NODE_STYLES[node.type])}>
            <p className="text-xs font-semibold">{en ? node.label.en : node.label.zh}</p>
            <p className="text-[10px] opacity-70">{en ? NODE_LABELS[node.type].en : NODE_LABELS[node.type].zh}</p>
          </div>
        ))}
      </div>

      {/* Edges */}
      {frame.edges.length > 0 && (
        <div className="space-y-1.5 rounded-md border border-border bg-secondary/50 px-3 py-2">
          {frame.edges.map((edge, i) => {
            const from = frame.nodes.find((n) => n.id === edge.from)
            const to = frame.nodes.find((n) => n.id === edge.to)
            return (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <span className="font-medium text-foreground">{from ? (en ? from.label.en : from.label.zh) : ''}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium text-foreground">{to ? (en ? to.label.en : to.label.zh) : ''}</span>
                <span
                  className={cn(
                    'ml-auto rounded px-1.5 py-0.5 text-[10px]',
                    edge.verified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
                  )}
                >
                  {edge.verified ? (en ? 'Evidence' : '有证据') : en ? 'Unverified' : '待验证'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
