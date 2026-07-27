import type { FmeaFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: FmeaFrame
  en: boolean
}

export function FmeaViz({ frame, en }: Props) {
  const hasMitigation = frame.items.some((it) => it.mitigation)

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-1.5 pr-2 text-left font-medium text-muted-foreground">
                {en ? 'Failure Mode' : '失效模式'}
              </th>
              <th className="px-1 pb-1.5 text-center font-medium text-muted-foreground">S</th>
              <th className="px-1 pb-1.5 text-center font-medium text-muted-foreground">O</th>
              <th className="px-1 pb-1.5 text-center font-medium text-muted-foreground">D</th>
              <th className="px-1 pb-1.5 text-center font-semibold text-foreground">RPN</th>
              {hasMitigation && (
                <th className="pb-1.5 pl-2 text-left font-medium text-muted-foreground">
                  {en ? 'Mitigation' : '措施'}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {frame.items.map((item, i) => {
              const isHighRpn = item.rpn >= 100
              return (
                <tr
                  key={en ? item.mode.en : item.mode.zh}
                  className={cn('border-b border-border/50', frame.sorted && i === 0 && 'bg-destructive/5')}
                >
                  <td className="py-1.5 pr-2">
                    <p className="font-medium text-foreground">{en ? item.mode.en : item.mode.zh}</p>
                    <p className="text-[10px] text-muted-foreground">{en ? item.effect.en : item.effect.zh}</p>
                  </td>
                  <td className="px-1 py-1.5 text-center text-muted-foreground">{item.s}</td>
                  <td className="px-1 py-1.5 text-center text-muted-foreground">{item.o}</td>
                  <td className="px-1 py-1.5 text-center text-muted-foreground">{item.d}</td>
                  <td
                    className={cn(
                      'px-1 py-1.5 text-center font-semibold',
                      item.rpn === 0 ? 'text-muted-foreground' : isHighRpn ? 'text-destructive' : 'text-foreground',
                    )}
                  >
                    {item.rpn || '—'}
                  </td>
                  {hasMitigation && (
                    <td className="py-1.5 pl-2 text-muted-foreground">
                      {item.mitigation ? (en ? item.mitigation.en : item.mitigation.zh) : ''}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
