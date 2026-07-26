import { NavLink, Outlet, useLocation } from 'react-router'

import { BookOpen, Dumbbell, LineChart, type LucideIcon } from 'lucide-react'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

const navigation: Array<{ to: string; label: string; end: boolean; icon: LucideIcon }> = [
  { to: '/', label: '方法库', end: true, icon: BookOpen },
  { to: '/practice', label: '场景训练', end: false, icon: Dumbbell },
  { to: '/progress', label: '我的进度', end: false, icon: LineChart },
]

const pageTitles: Record<string, string> = {
  '/': '方法库',
  '/practice': '场景训练',
  '/progress': '我的进度',
}

export function AppShell() {
  const location = useLocation()
  const { t } = useI18n()

  const currentTitle =
    pageTitles[location.pathname] ?? (location.pathname.startsWith('/methods/') ? '方法详情' : '思径')

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-[52px] items-center gap-2.5 border-b border-border px-4">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="size-3.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">{t('思径')}</span>
        </div>

        <nav className="flex-1 px-2.5 py-4" aria-label={t('主要导航')}>
          <div className="px-2 pb-2 text-eyebrow font-medium uppercase text-muted-foreground">{t('学习')}</div>
          <div className="space-y-0.5">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    isActive && 'bg-secondary font-medium text-foreground',
                  )
                }
              >
                <item.icon className="size-4 shrink-0" />
                {t(item.label)}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="flex gap-2 border-t border-border px-4 py-3 text-[11px] leading-5 text-muted-foreground">
          <span>{t('学会分析方法，自己做分析。')}</span>
        </div>
      </aside>

      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-20 flex min-h-[52px] items-center justify-between gap-3 border-b border-border bg-background px-4 py-2 sm:px-6 lg:px-7">
          <span className="text-sm font-medium">{t(currentTitle)}</span>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </header>

        <main className="pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-card px-2 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1.5 lg:hidden"
        aria-label={t('移动端导航')}
      >
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 rounded-md py-1.5 text-[11px] text-muted-foreground',
                isActive && 'font-medium text-foreground',
              )
            }
          >
            <item.icon className="size-4" />
            {t(item.label)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
