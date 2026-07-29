import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'

import { AppShell } from '@/components/app-shell'

const MethodsPage = lazy(() => import('@/pages/methods-page').then((module) => ({ default: module.MethodsPage })))
const MethodDetailPage = lazy(() =>
  import('@/pages/method-detail-page').then((module) => ({ default: module.MethodDetailPage })),
)
const PracticePage = lazy(() => import('@/pages/practice-page').then((module) => ({ default: module.PracticePage })))
const ProgressPage = lazy(() => import('@/pages/progress-page').then((module) => ({ default: module.ProgressPage })))
const SettingsPage = lazy(() => import('@/pages/settings-page').then((module) => ({ default: module.SettingsPage })))

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>
}

function PageLoadingFallback() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse px-5 py-8 sm:px-6" aria-hidden="true">
      <div className="h-6 w-36 rounded bg-secondary" />
      <div className="mt-3 h-4 w-2/3 rounded bg-secondary" />
      <div className="mt-8 h-28 rounded-lg bg-secondary" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            index
            element={
              <LazyPage>
                <MethodsPage />
              </LazyPage>
            }
          />
          <Route
            path="methods/:methodId"
            element={
              <LazyPage>
                <MethodDetailPage />
              </LazyPage>
            }
          />
          <Route
            path="practice"
            element={
              <LazyPage>
                <PracticePage />
              </LazyPage>
            }
          />
          <Route
            path="progress"
            element={
              <LazyPage>
                <ProgressPage />
              </LazyPage>
            }
          />
          <Route
            path="settings"
            element={
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
