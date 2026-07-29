import type { GuidedSession } from '@/data/domain'

const SESSION_KEY = 'clarity-guided-session'

export function loadGuidedSession(): GuidedSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as GuidedSession) : null
  } catch {
    return null
  }
}

export function saveGuidedSession(session: GuidedSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* Storage quota errors should not interrupt the training flow. */
  }
}

export function clearGuidedSession() {
  sessionStorage.removeItem(SESSION_KEY)
}
