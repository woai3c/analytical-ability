import { describe, expect, it } from 'vitest'

import { findProviderConfig, providerRegistry } from './providers'

describe('provider registry', () => {
  it('keeps provider ids unique and resolvable', () => {
    const ids = providerRegistry.map((provider) => provider.id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const provider of providerRegistry) {
      expect(findProviderConfig(provider.id)).toBe(provider)
    }
  })

  it('preserves the existing runtime defaults independently from UI ordering', () => {
    expect(findProviderConfig('anthropic')?.defaultModel).toBe('claude-sonnet-5')
    expect(findProviderConfig('anthropic')?.models[0]).toBe('claude-fable-5')
    expect(findProviderConfig('moonshot')?.defaultModel).toBe('kimi-k3')
    expect(findProviderConfig('moonshot')?.models[0]).toBe('kimi-k2.6')
  })
})
