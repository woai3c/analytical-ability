import { BrowserRouter, Route, Routes } from 'react-router'

import { AppShell } from '@/components/app-shell'
import { ManualPage } from '@/pages/manual-page'
import { TrainingPage } from '@/pages/training-page'
import { WorkspacePage } from '@/pages/workspace/workspace-page'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<WorkspacePage />} />
          <Route path="manual" element={<ManualPage />} />
          <Route path="training" element={<TrainingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
