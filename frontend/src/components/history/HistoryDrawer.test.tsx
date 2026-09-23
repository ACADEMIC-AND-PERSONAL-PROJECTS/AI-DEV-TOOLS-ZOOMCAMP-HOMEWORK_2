import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HistoryDrawer } from '@/components/history/HistoryDrawer'
import * as documentsApi from '@/services/documents'
import type { Block, Revision } from '@/types'

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
const CREATED_BY = '11111111-1111-1111-1111-111111111111'

const REVISION_V1: Revision = {
  id: 'cccc0001-cccc-cccc-cccc-cccccccccccc',
  documentId: DOCUMENT_ID,
  title: 'Architecture v1',
  snapshot: {
    blocks: [
      {
        type: 'MARKDOWN',
        content: { text: '# Ancienne version\n\nPremière mouture du document.' },
        position: 0,
      },
      {
        type: 'CALLOUT',
        content: { variant: 'INFO', title: 'Note', message: 'Avant refonte.' },
        position: 1,
      },
    ],
  },
  createdBy: CREATED_BY,
  createdAt: '2026-09-20T10:00:00Z',
}

const REVISION_V2: Revision = {
  id: 'cccc0002-cccc-cccc-cccc-cccccccccccc',
  documentId: DOCUMENT_ID,
  title: 'Architecture v2',
  snapshot: {
    blocks: [{ type: 'MARKDOWN', content: { text: '# Version initiale' }, position: 0 }],
  },
  createdBy: CREATED_BY,
  createdAt: '2026-09-22T10:00:00Z',
}

const REVISION_V3: Revision = {
  id: 'cccc0003-cccc-cccc-cccc-cccccccccccc',
  documentId: DOCUMENT_ID,
  title: 'Version manuelle',
  snapshot: REVISION_V2.snapshot,
  createdBy: CREATED_BY,
  createdAt: '2026-09-23T11:00:00Z',
}

const SAVED_BLOCKS: Block[] = [
  {
    id: 'bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    type: 'MARKDOWN',
    content: { text: '# Version initiale' },
    position: 0,
    createdAt: '2026-09-23T10:00:00Z',
    updatedAt: '2026-09-23T10:00:00Z',
  },
]

function renderDrawer(onRestored = vi.fn()) {
  const onOpenChange = vi.fn()
  render(
    <HistoryDrawer
      open
      onOpenChange={onOpenChange}
      documentId={DOCUMENT_ID}
      onRestored={onRestored}
    />,
  )
  return { onOpenChange, onRestored }
}

describe('HistoryDrawer', () => {
  beforeEach(() => {
    vi.spyOn(documentsApi, 'listRevisions').mockResolvedValue([REVISION_V1, REVISION_V2])
    vi.spyOn(documentsApi, 'createRevision').mockResolvedValue(REVISION_V3)
    vi.spyOn(documentsApi, 'replaceBlocks').mockResolvedValue(SAVED_BLOCKS)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('charge les révisions et affiche la première en aperçu', async () => {
    const listSpy = vi.mocked(documentsApi.listRevisions)
    renderDrawer()

    expect(await screen.findByText('Architecture v1')).toBeInTheDocument()
    expect(screen.getByText('Architecture v2')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Ancienne version' })).toBeInTheDocument()
    expect(screen.getByText('Avant refonte.')).toBeInTheDocument()
    expect(listSpy).toHaveBeenCalledWith(DOCUMENT_ID)
  })

  it('met à jour l’aperçu quand une autre révision est sélectionnée', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await user.click(await screen.findByRole('button', { name: /Architecture v2/ }))
    expect(await screen.findByRole('heading', { name: 'Version initiale' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ancienne version' })).not.toBeInTheDocument()
  })

  it('restaure la révision sélectionnée puis ferme le drawer', async () => {
    const user = userEvent.setup()
    const { onOpenChange, onRestored } = renderDrawer()
    const replaceSpy = vi.mocked(documentsApi.replaceBlocks)

    await user.click(await screen.findByRole('button', { name: /Architecture v2/ }))
    await user.click(screen.getByRole('button', { name: 'Restaurer cette version' }))

    await waitFor(() => expect(replaceSpy).toHaveBeenCalledTimes(1))
    expect(replaceSpy).toHaveBeenCalledWith(DOCUMENT_ID, [
      { id: null, type: 'MARKDOWN', content: { text: '# Version initiale' } },
    ])
    expect(onRestored).toHaveBeenCalledWith(SAVED_BLOCKS)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('crée une version manuelle et l’ajoute en tête de liste', async () => {
    const user = userEvent.setup()
    const createSpy = vi.mocked(documentsApi.createRevision)
    renderDrawer()

    await user.click(await screen.findByRole('button', { name: /Créer une version/ }))
    expect(await screen.findByText('Version manuelle')).toBeInTheDocument()
    expect(createSpy).toHaveBeenCalledWith(DOCUMENT_ID)
  })

  it('affiche une erreur si la restauration échoue', async () => {
    const user = userEvent.setup()
    vi.mocked(documentsApi.replaceBlocks).mockRejectedValue(new Error('boom'))
    renderDrawer()

    await user.click(await screen.findByRole('button', { name: /Architecture v2/ }))
    await user.click(screen.getByRole('button', { name: 'Restaurer cette version' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Une erreur est survenue, réessayez',
    )
  })

  it('ferme à la touche Échap', () => {
    const { onOpenChange } = renderDrawer()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
