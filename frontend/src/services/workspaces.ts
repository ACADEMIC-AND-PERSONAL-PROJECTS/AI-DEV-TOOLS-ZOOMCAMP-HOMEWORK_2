import api from './api'
import type { Workspace, WorkspaceMember } from '@/types'

export function listWorkspaces(): Promise<Workspace[]> {
  return api.get<Workspace[]>('/workspaces').then((r) => r.data)
}

export function createWorkspace(name: string, slug?: string): Promise<Workspace> {
  return api.post<Workspace>('/workspaces', { name, slug }).then((r) => r.data)
}

export function listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  return api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`).then((r) => r.data)
}
