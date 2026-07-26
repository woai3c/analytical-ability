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

export const taskTypeSchema = z.enum(taskTypes)
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

export const methodIdSchema = z.enum(methodIds)
export type MethodId = z.infer<typeof methodIdSchema>

// ── 场景训练 ─────────────────────────────────────────────────────

export const difficultyLevels = ['beginner', 'intermediate', 'advanced'] as const
export const difficultySchema = z.enum(difficultyLevels)
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

/** 用户对一个场景的练习记录。 */
export const practiceRecordSchema = z.object({
  scenarioId: z.string().min(1),
  /** 用户选择的方法。 */
  selectedMethods: z.array(methodIdSchema),
  /** 是否命中了 applicableMethods 中的至少一个。 */
  correct: z.boolean(),
  /** 用户的分析思路（自由文本）。 */
  reasoning: z.string(),
  /** AI 给出的反馈。 */
  feedback: z.string(),
  /** 完成时间。 */
  completedAt: z.string().min(1),
  /** 耗时（秒）。 */
  durationSeconds: z.number().min(0),
})

export type PracticeRecord = z.infer<typeof practiceRecordSchema>

/** 用户对某方法的掌握状态。 */
export const methodProgressSchema = z.object({
  methodId: methodIdSchema,
  /** 0-100 掌握度。 */
  mastery: z.number().min(0).max(100),
  /** 总练习次数。 */
  totalPractices: z.number().min(0),
  /** 正确次数。 */
  correctCount: z.number().min(0),
  /** 上次练习时间。 */
  lastPracticedAt: z.string().nullable(),
})

export type MethodProgress = z.infer<typeof methodProgressSchema>

/** 用户整体能力档案。 */
export const learnerProfileSchema = z.object({
  methodProgress: z.array(methodProgressSchema),
  totalScenarios: z.number().min(0),
  totalCorrect: z.number().min(0),
  /** 按任务类型的正确率。 */
  taskTypeAccuracy: z.record(taskTypeSchema, z.number().min(0).max(100)),
  streak: z.number().min(0),
  lastActiveAt: z.string().nullable(),
})

export type LearnerProfile = z.infer<typeof learnerProfileSchema>
