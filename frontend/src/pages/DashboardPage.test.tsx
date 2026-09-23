import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '@/hooks/useAuth'
import { TOKEN_KEY, USER_KEY } from '@/services/api'
import { DashboardPage } from './DashboardPage'

const user = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'ada@techblocks.dev',
  fullName: 'Ada Developer',
  avatarUrl: null,
  createdAt: '2026-09-01T10:00:00Z',
}

function renderDashboard() {
  localStorage.setItem(TOKEN_KEY, 'fake-jwt-token')
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return render(
    <MemoryRouter>
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  it('shouldLoadFirstWorkspaceAndTree', async () => {
    renderDashboard()

    expect(await screen.findByRole('button', { name: /Onboarding/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Architecture/ })).toBeInTheDocument()
    expect(screen.getAllByText('Backend').length).toBeGreaterThan(0)
  })

  it('shouldLogoutAndClearStorage', async () => {
    const actor = userEvent.setup()
    renderDashboard()
    await screen.findByRole('button', { name: /Onboarding/ })

    await actor.click(screen.getByRole('button', { name: 'Menu utilisateur' }))
    await actor.click(await screen.findByRole('menuitem', { name: 'Se déconnecter' }))

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(USER_KEY)).toBeNull()
  })
})
