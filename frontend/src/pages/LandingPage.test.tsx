import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LandingPage } from '@/pages/LandingPage'

vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value }: { value: string }) => <pre data-testid="codemirror">{value}</pre>,
}))

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
  it('shouldRenderHeroAndRegisterCtaWhenAnonymous', () => {
    renderLanding()

    expect(screen.getByRole('heading', { name: /Documentez votre stack/ })).toBeInTheDocument()

    const ctas = screen.getAllByRole('link', { name: /Commencer/ })
    expect(ctas.length).toBeGreaterThan(0)
    ctas.forEach((cta) => expect(cta).toHaveAttribute('href', '/auth?mode=register'))
  })

  it('shouldExposeSectionAnchorsInNav', () => {
    renderLanding()

    expect(screen.getByRole('link', { name: 'Blocs' })).toHaveAttribute('href', '#blocs')
    expect(screen.getByRole('link', { name: 'API' })).toHaveAttribute('href', '#api')
  })

  it('shouldPreviewRealBlocksInEditorMockup', () => {
    renderLanding()

    expect(screen.getByRole('img', { name: /Aperçu de l’éditeur/ })).toBeInTheDocument()
    expect(screen.getByTestId('codemirror')).toHaveTextContent('useAutosave')
    expect(screen.getByRole('heading', { name: 'Contexte' })).toBeInTheDocument()
    expect(screen.getByText('Sauvegarde automatique')).toBeInTheDocument()
  })
})
