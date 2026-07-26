import { NavLink, Outlet, useLocation } from 'react-router'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { cn } from '@/lib/utils'
import { loadSettings } from '@/pages/settings-page'
import { useI18n } from '@/providers/i18n-provider'

const navigation: Array<{ to: string; label: string; end: boolean }> = [
  { to: '/', label: '方法库', end: true },
  { to: '/practice', label: '场景训练', end: false },
  { to: '/progress', label: '我的进度', end: false },
  { to: '/settings', label: '设置', end: false },
]

const pageTitles: Record<string, string> = {
  '/': '方法库',
  '/practice': '场景训练',
  '/progress': '我的进度',
  '/settings': '设置',
}

export function AppShell() {
  const location = useLocation()
  const { t } = useI18n()

  const currentTitle =
    pageTitles[location.pathname] ?? (location.pathname.startsWith('/methods/') ? '方法详情' : 'Clarity')

  const settings = loadSettings()
  const needsApiKey = !settings?.apiKey

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-border lg:flex lg:flex-col">
        <div className="flex h-12 items-center px-4">
          <span className="text-sm font-semibold">Clarity</span>
        </div>

        <nav className="flex-1 px-2 py-3" aria-label={t('主要导航')}>
          <div className="space-y-px">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'block rounded-md px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-secondary font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )
                }
              >
                {t(item.label)}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

      <div className="lg:pl-56">
        <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <span className="text-sm font-medium">{t(currentTitle)}</span>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </header>

        {needsApiKey && location.pathname !== '/settings' && (
          <div className="border-b border-border bg-accent px-4 py-2.5 sm:px-6">
            <p className="text-sm text-foreground">
              {t('请先配置 AI API Key 才能使用场景训练。')}{' '}
              <NavLink to="/settings" className="font-medium underline">
                {t('前往设置')}
              </NavLink>
            </p>
          </div>
        )}

        <main className="pb-14 lg:pb-0">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid h-12 grid-cols-4 border-t border-border bg-background lg:hidden"
        aria-label={t('移动端导航')}
      >
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-center text-xs',
                isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
              )
            }
          >
            {t(item.label)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
