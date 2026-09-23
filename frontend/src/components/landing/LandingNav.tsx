import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Blocks, Menu, X } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'

const SECTIONS = [
  { href: '#blocs', label: 'Blocs' },
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#api', label: 'API' },
]

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        scrolled
          ? 'border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-xl'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="TechBlocks — accueil">
          <span className="flex size-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
            <Blocks className="size-4 text-zinc-200" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-50">TechBlocks</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {SECTIONS.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" className="h-8 px-3 text-zinc-300">
            <Link to="/auth">Se connecter</Link>
          </Button>
          <Button asChild size="lg" className="h-9 px-4">
            <Link to="/auth?mode=register">Commencer</Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-300 md:hidden"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      {menuOpen && (
        <div className="border-t border-zinc-800 bg-[#09090b]/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {SECTIONS.map((section) => (
              <a
                key={section.href}
                href={section.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              >
                {section.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild variant="outline" className="h-9">
              <Link to="/auth">Se connecter</Link>
            </Button>
            <Button asChild size="lg" className="h-9">
              <Link to="/auth?mode=register">Commencer</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
