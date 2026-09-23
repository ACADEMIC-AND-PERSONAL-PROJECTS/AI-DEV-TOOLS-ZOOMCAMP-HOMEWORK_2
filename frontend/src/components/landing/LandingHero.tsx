import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditorPreview } from './EditorPreview'

const HIGHLIGHTS = [
  'Markdown & code',
  'Diagrammes Mermaid',
  'Endpoints REST',
  'Callouts catégorisés',
]

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,black_25%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.16),transparent_65%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 font-mono text-xs text-zinc-400 backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Autosave 1,5 s · Historique des révisions
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-6xl">
            Documentez votre stack,{' '}
            <span className="bg-gradient-to-br from-zinc-50 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
              bloc par bloc.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-pretty text-zinc-400 sm:text-lg">
            TechBlocks réunit markdown, code, diagrammes Mermaid, endpoints API et callouts dans un
            éditeur de blocs taillé pour les équipes techniques.
          </p>

          <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="h-10 w-full px-5 sm:w-auto">
              <Link to="/auth?mode=register">
                Commencer
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-10 w-full border-zinc-800 bg-zinc-900/40 px-5 text-zinc-200 sm:w-auto"
            >
              <a href="#blocs">Explorer les blocs</a>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-xs text-zinc-500">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-zinc-700" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 sm:mt-20"
        >
          <EditorPreview />
        </motion.div>
      </div>
    </section>
  )
}
