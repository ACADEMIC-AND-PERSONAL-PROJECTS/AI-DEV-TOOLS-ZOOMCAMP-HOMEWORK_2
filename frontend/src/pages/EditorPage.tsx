import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BlockCanvas } from '@/components/editor/BlockCanvas'
import { extractError } from '@/lib/errors'
import * as documentsApi from '@/services/documents'
import type { Block, Document } from '@/types'

export function EditorPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const [document, setDocument] = useState<Document | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      </div>
      <div className="mt-6">
        <BlockCanvas blocks={blocks} onBlocksChange={setBlocks} />
      </div>
    </div>
  )
}
