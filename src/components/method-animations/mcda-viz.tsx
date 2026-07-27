import type { McdaFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: McdaFrame
  en: boolean
}

export function McdaViz({ frame, en }: Props) {
  const hasCriteria = frame.criteria.length > 0
  const hasScores = frame.options.some((o) => o.scores.length > 0)
  const hasTotals = frame.options.some((o) => o.total != null)

  return (
    <div className="space-y-3">
      {!hasCriteria ? (
        <div className="flex flex-wrap gap-2">
          {frame.options.map((opt) => (
            <div
              key={en ? opt.name.en : opt.name.zh}
              className="rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground"
            >
              {en ? opt.name.en : opt.name.zh}
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
                  <th
                    key={en ? c.name.en : c.name.zh}
                    className="px-1.5 pb-1.5 text-center font-medium text-muted-foreground"
                  >
                    {en ? c.name.en : c.name.zh}
                    <span className="ml-0.5 text-[10px] font-normal">({c.weight}%)</span>
                  </th>
                ))}
                {hasTotals && (
                  <th className="pb-1.5 pl-2 text-center font-semibold text-foreground">{en ? 'Total' : '总分'}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {frame.options.map((opt) => {
                const isWinner =
                  frame.winner && (en ? frame.winner.en : frame.winner.zh) === (en ? opt.name.en : opt.name.zh)
                return (
                  <tr
                    key={en ? opt.name.en : opt.name.zh}
                    className={cn('border-b border-border/50', isWinner && 'bg-success/10')}
                  >
                    <td className="py-1.5 pr-2 font-medium text-foreground">{en ? opt.name.en : opt.name.zh}</td>
                    {frame.criteria.map((c, ci) => (
                      <td key={en ? c.name.en : c.name.zh} className="px-1.5 py-1.5 text-center text-muted-foreground">
                        {hasScores && opt.scores[ci] != null ? opt.scores[ci] : '—'}
                      </td>
                    ))}
                    {hasTotals && (
                      <td
                        className={cn(
                          'py-1.5 pl-2 text-center font-semibold',
                          isWinner ? 'text-success' : 'text-foreground',
                        )}
                      >
                        {opt.total ?? '—'}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {frame.winner && (
        <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs text-foreground">
          {en ? 'Best option: ' : '最优方案：'}
          <span className="font-semibold">{en ? frame.winner.en : frame.winner.zh}</span>
          {en ? ' (sensitivity analysis recommended)' : '（但需做敏感性分析）'}
        </div>
      )}
    </div>
  )
}
