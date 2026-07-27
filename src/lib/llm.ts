import { createAnthropic } from '@ai-sdk/anthropic'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createXai } from '@ai-sdk/xai'
import { APICallError, NoObjectGeneratedError, generateObject, generateText } from 'ai'
import type { LanguageModel } from 'ai'
import type { z } from 'zod'

import type { ClaritySettings } from '@/lib/settings'
import { loadSettings } from '@/lib/settings'

export type LlmErrorCode =
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

const defaultModels: Record<string, string> = {
  deepseek: 'deepseek-v4-flash',
  anthropic: 'claude-sonnet-5',
  openai: 'gpt-5.6-sol',
  google: 'gemini-3.5-flash',
  xai: 'grok-4.3',
  alibaba: 'qwen3.7-max',
  zhipu: 'glm-5.2',
  moonshot: 'kimi-k3',
  custom: '',
}

function createModel(settings: ClaritySettings): LanguageModel {
  const { provider, apiKey, baseUrl, model } = settings
  const modelId = model || defaultModels[provider] || ''

  switch (provider) {
    case 'deepseek':
      return createDeepSeek({ apiKey })(modelId as any)
    case 'anthropic':
      return createAnthropic({ apiKey })(modelId as any)
    case 'openai':
      return createOpenAI({ apiKey })(modelId as any)
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(modelId as any)
    case 'xai':
      return createXai({ apiKey })(modelId as any)
    case 'alibaba':
      return createOpenAICompatible({
        name: 'alibaba',
        apiKey,
        baseURL: baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      })(modelId)
    case 'zhipu':
      return createOpenAICompatible({
        name: 'zhipu',
        apiKey,
        baseURL: baseUrl || 'https://open.bigmodel.cn/api/paas/v4',
      })(modelId)
    case 'moonshot':
      return createOpenAICompatible({
        name: 'moonshot',
        apiKey,
        baseURL: baseUrl || 'https://api.moonshot.cn/v1',
      })(modelId)
    case 'custom':
      if (!baseUrl || !modelId) {
        throw new LlmError('LLM_NOT_CONFIGURED', 'Custom provider requires Base URL and Model name.')
      }
      return createOpenAICompatible({
        name: 'custom',
        apiKey,
        baseURL: baseUrl,
      })(modelId)
    default:
      throw new LlmError('LLM_NOT_CONFIGURED', `Unknown provider: ${provider}`)
  }
}

function getModel(): LanguageModel {
  const settings = loadSettings()
  if (!settings || !settings.apiKey) {
    throw new LlmError('LLM_NOT_CONFIGURED', '请先在设置页面配置 API Key。')
  }
  return createModel(settings)
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface StructuredGenerationResult<T> {
  object: T
  usage: TokenUsage
}

export interface StructuredGenerationInput<S extends z.ZodType> {
  schema: S
  system: string
  prompt: string
}

export async function generateStructured<S extends z.ZodType>(
  input: StructuredGenerationInput<S>,
): Promise<StructuredGenerationResult<z.infer<S>>> {
  const model = getModel()

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
          totalTokens: (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
        },
      }
    } catch (error) {
      lastError = error
      if (!NoObjectGeneratedError.isInstance(error)) throw normalizeLlmError(error)
    }
  }
  throw normalizeLlmError(lastError)
}

function normalizeLlmError(error: unknown): LlmError {
  if (error instanceof LlmError) return error

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
  const model = createModel(settings)
  try {
    await generateText({
      model,
      prompt: 'Say "ok".',
      maxOutputTokens: 8,
      abortSignal: AbortSignal.timeout(15000),
    })
  } catch (error) {
    throw normalizeLlmError(error)
  }
}
