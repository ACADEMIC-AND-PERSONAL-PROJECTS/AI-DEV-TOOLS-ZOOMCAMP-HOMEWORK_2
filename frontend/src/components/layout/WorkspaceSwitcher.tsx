import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Workspace } from '@/types'

interface WorkspaceSwitcherProps {
  workspaces: Workspace[]
  current: Workspace | null
  collapsed: boolean
  onSelect: (workspaceId: string) => void
  onCreate: (name: string, slug?: string) => Promise<void>
}

export function WorkspaceSwitcher({
  workspaces,
  current,
  collapsed,
  onSelect,
  onCreate,
}: WorkspaceSwitcherProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setCreating(true)
    try {
      await onCreate(name, slug.trim() === '' ? undefined : slug.trim())
      setName('')
      setSlug('')
      setDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 rounded-md px-2 text-zinc-200"
            aria-label="Changer de workspace"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-400">
              {current ? current.name.charAt(0).toUpperCase() : '?'}
            </span>
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-left text-sm font-medium">
                  {current?.name ?? 'Aucun workspace'}
                </span>
                <ChevronsUpDown className="size-3.5 text-zinc-500" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {workspaces.map((workspace) => (
            <DropdownMenuItem key={workspace.id} onSelect={() => onSelect(workspace.id)}>
              <span className="flex-1 truncate">{workspace.name}</span>
              {current?.id === workspace.id && <Check className="size-4 text-zinc-400" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Nouveau workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-zinc-800 bg-[#18181b]">
          <DialogHeader>
            <DialogTitle>Créer un workspace</DialogTitle>
            <DialogDescription>
              Un workspace regroupe vos documents et vos membres.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="workspace-name">Nom</Label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Backend API"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="workspace-slug">Slug (optionnel)</Label>
              <Input
                id="workspace-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="backend-api"
              />
            </div>
            {error && (
              <p role="alert" className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Création…' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
