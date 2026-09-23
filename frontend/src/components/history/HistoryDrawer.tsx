import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { History, Plus, RotateCcw, X } from 'lucide-react'
import { BlockRenderer } from '@/components/blocks'
import { Button } from '@/components/ui/button'
import { extractError } from '@/lib/errors'
import * as documentsApi from '@/services/documents'
import type { Block, BlockUpsert, Revision } from '@/types'

interface HistoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string
  onRestored: (blocks: Block[]) => void
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  )
}

function snapshotToUpserts(revision: Revision): BlockUpsert[] {
  return revision.snapshot.blocks.map((block) => ({
    id: null,
    type: block.type,
    content: block.content,
  }))
}

export function HistoryDrawer({ open, onOpenChange, documentId, onRestored }: HistoryDrawerProps) {
  const [revisions, setRevisions] = useState<Revision[] | null>(null)
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!open || !documentId) return
    let cancelled = false
    const load = async () => {
      try {
        const items = await documentsApi.listRevisions(documentId)
        if (cancelled) return
        setRevisions(items)
        setSelectedRevisionId((current) => current ?? items[0]?.id ?? null)
      } catch (err) {
        if (!cancelled) setError(extractError(err))
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [open, documentId])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  const selected = revisions?.find((revision) => revision.id === selectedRevisionId) ?? null

  const previewBlocks: Block[] = selected
    ? selected.snapshot.blocks.map((snapshot, index) => ({
        id: `rev-${selected.id}-${index}`,
        type: snapshot.type,
        content: snapshot.content,
        position: snapshot.position,
        createdAt: selected.createdAt,
        updatedAt: selected.createdAt,
      }))
    : []

  const handleRestore = async () => {
    if (!selected || !documentId) return
    setRestoring(true)
    setError(null)
    try {
      const restored = await documentsApi.replaceBlocks(documentId, snapshotToUpserts(selected))
      onRestored(restored)
      onOpenChange(false)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setRestoring(false)
    }
  }

  const handleCreate = async () => {
    if (!documentId) return
    setCreating(true)
    setError(null)
    try {
      const revision = await documentsApi.createRevision(documentId)
      setRevisions((previous) => [revision, ...(previous ?? [])])
      setSelectedRevisionId(revision.id)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Historique des révisions"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-zinc-800 bg-[#18181b]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.18 }}
          >
            <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <History className="size-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-100">Historique</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fermer l'historique"
                onClick={() => onOpenChange(false)}
                className="size-7 text-zinc-400"
              >
                <X className="size-4" />
              </Button>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleCreate()}
                disabled={creating}
                className="mb-4 w-full gap-1.5 border-zinc-800"
              >
                <Plus className="size-3.5" />
                {creating ? 'Création…' : 'Créer une version'}
              </Button>
              {error && (
                <p
                  role="alert"
                  className="mb-3 rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-300"
                >
                  {error}
                </p>
              )}
              {revisions === null ? (
                <p className="text-sm text-zinc-500">Chargement…</p>
              ) : revisions.length === 0 ? (
                <p className="text-sm text-zinc-500">Aucune révision enregistrée.</p>
              ) : (
                <>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Révisions
                  </p>
                  <ul className="flex flex-col gap-1">
                    {revisions.map((revision) => {
                      const isSelected = revision.id === selectedRevisionId
                      return (
                        <li key={revision.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedRevisionId(revision.id)}
                            className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                              isSelected
                                ? 'border-zinc-600 bg-zinc-800/60'
                                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                            }`}
                          >
                            <span className="block truncate text-sm text-zinc-200">
                              {revision.title || 'Sans titre'}
                            </span>
                            <span className="block text-xs text-zinc-500">
                              {formatDate(revision.createdAt)}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                  {selected && (
                    <div className="mt-5 border-t border-zinc-800 pt-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Aperçu
                        </p>
                        <Button
                          size="sm"
                          onClick={() => void handleRestore()}
                          disabled={restoring}
                          className="h-7 gap-1.5 text-xs"
                        >
                          <RotateCcw className="size-3.5" />
                          {restoring ? 'Restauration…' : 'Restaurer cette version'}
                        </Button>
                      </div>
                      {previewBlocks.length === 0 ? (
                        <p className="text-sm text-zinc-500">
                          Cette révision ne contient aucun bloc.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {previewBlocks.map((block) => (
                            <BlockRenderer
                              key={block.id}
                              block={block}
                              selected={false}
                              onSelect={() => undefined}
                              onChange={() => undefined}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
