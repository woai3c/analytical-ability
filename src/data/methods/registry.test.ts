import { describe, expect, it } from 'vitest'

import { methodIds } from '../domain-constants'
import { animationRegistry } from './animation-data'
import { methodCatalog } from './catalog'
import { findMethodSpec, getMethodSpec, methodRegistry } from './registry'

describe('method content registries', () => {
  it('defines exactly one resolvable method specification for every method id', () => {
    expect(methodCatalog.map((method) => method.id)).toStrictEqual(methodIds)

    const registeredIds = methodRegistry.map((method) => method.id)

    expect(registeredIds).toEqual(methodIds)
    expect(new Set(registeredIds).size).toBe(methodIds.length)

    for (const methodId of methodIds) {
      const method = getMethodSpec(methodId)
      const catalogEntry = methodCatalog.find((entry) => entry.id === methodId)

      expect(method).toMatchObject(catalogEntry!)
      expect(findMethodSpec(methodId)).toBe(method)
      expect(method.name.zh).not.toBe('')
      expect(method.name.en).not.toBe('')
      expect(method.steps.length).toBeGreaterThan(0)
    }

    expect(findMethodSpec('unknown-method')).toBeUndefined()
  })

  it('provides non-empty bilingual animation frames for every method', () => {
    expect(new Set(Object.keys(animationRegistry))).toEqual(new Set(methodIds))

    for (const methodId of methodIds) {
      const frames = animationRegistry[methodId]

      expect(frames.length).toBeGreaterThan(0)
      for (const frame of frames) {
        expect(frame.label.zh).not.toBe('')
        expect(frame.label.en).not.toBe('')
      }
    }
  })
})
