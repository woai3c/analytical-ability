import type { ForecastFrame } from '@/data/methods/animation-data'
import { cn } from '@/lib/utils'

interface Props {
  frame: ForecastFrame
}

export function ForecastViz({ frame }: Props) {
  return (
    <div className="space-y-3">
      {/* Prediction */}
      <div className="rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground">
        <span className="font-medium">预测：</span>
        {frame.prediction}
      </div>

      {/* Base rate */}
      {frame.baseRate != null && (
        <div className="space-y-1.5">
          <p className="text-[12px] text-muted-foreground">基准率</p>
          <div className="relative h-5 overflow-hidden rounded-full bg-border/50">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-blue-500/30 transition-all duration-700"
              style={{ width: `${frame.baseRate}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground">
              {frame.baseRate}%
            </span>
          </div>
        </div>
      )}

      {/* Adjustments */}
      {frame.adjustments.length > 0 && (
        <div className="space-y-1">
          <p className="text-[12px] text-muted-foreground">调整因素</p>
          {frame.adjustments.map((adj) => (
            <div key={adj.factor} className="flex items-center gap-2 text-[12px]">
              <span
                className={cn(
                  'shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold',
                  adj.direction === 'up' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success',
                )}
              >
                {adj.direction === 'up' ? '↑' : '↓'}
              </span>
              <span className="text-muted-foreground">{adj.factor}</span>
            </div>
          ))}
        </div>
      )}

      {/* Final probability */}
      {frame.finalProbability != null && (
        <div className="space-y-1.5">
          <p className="text-[12px] font-medium text-foreground">最终判断</p>
          <div className="relative h-6 overflow-hidden rounded-full bg-border/50">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-warning/40 transition-all duration-700"
              style={{ width: `${frame.finalProbability}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-foreground">
              {frame.finalProbability}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
