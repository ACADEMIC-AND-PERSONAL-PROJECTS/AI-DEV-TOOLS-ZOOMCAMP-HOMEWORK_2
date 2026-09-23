import { useMemo, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { asBoolean, asString } from './helpers'
import type { BlockViewProps } from './types'

export function CodeBlock({ block, selected, onSelect, onChange }: BlockViewProps) {
  const language = asString(block.content.language) || 'typescript'
  const code = asString(block.content.code)
  const fileName = asString(block.content.fileName)
  const showLineNumbers = asBoolean(block.content.showLineNumbers, true)
  const [copied, setCopied] = useState(false)

  const extensions = useMemo(() => {
    if (language === 'typescript' || language === 'javascript') {
      return [javascript({ typescript: language === 'typescript' })]
    }
    return []
  }, [language])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard indisponible (environnement de test) : on ignore.
    }
  }

  return (
    <div
      onClick={onSelect}
      className={`overflow-hidden rounded-lg border bg-[#0d1117] transition-colors ${
        selected ? 'border-zinc-600' : 'border-zinc-800'
      }`}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2 font-mono text-xs text-zinc-400">
          {fileName && <span className="truncate text-zinc-300">{fileName}</span>}
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
            {language}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Copier le code"
          onClick={handleCopy}
          className="h-6 gap-1 px-1.5 text-zinc-400"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      </div>
      <CodeMirror
        value={code}
        height="auto"
        theme={vscodeDark}
        extensions={extensions}
        editable={selected}
        basicSetup={{ lineNumbers: showLineNumbers, foldGutter: false }}
        onChange={(value) => onChange({ ...block.content, code: value })}
      />
    </div>
  )
}
