import { useState } from 'react'

import type { MethodId } from '@/data/domain'
import {
  type AbcFrame,
  type CausalGraphFrame,
  type DmaicFrame,
  type FishboneFrame,
  type FiveWhyFrame,
  type FmeaFrame,
  type ForecastFrame,
  type KjFrame,
  type McdaFrame,
  type PdsaFrame,
  type PertFrame,
  type ValueAnalysisFrame,
  animationRegistry,
} from '@/data/methods/animation-data'
import { useI18n } from '@/providers/i18n-provider'

import { AbcViz } from './abc-viz'
import { CausalGraphViz } from './causal-graph-viz'
import { DmaicViz } from './dmaic-viz'
import { FishboneViz } from './fishbone-viz'
import { FiveWhyViz } from './five-why-viz'
import { FmeaViz } from './fmea-viz'
import { ForecastViz } from './forecast-viz'
import { KjViz } from './kj-viz'
import { McdaViz } from './mcda-viz'
import { PdsaViz } from './pdsa-viz'
import { PertViz } from './pert-viz'
import { StepAnimator } from './step-animator'
import { ValueAnalysisViz } from './value-analysis-viz'

interface Props {
  methodId: MethodId
}

export function MethodAnimation({ methodId }: Props) {
  const { language } = useI18n()
  const en = language === 'en'
  const frames = animationRegistry[methodId]
  const [step, setStep] = useState(0)

  if (!frames || frames.length === 0) return null

  const currentFrame = frames[step]!
  const label = en ? currentFrame.label.en : currentFrame.label.zh

  const handleStepChange = (next: number) => {
    if (next >= 0 && next < frames.length) setStep(next)
  }

  return (
    <StepAnimator totalSteps={frames.length} currentStep={step} onStepChange={handleStepChange} stepLabel={label}>
      <VizSwitch methodId={methodId} step={step} en={en} />
    </StepAnimator>
  )
}

function VizSwitch({ methodId, step, en }: { methodId: MethodId; step: number; en: boolean }) {
  const frames = animationRegistry[methodId]
  const frame = frames[step]

  switch (methodId) {
    case 'fishbone':
      return <FishboneViz frame={frame as FishboneFrame} en={en} />
    case 'five-why':
      return <FiveWhyViz frame={frame as FiveWhyFrame} en={en} />
    case 'abc':
      return <AbcViz frame={frame as AbcFrame} en={en} />
    case 'kj':
      return <KjViz frame={frame as KjFrame} en={en} />
    case 'causal-graph':
      return <CausalGraphViz frame={frame as CausalGraphFrame} en={en} />
    case 'mcda':
      return <McdaViz frame={frame as McdaFrame} en={en} />
    case 'value-analysis':
      return <ValueAnalysisViz frame={frame as ValueAnalysisFrame} en={en} />
    case 'fmea':
      return <FmeaViz frame={frame as FmeaFrame} en={en} />
    case 'dmaic':
      return <DmaicViz frame={frame as DmaicFrame} en={en} />
    case 'pdsa':
      return <PdsaViz frame={frame as PdsaFrame} en={en} />
    case 'forecast':
      return <ForecastViz frame={frame as ForecastFrame} en={en} />
    case 'pert':
      return <PertViz frame={frame as PertFrame} en={en} />
    default:
      return null
  }
}
