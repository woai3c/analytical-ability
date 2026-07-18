import cors from '@fastify/cors'
import Fastify from 'fastify'
import { z } from 'zod'

import { analyzeGoal } from '@clarity/analysis-engine'
import { goalInputSchema, llmAnalysisSchema } from '@clarity/domain'
import { LlmError, generateStructured, resolveActiveProvider } from '@clarity/llm'

import './env.js'

const app = Fastify({ logger: true })

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

app.post('/api/analysis/assist', async (request, reply) => {
  const language = request.headers['accept-language']?.startsWith('en') ? 'en' : 'zh-CN'
  const parsed = goalInputSchema.safeParse(request.body)
  if (!parsed.success) {
    return reply.status(400).send({ error: 'INVALID_GOAL_INPUT', details: parsed.error.flatten() })
  }

  try {
    const config = resolveActiveProvider(process.env)
    const deterministic = analyzeGoal(parsed.data, language)
    const isEnglish = language === 'en'
    const raw = await generateStructured({
      config,
      schemaName: 'goal_semantic_analysis',
      schema: z.toJSONSchema(llmAnalysisSchema) as Record<string, unknown>,
      system: isEnglish
        ? 'You are a rigorous goal-analysis assistant. Use English. Separate facts, assumptions, and unknowns. Never invent data. Questions must be answerable and research plans must name source types. Your output supplements rule-based analysis and never makes the final decision for the user.'
        : '你是严谨的目标分析助手。使用简体中文。区分事实、假设和未知项；不要虚构数据；问题要能实际回答；研究计划要说明数据源类型。你的输出只用于补充规则分析，不替用户做最终决策。',
      prompt: [
        isEnglish ? 'Provide a semantic supplement for this goal.' : '请对以下目标做语义补充分析。',
        `${isEnglish ? 'User input' : '用户输入'}：${JSON.stringify(parsed.data)}`,
        `${isEnglish ? 'Rule-engine findings' : '规则引擎已识别'}：${JSON.stringify({
          taskType: deterministic.taskTypeLabel,
          clarifications: deterministic.clarifications,
          dataNeeds: deterministic.dataNeeds,
          cautions: deterministic.cautions,
        })}`,
        isEnglish
          ? 'Do not repeat explicit rule-engine findings. Focus on contextual assumptions, missing questions, and actionable research queries.'
          : '不要重复规则引擎已经明确给出的内容，重点发现上下文相关的隐含假设、缺失问题和可执行的资料检索词。',
      ].join('\n'),
    })
    const result = llmAnalysisSchema.parse(raw)
    return { result }
  } catch (error) {
    if (error instanceof LlmError) {
      request.log.warn({ code: error.code }, 'Semantic assistance is unavailable')
      return reply.status(error.status).send({
        error: 'SEMANTIC_ASSIST_UNAVAILABLE',
        message: language === 'en' ? 'Semantic suggestions are temporarily unavailable.' : '智能补充暂时不可用。',
      })
    }
    if (error instanceof z.ZodError) {
      return reply.status(502).send({ error: 'LLM_SCHEMA_MISMATCH', message: '模型结果未通过结构校验，请重试。' })
    }
    request.log.error(error)
    return reply.status(500).send({ error: 'LLM_UNKNOWN_ERROR', message: '模型分析失败。' })
  }
})

const port = Number(process.env.PORT ?? 8787)
const host = process.env.HOST ?? '127.0.0.1'

try {
  await app.listen({ port, host })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
