import type { ComponentType } from 'react'
import { Blocks, History, Save, ShieldCheck, Users, Workflow } from 'lucide-react'
import { Reveal } from './Reveal'

interface Feature {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: Save,
    title: 'Autosave débouncé',
    description:
      'Les modifications sont regroupées puis envoyées en un seul PUT batch après 1,5 s d’inactivité. Aucun bouton « Enregistrer » à surveiller.',
  },
  {
    icon: History,
    title: 'Historique des révisions',
    description:
      'Un snapshot manuel en un clic, la comparaison des blocs entre deux versions, et la restauration d’une révision antérieure.',
  },
  {
    icon: Blocks,
    title: 'Éditeur par blocs',
    description:
      'Cinq composants typés, un slash menu pour insérer, du drag & drop pour réordonner. Le tout sans rechargement.',
  },
  {
    icon: Users,
    title: 'Workspaces & membres',
    description:
      'Cloisonnez la documentation par équipe, invitez vos collègues et attribuez les rôles ADMIN, EDITOR ou VIEWER.',
  },
  {
    icon: ShieldCheck,
    title: 'Authentification JWT',
    description:
      'Mots de passe hachés en BCrypt, jetons Bearer stateless, endpoints protégés par défaut côté Spring Security.',
  },
  {
    icon: Workflow,
    title: 'API REST prévisible',
    description:
      'Endpoints versionnés sous /api/v1, réponses camelCase, erreurs au format Problem Details (RFC 9457) et pagination uniforme.',
  },
]

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="scroll-mt-20 border-t border-zinc-800 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
            Fonctionnalités
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-4xl">
            Pensé pour les équipes qui écrivent du code.
          </h2>
          <p className="mt-4 text-zinc-400">
            Pas de wiki générique : chaque brique répond à un besoin concret de documentation
            technique.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Reveal key={feature.title} delay={index * 0.05}>
                <article className="h-full rounded-xl border border-zinc-800 bg-[#18181b]/60 p-5 transition-colors hover:border-zinc-700">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                    <Icon className="size-4 text-zinc-300" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-zinc-100">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
