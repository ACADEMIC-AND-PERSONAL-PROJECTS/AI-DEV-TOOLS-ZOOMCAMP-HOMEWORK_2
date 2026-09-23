import api from './api'
import type { Block, BlockType, BlockUpsert, Document, DocumentTree, Revision } from '@/types'

export function listDocumentTree(workspaceId: string): Promise<DocumentTree[]> {
  return api.get<DocumentTree[]>(`/workspaces/${workspaceId}/documents`).then((r) => r.data)
}

export function getDocument(id: string): Promise<Document> {
  return api.get<Document>(`/documents/${id}`).then((r) => r.data)
}

export interface CreateDocumentInput {
  title?: string
  icon?: string
  parentId?: string
  position?: number
}

export function createDocument(workspaceId: string, input: CreateDocumentInput): Promise<Document> {
  return api.post<Document>(`/workspaces/${workspaceId}/documents`, input).then((r) => r.data)
}

export function updateDocument(id: string, title: string, icon?: string): Promise<Document> {
  return api.put<Document>(`/documents/${id}`, { title, icon }).then((r) => r.data)
}

export function deleteDocument(id: string): Promise<void> {
  return api.delete(`/documents/${id}`).then(() => undefined)
}

export function replaceBlocks(id: string, blocks: BlockUpsert[]): Promise<Block[]> {
  return api.put<Block[]>(`/documents/${id}/blocks`, { blocks }).then((r) => r.data)
}

export function addBlock(
  id: string,
  type: BlockType,
  content: Record<string, unknown>,
  position?: number,
): Promise<Block> {
  return api.post<Block>(`/documents/${id}/blocks`, { type, content, position }).then((r) => r.data)
}

export function deleteBlock(blockId: string): Promise<void> {
  return api.delete(`/blocks/${blockId}`).then(() => undefined)
}

export function listRevisions(id: string): Promise<Revision[]> {
  return api.get<Revision[]>(`/documents/${id}/revisions`).then((r) => r.data)
}

export function createRevision(id: string): Promise<Revision> {
  return api.post<Revision>(`/documents/${id}/revisions`).then((r) => r.data)
}
