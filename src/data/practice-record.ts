import type { GuidedStepData } from './domain'

export interface PracticeRecord {
  scenarioId: string
  scenarioTitle: string
  scenarioDescription?: string
  scenarioContext?: string
  applicableMethods?: string[]
  taskType: string
  selectedMethods: string[]
  correct: boolean
  score: number
  feedback?: string
  improvementTip?: string
  methodExplanations?: Array<{ methodId: string; explanation: string; isBestFit: boolean }>
  completedAt: string
  steps?: Partial<GuidedStepData>

  guided?: boolean
  analysis?: string | undefined
  dimensions?: Array<{ name: string; score: number; comment: string }> | undefined
}
