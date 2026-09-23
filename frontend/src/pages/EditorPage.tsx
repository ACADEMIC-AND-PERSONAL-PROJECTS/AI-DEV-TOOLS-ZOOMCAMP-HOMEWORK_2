import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { History } from 'lucide-react'
import { BlockCanvas } from '@/components/editor/BlockCanvas'
import { HistoryDrawer } from '@/components/history/HistoryDrawer'
import { Button } from '@/components/ui/button'
import { useAutosave } from '@/hooks/useAutosave'
import type { AutosaveStatus } from '@/hooks/useAutosave'
import { extractError } from '@/lib/errors'
import * as documentsApi from '@/services/documents'
import type { Block, Document } from '@/types'

const STATUS_LABELS: Record<AutosaveStatus, string> = {
  idle: 'Enregistré',
  saving: 'Enregistrement…',
  saved: 'Enregistré',
  error: "Erreur d'enregistrement",
}

const STATUS_STYLES: Record<AutosaveStatus, string> = {
  idle: 'text-zinc-500',
  saving: 'text-zinc-400',
  saved: 'text-zinc-500',
  error: 'text-red-400',
}

export function EditorPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const [document, setDocument] = useState<Document | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const { status, markSynced } = useAutosave(documentId, blocks, document !== null, setBlocks)

  useEffect(() => {
    if (!documentId) return
    let cancelled = false
    documentsApi
      .getDocument(documentId)
      .then((doc) => {
        if (cancelled) return
        setDocument(doc)
        setBlocks(doc.blocks)
        setTitle(doc.title)
      })
      .catch((err) => {
        if (!cancelled) setError(extractError(err))
      })
    return () => {
      cancelled = true
    }
  }, [documentId])

  const handleTitleBlur = async () => {
    if (!documentId || !document) return
    const trimmed = title.trim()
    if (trimmed === document.title) return
    try {
      const updated = await documentsApi.updateDocument(documentId, trimmed)
      setDocument(updated)
      setTitle(updated.title)
    } catch (err) {
      setError(extractError(err))
    }
  }

  const handleRestored = (restored: Block[]) => {
    setBlocks(restored)
    markSynced(restored)
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p role="alert" className="max-w-md text-sm text-red-300">
          {error}
        </p>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-500">Chargement…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="flex items-center gap-2">
        {document.icon && <span className="text-2xl">{document.icon}</span>}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => void handleTitleBlur()}
          aria-label="Titre du document"
          placeholder="Document sans titre"
          className="w-full bg-transparent text-3xl font-semibold tracking-tight text-zinc-50 outline-none placeholder:text-zinc-600"
        />
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span data-testid="autosave-status" className={`text-xs ${STATUS_STYLES[status]}`}>
            {STATUS_LABELS[status]}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHistoryOpen(true)}
            className="gap-1.5 border-zinc-800 bg-[#18181b] text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <History className="size-4" />
            Historique
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <BlockCanvas blocks={blocks} onBlocksChange={setBlocks} />
      </div>
      <HistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        documentId={document.id}
        onRestored={handleRestored}
      />
    </div>
  )
}
