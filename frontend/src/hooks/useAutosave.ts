import { useCallback, useEffect, useRef, useState } from 'react'
import * as documentsApi from '@/services/documents'
import type { Block, BlockUpsert } from '@/types'

export const AUTOSAVE_DEBOUNCE_MS = 1500

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function toUpserts(blocks: Block[]): BlockUpsert[] {
  return blocks.map((block) => ({
    id: block.id.startsWith('temp-') ? null : block.id,
    type: block.type,
    content: block.content,
  }))
}

export function useAutosave(
  documentId: string | undefined,
  blocks: Block[],
  enabled: boolean,
  onSaved?: (blocks: Block[]) => void,
): { status: AutosaveStatus; markSynced: (blocks: Block[]) => void } {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSyncedRef = useRef<Block[] | null>(null)

  useEffect(() => {
    if (!documentId || !enabled) return
    if (lastSyncedRef.current === blocks) return
    if (lastSyncedRef.current === null) {
      lastSyncedRef.current = blocks
      return
    }

    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setStatus('saving')
      documentsApi
        .replaceBlocks(documentId, toUpserts(blocks))
        .then((saved) => {
          lastSyncedRef.current = saved
          onSaved?.(saved)
          setStatus('saved')
        })
        .catch(() => setStatus('error'))
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [documentId, enabled, blocks, onSaved])

  const markSynced = useCallback((blocks: Block[]) => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    lastSyncedRef.current = blocks
    setStatus('saved')
  }, [])

  return { status, markSynced }
}
