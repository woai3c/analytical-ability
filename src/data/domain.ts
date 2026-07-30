import { z } from 'zod'

import { difficultyLevels, methodIds, taskTypes } from './domain-constants'
import type { Difficulty, GuidedStepNumber, MethodId } from './domain-constants'

export type { Difficulty, GuidedStepNumber, MethodId, TaskType } from './domain-constants'

// ── 任务/场景类型 ─────────────────────────────────────────────────
// 保留用于方法路由和场景分类。

const taskTypeSchema = z.enum(taskTypes)

// ── 分析方法目录 ─────────────────────────────────────────────────

const methodIdSchema = z.enum(methodIds)

// ── 场景训练 ─────────────────────────────────────────────────────

const difficultySchema = z.enum(difficultyLevels)

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
  /** 步骤 1（随机训练）：选择方法 + 理由。专项训练时自动填入。 */
  methodSelection: { selectedMethods: string[]; reasoning: string; aiResponse: string } | null
  /** 步骤 2（随机）/ 步骤 1（专项）：运用方法分析 + 得出结论，合并为一步。 */
  analysis: { userWork: string; aiResponse: string } | null
  /** 最终步骤：综合评审（AI 自动生成）。 */
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
  /** 用户主动选择的专项训练方法；随机训练时为空，避免提前泄露推荐方法。 */
  focusMethodId?: MethodId
  currentStep: GuidedStepNumber
  steps: GuidedStepData
  tokenUsage: { promptTokens: number; completionTokens: number }
  startedAt: string
  completedAt: string | null
}
