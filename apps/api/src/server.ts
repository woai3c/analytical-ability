import cors from '@fastify/cors'
import Fastify from 'fastify'
import { z } from 'zod'

import { getMethodSpec, methodRegistry } from '@clarity/analysis-engine'
import { methodIdSchema, scenarioSchema, taskTypeSchema } from '@clarity/domain'
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

// ── 方法目录 ─────────────────────────────────────────────────────

app.get('/api/methods', async (request) => {
  const locale = localeOf(request.headers['accept-language'])
  const en = locale === 'en'

  return methodRegistry.map((spec) => ({
    id: spec.id,
    name: en ? spec.name.en : spec.name.zh,
    purpose: en ? spec.purpose.en : spec.purpose.zh,
    taskTypes: spec.taskTypes,
    caution: en ? spec.caution.en : spec.caution.zh,
    depth: spec.depth,
  }))
})

app.get('/api/methods/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const locale = localeOf(request.headers['accept-language'])
  const en = locale === 'en'

  const parsed = methodIdSchema.safeParse(id)
  if (!parsed.success) {
    return reply.status(404).send({ error: 'METHOD_NOT_FOUND' })
  }

  const spec = getMethodSpec(parsed.data)
  return {
    id: spec.id,
    name: en ? spec.name.en : spec.name.zh,
    purpose: en ? spec.purpose.en : spec.purpose.zh,
    taskTypes: spec.taskTypes,
    requiredInputs: spec.requiredInputs.map((i) => (en ? i.en : i.zh)),
    outputs: spec.outputs.map((o) => (en ? o.en : o.zh)),
    caution: en ? spec.caution.en : spec.caution.zh,
    depth: spec.depth,
  }
})

// ── 场景生成（LLM）─────────────────────────────────────────────────

const generateScenarioRequestSchema = z.object({
  taskType: taskTypeSchema.optional(),
  methodId: methodIdSchema.optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
})

app.post('/api/scenarios/generate', async (request, reply) => {
  const locale = localeOf(request.headers['accept-language'])
  const parsed = generateScenarioRequestSchema.safeParse(request.body)
  if (!parsed.success) {
    return reply.status(400).send({ error: 'INVALID_REQUEST', details: parsed.error.flatten() })
  }

  const { taskType, methodId, difficulty } = parsed.data
  const en = locale === 'en'

  const methodCatalog = methodRegistry
    .map((spec) => {
      const name = en ? spec.name.en : spec.name.zh
      const purpose = en ? spec.purpose.en : spec.purpose.zh
      return `- ${spec.id}（${name}）：${purpose}；适用场景：${spec.taskTypes.join('/')}`
    })
    .join('\n')

  const difficultyHint =
    difficulty === 'beginner'
      ? en
        ? 'Simple scenario with one clearly best method.'
        : '简单场景，有一个明显最优的方法。'
      : difficulty === 'intermediate'
        ? en
          ? 'Moderate scenario where 2-3 methods could apply, requiring comparison.'
          : '中等场景，2-3 个方法都有道理，需要比较取舍。'
        : en
          ? 'Complex scenario with ambiguity, conflicting signals, and multiple valid approaches.'
          : '复杂场景，信息模糊、信号冲突，多种方法都有其合理性。'

  const constraints = [
    taskType ? `${en ? 'Task type' : '场景类型'}：${taskType}` : '',
    methodId ? `${en ? 'Must include method' : '必须涵盖方法'}：${methodId}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const result = await generateStructured({
      schema: scenarioSchema,
      system: en
        ? [
            'You are a teacher of analytical thinking methods. Generate a realistic training scenario.',
            'The scenario must describe a concrete, believable real-life situation where someone needs to make a decision or solve a problem.',
            `Difficulty: ${difficultyHint}`,
            'The scenario must test whether the learner can identify which analytical method(s) to use and why.',
            'Include 1-2 common mistakes (methods that seem relevant but are not the best fit) with clear explanations.',
            'The id must be a short unique slug like "startup-pricing-q1".',
            'All explanations should teach WHY a method fits or does not fit this specific scenario.',
          ].join('\n')
        : [
            '你是分析思维方法的教师。请生成一个真实的训练场景。',
            '场景必须描述一个具体、可信的现实情境，某人需要做决策或解决问题。',
            `难度：${difficultyHint}`,
            '场景必须检验学习者能否识别应该用哪种分析方法、为什么。',
            '包含 1-2 个常见误选（看起来相关但并非最佳的方法），并给出清晰解释。',
            'id 用简短的英文短横线命名，如 "startup-pricing-q1"。',
            '所有解释都要说明为什么某方法适合或不适合这个具体场景。',
          ].join('\n'),
      prompt: [
        en ? 'Generate a training scenario with these requirements:' : '请按以下要求生成训练场景：',
        constraints || (en ? '(no special constraints)' : '（无特殊限制）'),
        `${en ? 'Method catalog' : '方法目录'}：\n${methodCatalog}`,
      ].join('\n\n'),
    })

    return { result }
  } catch (error) {
    return sendLlmError(reply, request, error, locale)
  }
})

// ── 练习反馈（LLM）─────────────────────────────────────────────────

const feedbackRequestSchema = z.object({
  scenarioTitle: z.string().min(1),
  scenarioDescription: z.string().min(1),
  scenarioContext: z.string().min(1),
  applicableMethods: z.array(methodIdSchema),
  selectedMethods: z.array(methodIdSchema),
  reasoning: z.string(),
})

const feedbackResponseSchema = z.object({
  correct: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string().min(1),
  methodExplanations: z.array(
    z.object({
      methodId: methodIdSchema,
      fit: z.enum(['good', 'partial', 'poor']),
      explanation: z.string().min(1),
    }),
  ),
  improvementTip: z.string().min(1),
})

app.post('/api/practice/feedback', async (request, reply) => {
  const locale = localeOf(request.headers['accept-language'])
  const parsed = feedbackRequestSchema.safeParse(request.body)
  if (!parsed.success) {
    return reply.status(400).send({ error: 'INVALID_REQUEST', details: parsed.error.flatten() })
  }

  const { scenarioTitle, scenarioDescription, scenarioContext, applicableMethods, selectedMethods, reasoning } =
    parsed.data
  const en = locale === 'en'

  try {
    const result = await generateStructured({
      schema: feedbackResponseSchema,
      system: en
        ? [
            'You are a supportive but rigorous analytical thinking coach.',
            "Evaluate the learner's method selection and reasoning for the given scenario.",
            'Be specific about WHY their choice works or does not work for THIS scenario.',
            'Give constructive feedback that helps them build transferable judgment.',
            'The improvement tip should be one actionable insight they can apply next time.',
          ].join('\n')
        : [
            '你是严谨但鼓励型的分析思维教练。',
            '评估学习者针对给定场景的方法选择和推理。',
            '具体说明为什么他们的选择在这个场景下有效或无效。',
            '给出有建设性的反馈，帮助他们建立可迁移的判断力。',
            '改进建议应该是一条下次可以直接用的可操作洞察。',
          ].join('\n'),
      prompt: [
        `${en ? 'Scenario' : '场景'}：${scenarioTitle}`,
        `${en ? 'Description' : '描述'}：${scenarioDescription}`,
        `${en ? 'Context' : '背景'}：${scenarioContext}`,
        `${en ? 'Best methods' : '最佳方法'}：${applicableMethods.join(', ')}`,
        `${en ? 'Learner chose' : '学习者选择'}：${selectedMethods.join(', ')}`,
        `${en ? 'Learner reasoning' : '学习者思路'}：${reasoning || (en ? '(none provided)' : '（未提供）')}`,
      ].join('\n'),
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

const llmErrorMessages: Record<string, { zh: string; en: string }> = {
  LLM_NOT_CONFIGURED: {
    zh: '尚未配置模型 API Key。请在 .env 中配置后重启服务。',
    en: 'No LLM API key configured. Add one to .env and restart.',
  },
  LLM_AUTH_FAILED: {
    zh: '模型供应商拒绝了 API Key，请检查配置。',
    en: 'The provider rejected the API key. Check .env.',
  },
  LLM_BILLING: {
    zh: '模型供应商账户余额不足。',
    en: 'The provider account is out of balance.',
  },
  LLM_MODEL_NOT_FOUND: {
    zh: '模型不存在或无权访问。',
    en: 'Model not found or not accessible.',
  },
  LLM_RATE_LIMITED: { zh: '请求过于频繁，请稍后重试。', en: 'Rate limited. Try again later.' },
  LLM_TIMEOUT: { zh: '模型响应超时，请重试。', en: 'The model timed out. Try again.' },
  LLM_SCHEMA_MISMATCH: {
    zh: '模型返回内容未通过校验，请重试。',
    en: 'The model response failed validation. Try again.',
  },
  LLM_UNKNOWN: { zh: '服务异常，请重试。', en: 'Service error. Try again.' },
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
      zh: '服务异常，请重试。',
      en: 'Service error. Try again.',
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
