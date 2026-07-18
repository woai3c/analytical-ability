import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { I18nProvider } from '@/providers/i18n-provider'
import { ThemeProvider } from '@/providers/theme-provider'

import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // PWA 安装失败不应阻断目标分析主流程。
    })
  })
}
