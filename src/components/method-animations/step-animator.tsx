import { useEffect, useRef, useState } from 'react'

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

interface StepAnimatorProps {
  totalSteps: number
  currentStep: number
  onStepChange: (step: number) => void
  stepLabel: string
  children: React.ReactNode
}

const AUTOPLAY_INTERVAL = 2200

export function StepAnimator({ totalSteps, currentStep, onStepChange, stepLabel, children }: StepAnimatorProps) {
  const { t } = useI18n()
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!playing || currentStep >= totalSteps - 1) return

    intervalRef.current = setInterval(() => {
      onStepChange(currentStep + 1)
    }, AUTOPLAY_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [playing, currentStep, totalSteps, onStepChange])

  const stopAndGo = (step: number) => {
    setPlaying(false)
    onStepChange(step)
  }

  const prev = () => {
    if (currentStep > 0) stopAndGo(currentStep - 1)
  }

  const next = () => {
    if (currentStep < totalSteps - 1) stopAndGo(currentStep + 1)
  }

  const togglePlay = () => {
    if (currentStep >= totalSteps - 1) {
      onStepChange(0)
      setPlaying(true)
    } else {
      setPlaying((p) => !p)
    }
  }

  const reset = () => stopAndGo(0)

  const isAtEnd = playing && currentStep >= totalSteps - 1
  const showPlaying = playing && !isAtEnd

  return (
    <div className="space-y-3">
      <div className="min-h-[200px] rounded-lg border border-border bg-secondary/50 p-4">{children}</div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {currentStep + 1}/{totalSteps}
        </p>
        <p className="text-xs text-muted-foreground">{stepLabel}</p>
      </div>

      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <button
            key={i}
            onClick={() => stopAndGo(i)}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= currentStep ? 'bg-foreground' : 'bg-border',
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-1">
        <button
          onClick={reset}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={t('重置')}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={prev}
          disabled={currentStep === 0}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={togglePlay}
          className="rounded-md bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/80"
        >
          {showPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          onClick={next}
          disabled={currentStep >= totalSteps - 1}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
