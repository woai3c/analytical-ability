import type { Difficulty, GuidedSession, GuidedStepNumber, MethodId, Reflection, Scenario } from '@/data/domain'
import type { TokenUsage } from '@/lib/llm'

export type StepUserInput =
  | { step: 1; userAnswer: string; skipped?: boolean }
  | { step: 2; selectedMethods: string[]; reasoning: string; skipped?: boolean }
  | { step: 3; userWork: string; skipped?: boolean }
  | { step: 4; userAnswer: string; skipped?: boolean }
  | { step: 5 }

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
    currentStep: 1,
    steps: {
      problemDefinition: null,
      methodSelection: null,
      methodApplication: null,
      conclusion: null,
      reflection: null,
    },
    tokenUsage: { promptTokens: usage.promptTokens, completionTokens: usage.completionTokens },
    startedAt: new Date().toISOString(),
    completedAt: null,
  }
}

export function getStepDisplay(
  session: GuidedSession,
  step: GuidedStepNumber,
): { userAnswer: string; aiResponse: string } | null {
  switch (step) {
    case 1:
      return session.steps.problemDefinition
        ? {
            userAnswer: session.steps.problemDefinition.userAnswer,
            aiResponse: session.steps.problemDefinition.aiResponse,
          }
        : null
    case 2:
      return session.steps.methodSelection
        ? {
            userAnswer: `${session.steps.methodSelection.selectedMethods.join(', ')}\n${session.steps.methodSelection.reasoning}`,
            aiResponse: session.steps.methodSelection.aiResponse,
          }
        : null
    case 3:
      return session.steps.methodApplication
        ? {
            userAnswer: session.steps.methodApplication.userWork,
            aiResponse: session.steps.methodApplication.aiResponse,
          }
        : null
    case 4:
      return session.steps.conclusion
        ? { userAnswer: session.steps.conclusion.userAnswer, aiResponse: session.steps.conclusion.aiResponse }
        : null
    case 5:
      return session.steps.reflection ? { userAnswer: '', aiResponse: session.steps.reflection.aiFeedback } : null
  }
}

export function applyUserInput(session: GuidedSession, step: GuidedStepNumber, input: StepUserInput): GuidedSession {
  const steps = { ...session.steps }
  switch (step) {
    case 1:
      if (input.step === 1) steps.problemDefinition = { userAnswer: input.userAnswer, aiResponse: '' }
      break
    case 2:
      if (input.step === 2)
        steps.methodSelection = {
          selectedMethods: input.selectedMethods,
          reasoning: input.reasoning,
          aiResponse: '',
        }
      break
    case 3:
      if (input.step === 3) steps.methodApplication = { userWork: input.userWork, aiResponse: '' }
      break
    case 4:
      if (input.step === 4) steps.conclusion = { userAnswer: input.userAnswer, aiResponse: '' }
      break
    case 5:
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
      if (steps.problemDefinition) {
        steps.problemDefinition = { ...steps.problemDefinition, aiResponse: result.aiResponse }
      }
      break
    case 2:
      if (steps.methodSelection) {
        steps.methodSelection = { ...steps.methodSelection, aiResponse: result.aiResponse }
      }
      break
    case 3:
      if (steps.methodApplication) {
        steps.methodApplication = { ...steps.methodApplication, aiResponse: result.aiResponse }
      }
      break
    case 4:
      if (steps.conclusion) {
        steps.conclusion = { ...steps.conclusion, aiResponse: result.aiResponse }
      }
      break
    case 5:
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
