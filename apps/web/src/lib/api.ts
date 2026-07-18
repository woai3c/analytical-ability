import type { GoalInput, LlmAnalysis } from '@clarity/domain'

import type { Language } from '@/providers/i18n-provider'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = (await response.json().catch(() => ({}))) as T & { message?: string }
  if (!response.ok) throw new Error(body.message || `HTTP ${response.status}`)
  return body
}

export function assistGoal(goal: GoalInput, language: Language) {
  return request<{ result: LlmAnalysis }>('/api/analysis/assist', {
    method: 'POST',
    headers: { 'Accept-Language': language },
    body: JSON.stringify(goal),
  })
}
