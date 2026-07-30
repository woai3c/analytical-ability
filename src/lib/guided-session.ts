import type { Difficulty, GuidedSession, GuidedStepNumber, MethodId, Reflection, Scenario } from '@/data/domain'
import { findMethodSpec } from '@/data/methods'
import type { TokenUsage } from '@/lib/llm'

export type StepUserInput =
  | { step: 1; selectedMethods: string[]; reasoning: string; skipped?: boolean }
  | { step: 2; userWork: string; skipped?: boolean }
  | { step: 3 }

interface StepProcessingResult {
  aiResponse: string
  reflection?: Reflection
}

export function buildNewSession(
  scenario: Scenario,
  usage: TokenUsage,
  difficulty: Difficulty,
  focusMethodId?: MethodId,
): GuidedSession {
  return {
    id: `gs-${Date.now()}`,
    scenario,
    difficulty,
    ...(focusMethodId ? { focusMethodId } : {}),
    currentStep: focusMethodId ? 2 : 1,
    steps: {
      methodSelection: focusMethodId ? { selectedMethods: [focusMethodId], reasoning: '', aiResponse: '' } : null,
      analysis: null,
      reflection: null,
    },
    tokenUsage: { promptTokens: usage.promptTokens, completionTokens: usage.completionTokens },
    startedAt: new Date().toISOString(),
    completedAt: null,
  }
}

function resolveMethodNames(ids: string[], en: boolean): string {
  return ids
    .map((id) => {
      const spec = findMethodSpec(id)
      return spec ? (en ? spec.name.en : spec.name.zh) : id
    })
    .join(', ')
}

export function getStepDisplay(
  session: GuidedSession,
  step: GuidedStepNumber,
  en = false,
): { userAnswer: string; aiResponse: string } | null {
  switch (step) {
    case 1: {
      if (!session.steps.methodSelection) return null
      const names = resolveMethodNames(session.steps.methodSelection.selectedMethods, en)
      const reasoning = session.steps.methodSelection.reasoning
      return {
        userAnswer: reasoning ? `${names}\n${reasoning}` : names,
        aiResponse: session.steps.methodSelection.aiResponse,
      }
    }
    case 2:
      return session.steps.analysis
        ? {
            userAnswer: session.steps.analysis.userWork,
            aiResponse: session.steps.analysis.aiResponse,
          }
        : null
    case 3:
      return session.steps.reflection ? { userAnswer: '', aiResponse: session.steps.reflection.aiFeedback } : null
  }
}

export function applyUserInput(session: GuidedSession, step: GuidedStepNumber, input: StepUserInput): GuidedSession {
  const steps = { ...session.steps }
  switch (step) {
    case 1:
      if (input.step === 1)
        steps.methodSelection = {
          selectedMethods: input.selectedMethods,
          reasoning: input.reasoning,
          aiResponse: '',
        }
      break
    case 2:
      if (input.step === 2) steps.analysis = { userWork: input.userWork, aiResponse: '' }
      break
    case 3:
      break
  }
  return { ...session, steps }
}

export function applyAiResponse(
  session: GuidedSession,
  step: GuidedStepNumber,
  result: StepProcessingResult,
): GuidedSession {
  const steps = { ...session.steps }
  switch (step) {
    case 1:
      if (steps.methodSelection) {
        steps.methodSelection = { ...steps.methodSelection, aiResponse: result.aiResponse }
      }
      break
    case 2:
      if (steps.analysis) {
        steps.analysis = { ...steps.analysis, aiResponse: result.aiResponse }
      }
      break
    case 3:
      if (result.reflection) {
        steps.reflection = {
          aiFeedback: result.reflection.overallFeedback,
          score: result.reflection.score,
          dimensions: result.reflection.dimensions,
          tips: result.reflection.tips,
        }
      }
      break
  }
  return { ...session, steps }
}
