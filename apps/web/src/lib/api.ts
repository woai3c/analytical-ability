import type { ActionRoute, AnalysisPlan, AnswerValue, Answers, IntakeResult, MethodId, TaskType } from '@clarity/domain'

import type { Language } from '@/providers/i18n-provider'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, body: unknown, language: Language): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': language },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      language === 'en'
        ? 'Cannot reach the analysis API. Make sure it is running (pnpm dev:api).'
        : '连不上分析服务，请确认后端已启动（pnpm dev:api）。',
      'API_UNREACHABLE',
    )
  }
  const data = (await response.json().catch(() => ({}))) as T & { message?: string; error?: string }
  if (!response.ok) throw new ApiError(data.message || `HTTP ${response.status}`, data.error)
  return data
}

export interface AnsweredQuestion {
  question: string
  answer: AnswerValue
}

export function runIntake(input: { rawGoal: string; answered: AnsweredQuestion[] }, language: Language) {
  return request<{ result: IntakeResult }>('/api/analysis/intake', input, language)
}

export function runPlan(
  input: { rawGoal: string; taskType: TaskType; intake: IntakeResult; answers: Answers },
  language: Language,
) {
  return request<{ result: AnalysisPlan }>('/api/analysis/plan', input, language)
}

export function runMethodRun(
  input: { methodId: MethodId; rawGoal: string; intake: IntakeResult; answers: Answers; material: string },
  language: Language,
) {
  return request<{ result: unknown }>('/api/analysis/method-run', input, language)
}

export function runRoute(
  input: {
    rawGoal: string
    intake: IntakeResult
    answers: Answers
    plan: AnalysisPlan
    methodRuns: Record<string, unknown>
  },
  language: Language,
) {
  return request<{ result: ActionRoute }>('/api/analysis/route', input, language)
}
