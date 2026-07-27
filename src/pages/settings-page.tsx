import { useCallback, useRef, useState } from 'react'

import { LlmError, testConnection } from '@/lib/llm'
import { RECORDS_KEY, loadSettings, saveSettings } from '@/lib/settings'
import type { ClaritySettings } from '@/lib/settings'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

interface ProviderConfig {
  id: string
  label: string
  placeholder: string
  models: string[]
}

const providers: ProviderConfig[] = [
  {
    id: 'deepseek',
    label: 'DeepSeek',
    placeholder: 'sk-...',
    models: ['deepseek-v4-flash', 'deepseek-v4-pro'],
  },
  {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    placeholder: 'sk-ant-...',
    models: ['claude-fable-5', 'claude-opus-4-8', 'claude-sonnet-5', 'claude-haiku-4-5'],
  },
  {
    id: 'openai',
    label: 'OpenAI (ChatGPT)',
    placeholder: 'sk-...',
    models: ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna', 'gpt-5.4-mini'],
  },
  {
    id: 'google',
    label: 'Google Gemini',
    placeholder: 'AI...',
    models: ['gemini-3.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash'],
  },
  {
    id: 'xai',
    label: 'xAI (Grok)',
    placeholder: 'xai-...',
    models: ['grok-4.3', 'grok-4.5'],
  },
  {
    id: 'alibaba',
    label: '阿里云 (通义千问)',
    placeholder: 'sk-...',
    models: ['qwen3.7-max', 'qwen3.7-plus', 'qwen3-coder-plus', 'qwq-plus'],
  },
  {
    id: 'zhipu',
    label: '智谱 AI (GLM)',
    placeholder: '...',
    models: ['glm-5.2', 'glm-5', 'glm-4.7'],
  },
  {
    id: 'moonshot',
    label: 'Moonshot (Kimi)',
    placeholder: 'sk-...',
    models: ['kimi-k2.6', 'kimi-k3'],
  },
  {
    id: 'custom',
    label: 'OpenAI 兼容 / Custom',
    placeholder: 'sk-...',
    models: [],
  },
]

export function SettingsPage() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<ClaritySettings>(
    () => loadSettings() ?? { provider: 'deepseek', apiKey: '' },
  )
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState('')

  async function handleTestConnection() {
    setTesting(true)
    setTestResult(null)
    try {
      await testConnection(settings)
      setTestResult({ ok: true, msg: t('连接成功') })
    } catch (e) {
      setTestResult({ ok: false, msg: e instanceof LlmError ? e.message : t('连接失败') })
    } finally {
      setTesting(false)
    }
  }

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
          saveSettings(data.settings)
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
  const currentProvider = providers.find((p) => p.id === settings.provider)
  const availableModels = currentProvider?.models ?? []

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
              onChange={(e) => setSettings({ ...settings, provider: e.target.value, model: '' })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
              placeholder={currentProvider?.placeholder ?? 'sk-...'}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
            />
          </div>

          {availableModels.length > 0 && (
            <div>
              <label className="text-sm text-muted-foreground">{t('模型')}</label>
              <select
                value={settings.model || availableModels[0]}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isCustom && (
            <>
              <div>
                <label className="text-sm text-muted-foreground">Base URL</label>
                <input
                  type="url"
                  value={settings.baseUrl ?? ''}
                  onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t('模型名称')}</label>
                <input
                  type="text"
                  value={settings.model ?? ''}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  placeholder="gpt-4o"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
            </>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              {t('保存')}
            </button>
            <button
              type="button"
              onClick={() => void handleTestConnection()}
              disabled={testing || !settings.apiKey}
              className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary disabled:opacity-50"
            >
              {testing ? t('测试中...') : t('测试连接')}
            </button>
            {saved && <span className="text-sm text-(--success)">{t('已保存')}</span>}
            {testResult && (
              <span className={cn('text-sm', testResult.ok ? 'text-(--success)' : 'text-destructive')}>
                {testResult.msg}
              </span>
            )}
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
