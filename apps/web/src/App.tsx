import { BrowserRouter, Route, Routes } from 'react-router'

import { AppShell } from '@/components/app-shell'
import { MethodDetailPage } from '@/pages/method-detail-page'
import { MethodsPage } from '@/pages/methods-page'
import { PracticePage } from '@/pages/practice-page'
import { ProgressPage } from '@/pages/progress-page'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<MethodsPage />} />
          <Route path="methods/:methodId" element={<MethodDetailPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="progress" element={<ProgressPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
