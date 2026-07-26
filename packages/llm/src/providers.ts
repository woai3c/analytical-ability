// @clarity/llm — 多供应商模型注册
//
// 配置哲学（与 x-code-cli 一致）：每个供应商只需要一个 API Key 环境变量，
// 配了哪个 Key 就用哪个供应商；不写 baseUrl / model 配置文件，不需要 LLM_PROVIDER 开关。
//
// 模型选择优先级：
//   1. LLM_MODEL 环境变量（格式 "provider:model"，如 "moonshotai:kimi-k3"）
//   2. 按 providerSpecs 顺序取第一个已配置 Key 的供应商默认模型
//   3. 都没有 → null（调用方抛 LLM_NOT_CONFIGURED）
import { createAlibaba } from '@ai-sdk/alibaba'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createMoonshotAI } from '@ai-sdk/moonshotai'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createXai } from '@ai-sdk/xai'
import { createProviderRegistry } from 'ai'
import { createZhipu } from 'zhipu-ai-provider'

type Environment = Record<string, string | undefined>

export interface ProviderSpec {
  id: string
  envKey: string
  defaultModel: string
}

/** 检测顺序即默认优先级：配置了多个 Key 时取排最前的。 */
export const providerSpecs: readonly ProviderSpec[] = [
  { id: 'deepseek', envKey: 'DEEPSEEK_API_KEY', defaultModel: 'deepseek-chat' },
  { id: 'anthropic', envKey: 'ANTHROPIC_API_KEY', defaultModel: 'claude-sonnet-5' },
  { id: 'openai', envKey: 'OPENAI_API_KEY', defaultModel: 'gpt-5.6-sol' },
  { id: 'google', envKey: 'GOOGLE_GENERATIVE_AI_API_KEY', defaultModel: 'gemini-3.5-flash' },
  { id: 'xai', envKey: 'XAI_API_KEY', defaultModel: 'grok-4.5' },
  { id: 'alibaba', envKey: 'ALIBABA_API_KEY', defaultModel: 'qwen3.7-max' },
  { id: 'zhipu', envKey: 'ZHIPU_API_KEY', defaultModel: 'glm-5.2' },
  { id: 'moonshotai', envKey: 'MOONSHOT_API_KEY', defaultModel: 'kimi-k3' },
]

/** 国内 Kimi 平台（platform.moonshot.cn）默认端点；国际站用 MOONSHOT_BASE_URL 覆盖为 https://api.moonshot.ai/v1 */
const MOONSHOT_DEFAULT_BASE_URL = 'https://api.moonshot.cn/v1'

export function getConfiguredProviders(env: Environment = process.env): string[] {
  const ids = providerSpecs.filter((spec) => env[spec.envKey]).map((spec) => spec.id)
  if (env.OPENAI_COMPATIBLE_API_KEY && env.OPENAI_COMPATIBLE_BASE_URL && env.OPENAI_COMPATIBLE_MODEL) {
    ids.push('custom')
  }
  return ids
}

export function resolveModelId(env: Environment = process.env): string | null {
  if (env.LLM_MODEL) return env.LLM_MODEL

  for (const spec of providerSpecs) {
    if (env[spec.envKey]) return `${spec.id}:${spec.defaultModel}`
  }
  if (env.OPENAI_COMPATIBLE_API_KEY && env.OPENAI_COMPATIBLE_BASE_URL && env.OPENAI_COMPATIBLE_MODEL) {
    return `custom:${env.OPENAI_COMPATIBLE_MODEL}`
  }
  return null
}

export function createModelRegistry(env: Environment = process.env) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providers: Record<string, any> = {}

  if (env.MOONSHOT_API_KEY) {
    providers.moonshotai = createMoonshotAI({
      apiKey: env.MOONSHOT_API_KEY,
      baseURL: env.MOONSHOT_BASE_URL ?? MOONSHOT_DEFAULT_BASE_URL,
    })
  }
  if (env.DEEPSEEK_API_KEY) providers.deepseek = createDeepSeek({ apiKey: env.DEEPSEEK_API_KEY })
  if (env.ANTHROPIC_API_KEY) providers.anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })
  if (env.OPENAI_API_KEY) providers.openai = createOpenAI({ apiKey: env.OPENAI_API_KEY })
  if (env.ALIBABA_API_KEY) providers.alibaba = createAlibaba({ apiKey: env.ALIBABA_API_KEY })
  if (env.ZHIPU_API_KEY) providers.zhipu = createZhipu({ apiKey: env.ZHIPU_API_KEY })
  if (env.GOOGLE_GENERATIVE_AI_API_KEY) {
    providers.google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY })
  }
  if (env.XAI_API_KEY) providers.xai = createXai({ apiKey: env.XAI_API_KEY })
  if (env.OPENAI_COMPATIBLE_API_KEY && env.OPENAI_COMPATIBLE_BASE_URL) {
    providers.custom = createOpenAICompatible({
      name: 'custom',
      apiKey: env.OPENAI_COMPATIBLE_API_KEY,
      baseURL: env.OPENAI_COMPATIBLE_BASE_URL,
      // 显式声明支持 JSON Schema 结构化输出：端点实测支持 json_schema
      // response_format；不声明时 SDK 退化为 json_object + 提示词注入，
      // 推理型模型（如 kimi-for-coding）容易只输出思维链导致解析失败。
      supportsStructuredOutputs: true,
    })
  }

  return createProviderRegistry(providers)
}
