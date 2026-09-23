import ReactMarkdown from 'react-markdown'
import { Textarea } from '@/components/ui/textarea'
import { asString } from './helpers'
import type { BlockViewProps } from './types'

export function MarkdownBlock({ block, selected, onSelect, onChange }: BlockViewProps) {
  const text = asString(block.content.text)

  if (selected) {
    return (
      <div onClick={onSelect} className="rounded-lg border border-zinc-600 p-1">
        <Textarea
          value={text}
          onChange={(e) => onChange({ ...block.content, text: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="Écrivez en Markdown…"
          rows={8}
          className="min-h-24 resize-y border-0 bg-transparent font-mono text-sm shadow-none focus-visible:ring-0"
        />
      </div>
    )
  }

  return (
    <div onClick={onSelect} className="cursor-text rounded-lg px-1 py-2">
      {text.trim() === '' ? (
        <p className="text-sm text-zinc-600">Bloc Markdown vide — cliquez pour éditer</p>
      ) : (
        <ReactMarkdown
          components={{
            h1: ({ node: _node, ...props }) => (
              <h1 className="mb-3 mt-6 text-2xl font-semibold tracking-tight text-zinc-100" {...props} />
            ),
            h2: ({ node: _node, ...props }) => (
              <h2 className="mb-2 mt-5 text-xl font-semibold tracking-tight text-zinc-100" {...props} />
            ),
            h3: ({ node: _node, ...props }) => (
              <h3 className="mb-2 mt-4 text-lg font-semibold text-zinc-100" {...props} />
            ),
            p: ({ node: _node, ...props }) => (
              <p className="mb-2 text-sm leading-relaxed text-zinc-300" {...props} />
            ),
            a: ({ node: _node, ...props }) => (
              <a className="text-blue-400 underline underline-offset-4 hover:text-blue-300" {...props} />
            ),
            code: ({ node: _node, ...props }) => (
              <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-xs text-zinc-200" {...props} />
            ),
            pre: ({ node: _node, ...props }) => (
              <pre className="mb-3 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-3 font-mono text-xs text-zinc-200" {...props} />
            ),
            ul: ({ node: _node, ...props }) => (
              <ul className="mb-2 list-disc space-y-1 pl-5 text-sm text-zinc-300" {...props} />
            ),
            ol: ({ node: _node, ...props }) => (
              <ol className="mb-2 list-decimal space-y-1 pl-5 text-sm text-zinc-300" {...props} />
            ),
            li: ({ node: _node, ...props }) => <li className="leading-relaxed" {...props} />,
            blockquote: ({ node: _node, ...props }) => (
              <blockquote className="mb-2 border-l-2 border-zinc-700 pl-3 text-sm italic text-zinc-400" {...props} />
            ),
            hr: ({ node: _node, ...props }) => <hr className="my-4 border-zinc-800" {...props} />,
          }}
        >
          {text}
        </ReactMarkdown>
      )}
    </div>
  )
}
