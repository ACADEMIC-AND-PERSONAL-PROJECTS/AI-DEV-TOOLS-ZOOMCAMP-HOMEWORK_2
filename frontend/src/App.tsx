import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardEmptyState, DashboardPage } from '@/pages/DashboardPage'
import { EditorPage } from '@/pages/EditorPage'
import { LandingPage } from '@/pages/LandingPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (!token) {
    return <Navigate to="/auth" replace />
  }
  return children
}

function HomeGate() {
  const { token } = useAuth()
  const { pathname } = useLocation()

  if (token) {
    return <DashboardPage />
  }
  if (pathname !== '/') {
    return <Navigate to="/auth" replace />
  }
  return <LandingPage />
}

function HomeIndex() {
  const { token } = useAuth()
  return token ? <DashboardEmptyState /> : null
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
      <Route path="/" element={<HomeGate />}>
        <Route index element={<HomeIndex />} />
        <Route
          path="documents/:documentId"
          element={
            <RequireAuth>
              <EditorPage />
            </RequireAuth>
          }
        />
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
