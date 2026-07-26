import { useCallback, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

const SETTINGS_KEY = 'clarity-settings'
const RECORDS_KEY = 'clarity-practice-records'

export interface ClaritySettings {
  provider: string
  apiKey: string
  baseUrl?: string
  model?: string
}

const providers = [
  { id: 'deepseek', label: 'DeepSeek', placeholder: 'sk-...' },
  { id: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
  { id: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
  { id: 'google', label: 'Google Gemini', placeholder: 'AI...' },
  { id: 'xai', label: 'xAI (Grok)', placeholder: 'xai-...' },
  { id: 'moonshot', label: 'Moonshot (Kimi)', placeholder: 'sk-...' },
  { id: 'custom', label: 'OpenAI Compatible', placeholder: 'sk-...' },
]

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

export function SettingsPage() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<ClaritySettings>(
    () => loadSettings() ?? { provider: 'deepseek', apiKey: '' },
  )
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState('')

  function handleSave() {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleExport() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: loadSettings(),
      practiceRecords: JSON.parse(localStorage.getItem(RECORDS_KEY) ?? '[]'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clarity-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.version !== 1) {
          setImportStatus(t('文件格式不兼容'))
          return
        }
        if (data.settings) {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings))
          setSettings(data.settings)
        }
        if (Array.isArray(data.practiceRecords)) {
          localStorage.setItem(RECORDS_KEY, JSON.stringify(data.practiceRecords))
        }
        setImportStatus(t('导入成功'))
        setTimeout(() => setImportStatus(''), 3000)
      } catch {
        setImportStatus(t('文件解析失败'))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const isCustom = settings.provider === 'custom'

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-8 sm:px-6">
      <h1 className="text-xl font-semibold">{t('设置')}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {t('配置 AI 模型和管理数据。API Key 仅存储在你的浏览器中，不会发送到任何第三方服务器。')}
      </p>

      {/* AI 配置 */}
      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-medium">{t('AI 模型配置')}</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">{t('模型提供商')}</label>
            <select
              value={settings.provider}
              onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">API Key</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder={providers.find((p) => p.id === settings.provider)?.placeholder ?? 'sk-...'}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-ring focus:outline-none"
            />
          </div>

          {isCustom && (
            <>
              <div>
                <label className="text-sm text-muted-foreground">Base URL</label>
                <input
                  type="url"
                  value={settings.baseUrl ?? ''}
                  onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-ring focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t('模型名称')}</label>
                <input
                  type="text"
                  value={settings.model ?? ''}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  placeholder="gpt-4o"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-ring focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              {t('保存')}
            </button>
            {saved && <span className="text-sm text-(--success)">{t('已保存')}</span>}
          </div>
        </div>
      </section>

      {/* 数据管理 */}
      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-medium">{t('数据管理')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('所有练习数据存储在浏览器本地。导出后可迁移到其他设备。')}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
          >
            {t('导出数据')}
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
          >
            {t('导入数据')}
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        </div>

        {importStatus && (
          <p
            className={cn(
              'mt-3 text-sm',
              importStatus.includes('成功') || importStatus.includes('Success')
                ? 'text-(--success)'
                : 'text-destructive',
            )}
          >
            {importStatus}
          </p>
        )}
      </section>
    </div>
  )
}
