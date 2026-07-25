import cors from '@fastify/cors'
import Fastify from 'fastify'
import { z } from 'zod'

import { analyzeGoal, getMethodSpec, methodRegistry, routeMethods } from '@clarity/analysis-engine'
import type { IntakeResult, MethodId, MethodPlanItem } from '@clarity/domain'
import {
  abcRunSchema,
  actionRouteSchema,
  analysisPlanSchema,
  answersSchema,
  causalGraphRunSchema,
  dmaicRunSchema,
  fishboneRunSchema,
  fiveWhyRunSchema,
  fmeaRunSchema,
  forecastRunSchema,
  goalInputSchema,
  intakeResultSchema,
  kjRunSchema,
  llmPlanDraftSchema,
  mcdaRunSchema,
  methodIdSchema,
  methodIds,
  pdsaRunSchema,
  pertRunSchema,
  taskTypeSchema,
  valueAnalysisRunSchema,
} from '@clarity/domain'
import { LlmError, generateStructured } from '@clarity/llm'

import './env.js'

const app = Fastify({ logger: true })

type Locale = 'zh-CN' | 'en'

await app.register(cors, {
  origin(origin, callback) {
    const configuredOrigin = process.env.WEB_ORIGIN
    const isLocalDevelopmentOrigin = origin === undefined || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
    const isConfiguredOrigin = configuredOrigin !== undefined && origin === configuredOrigin

    if (isLocalDevelopmentOrigin || isConfiguredOrigin) {
      callback(null, true)
      return
    }

    callback(new Error('Origin is not allowed'), false)
  },
})

app.get('/health', async () => ({ status: 'ok' }))

// ── 规则引擎兜底（LLM 不可用时前端降级使用）────────────────────────

app.post('/api/analysis/preview', async (request, reply) => {
  const parsed = goalInputSchema.safeParse(request.body)
  if (!parsed.success) {
    return reply.status(400).send({
      error: 'INVALID_GOAL_INPUT',
      details: parsed.error.flatten(),
    })
  }

  return analyzeGoal(parsed.data)
})

// ── Intake：目标输入后的第一次 LLM 分析 ─────────────────────────────

const intakeRequestSchema = z.object({
  rawGoal: z.string().trim().min(4),
  /** 已回答的问题（含问题文本），LLM 据此不再重复提问并发现新缺口。 */
  answered: z
    .array(
      z.object({
        question: z.string(),
        answer: z.union([z.string(), z.array(z.string())]),
      }),
    )
    .max(30)
    .default([]),
})

app.post('/api/analysis/intake', async (request, reply) => {
  const locale = localeOf(request.headers['accept-language'])
  const parsed = intakeRequestSchema.safeParse(request.body)
  if (!parsed.success) {
    return reply.status(400).send({ error: 'INVALID_INTAKE_INPUT', details: parsed.error.flatten() })
  }

  const en = locale === 'en'
  const methodCatalog = methodRegistry
    .map((spec) => {
      const name = en ? spec.name.en : spec.name.zh
      const inputs = spec.requiredInputs.map((item) => (en ? item.en : item.zh)).join('; ')
      return `- ${spec.id}（${name}）：适用 ${spec.taskTypes.join('/')}；前置条件：${inputs}`
    })
    .join('\n')

  const answeredText = parsed.data.answered.length
    ? parsed.data.answered
        .map((item) => `Q: ${item.question}\nA: ${Array.isArray(item.answer) ? item.answer.join('；') : item.answer}`)
        .join('\n')
    : en
      ? '(none yet)'
      : '（暂无）'

  try {
    const result = await generateStructured({
      schema: intakeResultSchema,
      system: en
        ? [
            'You are a rigorous goal-analysis assistant. Use English.',
            'Separate facts, assumptions, and unknowns. Never invent data.',
            'Generate follow-up questions ONLY for information that is genuinely missing and that a listed analysis method requires.',
            'Every question must state why it is needed and which method ids need it (forMethods), using only ids from the provided method catalog.',
            'Each question must include suggestions: concrete, goal-specific example answers the user could adapt — never generic placeholders.',
            'Do not re-ask anything already answered. If nothing important is missing, return an empty questions array.',
          ].join('\n')
        : [
            '你是严谨的目标分析助手。使用简体中文。',
            '区分事实、假设和未知项；绝不虚构数据。',
            '只为真正缺失、且某个分析方法必需的信息生成追问。',
            '每个问题必须说明为什么需要它、哪些方法需要它（forMethods 只能使用方法目录里的 id）。',
            '每个问题必须给出 suggestions：结合用户目标的具体填写示例，让用户可以直接改改用，禁止泛泛的占位示例。',
            '已经回答过的内容不要重复提问。如果没有重要缺口，questions 返回空数组。',
          ].join('\n'),
      prompt: [
        en ? 'Analyze this goal and decide what is still missing.' : '请分析以下目标，判断还缺哪些必须补充的条件。',
        `${en ? 'Goal' : '目标'}：${parsed.data.rawGoal}`,
        `${en ? 'Already answered' : '已回答'}：\n${answeredText}`,
        `${en ? 'Method catalog' : '分析方法目录'}：\n${methodCatalog}`,
        en
          ? 'Extract any goal fields already present in the text (baseline, desired outcome, metric, deadline, constraints, known facts).'
          : '请把原文里已经包含的信息抽取到 extracted（基线、期望结果、成功标准、期限、限制、已知事实），没有就留空。',
      ].join('\n\n'),
    })

    // 防御：LLM 可能编造方法 id 或重复问题，按注册表清洗。
    result.questions = dedupeQuestions(result.questions).map((q) => ({
      ...q,
      forMethods: q.forMethods.filter((id) => (methodIds as readonly string[]).includes(id)),
    }))
    return { result }
  } catch (error) {
    return sendLlmError(reply, request, error, locale)
  }
})

// ── Plan：方法路由（代码）+ 数据需求与推荐理由（LLM）─────────────────

const planRequestSchema = z.object({
  rawGoal: z.string().trim().min(4),
  taskType: taskTypeSchema,
  intake: intakeResultSchema,
  answers: answersSchema,
})

app.post('/api/analysis/plan', async (request, reply) => {
  const locale = localeOf(request.headers['accept-language'])
  const parsed = planRequestSchema.safeParse(request.body)
  if (!parsed.success) {
    return reply.status(400).send({ error: 'INVALID_PLAN_INPUT', details: parsed.error.flatten() })
  }

  const { rawGoal, taskType, intake, answers } = parsed.data
  const en = locale === 'en'
  const route = routeMethods(taskType)
  const routedIds = [...route.primary, ...route.optional]

  // 未回答的高优先级问题 → 对应方法标记为缺输入。
  const unanswered = intake.questions.filter((q) => {
    const value = answers[q.id]
    return (
      value === undefined ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0)
    )
  })

  const catalog = routedIds
    .map((id) => {
      const spec = getMethodSpec(id)
      return `- ${id}（${en ? spec.name.en : spec.name.zh}）：${en ? spec.purpose.en : spec.purpose.zh}`
    })
    .join('\n')

  try {
    const draft = await generateStructured({
      schema: llmPlanDraftSchema,
      system: en
        ? [
            'You are a rigorous goal-analysis assistant. Use English.',
            'Explain in one or two sentences why each routed method fits THIS specific goal. No generic textbook definitions.',
            'Draft data requirements: each item must name the question it answers, concrete fields, how to obtain it, a priority (A = blocks analysis, B = improves quality, C = nice to have), and the method it serves (or null).',
            'Only include data the user could realistically obtain. Never invent numbers.',
          ].join('\n')
        : [
            '你是严谨的目标分析助手。使用简体中文。',
            '为每个被路由到的方法写一两句理由，必须紧扣用户的具体目标，禁止照抄教科书定义。',
            '起草数据需求：每条必须说明要回答的问题、具体字段、获取方式、优先级（A=不补就无法分析，B=提升质量，C=可选）和服务的方法（没有则为 null）。',
            '只列用户现实可取得的数据，绝不虚构数值。',
          ].join('\n'),
      prompt: [
        `${en ? 'Goal' : '目标'}：${rawGoal}`,
        `${en ? 'Goal restatement' : '目标重述'}：${intake.restatement}`,
        `${en ? 'Answers so far' : '已补充的回答'}：${JSON.stringify(answers)}`,
        `${en ? 'Routed methods' : '已路由方法'}：\n${catalog}`,
      ].join('\n\n'),
    })

    const reasonMap = new Map(draft.methodReasons.map((item) => [item.methodId, item.reason]))
    const methods: MethodPlanItem[] = routedIds.map((id) => {
      const spec = getMethodSpec(id)
      const missing = unanswered.filter((q) => q.forMethods.includes(id)).map((q) => q.question)
      return {
        methodId: id,
        role: route.primary.includes(id) ? 'primary' : 'optional',
        reason: reasonMap.get(id) ?? (en ? spec.purpose.en : spec.purpose.zh),
        requiredInputs: spec.requiredInputs.map((item) => (en ? item.en : item.zh)),
        ready: missing.length === 0,
        missingInputs: missing,
        accepted: route.primary.includes(id),
      }
    })

    const result = analysisPlanSchema.parse({
      methods,
      dataNeeds: draft.dataNeeds.map((need, index) => ({ id: `need-${index + 1}`, ...need })),
    })
    return { result }
  } catch (error) {
    return sendLlmError(reply, request, error, locale)
  }
})

// ── Method-run：LLM 生成某方法的候选内容（计算在前端/引擎完成）─────────

const methodRunSchemas = {
  fishbone: fishboneRunSchema,
  'five-why': fiveWhyRunSchema,
  kj: kjRunSchema,
  abc: abcRunSchema,
  'causal-graph': causalGraphRunSchema,
  mcda: mcdaRunSchema,
  'value-analysis': valueAnalysisRunSchema,
  fmea: fmeaRunSchema,
  dmaic: dmaicRunSchema,
  pdsa: pdsaRunSchema,
  forecast: forecastRunSchema,
  pert: pertRunSchema,
} satisfies Record<MethodId, z.ZodType>

const methodRunRequestSchema = z.object({
  methodId: methodIdSchema,
  rawGoal: z.string().trim().min(4),
  intake: intakeResultSchema,
  answers: answersSchema,
  /** 用户为该方法补充的材料（如 KJ 的原始笔记、MCDA 的候选方案）。 */
  material: z.string().max(20000).default(''),
})

const methodPrompts: Record<MethodId, { zh: string; en: string }> = {
  fishbone: {
    zh: '生成鱼骨分析的候选原因树：problem 写要解释的问题，categories 给出 4-6 个类别（结合目标领域，不要只用“人机料法环”套话），每个类别 2-4 条候选原因，重要的原因给 1-2 条 subCauses。所有内容都是候选假设，语气不得写成已证实结论。',
    en: 'Draft a fishbone candidate-cause tree: 4-6 domain-appropriate categories, 2-4 candidate causes each, 1-2 subCauses for the important ones. Everything is a hypothesis — never phrase causes as verified facts.',
  },
  'five-why': {
    zh: '围绕问题生成 2-3 条 5 Why 追问链：startCause 是表面原因，whys 是逐层深入的追问答案（最多 5 层），最后一层应是可行动的根因候选。',
    en: 'Draft 2-3 five-why chains: startCause is the surface cause, whys dig deeper layer by layer (max 5), ending at an actionable root-cause candidate.',
  },
  kj: {
    zh: '把用户提供的原始材料拆成卡片（每条一个要点），再按语义归成 3-6 个主题组并命名；无法归类的 groupId 置 null。若用户没给材料，根据目标和回答生成候选卡片并在卡片文本中体现来源是推测。',
    en: 'Split the user material into one-idea cards, group them into 3-6 named themes; unclassified cards get groupId null. If no material was provided, draft candidate cards from the goal and mark them as inferred.',
  },
  abc: {
    zh: '根据目标确定一个价值口径 valueLabel，并生成 6-12 个候选项目及相对数值估计。数值是待用户修正的占位估计，不得假装是真实统计。',
    en: 'Pick a value metric (valueLabel) and draft 6-12 candidate items with rough relative values. Values are placeholders for the user to correct — never present them as real statistics.',
  },
  'causal-graph': {
    zh: '生成基础因果图：nodes 包含结果变量（outcome）、影响因素（factor）和可能的混杂因素（confounder）；edges 标注方向与关系类型（candidate=仅假设，evidence-backed=有证据），note 说明依据。',
    en: 'Draft a causal graph: nodes include the outcome, factors, and possible confounders; edges carry direction and relation type (candidate vs evidence-backed) with a note on the basis.',
  },
  mcda: {
    zh: '生成 MCDA 草稿：options 至少 2 个现实可行方案（如适用含“维持现状”）；criteria 4-6 条评价准则，weight 合计 100，minimum 为最低可接受表现（0-10）；scores 给每个方案在每条准则上的 0-10 估计分；notes 说明打分依据与不确定性。',
    en: 'Draft an MCDA table: at least 2 feasible options (include status quo if relevant); 4-6 criteria with weights summing to 100 and minimum acceptable scores; 0-10 estimated scores per option-criterion; notes on the scoring basis and uncertainty.',
  },
  'value-analysis': {
    zh: '生成价值分析表：列出目标涉及的功能或支出，判断 necessity，给出成本估计、价值判断和更省的替代做法。',
    en: 'Draft a value analysis: list the functions or expenses involved, judge necessity, estimate cost and worth, and propose cheaper alternatives.',
  },
  fmea: {
    zh: '生成 FMEA 草稿：列出 4-8 个可能的失效模式，给出影响、严重度/发生度/可探测度（1-10）和缓解措施。',
    en: 'Draft an FMEA: 4-8 plausible failure modes with effects, severity/occurrence/detection (1-10), and mitigations.',
  },
  dmaic: {
    zh: '按 Define/Measure/Analyze/Improve/Control 五段，针对用户目标各写一段可执行的要点（每段 2-4 句，具体到该目标，不写套话）。',
    en: 'Fill the five DMAIC sections with goal-specific, executable points (2-4 sentences each, no boilerplate).',
  },
  pdsa: {
    zh: '设计一轮 PDSA：prediction 写清预期结果，scope 是可停止的小范围，metrics 2-4 个观察指标，stopRule 是停止条件，nextCycle 说明下一轮怎么安排。',
    en: 'Design one PDSA cycle: an explicit prediction, a small stoppable scope, 2-4 metrics, a stop rule, and how the next cycle proceeds.',
  },
  forecast: {
    zh: '生成概率预测记录：statement 可验证且有截止时间；baseRate 说明参考哪类基准率（不知道就明说缺失）；scenarios 2-4 个情景及概率；probability 是 0-100 的综合概率；resolveBy 是验证时间。',
    en: 'Draft a forecast record: a verifiable statement with a deadline; the reference base rate (say explicitly if unknown); 2-4 scenarios with probabilities; an overall 0-100 probability; and a resolveBy date.',
  },
  pert: {
    zh: '把目标拆成 6-12 个有依赖关系的任务：name 具体可执行，optimistic/likely/pessimistic 是以天为单位的三点估算（pessimistic ≥ likely ≥ optimistic），dependencies 填前置任务 id。任务拆分是候选，工期最终由用户确认。',
    en: 'Decompose the goal into 6-12 dependent tasks: concrete names, three-point estimates in days (pessimistic ≥ likely ≥ optimistic), and dependency ids. The breakdown is a draft; durations are confirmed by the user.',
  },
}

app.post('/api/analysis/method-run', async (request, reply) => {
  const locale = localeOf(request.headers['accept-language'])
  const parsed = methodRunRequestSchema.safeParse(request.body)
  if (!parsed.success) {
    return reply.status(400).send({ error: 'INVALID_METHOD_RUN_INPUT', details: parsed.error.flatten() })
  }

  const { methodId, rawGoal, intake, answers, material } = parsed.data
  const en = locale === 'en'
  const spec = getMethodSpec(methodId)
  const schema = methodRunSchemas[methodId]

  try {
    const result = await generateStructured({
      schema,
      system: en
        ? `You are a rigorous goal-analysis assistant running the "${spec.name.en}" method. Use English. ${methodPrompts[methodId].en} Everything you produce is a candidate draft for the user to confirm and edit; never invent real-world data or sources. All id fields must be short unique slugs.`
        : `你是严谨的目标分析助手，正在运行「${spec.name.zh}」方法。使用简体中文。${methodPrompts[methodId].zh} 你产出的是供用户确认和修改的候选草稿，绝不虚构真实数据或来源。所有 id 字段用简短唯一的英文短横线命名。`,
      prompt: [
        `${en ? 'Goal' : '目标'}：${rawGoal}`,
        `${en ? 'Goal restatement' : '目标重述'}：${intake.restatement}`,
        `${en ? 'Assumptions' : '隐含假设'}：${JSON.stringify(intake.assumptions)}`,
        `${en ? 'Answers' : '用户补充的回答'}：${JSON.stringify(answers)}`,
        material ? `${en ? 'Material provided for this method' : '用户为该方法提供的材料'}：\n${material}` : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    })
    return { result }
  } catch (error) {
    return sendLlmError(reply, request, error, locale)
  }
})

// ── Route：行动路线（LLM 生成，关联方法产出）─────────────────────────

const routeRequestSchema = z.object({
  rawGoal: z.string().trim().min(4),
  intake: intakeResultSchema,
  answers: answersSchema,
  plan: analysisPlanSchema,
  methodRuns: z.record(z.string(), z.unknown()),
})

app.post('/api/analysis/route', async (request, reply) => {
  const locale = localeOf(request.headers['accept-language'])
  const parsed = routeRequestSchema.safeParse(request.body)
  if (!parsed.success) {
    return reply.status(400).send({ error: 'INVALID_ROUTE_INPUT', details: parsed.error.flatten() })
  }

  const { rawGoal, intake, answers, plan, methodRuns } = parsed.data
  const en = locale === 'en'
  const acceptedMethods = plan.methods.filter((m) => m.accepted)

  try {
    const result = await generateStructured({
      schema: actionRouteSchema,
      system: en
        ? [
            'You are a rigorous goal-analysis assistant. Use English.',
            'Draft an action route: concrete, verifiable steps that start from the highest-value missing information, then run the accepted analysis methods, then act and review.',
            'Each step needs: a completion criterion (doneWhen), a kind, the method it belongs to (linkedMethod, null for plain actions), and a realistic estimatedDays (null when unknown).',
            '5-8 steps. First step must be doable today. Never invent deadlines or durations the user has not given — use null instead.',
          ].join('\n')
        : [
            '你是严谨的目标分析助手。使用简体中文。',
            '起草行动路线：先补最高价值的信息缺口，再运行已确认的分析方法，然后行动与复盘。每一步都要具体、可验证。',
            '每步需要：完成标准（doneWhen）、类型（kind）、所属方法（linkedMethod，纯行动为 null）、现实的 estimatedDays（不知道就填 null）。',
            '共 5-8 步，第一步必须是今天就能做的。绝不替用户捏造期限和工期——不确定就填 null。',
          ].join('\n'),
      prompt: [
        `${en ? 'Goal' : '目标'}：${rawGoal}`,
        `${en ? 'Restatement' : '目标重述'}：${intake.restatement}`,
        `${en ? 'Extracted info' : '已掌握信息'}：${JSON.stringify(intake.extracted)}`,
        `${en ? 'Answers' : '用户回答'}：${JSON.stringify(answers)}`,
        `${en ? 'Accepted methods' : '已确认方法'}：${acceptedMethods.map((m) => m.methodId).join(', ')}`,
        `${en ? 'Method outputs' : '方法产出'}：${JSON.stringify(methodRuns)}`,
        `${en ? 'Priority data needs' : '优先数据需求'}：${JSON.stringify(plan.dataNeeds.filter((n) => n.priority === 'A'))}`,
      ].join('\n\n'),
    })
    return { result }
  } catch (error) {
    return sendLlmError(reply, request, error, locale)
  }
})

// ── 工具函数 ─────────────────────────────────────────────────────

function localeOf(header: string | string[] | undefined): Locale {
  const value = Array.isArray(header) ? header[0] : header
  return value?.startsWith('en') ? 'en' : 'zh-CN'
}

function dedupeQuestions(questions: IntakeResult['questions']): IntakeResult['questions'] {
  const seen = new Set<string>()
  return questions.filter((q) => {
    const key = q.question.trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const llmErrorMessages: Record<string, { zh: string; en: string }> = {
  LLM_NOT_CONFIGURED: {
    zh: '尚未配置模型 API Key。请在 .env 中配置（如 MOONSHOT_API_KEY）后重启服务。',
    en: 'No LLM API key configured. Add one (e.g. MOONSHOT_API_KEY) to .env and restart the API.',
  },
  LLM_AUTH_FAILED: {
    zh: '模型供应商拒绝了 API Key，请检查 .env 配置。',
    en: 'The provider rejected the API key. Check .env.',
  },
  LLM_BILLING: {
    zh: '模型供应商账户余额不足或套餐已停用。',
    en: 'The provider account is out of balance or suspended.',
  },
  LLM_MODEL_NOT_FOUND: {
    zh: '模型不存在或无权访问，请检查 LLM_MODEL 配置。',
    en: 'Model not found or not accessible. Check LLM_MODEL.',
  },
  LLM_RATE_LIMITED: { zh: '模型供应商限流，请稍后重试。', en: 'Rate limited by the provider. Try again later.' },
  LLM_TIMEOUT: { zh: '模型响应超时，请重试。', en: 'The model timed out. Try again.' },
  LLM_SCHEMA_MISMATCH: {
    zh: '模型返回的内容未通过校验，请重试。',
    en: 'The model response failed validation. Try again.',
  },
  LLM_UNKNOWN: { zh: '模型分析失败，请重试。', en: 'Model analysis failed. Try again.' },
}

function sendLlmError(
  reply: import('fastify').FastifyReply,
  request: import('fastify').FastifyRequest,
  error: unknown,
  locale: Locale,
) {
  const en = locale === 'en'
  if (error instanceof LlmError) {
    request.log.warn({ code: error.code }, 'LLM call failed')
    const message = llmErrorMessages[error.code] ?? {
      zh: '模型分析失败，请重试。',
      en: 'Model analysis failed. Try again.',
    }
    return reply.status(error.status).send({ error: error.code, message: en ? message.en : message.zh })
  }
  if (error instanceof z.ZodError) {
    return reply.status(502).send({
      error: 'LLM_SCHEMA_MISMATCH',
      message: en ? 'The model response failed validation. Try again.' : '模型结果未通过结构校验，请重试。',
    })
  }
  request.log.error(error)
  return reply.status(500).send({ error: 'INTERNAL_ERROR', message: en ? 'Internal error.' : '服务器内部错误。' })
}

const port = Number(process.env.PORT ?? 8787)
const host = process.env.HOST ?? '127.0.0.1'

try {
  await app.listen({ port, host })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
