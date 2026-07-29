import type { LanguageModel } from 'ai'
import type { z } from 'zod'

import { findProviderConfig } from '@/data/providers'
import type { ClaritySettings } from '@/lib/settings'
import { loadSettings } from '@/lib/settings'

type LlmErrorCode =
  | 'LLM_NOT_CONFIGURED'
  | 'LLM_AUTH_FAILED'
  | 'LLM_BILLING'
  | 'LLM_MODEL_NOT_FOUND'
  | 'LLM_RATE_LIMITED'
  | 'LLM_TIMEOUT'
  | 'LLM_SCHEMA_MISMATCH'
  | 'LLM_UNKNOWN'

export class LlmError extends Error {
  constructor(
    public code: LlmErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'LlmError'
  }
}

async function createModel(settings: ClaritySettings): Promise<LanguageModel> {
  const { provider, apiKey, baseUrl, model } = settings
  const providerConfig = findProviderConfig(provider)
  const modelId = model || providerConfig?.defaultModel || ''

  switch (provider) {
    case 'deepseek': {
      const { createDeepSeek } = await import('@ai-sdk/deepseek')
      return createDeepSeek({ apiKey })(modelId)
    }
    case 'anthropic': {
      const { createAnthropic } = await import('@ai-sdk/anthropic')
      return createAnthropic({ apiKey })(modelId)
    }
    case 'openai': {
      const { createOpenAI } = await import('@ai-sdk/openai')
      return createOpenAI({ apiKey })(modelId)
    }
    case 'google': {
      const { createGoogleGenerativeAI } = await import('@ai-sdk/google')
      return createGoogleGenerativeAI({ apiKey })(modelId)
    }
    case 'xai': {
      const { createXai } = await import('@ai-sdk/xai')
      return createXai({ apiKey })(modelId)
    }
    case 'alibaba':
    case 'zhipu':
    case 'moonshot': {
      const { createOpenAICompatible } = await import('@ai-sdk/openai-compatible')
      return createOpenAICompatible({
        name: provider,
        apiKey,
        baseURL: baseUrl || providerConfig!.baseUrl!,
      })(modelId)
    }
    case 'custom': {
      if (!baseUrl || !modelId) {
        throw new LlmError('LLM_NOT_CONFIGURED', 'Custom provider requires Base URL and Model name.')
      }
      const { createOpenAICompatible } = await import('@ai-sdk/openai-compatible')
      return createOpenAICompatible({
        name: 'custom',
        apiKey,
        baseURL: baseUrl,
      })(modelId)
    }
    default:
      throw new LlmError('LLM_NOT_CONFIGURED', `Unknown provider: ${provider}`)
  }
}

function getSettings(): ClaritySettings {
  const settings = loadSettings()
  if (!settings || !settings.apiKey) {
    throw new LlmError('LLM_NOT_CONFIGURED', '请先在设置页面配置 API Key。')
  }
  return settings
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
}

interface StructuredGenerationResult<T> {
  object: T
  usage: TokenUsage
}

interface StructuredGenerationInput<S extends z.ZodType> {
  schema: S
  system: string
  prompt: string
}

export async function generateStructured<S extends z.ZodType>(
  input: StructuredGenerationInput<S>,
): Promise<StructuredGenerationResult<z.infer<S>>> {
  const settings = getSettings()
  const [model, { generateObject, NoObjectGeneratedError }] = await Promise.all([createModel(settings), import('ai')])

  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { object, usage } = await generateObject({
        model,
        schema: input.schema,
        system: input.system,
        prompt: input.prompt,
        maxOutputTokens: 6000,
        abortSignal: AbortSignal.timeout(90000),
      })
      return {
        object: object as z.infer<S>,
        usage: {
          promptTokens: usage?.inputTokens ?? 0,
          completionTokens: usage?.outputTokens ?? 0,
        },
      }
    } catch (error) {
      lastError = error
      if (!NoObjectGeneratedError.isInstance(error)) throw await normalizeLlmError(error)
    }
  }
  throw await normalizeLlmError(lastError)
}

async function normalizeLlmError(error: unknown): Promise<LlmError> {
  if (error instanceof LlmError) return error

  const { APICallError, NoObjectGeneratedError } = await import('ai')

  if (APICallError.isInstance(error)) {
    const status = error.statusCode ?? 0
    if (status === 401 || status === 403) {
      return new LlmError('LLM_AUTH_FAILED', 'API Key 无效或已过期，请检查设置。')
    }
    if (status === 402) {
      return new LlmError('LLM_BILLING', '账户余额不足。')
    }
    if (status === 404) {
      return new LlmError('LLM_MODEL_NOT_FOUND', '模型不存在或无权访问。')
    }
    if (status === 429) {
      return new LlmError('LLM_RATE_LIMITED', '请求过于频繁，请稍后重试。')
    }
    return new LlmError('LLM_UNKNOWN', `调用失败（HTTP ${status || '未知'}）`)
  }

  if (NoObjectGeneratedError.isInstance(error)) {
    return new LlmError('LLM_SCHEMA_MISMATCH', '模型返回内容未通过校验，请重试。')
  }

  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
    return new LlmError('LLM_TIMEOUT', '模型响应超时，请重试。')
  }

  return new LlmError('LLM_UNKNOWN', error instanceof Error ? error.message : '未知错误')
}

export async function testConnection(settings: ClaritySettings): Promise<void> {
  if (!settings.apiKey) {
    throw new LlmError('LLM_NOT_CONFIGURED', '请先填写 API Key。')
  }
  try {
    const [model, { generateText }] = await Promise.all([createModel(settings), import('ai')])
    await generateText({
      model,
      prompt: 'Say "ok".',
      maxOutputTokens: 8,
      abortSignal: AbortSignal.timeout(15000),
    })
  } catch (error) {
    throw await normalizeLlmError(error)
  }
}
