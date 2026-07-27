import type { McdaFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: McdaFrame
}

export function McdaViz({ frame }: Props) {
  const hasCriteria = frame.criteria.length > 0
  const hasScores = frame.options.some((o) => o.scores.length > 0)
  const hasTotals = frame.options.some((o) => o.total != null)

  return (
    <div className="space-y-3">
      {!hasCriteria ? (
        <div className="flex flex-wrap gap-2">
          {frame.options.map((opt) => (
            <div
              key={opt.name}
              className="rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground"
            >
              {opt.name}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-1.5 pr-2 text-left font-medium text-muted-foreground" />
                {frame.criteria.map((c) => (
                  <th key={c.name} className="pb-1.5 px-1.5 text-center font-medium text-muted-foreground">
                    {c.name}
                    <span className="ml-0.5 text-[10px] font-normal">({c.weight}%)</span>
                  </th>
                ))}
                {hasTotals && <th className="pb-1.5 pl-2 text-center font-semibold text-foreground">总分</th>}
              </tr>
            </thead>
            <tbody>
              {frame.options.map((opt) => (
                <tr
                  key={opt.name}
                  className={cn('border-b border-border/50', frame.winner === opt.name && 'bg-success/10')}
                >
                  <td className="py-1.5 pr-2 font-medium text-foreground">{opt.name}</td>
                  {frame.criteria.map((c, ci) => (
                    <td key={c.name} className="px-1.5 py-1.5 text-center text-muted-foreground">
                      {hasScores && opt.scores[ci] != null ? opt.scores[ci] : '—'}
                    </td>
                  ))}
                  {hasTotals && (
                    <td
                      className={cn(
                        'py-1.5 pl-2 text-center font-semibold',
                        frame.winner === opt.name ? 'text-success' : 'text-foreground',
                      )}
                    >
                      {opt.total ?? '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {frame.winner && (
        <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs text-foreground">
          最优方案：<span className="font-semibold">{frame.winner}</span>（但需做敏感性分析）
        </div>
      )}
    </div>
  )
}
