import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import {
  Braces,
  Code,
  GripVertical,
  Plus,
  Text,
  Trash2,
  TriangleAlert,
  Workflow,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BlockRenderer } from '@/components/blocks'
import type { Block, BlockType } from '@/types'

const BLOCK_MENU: { type: BlockType; label: string; icon: typeof Text }[] = [
  { type: 'MARKDOWN', label: 'Texte (Markdown)', icon: Text },
  { type: 'CODE', label: 'Code', icon: Code },
  { type: 'MERMAID', label: 'Diagramme Mermaid', icon: Workflow },
  { type: 'API_ENDPOINT', label: 'Endpoint API', icon: Braces },
  { type: 'CALLOUT', label: 'Callout', icon: TriangleAlert },
]

function createTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function defaultContent(type: BlockType): Record<string, unknown> {
  switch (type) {
    case 'MARKDOWN':
      return { text: '' }
    case 'CODE':
      return { language: 'typescript', code: '', showLineNumbers: true, fileName: '' }
    case 'MERMAID':
      return { code: 'graph TD;\n  A[Client] -->|REST| B[API];' }
    case 'API_ENDPOINT':
      return { method: 'GET', endpoint: '', summary: '', headers: [], requestBody: '', responseExample: '' }
    case 'CALLOUT':
      return { variant: 'INFO', title: '', message: '' }
  }
}

interface BlockCanvasProps {
  blocks: Block[]
  onBlocksChange: (blocks: Block[]) => void
}

interface BlockItemProps {
  block: Block
  selected: boolean
  onSelect: () => void
  onChange: (content: Record<string, unknown>) => void
  onDelete: () => void
}

function BlockItem({ block, selected, onSelect, onChange, onDelete }: BlockItemProps) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={block}
      dragListener={false}
      dragControls={dragControls}
      className="group relative"
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          aria-label="Réordonner le bloc"
          onPointerDown={(e) => dragControls.start(e)}
          className="mt-2 hidden shrink-0 cursor-grab touch-none rounded p-0.5 text-zinc-600 hover:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 group-hover:block group-focus-within:block"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <BlockRenderer
            block={block}
            selected={selected}
            onSelect={onSelect}
            onChange={onChange}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Supprimer le bloc"
          onClick={onDelete}
          className="mt-1 hidden size-7 shrink-0 text-zinc-500 hover:text-red-400 group-hover:flex group-focus-within:flex"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </Reorder.Item>
  )
}

export function BlockCanvas({ blocks, onBlocksChange }: BlockCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const insertBlock = (type: BlockType) => {
    const now = new Date().toISOString()
    const block: Block = {
      id: createTempId(),
      type,
      content: defaultContent(type),
      position: blocks.length,
      createdAt: now,
      updatedAt: now,
    }
    onBlocksChange([...blocks, block])
    setSelectedId(block.id)
    setMenuOpen(false)
  }

  const handleChange = (id: string, content: Record<string, unknown>) => {
    onBlocksChange(
      blocks.map((block) =>
        block.id === id ? { ...block, content, updatedAt: new Date().toISOString() } : block,
      ),
    )
  }

  const handleDelete = (id: string) => {
    onBlocksChange(blocks.filter((block) => block.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const handleReorder = (reordered: Block[]) => {
    onBlocksChange(reordered.map((block, index) => ({ ...block, position: index })))
  }

  const handleCanvasKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === '/' && event.target === event.currentTarget) {
      event.preventDefault()
      setMenuOpen(true)
    }
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={handleCanvasKeyDown}
      className="flex flex-col gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-zinc-700"
    >
      <Reorder.Group
        axis="y"
        values={blocks}
        onReorder={handleReorder}
        className="flex flex-col gap-2"
      >
        {blocks.map((block) => (
          <BlockItem
            key={block.id}
            block={block}
            selected={block.id === selectedId}
            onSelect={() => setSelectedId(block.id)}
            onChange={(content) => handleChange(block.id, content)}
            onDelete={() => handleDelete(block.id)}
          />
        ))}
      </Reorder.Group>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 rounded-md border border-dashed border-zinc-800 px-3 py-2 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
          >
            <Plus className="size-4" />
            <span className="text-sm">Tapez « / » pour insérer un bloc</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 border-zinc-800 bg-[#18181b]">
          {BLOCK_MENU.map(({ type, label, icon: Icon }) => (
            <DropdownMenuItem key={type} onSelect={() => insertBlock(type)}>
              <Icon className="size-4 text-zinc-400" />
              <span>{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
