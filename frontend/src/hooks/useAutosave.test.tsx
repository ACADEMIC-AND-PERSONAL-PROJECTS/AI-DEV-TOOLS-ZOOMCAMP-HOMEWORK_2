import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAutosave } from '@/hooks/useAutosave'
import * as documentsApi from '@/services/documents'
import type { Block } from '@/types'

const DOCUMENT_ID = '55555555-5555-5555-5555-555555555555'

function makeBlock(type: Block['type'], content: Record<string, unknown>, id: string): Block {
  return {
    id,
    type,
    content,
    position: 0,
    createdAt: '2026-09-23T10:00:00Z',
    updatedAt: '2026-09-23T10:00:00Z',
  }
}

interface HarnessProps {
  documentId?: string
  initial: Block[]
  enabled: boolean
  onSaved?: (blocks: Block[]) => void
}

function Harness({ documentId, initial, enabled, onSaved }: HarnessProps) {
  const [blocks, setBlocks] = useState(initial)
  const { status, markSynced } = useAutosave(documentId, blocks, enabled, onSaved ?? setBlocks)
  return (
    <div>
      <span data-testid="status">{status}</span>
      <button
        type="button"
        onClick={() =>
          setBlocks([...blocks, makeBlock('MARKDOWN', { text: 'nouveau' }, `temp-${blocks.length}`)])
        }
      >
        edit
      </button>
      <button type="button" onClick={() => markSynced(blocks)}>
        sync
      </button>
    </div>
  )
}

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("n'émet pas de PUT au montage quand les blocs sont chargés (baseline)", () => {
    const spy = vi.spyOn(documentsApi, 'replaceBlocks').mockResolvedValue([])
    const initial = [makeBlock('MARKDOWN', { text: 'a' }, 'aaaa0001-aaaa-aaaa-aaaa-aaaaaaaaaaaa')]
    render(<Harness documentId={DOCUMENT_ID} initial={initial} enabled />)

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(spy).not.toHaveBeenCalled()
  })

  it('débounce 1.5s puis envoie un PUT batch avec les ids temporaires à null', async () => {
    const saved = [makeBlock('MARKDOWN', { text: 'nouveau' }, 'bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb')]
    const spy = vi.spyOn(documentsApi, 'replaceBlocks').mockResolvedValue(saved)
    render(<Harness documentId={DOCUMENT_ID} initial={[]} enabled />)

    fireEvent.click(screen.getByText('edit'))
    act(() => {
      vi.advanceTimersByTime(1499)
    })
    expect(spy).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(DOCUMENT_ID, [
      { id: null, type: 'MARKDOWN', content: { text: 'nouveau' } },
    ])
  })

  it('passe par le statut saving puis saved', async () => {
    const saved = [makeBlock('MARKDOWN', { text: 'nouveau' }, 'bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb')]
    let resolveSave!: (blocks: Block[]) => void
    const spy = vi
      .spyOn(documentsApi, 'replaceBlocks')
      .mockImplementation(
        () =>
          new Promise<Block[]>((resolve) => {
            resolveSave = resolve
          }),
      )
    render(<Harness documentId={DOCUMENT_ID} initial={[]} enabled />)

    fireEvent.click(screen.getByText('edit'))
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByTestId('status')).toHaveTextContent('saving')

    await act(async () => {
      resolveSave(saved)
    })
    expect(screen.getByTestId('status')).toHaveTextContent('saved')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('regroupe les modifications rapprochées en un seul PUT', async () => {
    const spy = vi.spyOn(documentsApi, 'replaceBlocks').mockResolvedValue([])
    render(<Harness documentId={DOCUMENT_ID} initial={[]} enabled />)

    fireEvent.click(screen.getByText('edit'))
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    fireEvent.click(screen.getByText('edit'))
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][1]).toEqual([
      { id: null, type: 'MARKDOWN', content: { text: 'nouveau' } },
      { id: null, type: 'MARKDOWN', content: { text: 'nouveau' } },
    ])
  })

  it('passe au statut error quand le PUT échoue', async () => {
    vi.spyOn(documentsApi, 'replaceBlocks').mockRejectedValue(new Error('boom'))
    render(<Harness documentId={DOCUMENT_ID} initial={[]} enabled />)

    fireEvent.click(screen.getByText('edit'))
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByTestId('status')).toHaveTextContent('error')
  })

  it('markSynced annule la sauvegarde en attente', () => {
    const spy = vi.spyOn(documentsApi, 'replaceBlocks').mockResolvedValue([])
    render(<Harness documentId={DOCUMENT_ID} initial={[]} enabled />)

    fireEvent.click(screen.getByText('edit'))
    fireEvent.click(screen.getByText('sync'))
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(spy).not.toHaveBeenCalled()
    expect(screen.getByTestId('status')).toHaveTextContent('saved')
  })
})
