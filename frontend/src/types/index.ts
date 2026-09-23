export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER'

export type BlockType = 'MARKDOWN' | 'CODE' | 'MERMAID' | 'API_ENDPOINT' | 'CALLOUT'

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Workspace {
  id: string
  name: string
  slug: string
  ownerId: string
  createdAt: string
}

export interface WorkspaceMember {
  id: string
  userId: string
  email: string
  fullName: string
  avatarUrl: string | null
  role: Role
  joinedAt: string
}

export interface Block {
  id: string
  type: BlockType
  content: Record<string, unknown>
  position: number
  createdAt: string
  updatedAt: string
}

export interface BlockUpsert {
  id: string | null
  type: BlockType
  content: Record<string, unknown>
}

export interface Document {
  id: string
  workspaceId: string
  parentId: string | null
  title: string
  icon: string
  position: number
  createdAt: string
  updatedAt: string
  blocks: Block[]
}

export interface DocumentTree {
  id: string
  parentId: string | null
  title: string
  icon: string
  position: number
  updatedAt: string
  children: DocumentTree[]
}

export interface RevisionBlockSnapshot {
  type: BlockType
  content: Record<string, unknown>
  position: number
}

export interface Revision {
  id: string
  documentId: string
  title: string
  snapshot: { blocks: RevisionBlockSnapshot[] }
  createdBy: string | null
  createdAt: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  errors?: string[]
}
