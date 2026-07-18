import { NavLink, Outlet, useLocation } from 'react-router'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

const navigation = [
  { to: '/', label: '目标分析', end: true },
  { to: '/training', label: '能力训练', end: false },
]

const pageTitles: Record<string, string> = {
  '/': '目标分析',
  '/training': '能力训练',
}

export function AppShell() {
  const location = useLocation()
  const { t } = useI18n()
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-[52px] items-center border-b border-border px-4">
          <span className="text-sm font-semibold tracking-tight">{t('目标工作台')}</span>
        </div>

        <nav className="flex-1 px-2.5 py-4" aria-label={t('主要导航')}>
          <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {t('工作区')}
          </div>
          <div className="space-y-0.5">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex h-8 items-center rounded-md px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    isActive && 'bg-secondary font-medium text-foreground',
                  )
                }
              >
                {t(item.label)}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-border px-4 py-3 text-[11px] leading-5 text-muted-foreground">
          {t('规则分析可离线运行；智能补充只提供语义建议，结论仍需证据验证。')}
        </div>
      </aside>

      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-20 flex min-h-[52px] items-center justify-between gap-3 border-b border-border bg-background px-4 py-2 sm:px-6 lg:px-7">
          <span className="text-sm font-medium">{t(pageTitles[location.pathname] ?? '目标工作台')}</span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </header>

        <main className="pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-border bg-card px-2 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1.5 lg:hidden"
        aria-label={t('移动端导航')}
      >
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-center rounded-md py-2 text-[11px] text-muted-foreground',
                isActive && 'font-medium text-foreground',
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
