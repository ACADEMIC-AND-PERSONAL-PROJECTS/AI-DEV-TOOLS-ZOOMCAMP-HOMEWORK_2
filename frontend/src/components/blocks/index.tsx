import { ApiBlock } from './ApiBlock'
import { CalloutBlock } from './CalloutBlock'
import { CodeBlock } from './CodeBlock'
import { MarkdownBlock } from './MarkdownBlock'
import { MermaidBlock } from './MermaidBlock'
import type { BlockViewProps } from './types'

export function BlockRenderer(props: BlockViewProps) {
  switch (props.block.type) {
    case 'CODE':
      return <CodeBlock {...props} />
    case 'MARKDOWN':
      return <MarkdownBlock {...props} />
    case 'MERMAID':
      return <MermaidBlock {...props} />
    case 'API_ENDPOINT':
      return <ApiBlock {...props} />
    case 'CALLOUT':
      return <CalloutBlock {...props} />
  }
}
