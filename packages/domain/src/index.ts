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

// ── 分析方法目录 ─────────────────────────────────────────────────
// 与 product.md 11.2 节"第一版完整方法箱"对齐。

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

// ── 动态澄清（LLM intake 产出）────────────────────────────────────

export const questionInputTypes = ['text', 'longtext', 'date', 'list', 'choice'] as const

export const dynamicQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  why: z.string().min(1),
  /** 哪些分析方法需要这个答案。LLM 可能产出未知 id，API 层按注册表过滤。 */
  forMethods: z.array(z.string()),
  priority: z.enum(['high', 'medium', 'low']),
  inputType: z.enum(questionInputTypes),
  /** 针对当前目标的填写示例或可选答案（choice 类型为选项）。 */
  suggestions: z.array(z.string()).max(6),
})

export type DynamicQuestion = z.infer<typeof dynamicQuestionSchema>

export const extractedGoalSchema = z.object({
  currentState: z.string(),
  desiredOutcome: z.string(),
  successMetric: z.string(),
  deadline: z.string(),
  constraints: z.array(z.string()),
  knownFacts: z.array(z.string()),
})

export type ExtractedGoal = z.infer<typeof extractedGoalSchema>

export const intakeResultSchema = z.object({
  restatement: z.string().min(1),
  taskType: taskTypeSchema,
  taskTypeReason: z.string().min(1),
  extracted: extractedGoalSchema,
  assumptions: z.array(z.string().min(1)).max(8),
  questions: z.array(dynamicQuestionSchema).max(12),
  summary: z.string().min(1),
})

export type IntakeResult = z.infer<typeof intakeResultSchema>

export const answerValueSchema = z.union([z.string(), z.array(z.string())])
export type AnswerValue = z.infer<typeof answerValueSchema>
export const answersSchema = z.record(z.string(), answerValueSchema)
export type Answers = z.infer<typeof answersSchema>

// ── 分析计划（方法路由 + 数据需求）─────────────────────────────────

export const methodPlanItemSchema = z.object({
  methodId: methodIdSchema,
  role: z.enum(['primary', 'optional']),
  /** 为什么这个方法适用于当前目标（LLM 解释）。 */
  reason: z.string(),
  /** 前置条件清单（来自方法注册表）。 */
  requiredInputs: z.array(z.string()),
  ready: z.boolean(),
  missingInputs: z.array(z.string()),
  accepted: z.boolean(),
})

export type MethodPlanItem = z.infer<typeof methodPlanItemSchema>

export const planDataNeedSchema = z.object({
  id: z.string().min(1),
  /** 这条数据要回答的问题。 */
  question: z.string().min(1),
  fields: z.array(z.string().min(1)),
  /** 获取方式。 */
  source: z.string().min(1),
  priority: z.enum(['A', 'B', 'C']),
  methodId: methodIdSchema.nullable(),
})

export type PlanDataNeed = z.infer<typeof planDataNeedSchema>

export const analysisPlanSchema = z.object({
  methods: z.array(methodPlanItemSchema),
  dataNeeds: z.array(planDataNeedSchema),
})

export type AnalysisPlan = z.infer<typeof analysisPlanSchema>

/** LLM 只负责解释与数据需求草稿；路由与 ready 状态由代码计算。 */
export const llmPlanDraftSchema = z.object({
  methodReasons: z.array(z.object({ methodId: methodIdSchema, reason: z.string().min(1) })),
  dataNeeds: z.array(
    z.object({
      question: z.string().min(1),
      fields: z.array(z.string().min(1)),
      source: z.string().min(1),
      priority: z.enum(['A', 'B', 'C']),
      methodId: methodIdSchema.nullable(),
    }),
  ),
})

export type LlmPlanDraft = z.infer<typeof llmPlanDraftSchema>

// ── 方法运行结果 ─────────────────────────────────────────────────

export const fishboneRunSchema = z.object({
  problem: z.string(),
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      causes: z.array(z.object({ id: z.string(), text: z.string(), subCauses: z.array(z.string()) })),
    }),
  ),
})
export type FishboneRun = z.infer<typeof fishboneRunSchema>

export const fiveWhyRunSchema = z.object({
  problem: z.string(),
  chains: z.array(z.object({ id: z.string(), startCause: z.string(), whys: z.array(z.string()).max(6) })),
})
export type FiveWhyRun = z.infer<typeof fiveWhyRunSchema>

export const kjRunSchema = z.object({
  cards: z.array(z.object({ id: z.string(), text: z.string(), groupId: z.string().nullable() })),
  groups: z.array(z.object({ id: z.string(), name: z.string() })),
})
export type KjRun = z.infer<typeof kjRunSchema>

export const abcRunSchema = z.object({
  valueLabel: z.string(),
  items: z.array(z.object({ id: z.string(), name: z.string(), value: z.number() })),
})
export type AbcRun = z.infer<typeof abcRunSchema>

export const causalGraphRunSchema = z.object({
  nodes: z.array(z.object({ id: z.string(), label: z.string(), kind: z.enum(['factor', 'outcome', 'confounder']) })),
  edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      relation: z.enum(['candidate', 'evidence-backed']),
      note: z.string(),
    }),
  ),
})
export type CausalGraphRun = z.infer<typeof causalGraphRunSchema>

export const mcdaRunSchema = z.object({
  options: z.array(z.object({ id: z.string(), name: z.string() })).min(2),
  criteria: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      /** 权重，全部准则合计 100。 */
      weight: z.number().min(0).max(100),
      /** 该准则的最低可接受表现（0-10）。 */
      minimum: z.number().min(0).max(10),
    }),
  ),
  /** scores[optionId][criterionId] = 0-10 表现分。 */
  scores: z.record(z.string(), z.record(z.string(), z.number().min(0).max(10))),
  notes: z.string(),
})
export type McdaRun = z.infer<typeof mcdaRunSchema>

export const valueAnalysisRunSchema = z.object({
  functions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      necessity: z.enum(['essential', 'nice-to-have', 'waste']),
      cost: z.string(),
      worth: z.string(),
      alternative: z.string(),
    }),
  ),
})
export type ValueAnalysisRun = z.infer<typeof valueAnalysisRunSchema>

export const fmeaRunSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      failureMode: z.string(),
      effect: z.string(),
      severity: z.number().min(1).max(10),
      occurrence: z.number().min(1).max(10),
      detection: z.number().min(1).max(10),
      mitigation: z.string(),
    }),
  ),
})
export type FmeaRun = z.infer<typeof fmeaRunSchema>

export const dmaicRunSchema = z.object({
  define: z.string(),
  measure: z.string(),
  analyze: z.string(),
  improve: z.string(),
  control: z.string(),
})
export type DmaicRun = z.infer<typeof dmaicRunSchema>

export const pdsaRunSchema = z.object({
  prediction: z.string(),
  scope: z.string(),
  metrics: z.array(z.string()),
  stopRule: z.string(),
  nextCycle: z.string(),
})
export type PdsaRun = z.infer<typeof pdsaRunSchema>

export const forecastRunSchema = z.object({
  statement: z.string(),
  baseRate: z.string(),
  scenarios: z.array(
    z.object({ id: z.string(), name: z.string(), probability: z.number().min(0).max(100), rationale: z.string() }),
  ),
  probability: z.number().min(0).max(100),
  resolveBy: z.string(),
})
export type ForecastRun = z.infer<typeof forecastRunSchema>

export const pertRunSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      optimistic: z.number().min(0),
      likely: z.number().min(0),
      pessimistic: z.number().min(0),
      dependencies: z.array(z.string()),
    }),
  ),
})
export type PertRun = z.infer<typeof pertRunSchema>

export interface MethodRunMap {
  fishbone: FishboneRun
  'five-why': FiveWhyRun
  kj: KjRun
  abc: AbcRun
  'causal-graph': CausalGraphRun
  mcda: McdaRun
  'value-analysis': ValueAnalysisRun
  fmea: FmeaRun
  dmaic: DmaicRun
  pdsa: PdsaRun
  forecast: ForecastRun
  pert: PertRun
}

export type MethodRuns = Partial<{ [K in MethodId]: MethodRunMap[K] }>

// ── 行动路线 ────────────────────────────────────────────────────

export const routeStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  doneWhen: z.string().min(1),
  kind: z.enum(['clarify', 'collect', 'analyze', 'decide', 'act', 'review']),
  /** 这一步由哪个分析方法的产出驱动；纯行动步骤为 null。 */
  linkedMethod: methodIdSchema.nullable(),
  estimatedDays: z.number().min(0).nullable(),
})

export type RouteStep = z.infer<typeof routeStepSchema>

export const actionRouteSchema = z.object({
  steps: z.array(routeStepSchema).min(1),
  notes: z.string(),
})

export type ActionRoute = z.infer<typeof actionRouteSchema>

// ── 执行项目（localStorage 持久化）─────────────────────────────────

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  language: z.enum(['zh-CN', 'en']),
  step: z.number().min(1).max(5),
  rawGoal: z.string().min(1),
  answers: answersSchema,
  intake: intakeResultSchema.nullable(),
  plan: analysisPlanSchema.nullable(),
  methodRuns: z.record(z.string(), z.unknown()),
  route: actionRouteSchema.nullable(),
  doneStepIds: z.array(z.string()),
})

export type Project = z.infer<typeof projectSchema>
