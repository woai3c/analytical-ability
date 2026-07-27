import type { FishboneFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: FishboneFrame
}

export function FishboneViz({ frame }: Props) {
  const top = frame.categories.filter((_, i) => i % 2 === 0)
  const bottom = frame.categories.filter((_, i) => i % 2 === 1)

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {/* Branches */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Top branches */}
        <div className="flex justify-around">
          {top.map((cat) => (
            <Branch key={cat.name} cat={cat} position="top" />
          ))}
        </div>

        {/* Main spine */}
        <div className="relative mx-2">
          <div className="h-0.5 w-full bg-foreground" />
          {frame.categories.length > 0 && (
            <>
              {top.map((cat, i) => (
                <div
                  key={cat.name}
                  className="absolute top-0 h-6 w-0.5 -translate-y-full bg-foreground"
                  style={{ left: `${((i + 0.5) / Math.max(top.length, 1)) * 100}%` }}
                />
              ))}
              {bottom.map((cat, i) => (
                <div
                  key={cat.name}
                  className="absolute top-0 h-6 w-0.5 bg-foreground"
                  style={{ left: `${((i + 0.5) / Math.max(bottom.length, 1)) * 100}%` }}
                />
              ))}
            </>
          )}
        </div>

        {/* Bottom branches */}
        <div className="flex justify-around">
          {bottom.map((cat) => (
            <Branch key={cat.name} cat={cat} position="bottom" />
          ))}
        </div>
      </div>

      {/* Fish head */}
      <div className="ml-1 shrink-0">
        <div className="rounded-lg border-2 border-foreground bg-secondary px-3 py-2 text-xs font-semibold text-foreground">
          {frame.head}
        </div>
      </div>
    </div>
  )
}

function Branch({ cat, position }: { cat: FishboneFrame['categories'][number]; position: 'top' | 'bottom' }) {
  return (
    <div
      className={cn(
        'flex w-28 flex-col items-center gap-1 transition-opacity duration-500',
        position === 'bottom' && 'flex-col-reverse',
      )}
    >
      <span className={cn('text-[12px] font-semibold', cat.highlighted ? 'text-warning' : 'text-foreground')}>
        {cat.name}
      </span>
      {cat.causes.map((cause) => (
        <div key={cause.text} className="flex flex-col items-center gap-0.5">
          <span
            className={cn(
              'text-center text-[10px] leading-tight',
              cat.highlighted ? 'font-medium text-warning' : 'text-muted-foreground',
            )}
          >
            {cause.text}
          </span>
          {cause.sub && (
            <span className="text-center text-[10px] leading-tight text-muted-foreground/70">← {cause.sub}</span>
          )}
        </div>
      ))}
    </div>
  )
}
