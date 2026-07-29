import { z } from 'zod'

// ── 任务/场景类型 ─────────────────────────────────────────────────
// 保留用于方法路由和场景分类。

export const taskTypes = [
  'diagnosis',
  'improvement',
  'selection',
  'planning',
  'prediction',
  'exploration',
  'learning',
] as const

const taskTypeSchema = z.enum(taskTypes)
export type TaskType = z.infer<typeof taskTypeSchema>

// ── 分析方法目录 ─────────────────────────────────────────────────

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

const methodIdSchema = z.enum(methodIds)
export type MethodId = z.infer<typeof methodIdSchema>

// ── 场景训练 ─────────────────────────────────────────────────────

const difficultyLevels = ['beginner', 'intermediate', 'advanced'] as const
const difficultySchema = z.enum(difficultyLevels)
export type Difficulty = z.infer<typeof difficultySchema>

/** 一个训练场景：描述真实情境，用户需要选择合适的分析方法并运用。 */
export const scenarioSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  context: z.string().min(1),
  difficulty: difficultySchema,
  /** 该场景属于哪种任务类型。 */
  taskType: taskTypeSchema,
  /** 适用的方法（可能有多个合理答案）。 */
  applicableMethods: z.array(methodIdSchema).min(1),
  /** 为什么这些方法适用的解释。 */
  explanations: z.record(methodIdSchema, z.string()),
  /** 不适用的常见误选方法及解释。 */
  commonMistakes: z.array(
    z.object({
      methodId: methodIdSchema,
      why: z.string().min(1),
    }),
  ),
})

export type Scenario = z.infer<typeof scenarioSchema>

// ── 引导式训练 ─────────────────────────────────────────────────

export const guidedStepNumbers = [1, 2, 3, 4, 5] as const
export type GuidedStepNumber = (typeof guidedStepNumbers)[number]

export const stepResponseSchema = z.object({
  feedback: z.string().min(1),
  hint: z.string().optional(),
})

export const reflectionSchema = z.object({
  overallFeedback: z.string().min(1),
  score: z.number().min(0).max(100),
  dimensions: z.array(
    z.object({
      name: z.string().min(1),
      score: z.number().min(0).max(100),
      comment: z.string().min(1),
    }),
  ),
  tips: z.array(z.string().min(1)),
})

export type Reflection = z.infer<typeof reflectionSchema>

export interface GuidedStepData {
  problemDefinition: { userAnswer: string; aiResponse: string } | null
  methodSelection: { selectedMethods: string[]; reasoning: string; aiResponse: string } | null
  methodApplication: { userWork: string; aiResponse: string } | null
  conclusion: { userAnswer: string; aiResponse: string } | null
  reflection: {
    aiFeedback: string
    score: number
    dimensions: Array<{ name: string; score: number; comment: string }>
    tips: string[]
  } | null
}

export interface GuidedSession {
  id: string
  scenario: Scenario
  difficulty: Difficulty
  currentStep: GuidedStepNumber
  steps: GuidedStepData
  tokenUsage: { promptTokens: number; completionTokens: number }
  startedAt: string
  completedAt: string | null
}
