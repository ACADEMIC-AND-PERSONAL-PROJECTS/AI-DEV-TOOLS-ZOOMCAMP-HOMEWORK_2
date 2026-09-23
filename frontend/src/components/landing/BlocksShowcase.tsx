import { useState } from 'react'
import type { ComponentType } from 'react'
import { Braces, Code, Text, TriangleAlert, Workflow } from 'lucide-react'
import { cn } from 'cn'
import { BlockRenderer } from '@/components/blocks'
import type { BlockType } from '@/types'
import { SHOWCASE_BLOCKS } from './demo-blocks'
import { Reveal } from './Reveal'

interface ShowcaseTab {
  type: BlockType
  label: string
  hint: string
  icon: ComponentType<{ className?: string }>
}

const TABS: ShowcaseTab[] = [
  {
    type: 'MARKDOWN',
    label: 'Markdown',
    hint: 'Titres, listes, tableaux et code inline, échappés au rendu.',
    icon: Text,
  },
  {
    type: 'CODE',
    label: 'Code',
    hint: 'Coloration syntaxique, numéros de ligne et nom de fichier.',
    icon: Code,
  },
  {
    type: 'MERMAID',
    label: 'Mermaid',
    hint: 'Diagrammes générés depuis le code, sans image à maintenir.',
    icon: Workflow,
  },
  {
    type: 'API_ENDPOINT',
    label: 'Endpoint API',
    hint: 'Méthode, chemin, headers, payload et exemple de réponse.',
    icon: Braces,
  },
  {
    type: 'CALLOUT',
    label: 'Callout',
    hint: 'Info, succès, avertissement ou erreur, avec titre.',
    icon: TriangleAlert,
  },
]

const noop = () => {}

export function BlocksShowcase() {
  const [active, setActive] = useState<BlockType>('MARKDOWN')
  const [showJson, setShowJson] = useState(false)

  const tab = TABS.find((item) => item.type === active) ?? TABS[0]
  const block = SHOWCASE_BLOCKS[active]

  return (
    <section id="blocs" className="scroll-mt-20 border-t border-zinc-800 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">Les blocs</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-4xl">
            Cinq briques pour documenter toute votre stack.
          </h2>
          <p className="mt-4 text-zinc-400">
            Chaque bloc est typé et persisté en JSONB. Un document se compose, se réordonne, et se
            relit bloc par bloc.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-10">
          <div
            role="tablist"
            aria-label="Types de blocs"
            className="flex flex-wrap justify-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/40 p-1"
          >
            {TABS.map((item) => {
              const Icon = item.icon
              const selected = item.type === active
              return (
                <button
                  key={item.type}
                  type="button"
                  role="tab"
                  id={`tab-${item.type}`}
                  aria-selected={selected}
                  aria-controls={`panel-${item.type}`}
                  onClick={() => {
                    setActive(item.type)
                    setShowJson(false)
                  }}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                    selected
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-100',
                  )}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </button>
              )
            })}
          </div>

          <div
            role="tabpanel"
            id={`panel-${active}`}
            aria-labelledby={`tab-${active}`}
            className="mt-4 min-h-[320px] rounded-xl border border-zinc-800 bg-[#18181b]/70 p-4 backdrop-blur-xl sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">{tab.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{tab.hint}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowJson((open) => !open)}
                className="rounded-md border border-zinc-800 px-2 py-1 font-mono text-xs text-zinc-500 transition-colors hover:text-zinc-200"
              >
                {showJson ? 'Masquer le JSONB' : 'Voir le JSONB'}
              </button>
            </div>

            {showJson ? (
              <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-[#09090b] p-4 font-mono text-xs leading-relaxed text-zinc-400">
                {JSON.stringify(block.content, null, 2)}
              </pre>
            ) : (
              <BlockRenderer block={block} selected={false} onSelect={noop} onChange={noop} />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
