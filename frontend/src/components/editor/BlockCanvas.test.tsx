import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BlockCanvas } from '@/components/editor/BlockCanvas'
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

function makeBlock(type: Block['type'], content: Record<string, unknown>, id: string): Block {
  return {
    id,
    type,
    content,
    position: 0,
    createdAt: '2026-09-11T10:00:00Z',
    updatedAt: '2026-09-11T10:00:00Z',
  }
}

function Harness({ initial }: { initial: Block[] }) {
  const [blocks, setBlocks] = useState<Block[]>(initial)
  return <BlockCanvas blocks={blocks} onBlocksChange={setBlocks} />
}

describe('BlockCanvas', () => {
  it('insère un bloc via le slash menu déclenché par la touche /', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness initial={[]} />)
    const canvas = container.querySelector('[tabindex="0"]')
    expect(canvas).not.toBeNull()

    fireEvent.keyDown(canvas!, { key: '/' })
    await user.click(await screen.findByText('Callout'))

    expect(await screen.findByLabelText('Message')).toBeInTheDocument()
    expect(screen.getByLabelText('Variante du callout')).toBeInTheDocument()
  })

  it('insère un bloc via le bouton d’ajout', async () => {
    const user = userEvent.setup()
    render(<Harness initial={[]} />)

    await user.click(screen.getByRole('button', { name: /Tapez « \/ »/ }))
    await user.click(await screen.findByText('Code'))

    expect(await screen.findByTestId('codemirror')).toBeInTheDocument()
    expect(screen.getByLabelText('Copier le code')).toBeInTheDocument()
  })

  it('passe un bloc en mode édition au clic', async () => {
    const user = userEvent.setup()
    render(<Harness initial={[makeBlock('MARKDOWN', { text: '' }, 'block-1')]} />)

    await user.click(screen.getByText('Bloc Markdown vide — cliquez pour éditer'))

    expect(await screen.findByPlaceholderText('Écrivez en Markdown…')).toBeInTheDocument()
  })

  it('supprime un bloc via le bouton de suppression', async () => {
    const user = userEvent.setup()
    render(<Harness initial={[makeBlock('MARKDOWN', { text: '' }, 'block-1')]} />)

    expect(screen.getByText('Bloc Markdown vide — cliquez pour éditer')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Supprimer le bloc' }))

    expect(screen.queryByText('Bloc Markdown vide — cliquez pour éditer')).not.toBeInTheDocument()
  })
})
