import { useState } from 'react'
import { motion } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import type { DocumentTree, Workspace } from '@/types'

interface SidebarProps {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  tree: DocumentTree[]
  selectedDocumentId: string | null
  onSelectWorkspace: (workspaceId: string) => void
  onCreateWorkspace: (name: string, slug?: string) => Promise<void>
  onSelectDocument: (documentId: string) => void
  onCreateDocument: () => void
}

interface TreeNodeProps {
  node: DocumentTree
  depth: number
  selected: boolean
  collapsed: boolean
  onSelect: (documentId: string) => void
}

function TreeNode({ node, depth, selected, collapsed, onSelect }: TreeNodeProps) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        title={collapsed ? node.title : undefined}
        aria-current={selected ? 'page' : undefined}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-zinc-800/60 ${
          selected ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400'
        }`}
        style={{ paddingLeft: collapsed ? undefined : `${12 + depth * 14}px` }}
      >
        <span className="shrink-0">{node.icon || '📄'}</span>
        {!collapsed && <span className="truncate">{node.title}</span>}
      </button>
      {!collapsed &&
        node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            selected={selected}
            collapsed={collapsed}
            onSelect={onSelect}
          />
        ))}
    </div>
  )
}

export function Sidebar({
  workspaces,
  currentWorkspace,
  tree,
  selectedDocumentId,
  onSelectWorkspace,
  onCreateWorkspace,
  onSelectDocument,
  onCreateDocument,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 280 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="flex h-full shrink-0 flex-col border-r border-zinc-800 bg-[#09090b]"
    >
      <div className="flex flex-col gap-1 p-2">
        <WorkspaceSwitcher
          workspaces={workspaces}
          current={currentWorkspace}
          collapsed={collapsed}
          onSelect={onSelectWorkspace}
          onCreate={onCreateWorkspace}
        />
        {currentWorkspace && (
          <Button
            variant="ghost"
            className="justify-start gap-2 rounded-md px-2 text-zinc-400"
            onClick={onCreateDocument}
            aria-label="Nouveau document"
          >
            <Plus className="size-4" />
            {!collapsed && <span className="text-sm">Nouveau document</span>}
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2" aria-label="Documents">
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            selected={node.id === selectedDocumentId}
            collapsed={collapsed}
            onSelect={onSelectDocument}
          />
        ))}
        {!collapsed && tree.length === 0 && currentWorkspace && (
          <p className="px-2 py-4 text-center text-xs text-zinc-600">
            Aucun document. Créez votre premier document.
          </p>
        )}
      </nav>

      <div className="border-t border-zinc-800 p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 rounded-md px-2 text-zinc-400"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          {!collapsed && <span className="text-sm">Replier</span>}
        </Button>
      </div>
    </motion.aside>
  )
}
