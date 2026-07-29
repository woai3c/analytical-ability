export interface ProviderConfig {
  id: string
  label: string
  placeholder: string
  defaultModel: string
  models: readonly string[]
  baseUrl?: string
}

export const providerRegistry: readonly ProviderConfig[] = [
  {
    id: 'deepseek',
    label: 'DeepSeek',
    placeholder: 'sk-...',
    defaultModel: 'deepseek-v4-flash',
    models: ['deepseek-v4-flash', 'deepseek-v4-pro'],
  },
  {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    placeholder: 'sk-ant-...',
    defaultModel: 'claude-sonnet-5',
    models: ['claude-fable-5', 'claude-opus-4-8', 'claude-sonnet-5', 'claude-haiku-4-5'],
  },
  {
    id: 'openai',
    label: 'OpenAI (ChatGPT)',
    placeholder: 'sk-...',
    defaultModel: 'gpt-5.6-sol',
    models: ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna', 'gpt-5.4-mini'],
  },
  {
    id: 'google',
    label: 'Google Gemini',
    placeholder: 'AI...',
    defaultModel: 'gemini-3.5-flash',
    models: ['gemini-3.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash'],
  },
  {
    id: 'xai',
    label: 'xAI (Grok)',
    placeholder: 'xai-...',
    defaultModel: 'grok-4.3',
    models: ['grok-4.3', 'grok-4.5'],
  },
  {
    id: 'alibaba',
    label: '阿里云 (通义千问)',
    placeholder: 'sk-...',
    defaultModel: 'qwen3.7-max',
    models: ['qwen3.7-max', 'qwen3.7-plus', 'qwen3-coder-plus', 'qwq-plus'],
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
  {
    id: 'zhipu',
    label: '智谱 AI (GLM)',
    placeholder: '...',
    defaultModel: 'glm-5.2',
    models: ['glm-5.2', 'glm-5', 'glm-4.7'],
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  },
  {
    id: 'moonshot',
    label: 'Moonshot (Kimi)',
    placeholder: 'sk-...',
    defaultModel: 'kimi-k3',
    models: ['kimi-k2.6', 'kimi-k3'],
    baseUrl: 'https://api.moonshot.cn/v1',
  },
  {
    id: 'custom',
    label: 'OpenAI 兼容 / Custom',
    placeholder: 'sk-...',
    defaultModel: '',
    models: [],
  },
]

const providerConfigMap = new Map(providerRegistry.map((provider) => [provider.id, provider]))

export function findProviderConfig(providerId: string): ProviderConfig | undefined {
  return providerConfigMap.get(providerId)
}
