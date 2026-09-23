import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { TOKEN_KEY, USER_KEY } from '@/services/api'

vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value }: { value: string }) => <pre data-testid="codemirror">{value}</pre>,
}))

const user = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'ada@techblocks.dev',
  fullName: 'Ada Developer',
  avatarUrl: null,
  createdAt: '2026-09-01T10:00:00Z',
}

describe('App', () => {
  it('shouldRenderLandingWhenAnonymous', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /Documentez votre stack/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Menu utilisateur' })).not.toBeInTheDocument()
  })

  it('shouldRedirectToAuthWhenAnonymousOnDocumentDeepLink', () => {
    window.history.pushState({}, '', '/documents/55555555-5555-5555-5555-555555555555')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'TechBlocks' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Documentez votre stack/ })).not.toBeInTheDocument()
  })

  it('shouldRenderDashboardWhenAuthenticated', async () => {
    localStorage.setItem(TOKEN_KEY, 'fake-jwt-token')
    localStorage.setItem(USER_KEY, JSON.stringify(user))

    render(<App />)

    expect(await screen.findByRole('button', { name: /Onboarding/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Documentez votre stack/ })).not.toBeInTheDocument()
  })
})
