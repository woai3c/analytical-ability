// @clarity/llm — 统一的结构化生成入口
//
// 对外只暴露三个东西：
//   resolveModel()        当前生效的供应商与模型（只读环境变量）
//   generateStructured()  带 zod 校验的结构化生成（AI SDK generateObject）
//   LlmError              带业务错误码的异常，由 API 层映射成对用户友好的提示
import { APICallError, NoObjectGeneratedError, generateObject } from 'ai'
import type { LanguageModel } from 'ai'
import type { z } from 'zod'

import { createModelRegistry, getConfiguredProviders, resolveModelId } from './providers.js'

export { getConfiguredProviders, resolveModelId }

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
    public status: number,
  ) {
    super(message)
    this.name = 'LlmError'
  }
}

export interface ResolvedModel {
  modelId: string
  providerId: string
  model: LanguageModel
}

export function resolveModel(env: Record<string, string | undefined> = process.env): ResolvedModel {
  const modelId = resolveModelId(env)
  if (!modelId) {
    throw new LlmError(
      'LLM_NOT_CONFIGURED',
      '未配置任何模型供应商的 API Key。请在仓库根目录 .env 中配置（例如 MOONSHOT_API_KEY）后重启服务。',
      503,
    )
  }
  const registry = createModelRegistry(env)
  const model = registry.languageModel(modelId as `${string}:${string}`)
  return { modelId, providerId: modelId.split(':')[0] ?? '', model }
}

export interface StructuredGenerationInput<S extends z.ZodType> {
  schema: S
  system: string
  prompt: string
  maxOutputTokens?: number
}

/** 结构化生成：schema 校验失败自动重试一次，之后抛 LlmError(LLM_SCHEMA_MISMATCH)。 */
export async function generateStructured<S extends z.ZodType>(
  input: StructuredGenerationInput<S>,
): Promise<z.infer<S>> {
  const { model } = resolveModel()
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS ?? 90000)
  const maxOutputTokens = input.maxOutputTokens ?? Number(process.env.LLM_MAX_OUTPUT_TOKENS ?? 6000)

  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { object } = await generateObject({
        model,
        schema: input.schema,
        system: input.system,
        prompt: input.prompt,
        maxOutputTokens,
        abortSignal: AbortSignal.timeout(timeoutMs),
      })
      return object as z.infer<S>
    } catch (error) {
      lastError = error
      // 只有结构校验失败值得重试；鉴权、余额、限流等问题重试无意义。
      if (!NoObjectGeneratedError.isInstance(error)) throw normalizeLlmError(error)
    }
  }
  throw normalizeLlmError(lastError)
}

function normalizeLlmError(error: unknown): LlmError {
  if (error instanceof LlmError) return error

  if (APICallError.isInstance(error)) {
    const status = error.statusCode ?? 0
    const detail = extractProviderMessage(error)
    if (status === 401 || status === 403) {
      return new LlmError('LLM_AUTH_FAILED', `供应商拒绝了 API Key${detail}，请检查 .env 中的配置。`, 502)
    }
    if (status === 402) {
      return new LlmError('LLM_BILLING', `供应商账户余额不足或套餐已停用${detail}。`, 502)
    }
    if (status === 404) {
      return new LlmError('LLM_MODEL_NOT_FOUND', `模型不存在或当前账号无权访问${detail}，请检查 LLM_MODEL 配置。`, 502)
    }
    if (status === 429) {
      return new LlmError('LLM_RATE_LIMITED', `供应商限流${detail}，请稍后重试。`, 429)
    }
    return new LlmError('LLM_UNKNOWN', `模型调用失败（HTTP ${status || '未知'}）${detail}。`, 502)
  }

  if (NoObjectGeneratedError.isInstance(error)) {
    return new LlmError('LLM_SCHEMA_MISMATCH', '模型返回的内容未通过结构校验，请重试。', 502)
  }

  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
    return new LlmError('LLM_TIMEOUT', '模型响应超时，请稍后重试。', 504)
  }

  return new LlmError('LLM_UNKNOWN', error instanceof Error ? `模型调用失败：${error.message}` : '模型调用失败。', 502)
}

/** 从供应商响应体里提取一小段可读原因，附在错误后面。 */
function extractProviderMessage(error: InstanceType<typeof APICallError>): string {
  try {
    const body = error.responseBody
    if (!body) return ''
    const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string }
    const message = parsed.error?.message ?? parsed.message
    if (!message) return ''
    const trimmed = message.length > 120 ? `${message.slice(0, 120)}…` : message
    return `（${trimmed}）`
  } catch {
    return ''
  }
}
