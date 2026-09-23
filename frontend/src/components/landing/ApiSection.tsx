import { cn } from 'cn'
import { Reveal } from './Reveal'

const ENDPOINTS = [
  { method: 'POST', path: '/api/v1/auth/login', label: 'Authentification, jeton Bearer' },
  { method: 'GET', path: '/api/v1/workspaces', label: 'Workspaces de l’utilisateur' },
  { method: 'POST', path: '/api/v1/workspaces/{id}/documents', label: 'Création d’un document' },
  { method: 'PUT', path: '/api/v1/documents/{id}/blocks', label: 'Batch upsert des blocs' },
  { method: 'DELETE', path: '/api/v1/blocks/{blockId}', label: 'Suppression d’un bloc' },
  { method: 'GET', path: '/api/v1/documents/{id}/revisions', label: 'Historique des révisions' },
]

const METHOD_STYLES: Record<string, string> = {
  GET: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  POST: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  PUT: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  DELETE: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
}

const REQUEST = `curl -X POST http://localhost:8080/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"ada@techblocks.dev","password":"••••••••"}'`

const RESPONSE = `{
  "token": "eyJhbGciOiJIUzI1NiJ9…",
  "user": {
    "email": "ada@techblocks.dev",
    "fullName": "Ada Developer"
  }
}`

export function ApiSection() {
  return (
    <section id="api" className="scroll-mt-20 border-t border-zinc-800 px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">API</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-4xl">
            Une API REST prévisible, documentée dans vos documents.
          </h2>
          <p className="mt-4 text-zinc-400">
            Tout passe par <span className="font-mono text-zinc-300">/api/v1</span>, en JSON
            camelCase. Les erreurs suivent Problem Details (RFC 9457) et les listes sont paginées
            avec <span className="font-mono text-zinc-300">{'{ items, total, page, size }'}</span>.
          </p>

          <ul className="mt-8 flex flex-col divide-y divide-zinc-800 border-y border-zinc-800">
            {ENDPOINTS.map((endpoint) => (
              <li key={endpoint.path} className="flex items-center gap-3 py-2.5">
                <span
                  className={cn(
                    'w-16 shrink-0 rounded border px-1.5 py-0.5 text-center font-mono text-[10px] tracking-wide',
                    METHOD_STYLES[endpoint.method],
                  )}
                >
                  {endpoint.method}
                </span>
                <span className="truncate font-mono text-xs text-zinc-300">{endpoint.path}</span>
                <span className="ml-auto hidden shrink-0 text-xs text-zinc-500 lg:block">
                  {endpoint.label}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0b0b0e] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-[#09090b] px-4 py-2.5">
              <span className="font-mono text-xs text-zinc-500">Requête</span>
              <span className="ml-auto font-mono text-xs text-zinc-600">bash</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-400">
              {REQUEST}
            </pre>
            <div className="flex items-center gap-2 border-y border-zinc-800 bg-[#09090b] px-4 py-2.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs text-zinc-500">200 OK</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-300">
              {RESPONSE}
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
