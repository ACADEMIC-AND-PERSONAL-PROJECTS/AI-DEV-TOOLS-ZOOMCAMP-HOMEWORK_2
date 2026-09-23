import type { Block, BlockType } from '@/types'

const TIMESTAMP = '2026-09-23T10:00:00Z'

function demoBlock(
  id: string,
  type: BlockType,
  content: Record<string, unknown>,
  position: number,
): Block {
  return { id, type, content, position, createdAt: TIMESTAMP, updatedAt: TIMESTAMP }
}

export const HERO_BLOCKS: Block[] = [
  demoBlock(
    'demo-hero-1',
    'MARKDOWN',
    {
      text: "## Contexte\n\nL'API TechBlocks est consommée par le client React. Chaque document est composé de blocs typés et persistés en `JSONB`.",
    },
    0,
  ),
  demoBlock(
    'demo-hero-2',
    'CODE',
    {
      language: 'typescript',
      code: 'export function useAutosave(id: string, blocks: Block[]) {\n  return useDebouncedSave({\n    delay: AUTOSAVE_DEBOUNCE_MS,\n    save: (next) => replaceBlocks(id, toUpserts(next)),\n  })\n}',
      showLineNumbers: true,
      fileName: 'hooks/useAutosave.ts',
    },
    1,
  ),
  demoBlock(
    'demo-hero-3',
    'CALLOUT',
    {
      variant: 'SUCCESS',
      title: 'Sauvegarde automatique',
      message: 'Les modifications partent en un seul PUT batch après 1,5 s d’inactivité.',
    },
    2,
  ),
]

export const SHOWCASE_BLOCKS: Record<BlockType, Block> = {
  MARKDOWN: demoBlock(
    'demo-markdown',
    'MARKDOWN',
    {
      text: "## Endpoints de documentation\n\nChaque bloc accepte du **Markdown** complet : titres, listes, citations et code inline comme `PUT /blocks`.\n\n- Listes à puces\n- Liens et images\n- Tableaux et blocs de code",
    },
    0,
  ),
  CODE: demoBlock(
    'demo-code',
    'CODE',
    {
      language: 'typescript',
      code: "const [blocks, setBlocks] = useState<Block[]>([])\n\nasync function upsert(block: Block) {\n  await documentsApi.replaceBlocks(documentId, toUpserts(blocks))\n}",
      showLineNumbers: true,
      fileName: 'services/documents.ts',
    },
    0,
  ),
  MERMAID: demoBlock(
    'demo-mermaid',
    'MERMAID',
    {
      code: 'graph TD;\n  A[Client] -->|REST| B(Spring Boot);\n  B -->|JPA| C[(PostgreSQL)];',
    },
    0,
  ),
  API_ENDPOINT: demoBlock(
    'demo-api',
    'API_ENDPOINT',
    {
      method: 'POST',
      endpoint: '/api/v1/auth/login',
      summary: "Authentification de l'utilisateur",
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      requestBody: '{\n  "email": "user@tech.com",\n  "password": "secret"\n}',
      responseExample: '{\n  "token": "eyJhbGciOi..."\n}',
    },
    0,
  ),
  CALLOUT: demoBlock(
    'demo-callout',
    'CALLOUT',
    {
      variant: 'WARNING',
      title: 'Attention au Rate Limiting',
      message: 'Ne pas dépasser 100 requêtes/min par clé API.',
    },
    0,
  ),
}
