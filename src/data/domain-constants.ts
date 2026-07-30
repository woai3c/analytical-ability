export const taskTypes = [
  'diagnosis',
  'improvement',
  'selection',
  'planning',
  'prediction',
  'exploration',
  'learning',
] as const

export type TaskType = (typeof taskTypes)[number]

export const methodIds = [
  'fishbone',
  'five-why',
  'kj',
  'abc',
  'causal-graph',
  'mcda',
  'value-analysis',
  'fmea',
  'dmaic',
  'pdsa',
  'forecast',
  'pert',
] as const

export type MethodId = (typeof methodIds)[number]

export const difficultyLevels = ['beginner', 'intermediate', 'advanced'] as const
export type Difficulty = (typeof difficultyLevels)[number]

export const guidedStepNumbers = [1, 2, 3] as const
export type GuidedStepNumber = (typeof guidedStepNumbers)[number]
