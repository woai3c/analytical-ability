import { describe, expect, it } from 'vitest'

import { resolveModel, resolveModelId } from '../src/index.js'
import { getConfiguredProviders } from '../src/providers.js'

describe('model resolution', () => {
  it('uses the first configured provider in detection order', () => {
    expect(resolveModelId({ DEEPSEEK_API_KEY: 'k', MOONSHOT_API_KEY: 'k' })).toBe('moonshotai:kimi-k3')
    expect(resolveModelId({ OPENAI_API_KEY: 'k' })).toBe('openai:gpt-5.6-sol')
  })

  it('honours the explicit LLM_MODEL override', () => {
    expect(resolveModelId({ LLM_MODEL: 'deepseek:deepseek-v4-flash', MOONSHOT_API_KEY: 'k' })).toBe(
      'deepseek:deepseek-v4-flash',
    )
  })

  it('supports an OpenAI-compatible custom provider', () => {
    const env = {
      OPENAI_COMPATIBLE_API_KEY: 'k',
      OPENAI_COMPATIBLE_BASE_URL: 'https://example.com/v1',
      OPENAI_COMPATIBLE_MODEL: 'my-model',
    }
    expect(resolveModelId(env)).toBe('custom:my-model')
    expect(getConfiguredProviders(env)).toEqual(['custom'])
  })

  it('returns null and resolveModel throws when nothing is configured', () => {
    expect(resolveModelId({})).toBeNull()
    expect(() => resolveModel({})).toThrowError(/LLM_NOT_CONFIGURED|未配置/)
  })

  it('never exposes API keys in resolved values', () => {
    const resolved = resolveModel({ MOONSHOT_API_KEY: 'super-secret-key' })
    expect(JSON.stringify({ modelId: resolved.modelId, providerId: resolved.providerId })).not.toContain(
      'super-secret-key',
    )
  })
})
