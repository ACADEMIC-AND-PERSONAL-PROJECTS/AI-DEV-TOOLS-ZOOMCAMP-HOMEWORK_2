import { ChevronDown, FileText, Search, Sparkles } from 'lucide-react'
import { BlockRenderer } from '@/components/blocks'
import { HERO_BLOCKS } from './demo-blocks'

const TREE = ['Architecture backend', 'Endpoints REST', 'Guide de démarrage', 'Conventions de code']

const noop = () => {}

export function EditorPreview() {
  return (
    <div
      role="img"
      aria-label="Aperçu de l’éditeur TechBlocks : un document composé de blocs Markdown, code et callout."
      className="relative"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-16 h-56 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_65%)] blur-2xl" />

      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#0b0b0e] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]">
        <div className="flex h-10 items-center gap-2 border-b border-zinc-800 bg-[#09090b] px-3">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-zinc-700" />
            <span className="size-2.5 rounded-full bg-zinc-700" />
            <span className="size-2.5 rounded-full bg-zinc-700" />
          </span>
          <span className="mx-auto hidden items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-xs text-zinc-500 sm:flex">
            techblocks / architecture
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 sm:ml-0">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Enregistré
          </span>
        </div>

        <div className="flex">
          <aside className="hidden w-52 shrink-0 flex-col gap-3 border-r border-zinc-800 bg-[#09090b] p-3 sm:flex">
            <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                <Sparkles className="size-3 text-zinc-500" />
                TechBlocks
              </span>
              <ChevronDown className="size-3 text-zinc-600" />
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/40 px-2 py-1 text-xs text-zinc-600">
              <Search className="size-3" />
              Rechercher…
            </div>
            <ul className="flex flex-col gap-0.5">
              {TREE.map((title, index) => (
                <li
                  key={title}
                  className={`flex items-center gap-1.5 truncate rounded-md px-2 py-1.5 text-xs ${
                    index === 0
                      ? 'bg-zinc-800/60 text-zinc-100'
                      : 'text-zinc-500'
                  }`}
                >
                  <FileText className="size-3 shrink-0" />
                  <span className="truncate">{title}</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="min-w-0 flex-1 p-4 sm:p-6">
            <p className="font-mono text-xs text-zinc-600">Document · Blocs</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">
              Architecture backend
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              {HERO_BLOCKS.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  selected={false}
                  onSelect={noop}
                  onChange={noop}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
