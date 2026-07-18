import { BrowserRouter, Route, Routes } from 'react-router'

import { AppShell } from '@/components/app-shell'
import { TrainingPage } from '@/pages/training-page'
import { WorkspacePage } from '@/pages/workspace-page'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<WorkspacePage />} />
          <Route path="training" element={<TrainingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
