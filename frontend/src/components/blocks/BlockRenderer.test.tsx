import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BlockRenderer } from '@/components/blocks'
import type { BlockViewProps } from '@/components/blocks/types'
import type { Block } from '@/types'

vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value }: { value: string }) => <pre data-testid="codemirror">{value}</pre>,
}))

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg data-testid="mermaid-output"></svg>' }),
  },
}))

function makeBlock(type: Block['type'], content: Record<string, unknown>): Block {
  return {
    id: 'block-1',
    type,
    content,
    position: 0,
    createdAt: '2026-09-11T10:00:00Z',
    updatedAt: '2026-09-11T10:00:00Z',
  }
}

function renderBlock(block: Block, selected = false): BlockViewProps {
  const props: BlockViewProps = { block, selected, onSelect: vi.fn(), onChange: vi.fn() }
  render(<BlockRenderer {...props} />)
  return props
}

describe('BlockRenderer', () => {
  it('rend un bloc MARKDOWN en mode lecture', () => {
    renderBlock(makeBlock('MARKDOWN', { text: '# Vue globale\n\nArchitecture **monorepo**.' }))
    expect(screen.getByRole('heading', { name: 'Vue globale' })).toBeInTheDocument()
    expect(screen.getByText('monorepo')).toBeInTheDocument()
  })

  it('rend un bloc MARKDOWN en mode édition', () => {
    renderBlock(makeBlock('MARKDOWN', { text: '' }), true)
    expect(screen.getByPlaceholderText('Écrivez en Markdown…')).toBeInTheDocument()
  })

  it('rend un bloc CODE avec nom de fichier, langage et contenu', () => {
    renderBlock(
      makeBlock('CODE', {
        language: 'typescript',
        code: 'const app = "TechBlocks"',
        showLineNumbers: true,
        fileName: 'main.ts',
      }),
    )
    expect(screen.getByText('main.ts')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
    expect(screen.getByTestId('codemirror')).toHaveTextContent('const app = "TechBlocks"')
  })

  it('rend un bloc API_ENDPOINT avec méthode, endpoint et détails dépliables', async () => {
    const user = userEvent.setup()
    renderBlock(
      makeBlock('API_ENDPOINT', {
        method: 'GET',
        endpoint: '/api/v1/workspaces',
        summary: 'Liste les workspaces',
        headers: [{ key: 'Authorization', value: 'Bearer <token>' }],
        requestBody: '',
        responseExample: '{"items": []}',
      }),
    )
    expect(screen.getByText('GET')).toBeInTheDocument()
    expect(screen.getByText('/api/v1/workspaces')).toBeInTheDocument()
    expect(screen.getByText('Liste les workspaces')).toBeInTheDocument()

    await user.click(screen.getByText('Détails'))
    expect(screen.getByText('Authorization:')).toBeInTheDocument()
    expect(screen.getByText('Bearer <token>')).toBeInTheDocument()
    expect(screen.getByText('Réponse')).toBeInTheDocument()
    expect(screen.getByText('{"items": []}')).toBeInTheDocument()
  })

  it('rend un bloc CALLOUT avec titre et message', () => {
    renderBlock(
      makeBlock('CALLOUT', { variant: 'INFO', title: 'À savoir', message: 'Le JWT expire après 24h.' }),
    )
    expect(screen.getByText('À savoir')).toBeInTheDocument()
    expect(screen.getByText('Le JWT expire après 24h.')).toBeInTheDocument()
  })

  it('rend un bloc MERMAID en mode lecture', async () => {
    renderBlock(makeBlock('MERMAID', { code: 'graph TD;\n  A-->B;' }))
    expect(await screen.findByTestId('mermaid-output')).toBeInTheDocument()
  })

  it('bascule un bloc MERMAID sélectionné vers l’aperçu', async () => {
    const user = userEvent.setup()
    renderBlock(makeBlock('MERMAID', { code: 'graph TD;\n  A-->B;' }), true)
    expect(screen.getByPlaceholderText('graph TD;')).toHaveValue('graph TD;\n  A-->B;')
    await user.click(screen.getByRole('button', { name: /Aperçu/ }))
    expect(await screen.findByTestId('mermaid-output')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Éditer/ })).toBeInTheDocument()
  })
})
