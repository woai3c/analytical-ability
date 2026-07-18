import { z } from 'zod'

export const taskTypes = [
  'diagnosis',
  'improvement',
  'selection',
  'planning',
  'prediction',
  'exploration',
  'learning',
] as const

export const taskTypeSchema = z.enum(taskTypes)
export type TaskType = z.infer<typeof taskTypeSchema>

export const goalInputSchema = z.object({
  rawGoal: z.string().trim().min(4, '请至少用一句话描述目标'),
  currentState: z.string().trim(),
  desiredOutcome: z.string().trim(),
  successMetric: z.string().trim(),
  deadline: z.string().trim(),
  constraints: z.array(z.string().trim().min(1)),
  knownFacts: z.array(z.string().trim().min(1)),
  preferredTaskType: taskTypeSchema.nullable(),
})

export type GoalInput = z.infer<typeof goalInputSchema>

export const clarificationSchema = z.object({
  id: z.string(),
  field: z.string(),
  question: z.string(),
  reason: z.string(),
  required: z.boolean(),
})

export const dataNeedSchema = z.object({
  id: z.string(),
  title: z.string(),
  reason: z.string(),
  fields: z.array(z.string()),
  collectionMethod: z.string(),
  required: z.boolean(),
})

export const actionStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  doneWhen: z.string(),
  kind: z.enum(['clarify', 'collect', 'analyze', 'decide', 'act', 'review']),
})

export const analysisPreviewSchema = z.object({
  taskType: taskTypeSchema,
  taskTypeLabel: z.string(),
  completeness: z.number().min(0).max(100),
  summary: z.string(),
  clarifications: z.array(clarificationSchema),
  dataNeeds: z.array(dataNeedSchema),
  actionSteps: z.array(actionStepSchema),
  cautions: z.array(z.string()),
})

export type Clarification = z.infer<typeof clarificationSchema>
export type DataNeed = z.infer<typeof dataNeedSchema>
export type ActionStep = z.infer<typeof actionStepSchema>
export type AnalysisPreview = z.infer<typeof analysisPreviewSchema>

export const llmAnalysisSchema = z.object({
  goalRestatement: z.string().min(1),
  assumptions: z.array(z.string().min(1)).max(8),
  missingQuestions: z
    .array(
      z.object({
        question: z.string().min(1),
        why: z.string().min(1),
        priority: z.enum(['high', 'medium', 'low']),
      }),
    )
    .max(10),
  researchPlan: z
    .array(
      z.object({
        query: z.string().min(1),
        reason: z.string().min(1),
        sourceType: z.string().min(1),
      }),
    )
    .max(10),
  suggestedNextStep: z.string().min(1),
})

export type LlmAnalysis = z.infer<typeof llmAnalysisSchema>

export const emptyGoalInput: GoalInput = {
  rawGoal: '',
  currentState: '',
  desiredOutcome: '',
  successMetric: '',
  deadline: '',
  constraints: [],
  knownFacts: [],
  preferredTaskType: null,
}
