import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardEmptyState, DashboardPage } from '@/pages/DashboardPage'
import { EditorPage } from '@/pages/EditorPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (!token) {
    return <Navigate to="/auth" replace />
  }
  return children
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (token) {
    return <Navigate to="/" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <RedirectIfAuthed>
            <AuthPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardEmptyState />} />
        <Route path="documents/:documentId" element={<EditorPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
