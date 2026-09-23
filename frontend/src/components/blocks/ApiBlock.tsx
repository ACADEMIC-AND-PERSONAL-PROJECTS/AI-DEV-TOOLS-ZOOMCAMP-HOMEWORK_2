import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { asString } from './helpers'
import type { BlockViewProps } from './types'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const METHOD_STYLES: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-400',
  POST: 'bg-blue-500/15 text-blue-400',
  PUT: 'bg-amber-500/15 text-amber-400',
  PATCH: 'bg-violet-500/15 text-violet-400',
  DELETE: 'bg-red-500/15 text-red-400',
}

interface HeaderRow {
  key: string
  value: string
}

function asHeaders(value: unknown): HeaderRow[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((row) => {
    if (typeof row !== 'object' || row === null) return []
    const { key, value: headerValue } = row as Record<string, unknown>
    if (typeof key !== 'string' || typeof headerValue !== 'string') return []
    return [{ key, value: headerValue }]
  })
}

function methodOf(value: unknown): HttpMethod {
  const raw = asString(value).toUpperCase()
  return (METHODS as string[]).includes(raw) ? (raw as HttpMethod) : 'GET'
}

export function ApiBlock({ block, selected, onSelect, onChange }: BlockViewProps) {
  const method = methodOf(block.content.method)
  const endpoint = asString(block.content.endpoint)
  const summary = asString(block.content.summary)
  const requestBody = asString(block.content.requestBody)
  const responseExample = asString(block.content.responseExample)
  const headers = useMemo(() => asHeaders(block.content.headers), [block.content.headers])
  const [detailsOpen, setDetailsOpen] = useState(false)

  const patch = (partial: Record<string, unknown>) => onChange({ ...block.content, ...partial })

  if (selected) {
    return (
      <div onClick={onSelect} className="flex flex-col gap-3 rounded-lg border border-zinc-600 p-3">
        <div className="flex gap-2">
          <div className="w-28">
            <Select
              value={method}
              onValueChange={(value) => patch({ method: value as HttpMethod })}
            >
              <SelectTrigger aria-label="Méthode HTTP" className="border-zinc-800 bg-zinc-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-[#18181b]">
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            value={endpoint}
            onChange={(e) => patch({ endpoint: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            placeholder="/api/v1/resource"
            aria-label="Endpoint"
            className="flex-1 border-zinc-800 bg-zinc-900 font-mono text-sm"
          />
        </div>
        <Input
          value={summary}
          onChange={(e) => patch({ summary: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="Résumé de l'endpoint"
          aria-label="Résumé"
          className="border-zinc-800 bg-zinc-900"
        />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="api-request" className="text-xs text-zinc-500">
            Corps de requête (JSON)
          </Label>
          <Textarea
            id="api-request"
            value={requestBody}
            onChange={(e) => patch({ requestBody: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            rows={4}
            className="min-h-16 resize-y border-zinc-800 bg-zinc-900 font-mono text-xs"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="api-response" className="text-xs text-zinc-500">
            Exemple de réponse (JSON)
          </Label>
          <Textarea
            id="api-response"
            value={responseExample}
            onChange={(e) => patch({ responseExample: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            rows={4}
            className="min-h-16 resize-y border-zinc-800 bg-zinc-900 font-mono text-xs"
          />
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onSelect}
      className="cursor-text rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5"
    >
      <div className="flex items-center gap-2">
        <span
          className={`rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${METHOD_STYLES[method] ?? METHOD_STYLES.GET}`}
        >
          {method}
        </span>
        <code className="truncate font-mono text-sm text-zinc-200">
          {endpoint || '/api/v1/…'}
        </code>
      </div>
      {summary && <p className="mt-1.5 text-sm text-zinc-400">{summary}</p>}
      {(headers.length > 0 || requestBody || responseExample) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDetailsOpen((open) => !open)
          }}
          className="mt-2 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
        >
          {detailsOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          Détails
        </button>
      )}
      {detailsOpen && (
        <div className="mt-2 flex flex-col gap-2 border-t border-zinc-800 pt-2">
          {headers.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {headers.map((header, index) => (
                <li key={`${header.key}-${index}`} className="font-mono text-xs text-zinc-400">
                  <span className="text-zinc-500">{header.key}:</span> {header.value}
                </li>
              ))}
            </ul>
          )}
          {requestBody && (
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-500">Requête</p>
              <pre className="overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950 p-2 font-mono text-xs text-zinc-300">
                {requestBody}
              </pre>
            </div>
          )}
          {responseExample && (
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-500">Réponse</p>
              <pre className="overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950 p-2 font-mono text-xs text-zinc-300">
                {responseExample}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
