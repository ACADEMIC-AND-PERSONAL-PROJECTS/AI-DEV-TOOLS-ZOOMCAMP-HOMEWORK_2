import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LandingPage } from '@/pages/LandingPage'

vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value }: { value: string }) => <pre data-testid="codemirror">{value}</pre>,
}))

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg data-testid="mermaid-output"></svg>' }),
  },
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

  it('shouldRenderEverySectionAsAnchorTarget', () => {
    renderLanding()

    expect(screen.getByRole('heading', { name: /Cinq briques pour documenter/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Pensé pour les équipes/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /en quatre temps/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /documentée dans vos documents/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /mérite mieux/ })).toBeInTheDocument()

    const anchors = ['blocs', 'fonctionnalites', 'workflow', 'api']
    anchors.forEach((id) => expect(document.getElementById(id)).not.toBeNull())
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('shouldPreviewRealBlocksInEditorMockup', () => {
    renderLanding()

    expect(screen.getByRole('img', { name: /Aperçu de l’éditeur/ })).toBeInTheDocument()
    expect(screen.getByTestId('codemirror')).toHaveTextContent('useAutosave')
    expect(screen.getByRole('heading', { name: 'Contexte' })).toBeInTheDocument()
    expect(screen.getByText('Sauvegarde automatique')).toBeInTheDocument()
  })

  it('shouldSwapRenderedBlockWhenSwitchingShowcaseTab', async () => {
    const user = userEvent.setup()
    renderLanding()

    expect(screen.getByRole('heading', { name: 'Endpoints de documentation' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Endpoint API' }))

    expect(screen.getByRole('tab', { name: 'Endpoint API' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText(/Authentification de l/)).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Endpoints de documentation' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Mermaid' }))

    expect(await screen.findByTestId('mermaid-output')).toBeInTheDocument()
  })

  it('shouldToggleJsonbSourceOfActiveBlock', async () => {
    const user = userEvent.setup()
    renderLanding()

    await user.click(screen.getByRole('button', { name: 'Voir le JSONB' }))

    expect(screen.getByText(/Endpoints de documentation/)).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Endpoints de documentation' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Masquer le JSONB' }))

    expect(screen.getByRole('heading', { name: 'Endpoints de documentation' })).toBeInTheDocument()
  })
})
