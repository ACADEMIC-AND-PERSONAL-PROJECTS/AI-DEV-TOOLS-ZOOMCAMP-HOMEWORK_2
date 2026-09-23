import { Reveal } from './Reveal'

const STEPS = [
  {
    step: '01',
    title: 'Créez un workspace',
    description:
      'Un espace par équipe ou par projet, avec ses membres et leurs rôles ADMIN, EDITOR ou VIEWER.',
  },
  {
    step: '02',
    title: 'Composez le document',
    description:
      'Insérez vos blocs depuis le slash menu, réordonnez par glisser-déposer. Tout part en autosave.',
  },
  {
    step: '03',
    title: 'Versionnez',
    description:
      'Un snapshot avant refonte, une comparaison bloc à bloc, une restauration si le besoin se présente.',
  },
  {
    step: '04',
    title: 'Documentez l’API',
    description:
      'Les endpoints vivent dans le même document que le code : méthode, headers, payload, réponse.',
  },
]

export function WorkflowSection() {
  return (
    <section id="workflow" className="scroll-mt-20 border-t border-zinc-800 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">Workflow</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-4xl">
            De l’idée au document publié, en quatre temps.
          </h2>
        </Reveal>

        <Reveal delay={0.05} className="mt-12">
          <div className="grid gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <div key={item.step} className="bg-[#09090b] p-6">
                <span className="font-mono text-xs text-zinc-600">{item.step}</span>
                <h3 className="mt-4 text-sm font-semibold text-zinc-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
