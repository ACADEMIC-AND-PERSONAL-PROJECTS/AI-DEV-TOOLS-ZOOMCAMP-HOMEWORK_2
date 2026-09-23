import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from './Reveal'

export function LandingCta() {
  return (
    <section className="border-t border-zinc-800 px-6 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#18181b]/70 px-6 py-14 text-center backdrop-blur-xl sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-4xl">
              Votre documentation mérite mieux qu’un wiki oublié.
            </h2>
            <p className="mt-4 text-zinc-400">
              Créez un workspace, composez votre premier document en blocs, et laissez l’autosave
              faire le reste.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-10 px-5">
                <Link to="/auth?mode=register">
                  Commencer
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-10 px-5">
                <Link to="/auth">Se connecter</Link>
              </Button>
            </div>
            <p className="mt-6 font-mono text-xs text-zinc-600">
              Autosave 1,5 s · Historique des révisions · 5 types de blocs
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
