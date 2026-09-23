import { Link } from 'react-router-dom'
import { Blocks } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-800 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2.5" aria-label="TechBlocks — accueil">
            <span className="flex size-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
              <Blocks className="size-4 text-zinc-200" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-50">TechBlocks</span>
          </Link>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-zinc-500">
            Documentation collaborative, structurée en blocs typés, pour les équipes qui écrivent du
            code.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Compte">
            <Link
              to="/auth"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Se connecter
            </Link>
            <Link
              to="/auth?mode=register"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Créer un compte
            </Link>
          </nav>
          <p className="font-mono text-xs text-zinc-600">React · Spring Boot 3 · PostgreSQL 16</p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-zinc-800 pt-6">
        <p className="text-xs text-zinc-600">
          © 2026 TechBlocks — projet de documentation technique, thème sombre par défaut.
        </p>
      </div>
    </footer>
  )
}
