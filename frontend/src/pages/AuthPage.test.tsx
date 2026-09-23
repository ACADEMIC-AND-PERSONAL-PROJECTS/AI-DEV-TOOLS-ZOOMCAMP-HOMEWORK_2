import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '@/hooks/useAuth'
import { TOKEN_KEY } from '@/services/api'
import { AuthPage } from './AuthPage'

function renderAuthPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AuthPage', () => {
  it('shouldRenderLoginFormByDefault', () => {
    renderAuthPage()

    expect(screen.getByRole('heading', { name: 'TechBlocks' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
    expect(screen.queryByLabelText('Nom complet')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument()
  })

  it('shouldPersistTokenWhenLoginSucceeds', async () => {
    const user = userEvent.setup()
    renderAuthPage()

    await user.type(screen.getByLabelText('Email'), 'ada@techblocks.dev')
    await user.type(screen.getByLabelText('Mot de passe'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    await waitFor(() => {
      expect(localStorage.getItem(TOKEN_KEY)).toBe('fake-jwt-token')
    })
  })

  it('shouldDisplayProblemDetailWhenLoginFails', async () => {
    const user = userEvent.setup()
    renderAuthPage()

    await user.type(screen.getByLabelText('Email'), 'ada@techblocks.dev')
    await user.type(screen.getByLabelText('Mot de passe'), 'mauvais-mot-de-passe')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Identifiants invalides')
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('shouldPersistTokenWhenRegisterSucceeds', async () => {
    const user = userEvent.setup()
    renderAuthPage()

    await user.click(screen.getByRole('button', { name: 'S’inscrire' }))
    expect(screen.getByLabelText('Nom complet')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nom complet'), 'Grace Hopper')
    await user.type(screen.getByLabelText('Email'), 'grace@techblocks.dev')
    await user.type(screen.getByLabelText('Mot de passe'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Créer le compte' }))

    await waitFor(() => {
      expect(localStorage.getItem(TOKEN_KEY)).toBe('fake-jwt-token')
    })
  })
})
