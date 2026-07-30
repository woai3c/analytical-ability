import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GuidedSession, Scenario } from '@/data/domain'
import { applyAiResponse, applyUserInput, buildNewSession, getStepDisplay } from '@/lib/guided-session'
import { clearGuidedSession, loadGuidedSession, saveGuidedSession } from '@/lib/guided-session-store'
import {
  countPracticedMethods,
  loadPracticeRecords,
  replacePracticeRecords,
  saveGuidedPracticeRecord,
} from '@/lib/practice-records'
import { RECORDS_KEY } from '@/lib/settings'

const scenario: Scenario = {
  id: 'scenario-1',
  title: 'Scenario',
  description: 'Description',
  context: 'Context',
  difficulty: 'beginner',
  taskType: 'diagnosis',
  applicableMethods: ['fishbone'],
  explanations: {
    fishbone: 'Good fit',
    'five-why': '',
    kj: '',
    abc: '',
    'causal-graph': '',
    mcda: '',
    'value-analysis': '',
    fmea: '',
    dmaic: '',
    pdsa: '',
    forecast: '',
    pert: '',
  },
  commonMistakes: [],
}

function createSession(): GuidedSession {
  return {
    id: 'session-1',
    scenario,
    difficulty: 'beginner',
    currentStep: 1,
    steps: {
      methodSelection: null,
      analysis: null,
      reflection: null,
    },
    tokenUsage: { promptTokens: 10, completionTokens: 5 },
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: null,
  }
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('guided session transformations', () => {
  it('builds a new random-training session starting at step 1', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'))

    const session = buildNewSession(scenario, { promptTokens: 12, completionTokens: 7 }, 'intermediate')

    expect(session).toEqual({
      id: `gs-${new Date('2026-01-02T03:04:05.000Z').getTime()}`,
      scenario,
      difficulty: 'intermediate',
      currentStep: 1,
      steps: {
        methodSelection: null,
        analysis: null,
        reflection: null,
      },
      tokenUsage: { promptTokens: 12, completionTokens: 7 },
      startedAt: '2026-01-02T03:04:05.000Z',
      completedAt: null,
    })
  })

  it('builds a focused-training session starting at step 2 with method pre-selected', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'))

    const focusedSession = buildNewSession(
      scenario,
      { promptTokens: 12, completionTokens: 7 },
      'intermediate',
      'fishbone',
    )
    expect(focusedSession.focusMethodId).toBe('fishbone')
    expect(focusedSession.currentStep).toBe(2)
    expect(focusedSession.steps.methodSelection).toEqual({
      selectedMethods: ['fishbone'],
      reasoning: '',
      aiResponse: '',
    })
  })

  it('stores every editable step without mutating the previous session', () => {
    const session = createSession()
    const withMethods = applyUserInput(session, 1, {
      step: 1,
      selectedMethods: ['fishbone', 'five-why'],
      reasoning: 'Use breadth, then depth.',
    })
    const withAnalysis = applyUserInput(withMethods, 2, {
      step: 2,
      userWork: 'Analysis and conclusion combined.',
    })
    const unchangedReflection = applyUserInput(withAnalysis, 3, { step: 3 })

    expect(session.steps.methodSelection).toBeNull()
    expect(withMethods).not.toBe(session)
    expect(unchangedReflection.steps).toEqual({
      methodSelection: {
        selectedMethods: ['fishbone', 'five-why'],
        reasoning: 'Use breadth, then depth.',
        aiResponse: '',
      },
      analysis: {
        userWork: 'Analysis and conclusion combined.',
        aiResponse: '',
      },
      reflection: null,
    })
  })

  it('applies AI responses to every step and builds the final reflection', () => {
    let session = createSession()
    session = applyUserInput(session, 1, {
      step: 1,
      selectedMethods: ['fishbone', 'five-why'],
      reasoning: 'Use breadth, then depth.',
    })
    session = applyUserInput(session, 2, { step: 2, userWork: 'Analysis and conclusion.' })

    const originalSteps = session.steps
    session = applyAiResponse(session, 1, { aiResponse: 'Good choice.' })
    session = applyAiResponse(session, 2, { aiResponse: 'Thorough analysis.' })
    session = applyAiResponse(session, 3, {
      aiResponse: 'Overall feedback',
      reflection: {
        overallFeedback: 'Overall feedback',
        score: 82,
        dimensions: [{ name: 'Logic', score: 80, comment: 'Sound' }],
        tips: ['Use more evidence'],
      },
    })

    expect(originalSteps.methodSelection?.aiResponse).toBe('')
    expect(session.steps.methodSelection).toEqual({
      selectedMethods: ['fishbone', 'five-why'],
      reasoning: 'Use breadth, then depth.',
      aiResponse: 'Good choice.',
    })
    expect(session.steps.analysis?.aiResponse).toBe('Thorough analysis.')
    expect(session.steps.reflection).toEqual({
      aiFeedback: 'Overall feedback',
      score: 82,
      dimensions: [{ name: 'Logic', score: 80, comment: 'Sound' }],
      tips: ['Use more evidence'],
    })
  })

  it('returns the display value for each completed step', () => {
    const session = createSession()
    session.steps.methodSelection = {
      selectedMethods: ['fishbone', 'five-why'],
      reasoning: 'Reasoning',
      aiResponse: 'Selection feedback',
    }
    session.steps.analysis = { userWork: 'Analysis and conclusion', aiResponse: 'Analysis feedback' }
    session.steps.reflection = {
      aiFeedback: 'Overall feedback',
      score: 82,
      dimensions: [],
      tips: [],
    }

    expect(getStepDisplay(session, 1, false)).toEqual({
      userAnswer: '鱼骨分析, 5 Why 追问\nReasoning',
      aiResponse: 'Selection feedback',
    })
    expect(getStepDisplay(session, 2)).toEqual({
      userAnswer: 'Analysis and conclusion',
      aiResponse: 'Analysis feedback',
    })
    expect(getStepDisplay(session, 3)).toEqual({ userAnswer: '', aiResponse: 'Overall feedback' })
  })
})

describe('practice record persistence', () => {
  it('appends the current guided record using the existing storage shape', () => {
    const session = createSession()
    session.completedAt = '2026-01-01T01:00:00.000Z'
    session.steps.methodSelection = {
      selectedMethods: ['fishbone'],
      reasoning: 'Find candidate causes.',
      aiResponse: 'Good choice.',
    }
    session.steps.reflection = {
      aiFeedback: 'Well done.',
      score: 75,
      dimensions: [{ name: 'Logic', score: 75, comment: 'Good' }],
      tips: ['Add evidence'],
    }

    localStorage.setItem(RECORDS_KEY, JSON.stringify([{ scenarioId: 'existing' }]))
    saveGuidedPracticeRecord(session)

    expect(JSON.parse(localStorage.getItem(RECORDS_KEY) ?? '[]')).toStrictEqual([
      { scenarioId: 'existing' },
      {
        scenarioId: 'scenario-1',
        scenarioTitle: 'Scenario',
        scenarioDescription: 'Description',
        scenarioContext: 'Context',
        applicableMethods: ['fishbone'],
        taskType: 'diagnosis',
        selectedMethods: ['fishbone'],
        correct: true,
        score: 75,
        feedback: 'Well done.',
        improvementTip: 'Add evidence',
        methodExplanations: [],
        completedAt: '2026-01-01T01:00:00.000Z',
        guided: true,
        dimensions: [{ name: 'Logic', score: 75, comment: 'Good' }],
        steps: session.steps,
      },
    ])
  })

  it('loads, replaces, and counts records through the shared storage layer', () => {
    const record = {
      scenarioId: 'scenario-1',
      scenarioTitle: 'Scenario',
      taskType: 'diagnosis',
      selectedMethods: ['fishbone', 'five-why'],
      correct: true,
      score: 75,
      completedAt: '2026-01-01T01:00:00.000Z',
    }

    replacePracticeRecords([record, { ...record, scenarioId: 'scenario-2', selectedMethods: ['fishbone'] }])

    expect(loadPracticeRecords()).toHaveLength(2)
    expect(countPracticedMethods()).toEqual({ fishbone: 2, 'five-why': 1 })
  })

  it('treats malformed or non-array record storage as empty', () => {
    localStorage.setItem(RECORDS_KEY, '{broken')
    expect(loadPracticeRecords()).toEqual([])

    localStorage.setItem(RECORDS_KEY, JSON.stringify({ scenarioId: 'not-an-array' }))
    expect(loadPracticeRecords()).toEqual([])
  })
})

describe('guided session storage', () => {
  it('round-trips and clears the active session', () => {
    const session = createSession()

    saveGuidedSession(session)
    expect(loadGuidedSession()).toEqual(session)

    clearGuidedSession()
    expect(loadGuidedSession()).toBeNull()
  })

  it('ignores malformed session storage', () => {
    sessionStorage.setItem('clarity-guided-session', '{broken')
    expect(loadGuidedSession()).toBeNull()
  })
})
