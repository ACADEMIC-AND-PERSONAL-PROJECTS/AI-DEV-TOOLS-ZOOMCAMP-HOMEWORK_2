import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { EditorPage } from '@/pages/EditorPage'

vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value }: { value: string }) => <pre data-testid="codemirror">{value}</pre>,
}))

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg data-testid="mermaid-output"></svg>' }),
  },
}))

const DOCUMENT_ID = '55555555-5555-5555-5555-555555555555'

function renderEditor() {
  return render(
    <MemoryRouter initialEntries={[`/documents/${DOCUMENT_ID}`]}>
      <Routes>
        <Route path="documents/:documentId" element={<EditorPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EditorPage', () => {
  it('charge le document et affiche son titre', async () => {
    renderEditor()
    expect(await screen.findByDisplayValue('Architecture')).toBeInTheDocument()
  })

  it('affiche les blocs du document', async () => {
    renderEditor()
    expect(await screen.findByRole('heading', { name: 'Vue globale' })).toBeInTheDocument()
    expect(screen.getByText('/api/v1/workspaces')).toBeInTheDocument()
    expect(screen.getByText('À savoir')).toBeInTheDocument()
    expect(screen.getByTestId('codemirror')).toHaveTextContent('const app = "TechBlocks"')
  })

  it('enregistre le titre modifié au blur', async () => {
    const user = userEvent.setup()
    renderEditor()
    const input = await screen.findByDisplayValue('Architecture')
    await user.clear(input)
    await user.type(input, 'Architecture v2')
    await user.tab()

    expect(await screen.findByDisplayValue('Architecture v2')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
