import { FileText, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@/types'

interface NavbarProps {
  user: User
  workspaceName: string | null
  onLogout: () => void
}

export function Navbar({ user, workspaceName, onLogout }: NavbarProps) {
  const initials = user.fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#09090b] px-4">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <FileText className="size-4" />
        <span className="font-medium text-zinc-300">{workspaceName ?? 'TechBlocks'}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="gap-2 rounded-full px-1.5 py-1"
            aria-label="Menu utilisateur"
          >
            <span className="flex size-7 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300">
              {initials}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <span className="block truncate text-sm">{user.fullName}</span>
            <span className="block truncate text-xs font-normal text-zinc-500">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onLogout}>
            <LogOut className="size-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
