const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const locale = document.documentElement.lang === 'en' ? 'en' : 'zh-CN'
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.message ?? `Request failed: ${res.status}`)
  }

  return res.json()
}

export interface MethodSummary {
  id: string
  name: string
  purpose: string
  taskTypes: string[]
  caution: string
  depth: string
}

export interface MethodDetail extends MethodSummary {
  requiredInputs: string[]
  outputs: string[]
}

export interface Scenario {
  id: string
  title: string
  description: string
  context: string
  difficulty: string
  taskType: string
  applicableMethods: string[]
  explanations: Record<string, string>
  commonMistakes: Array<{ methodId: string; why: string }>
}

export interface PracticeFeedback {
  correct: boolean
  score: number
  feedback: string
  methodExplanations: Array<{
    methodId: string
    fit: 'good' | 'partial' | 'poor'
    explanation: string
  }>
  improvementTip: string
}

export function fetchMethods(): Promise<MethodSummary[]> {
  return request('/api/methods')
}

export function fetchMethod(id: string): Promise<MethodDetail> {
  return request(`/api/methods/${id}`)
}

export function generateScenario(params: {
  taskType?: string
  methodId?: string
  difficulty?: string
}): Promise<{ result: Scenario }> {
  return request('/api/scenarios/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export function submitPractice(params: {
  scenarioTitle: string
  scenarioDescription: string
  scenarioContext: string
  applicableMethods: string[]
  selectedMethods: string[]
  reasoning: string
}): Promise<{ result: PracticeFeedback }> {
  return request('/api/practice/feedback', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}
