const SETTINGS_KEY = 'clarity-settings'

export interface ClaritySettings {
  provider: string
  apiKey: string
  baseUrl?: string
  model?: string
}

export function loadSettings(): ClaritySettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ClaritySettings
  } catch {
    return null
  }
}

export function saveSettings(settings: ClaritySettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
