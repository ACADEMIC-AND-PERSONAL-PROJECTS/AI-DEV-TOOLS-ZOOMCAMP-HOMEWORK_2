import type { Block } from '@/types'

export interface BlockViewProps {
  block: Block
  selected: boolean
  onSelect: () => void
  onChange: (content: Record<string, unknown>) => void
}
