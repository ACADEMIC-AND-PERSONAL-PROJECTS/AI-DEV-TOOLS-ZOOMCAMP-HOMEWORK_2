import { useEffect, useState } from 'react'
import { Eye, PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { asString } from './helpers'
import type { BlockViewProps } from './types'

function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function renderDiagram() {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'dark' })
        const diagramId = `mermaid-${Math.random().toString(36).slice(2, 10)}`
        const { svg: diagramSvg } = await mermaid.render(diagramId, code)
        if (!cancelled) {
          setSvg(diagramSvg)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setSvg(null)
          setError(err instanceof Error ? err.message : 'Diagramme invalide')
        }
      }
    }
    void renderDiagram()
    return () => {
      cancelled = true
    }
  }, [code])

  if (error) {
    return (
      <p role="alert" className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 font-mono text-xs text-red-300">
        {error}
      </p>
    )
  }
  if (!svg) {
    return <p className="text-sm text-zinc-500">Rendu du diagramme…</p>
  }
  return (
    <div
      className="flex justify-center overflow-x-auto py-2"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export function MermaidBlock({ block, selected, onSelect, onChange }: BlockViewProps) {
  const code = asString(block.content.code)
  const [preview, setPreview] = useState(false)

  if (selected && !preview) {
    return (
      <div onClick={onSelect} className="rounded-lg border border-zinc-600 p-1">
        <div className="flex items-center justify-between pb-1">
          <span className="pl-2 font-mono text-xs text-zinc-500">Mermaid</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPreview(true)}
            className="h-6 gap-1 px-1.5 text-zinc-400"
          >
            <Eye className="size-3.5" />
            Aperçu
          </Button>
        </div>
        <Textarea
          value={code}
          onChange={(e) => onChange({ ...block.content, code: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="graph TD;"
          rows={6}
          className="min-h-24 resize-y border-0 bg-transparent font-mono text-sm shadow-none focus-visible:ring-0"
        />
      </div>
    )
  }

  return (
    <div onClick={onSelect} className="group cursor-text rounded-lg border border-zinc-800 px-3 py-2">
      {selected && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setPreview(false)
          }}
          className="mb-1 h-6 gap-1 px-1.5 text-zinc-400"
        >
          <PencilLine className="size-3.5" />
          Éditer
        </Button>
      )}
      {code.trim() === '' ? (
        <p className="text-sm text-zinc-600">Diagramme Mermaid vide</p>
      ) : (
        <MermaidDiagram code={code} />
      )}
    </div>
  )
}
