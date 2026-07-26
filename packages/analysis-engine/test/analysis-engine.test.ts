import { describe, expect, it } from 'vitest'

import { getMethodSpec, methodRegistry, routeMethods } from '../src/index.js'

describe('method registry', () => {
  it('contains all 12 methods', () => {
    expect(methodRegistry).toHaveLength(12)
  })

  it('getMethodSpec returns correct method', () => {
    const spec = getMethodSpec('fishbone')
    expect(spec.id).toBe('fishbone')
    expect(spec.name.zh).toBe('鱼骨分析')
    expect(spec.name.en).toBe('Fishbone diagram')
  })

  it('each method has localized name, purpose, and caution', () => {
    for (const spec of methodRegistry) {
      expect(spec.name.zh.length).toBeGreaterThan(0)
      expect(spec.name.en.length).toBeGreaterThan(0)
      expect(spec.purpose.zh.length).toBeGreaterThan(0)
      expect(spec.purpose.en.length).toBeGreaterThan(0)
      expect(spec.caution.zh.length).toBeGreaterThan(0)
      expect(spec.caution.en.length).toBeGreaterThan(0)
    }
  })

  it('each method has at least one task type', () => {
    for (const spec of methodRegistry) {
      expect(spec.taskTypes.length).toBeGreaterThan(0)
    }
  })
})

describe('method router', () => {
  it('routes diagnosis to fishbone and five-why', () => {
    const route = routeMethods('diagnosis')
    expect(route.primary).toContain('fishbone')
    expect(route.primary).toContain('five-why')
  })

  it('routes selection to mcda', () => {
    const route = routeMethods('selection')
    expect(route.primary).toContain('mcda')
  })

  it('every task type has at least one primary method', () => {
    const types = [
      'diagnosis',
      'improvement',
      'selection',
      'planning',
      'prediction',
      'exploration',
      'learning',
    ] as const
    for (const type of types) {
      const route = routeMethods(type)
      expect(route.primary.length).toBeGreaterThan(0)
    }
  })
})
